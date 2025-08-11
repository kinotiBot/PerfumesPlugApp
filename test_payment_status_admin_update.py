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
from rest_framework.authtoken.models import Token

User = get_user_model()

def test_admin_payment_status_update():
    print("\n=== Testing Admin Payment Status Update ===")
    
    # Create or get admin user
    admin_email = 'testadmin@test.com'
    try:
        admin_user = User.objects.get(email=admin_email)
        admin_user.set_password('admin123')  # Reset password to ensure we know it
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()
        print(f"Updated existing admin user: {admin_user.email}")
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
    
    # Create or get a test order
    test_order = Order.objects.filter(payment_status=False).first()
    if not test_order:
        # Create a test perfume if needed
        perfume, _ = Perfume.objects.get_or_create(
            name='Test Perfume',
            defaults={
                'description': 'Test perfume for payment status testing',
                'price': 50.00,
                'stock': 10,
                'is_active': True
            }
        )
        
        # Create a test order
        test_order = Order.objects.create(
            user=admin_user,
            payment_method='mobile_money',
            payment_status=False,  # Unpaid
            subtotal=50.00,
            tax=5.00,
            shipping=10.00,
            total=65.00
        )
        print(f"Created test order: {test_order.order_number}")
    else:
        print(f"Using existing unpaid order: {test_order.order_number}")
    
    print(f"Initial payment status: {test_order.payment_status}")
    
    # Test 1: Login as admin
    print("\n--- Test 1: Admin Login ---")
    login_url = 'http://localhost:8000/api/users/login/'
    login_data = {
        'email': 'testadmin@test.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login status: {response.status_code}")
        
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get('access')
            print(f"Login successful, got token: {token[:20]}...")
            
            # Test 2: Update payment status to paid
            print("\n--- Test 2: Update Payment Status to Paid ---")
            update_url = f'http://localhost:8000/api/orders/{test_order.id}/update_payment_status/'
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            update_data = {
                'payment_status': True  # Set to paid
            }
            
            print(f"Sending request to: {update_url}")
            print(f"Request data: {update_data}")
            print(f"Headers: {headers}")
            
            update_response = requests.post(update_url, json=update_data, headers=headers)
            print(f"Update response status: {update_response.status_code}")
            print(f"Update response body: {update_response.text}")
            
            if update_response.status_code == 200:
                # Check if the order was actually updated
                test_order.refresh_from_db()
                print(f"\nOrder payment status after update: {test_order.payment_status}")
                
                if test_order.payment_status:
                    print("✅ SUCCESS: Payment status successfully updated to paid!")
                else:
                    print("❌ ISSUE: Payment status was not updated in database")
            else:
                print(f"❌ ERROR: Failed to update payment status")
                try:
                    error_data = update_response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Raw error response: {update_response.text}")
        else:
            print(f"❌ Login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server. Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 3: Check current order status directly from database
    print("\n--- Test 3: Direct Database Check ---")
    test_order.refresh_from_db()
    print(f"Current order payment status in DB: {test_order.payment_status}")
    print(f"Order details: ID={test_order.id}, Number={test_order.order_number}, Status={test_order.status}")

if __name__ == '__main__':
    test_admin_payment_status_update()