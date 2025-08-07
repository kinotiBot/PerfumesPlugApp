from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from perfumes.serializers import PerfumeSerializer
from users.serializers import AddressSerializer

class CartItemSerializer(serializers.ModelSerializer):
    perfume_details = PerfumeSerializer(source='perfume', read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'perfume', 'perfume_details', 'quantity', 'total']
        read_only_fields = ['total']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['subtotal', 'total_items']

class OrderItemSerializer(serializers.ModelSerializer):
    perfume_details = PerfumeSerializer(source='perfume', read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'perfume', 'perfume_details', 'price', 'quantity', 'total']
        read_only_fields = ['total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address_details = AddressSerializer(source='shipping_address', read_only=True)
    billing_address_details = AddressSerializer(source='billing_address', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'payment_method', 'payment_status',
            'shipping_address', 'shipping_address_details', 'billing_address', 'billing_address_details',
            'subtotal', 'tax', 'shipping', 'total', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'user']

class OrderCreateSerializer(serializers.ModelSerializer):
    shipping_address = serializers.IntegerField(required=False, allow_null=True)
    billing_address = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Order
        fields = [
            'payment_method', 'shipping_address', 'billing_address',
            'subtotal', 'tax', 'shipping', 'total'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.get(user=user)
        
        if not cart.items.exists():
            raise serializers.ValidationError({"cart": "Cart is empty"})
        
        # Create order
        order = Order.objects.create(
            user=user,
            **validated_data
        )
        
        # Create order items from cart items
        for cart_item in cart.items.all():
            price = cart_item.perfume.discount_price or cart_item.perfume.price
            OrderItem.objects.create(
                order=order,
                perfume=cart_item.perfume,
                price=price,
                quantity=cart_item.quantity
            )
            
            # Update perfume stock
            perfume = cart_item.perfume
            perfume.stock -= cart_item.quantity
            perfume.save()
        
        # Clear the cart
        cart.items.all().delete()
        
        return order


class GuestOrderCreateSerializer(serializers.ModelSerializer):
    # Guest contact information
    guest_name = serializers.CharField(max_length=100)
    guest_email = serializers.EmailField()
    guest_phone = serializers.CharField(max_length=20)
    guest_address = serializers.CharField(max_length=255)
    guest_city = serializers.CharField(max_length=100)
    guest_province = serializers.CharField(max_length=100)
    guest_notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    # Cart items data
    cart_items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = Order
        fields = [
            'payment_method', 'subtotal', 'tax', 'shipping', 'total',
            'guest_name', 'guest_email', 'guest_phone', 'guest_address',
            'guest_city', 'guest_province', 'guest_notes', 'cart_items'
        ]
    
    def create(self, validated_data):
        # Extract guest info and cart items
        guest_info = {
            'guest_name': validated_data.pop('guest_name'),
            'guest_email': validated_data.pop('guest_email'),
            'guest_phone': validated_data.pop('guest_phone'),
            'guest_address': validated_data.pop('guest_address'),
            'guest_city': validated_data.pop('guest_city'),
            'guest_province': validated_data.pop('guest_province'),
            'guest_notes': validated_data.pop('guest_notes', ''),
        }
        cart_items_data = validated_data.pop('cart_items')
        
        if not cart_items_data:
            raise serializers.ValidationError({"cart_items": "Cart is empty"})
        
        # Create order without user
        order = Order.objects.create(
            user=None,
            **validated_data,
            **guest_info
        )
        
        # Create order items from cart items data
        for item_data in cart_items_data:
            perfume_id = item_data.get('perfume', {}).get('id')
            quantity = item_data.get('quantity', 1)
            
            try:
                perfume = Perfume.objects.get(id=perfume_id)
            except Perfume.DoesNotExist:
                raise serializers.ValidationError({"cart_items": f"Perfume with id {perfume_id} not found"})
            
            if perfume.stock < quantity:
                raise serializers.ValidationError({"cart_items": f"Insufficient stock for {perfume.name}"})
            
            price = perfume.discount_price or perfume.price
            OrderItem.objects.create(
                order=order,
                perfume=perfume,
                price=price,
                quantity=quantity
            )
            
            # Update perfume stock
            perfume.stock -= quantity
            perfume.save()
        
        return order