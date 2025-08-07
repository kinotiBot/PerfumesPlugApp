from django.db import models
from django.contrib.auth import get_user_model
from perfumes.models import Perfume

User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = (
        ('P', 'Pending'),
        ('C', 'Confirmed'),
        ('S', 'Shipped'),
        ('D', 'Delivered'),
        ('X', 'Cancelled'),
    )
    
    PAYMENT_CHOICES = (
        ('mobile_money', 'Mobile Money'),
        ('credit_card', 'Credit Card'),
        ('paypal', 'PayPal'),
        ('cash_on_delivery', 'Cash On Delivery'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_status = models.BooleanField(default=False)
    shipping_address = models.ForeignKey(
        'users.Address', on_delete=models.SET_NULL, 
        related_name='shipping_orders', null=True
    )
    billing_address = models.ForeignKey(
        'users.Address', on_delete=models.SET_NULL, 
        related_name='billing_orders', null=True
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    shipping = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Guest information fields
    guest_name = models.CharField(max_length=100, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)
    guest_address = models.CharField(max_length=255, null=True, blank=True)
    guest_city = models.CharField(max_length=100, null=True, blank=True)
    guest_province = models.CharField(max_length=100, null=True, blank=True)
    guest_notes = models.TextField(max_length=500, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate a unique order number
            last_order = Order.objects.order_by('-id').first()
            if last_order:
                order_number = f"ORD-{last_order.id + 1:06d}"
            else:
                order_number = "ORD-000001"
            self.order_number = order_number
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    perfume = models.ForeignKey(Perfume, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.quantity} x {self.perfume.name}"
    
    @property
    def total(self):
        return self.price * self.quantity

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email}'s Cart"
    
    @property
    def total_items(self):
        return self.items.count()
    
    @property
    def subtotal(self):
        return sum(item.total for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    perfume = models.ForeignKey(Perfume, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = ('cart', 'perfume')
    
    def __str__(self):
        return f"{self.quantity} x {self.perfume.name}"
    
    @property
    def total(self):
        if self.perfume.discount_price:
            return self.perfume.discount_price * self.quantity
        return self.perfume.price * self.quantity