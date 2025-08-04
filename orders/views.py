from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, Cart, CartItem
from perfumes.models import Perfume
from .serializers import (
    OrderSerializer, OrderItemSerializer, CartSerializer,
    CartItemSerializer, OrderCreateSerializer
)

class CartViewSet(viewsets.GenericViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Get or create cart for the current user
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_object()
        perfume_id = request.data.get('perfume_id')
        quantity = int(request.data.get('quantity', 1))
        
        if quantity <= 0:
            return Response(
                {"detail": "Quantity must be greater than zero"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            perfume = Perfume.objects.get(id=perfume_id, is_active=True)
        except Perfume.DoesNotExist:
            return Response(
                {"detail": "Perfume not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if perfume is in stock
        if perfume.stock < quantity:
            return Response(
                {"detail": f"Only {perfume.stock} items available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if item already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            perfume=perfume,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update quantity if item already exists
            cart_item.quantity += quantity
            if cart_item.quantity > perfume.stock:
                return Response(
                    {"detail": f"Cannot add more. Only {perfume.stock} items available"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if quantity <= 0:
            # Remove item if quantity is zero or negative
            cart_item.delete()
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        
        # Check if requested quantity is available
        if quantity > cart_item.perfume.stock:
            return Response(
                {"detail": f"Only {cart_item.perfume.stock} items available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self.get_object()
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        # Only pending orders can be cancelled
        if order.status != 'P':
            return Response(
                {"detail": "Only pending orders can be cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status
        order.status = 'X'
        order.save()
        
        # Return stock to inventory
        for item in order.items.all():
            perfume = item.perfume
            perfume.stock += item.quantity
            perfume.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)