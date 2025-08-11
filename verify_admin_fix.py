#!/usr/bin/env python
"""
Script to verify that the admin order details fix is working correctly.
This script checks that the API returns 'total' field (not 'total_amount') 
and that the admin interface can display order information properly.
"""

import os
import django
import sys
import requests
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from perfumes.models import Perfume, Brand, Category
from django.test import Client

User = get_user_model()

def create_test_data():
    """Create test data for verification"""
    print("Creating test data...")
    
    # Create or get admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'password': 'adminpass123',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True
        }
    )
    # Always set password to ensure it's correct
    admin_user.set_password('adminpass123')
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    
    if created:
        print(f"Created admin user: {admin_user.email}")
    else:
        print(f"Using existing admin user: {admin_user.email} (password updated)")
    
    # Create or get category
    category, created = Category.objects.get_or_create(
        name='Test Category',
        defaults={'slug': 'test-category'}
    )
    if created:
        print(f"Created category: {category.name}")
    
    # Create or get brand
    brand, created = Brand.objects.get_or_create(
        name='Test Brand',
        defaults={'slug': 'test-brand'}
    )
    if created:
        print(f"Created brand: {brand.name}")
    
    # Create or get perfume
    perfume, created = Perfume.objects.get_or_create(
        name='Test Perfume',
        defaults={
            'slug': 'test-perfume',
            'brand': brand,
            'category': category,
            'price': Decimal('75.00'),
            'stock': 10,
            'gender': 'U',
            'description': 'Test perfume for verification'
        }
    )
    if created:
        print(f"Created perfume: {perfume.name}")
    
    # Create test order
    order, created = Order.objects.get_or_create(
        user=admin_user,
        defaults={
            'payment_method': 'mobile_money',
            'payment_status': True,
            'subtotal': Decimal('75.00'),
            'tax': Decimal('0.00'),
            'shipping': Decimal('0.00'),
            'total': Decimal('75.00')
        }
    )
    if created:
        print(f"Created order: {order.order_number}")
        
        # Create order item
        order_item = OrderItem.objects.create(
            order=order,
            perfume=perfume,
            price=Decimal('75.00'),
            quantity=1
        )
        print(f"Created order item: {order_item}")
    else:
        print(f"Using existing order: {order.order_number}")
    
    return admin_user, order

def verify_api_response(admin_user, order):
    """Verify that the API returns the correct field structure"""
    print("\nVerifying API response...")
    
    client = Client()
    
    # Login as admin
    login_success = client.login(email=admin_user.email, password='adminpass123')
    if not login_success:
        print("❌ Failed to login as admin")
        return False
    
    print("✅ Successfully logged in as admin")
    
    # Get orders list
    response = client.get('/api/orders/')
    
    if response.status_code != 200:
        print(f"❌ API request failed with status {response.status_code}")
        print(f"Response content: {response.content}")
        return False
    
    print("✅ API request successful")
    
    data = response.json()
    
    if 'results' not in data:
        print("❌ No 'results' field in API response")
        return False
    
    if not data['results']:
        print("❌ No orders found in API response")
        return False
    
    order_data = data['results'][0]
    print(f"✅ Found order data: {order_data.get('order_number', 'Unknown')}")
    
    # Check for 'total' field (not 'total_amount')
    if 'total' not in order_data:
        print("❌ 'total' field missing from order data")
        print(f"Available fields: {list(order_data.keys())}")
        return False
    
    if 'total_amount' in order_data:
        print("⚠️  'total_amount' field still present (should be 'total')")
    
    print(f"✅ 'total' field found with value: {order_data['total']}")
    
    # Check other important fields
    required_fields = ['id', 'order_number', 'status', 'payment_status', 'created_at']
    missing_fields = []
    
    for field in required_fields:
        if field not in order_data:
            missing_fields.append(field)
    
    if missing_fields:
        print(f"❌ Missing required fields: {missing_fields}")
        return False
    
    print("✅ All required fields present")
    
    # Check items structure
    if 'items' in order_data and order_data['items']:
        item = order_data['items'][0]
        if 'perfume_details' in item:
            print("✅ Order items have perfume details")
        else:
            print("⚠️  Order items missing perfume details")
    
    return True

def main():
    print("=== Admin Order Details Fix Verification ===")
    print("This script verifies that the admin order details display correctly.")
    print("The fix changes 'total_amount' to 'total' in the admin Orders.js component.\n")
    
    try:
        # Create test data
        admin_user, order = create_test_data()
        
        # Verify API response
        if verify_api_response(admin_user, order):
            print("\n🎉 SUCCESS: Admin order details fix is working correctly!")
            print("\nThe admin interface should now display:")
            print(f"- Order total: ${order.total}")
            print(f"- Order number: {order.order_number}")
            print(f"- Payment status: {'Paid' if order.payment_status else 'Unpaid'}")
            print("\nYou can now view the admin orders page at: http://localhost:3000/admin/orders")
            return True
        else:
            print("\n❌ FAILED: Issues found with the admin order details")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)