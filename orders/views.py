from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, Cart, CartItem
from perfumes.models import Perfume
from .serializers import (
    OrderSerializer, OrderItemSerializer, CartSerializer,
    CartItemSerializer, OrderCreateSerializer, GuestOrderCreateSerializer,
    PaymentStatusUpdateSerializer
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    search_fields = ['id', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'total_amount']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all() if user.is_staff else Order.objects.filter(user=user)
        
        # Handle order_id filter manually since it's searching by ID
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(id__icontains=order_id)
            
        return queryset.order_by('-created_at')
    
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
    
    @action(detail=True, methods=['post'])
    def update_order_status(self, request, pk=None):
        """Update the status of an order"""
        order = self.get_object()
        
        # Get the new status from request data
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'error': 'Status field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status choice
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid choices are: {", ".join(valid_statuses)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status
        order.status = new_status
        order.save()
        
        return Response({
            'message': f'Order status updated to {order.get_status_display()}',
            'order_id': order.id,
            'order_number': order.order_number,
            'status': order.status
        })
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update the payment status of an order"""
        order = self.get_object()
        serializer = PaymentStatusUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update payment status
        payment_status = serializer.validated_data['payment_status']
        order.payment_status = payment_status
        order.save()
        
        return Response({
            'message': f'Payment status updated to {"paid" if payment_status else "unpaid"}',
            'order_id': order.id,
            'order_number': order.order_number,
            'payment_status': order.payment_status
        })
    
    @action(detail=False, methods=['post'], permission_classes=[])
    def guest(self, request):
        """
        Create an order for guest users (no authentication required)
        """
        print(f"Guest order request data: {request.data}")
        serializer = GuestOrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        print(f"Guest order validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)