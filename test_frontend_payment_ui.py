#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

import requests
import json
from django.contrib.auth import get_user_model
from orders.models import Order
from perfumes.models import Perfume

User = get_user_model()

def create_test_scenario():
    print("\n=== Creating Test Scenario for Frontend Testing ===")
    
    # Ensure we have an admin user
    admin_email = 'testadmin@test.com'
    try:
        admin_user = User.objects.get(email=admin_email)
        print(f"Using existing admin user: {admin_user.email}")
    except User.DoesNotExist:
        admin_user = User.objects.create_user(
            email=admin_email,
            password='admin123',
            first_name='Test',
            last_name='Admin',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        print(f"Created new admin user: {admin_user.email}")
    
    # Use an existing perfume for the test order
    perfume = Perfume.objects.filter(is_active=True).first()
    if not perfume:
        print("❌ No active perfumes found. Please ensure there are perfumes in the database.")
        return None
    
    print(f"Using perfume: {perfume.name} (${perfume.price})")
    
    # Create a test order that's unpaid
    test_order = Order.objects.create(
        user=admin_user,
        payment_method='mobile_money',
        payment_status=False,  # Unpaid
        status='C',  # Confirmed
        subtotal=75.00,
        tax=7.50,
        shipping=5.00,
        total=87.50
    )
    
    print(f"\n✅ Test scenario created successfully!")
    print(f"📋 Order Details:")
    print(f"   - Order Number: {test_order.order_number}")
    print(f"   - Order ID: {test_order.id}")
    print(f"   - Payment Status: {'Paid' if test_order.payment_status else 'Unpaid'}")
    print(f"   - Order Status: {test_order.get_status_display()}")
    print(f"   - Total: ${test_order.total}")
    
    print(f"\n👤 Admin User Details:")
    print(f"   - Email: {admin_user.email}")
    print(f"   - Password: admin123")
    print(f"   - Is Staff: {admin_user.is_staff}")
    print(f"   - Is Superuser: {admin_user.is_superuser}")
    
    print(f"\n🔧 Testing Instructions:")
    print(f"1. Open your browser and go to: http://localhost:3000/admin/login")
    print(f"2. Login with: {admin_user.email} / admin123")
    print(f"3. Navigate to Orders management")
    print(f"4. Find order {test_order.order_number} (ID: {test_order.id})")
    print(f"5. Try to change payment status from 'Unpaid' to 'Paid'")
    print(f"6. Check if the change is saved and reflected in the UI")
    
    print(f"\n🔍 What to look for:")
    print(f"- Does the Select dropdown show the current payment status correctly?")
    print(f"- Can you select 'Paid' from the dropdown?")
    print(f"- Does the change get saved when you close the dialog?")
    print(f"- Are there any console errors in the browser?")
    print(f"- Does the order list refresh to show the updated status?")
    
    return test_order

def verify_order_status(order_id):
    print(f"\n=== Verifying Order Status ===")
    try:
        order = Order.objects.get(id=order_id)
        print(f"Order {order.order_number}:")
        print(f"   - Payment Status: {'Paid' if order.payment_status else 'Unpaid'}")
        print(f"   - Last Updated: {order.updated_at}")
        return order.payment_status
    except Order.DoesNotExist:
        print(f"❌ Order with ID {order_id} not found")
        return None

if __name__ == '__main__':
    test_order = create_test_scenario()
    
    print(f"\n⏳ Now please test the frontend manually...")
    print(f"After testing, run: python -c \"from test_frontend_payment_ui import verify_order_status; verify_order_status({test_order.id})\"")