#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from perfumes.models import Perfume, Category, Brand
from users.models import Address

User = get_user_model()

def create_test_orders():
    print("Creating test orders for filtering demonstration...")
    
    # Create or get test user
    user, created = User.objects.get_or_create(
        email='testuser@example.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'User',
            'is_staff': False
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"Created test user: {user.email}")
    
    # Create or get admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@example.com',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.email}")
    
    # Create test category and brand if they don't exist
    category, _ = Category.objects.get_or_create(
        name='Test Category',
        defaults={'slug': 'test-category'}
    )
    
    brand, _ = Brand.objects.get_or_create(
        name='Test Brand',
        defaults={'slug': 'test-brand'}
    )
    
    # Create test perfume if it doesn't exist
    perfume, _ = Perfume.objects.get_or_create(
        name='Test Perfume',
        defaults={
            'slug': 'test-perfume',
            'brand': brand,
            'category': category,
            'price': Decimal('50.00'),
            'stock': 100,
            'description': 'A test perfume for demonstration'
        }
    )
    
    # Create test orders with different statuses
    orders_data = [
        {
            'user': user,
            'status': 'P',  # Pending
            'payment_method': 'mobile_money',
            'payment_status': False,
            'subtotal': Decimal('50.00'),
            'tax': Decimal('5.00'),
            'shipping': Decimal('10.00'),
            'total': Decimal('65.00')
        },
        {
            'user': user,
            'status': 'C',  # Confirmed
            'payment_method': 'credit_card',
            'payment_status': True,
            'subtotal': Decimal('75.00'),
            'tax': Decimal('7.50'),
            'shipping': Decimal('10.00'),
            'total': Decimal('92.50')
        },
        {
            'user': user,
            'status': 'S',  # Shipped
            'payment_method': 'paypal',
            'payment_status': True,
            'subtotal': Decimal('100.00'),
            'tax': Decimal('10.00'),
            'shipping': Decimal('15.00'),
            'total': Decimal('125.00')
        },
        {
            'user': user,
            'status': 'D',  # Delivered
            'payment_method': 'cash_on_delivery',
            'payment_status': True,
            'subtotal': Decimal('80.00'),
            'tax': Decimal('8.00'),
            'shipping': Decimal('12.00'),
            'total': Decimal('100.00')
        },
        {
            'user': user,
            'status': 'X',  # Cancelled
            'payment_method': 'mobile_money',
            'payment_status': False,
            'subtotal': Decimal('60.00'),
            'tax': Decimal('6.00'),
            'shipping': Decimal('10.00'),
            'total': Decimal('76.00')
        }
    ]
    
    created_orders = []
    for order_data in orders_data:
        order = Order.objects.create(**order_data)
        # Create an order item for each order
        OrderItem.objects.create(
            order=order,
            perfume=perfume,
            price=perfume.price,
            quantity=1
        )
        created_orders.append(order)
        print(f"Created order {order.order_number} with status {order.get_status_display()}")
    
    print(f"\nSuccessfully created {len(created_orders)} test orders!")
    print("\nYou can now test the filtering functionality with:")
    print("- Status filters: Pending, Confirmed, Shipped, Delivered, Cancelled")
    print("- Payment status filters: Paid (True) and Unpaid (False)")
    print("- Order ID search")
    print("\nAdmin credentials: admin@example.com / admin123")
    print("User credentials: testuser@example.com / testpass123")

if __name__ == '__main__':
    create_test_orders()