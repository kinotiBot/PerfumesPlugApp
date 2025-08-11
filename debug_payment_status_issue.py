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
from datetime import datetime

User = get_user_model()

def debug_payment_status_issue():
    print("\n=== Debugging Payment Status Update Issue ===")
    
    # Find the test order we created
    try:
        test_order = Order.objects.get(id=63)
        print(f"Found test order: {test_order.order_number}")
    except Order.DoesNotExist:
        print("❌ Test order not found. Please run test_frontend_payment_ui.py first.")
        return
    
    print(f"\n📋 Current Order Status:")
    print(f"   - Order ID: {test_order.id}")
    print(f"   - Order Number: {test_order.order_number}")
    print(f"   - Payment Status: {'Paid' if test_order.payment_status else 'Unpaid'}")
    print(f"   - Order Status: {test_order.get_status_display()}")
    print(f"   - Last Updated: {test_order.updated_at}")
    
    # Test the API endpoint directly
    print(f"\n🔧 Testing API Endpoint Directly:")
    
    # Login as admin
    admin_email = 'testadmin@test.com'
    login_url = 'http://localhost:8000/api/users/login/'
    login_data = {
        'email': admin_email,
        'password': 'admin123'
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get('access')
            print(f"✅ Admin login successful")
            
            # Test updating payment status to paid
            update_url = f'http://localhost:8000/api/orders/{test_order.id}/update_payment_status/'
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Test with different values to see what works
            test_values = [
                {'payment_status': True, 'description': 'Boolean True'},
                {'payment_status': 'true', 'description': 'String "true"'},
                {'payment_status': 1, 'description': 'Integer 1'},
            ]
            
            for test_data in test_values:
                print(f"\n--- Testing with {test_data['description']} ---")
                
                # Reset order to unpaid first
                test_order.payment_status = False
                test_order.save()
                
                update_response = requests.post(update_url, json={'payment_status': test_data['payment_status']}, headers=headers)
                print(f"Response Status: {update_response.status_code}")
                
                if update_response.status_code == 200:
                    test_order.refresh_from_db()
                    print(f"✅ Success - Payment Status: {'Paid' if test_order.payment_status else 'Unpaid'}")
                    print(f"Response: {update_response.json().get('payment_status')}")
                else:
                    print(f"❌ Failed - Response: {update_response.text}")
            
            # Test the frontend API call format
            print(f"\n--- Testing Frontend API Call Format ---")
            test_order.payment_status = False
            test_order.save()
            
            # This mimics what the frontend sends
            frontend_data = {'payment_status': True}
            update_response = requests.post(update_url, json=frontend_data, headers=headers)
            print(f"Frontend format response: {update_response.status_code}")
            
            if update_response.status_code == 200:
                test_order.refresh_from_db()
                print(f"✅ Frontend format works - Payment Status: {'Paid' if test_order.payment_status else 'Unpaid'}")
                
                # Check the response structure
                response_data = update_response.json()
                print(f"Response payment_status: {response_data.get('payment_status')}")
                print(f"Response type: {type(response_data.get('payment_status'))}")
            else:
                print(f"❌ Frontend format failed - Response: {update_response.text}")
                
        else:
            print(f"❌ Admin login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server. Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Check for common issues
    print(f"\n🔍 Checking for Common Issues:")
    
    # Check if admin user has proper permissions
    admin_user = User.objects.get(email=admin_email)
    print(f"Admin user permissions:")
    print(f"   - is_staff: {admin_user.is_staff}")
    print(f"   - is_superuser: {admin_user.is_superuser}")
    print(f"   - is_active: {admin_user.is_active}")
    
    # Check order permissions
    print(f"\nOrder details:")
    print(f"   - Order owner: {test_order.user.email if test_order.user else 'Guest'}")
    print(f"   - Can admin access: {admin_user.is_staff}")
    
    # Final status check
    test_order.refresh_from_db()
    print(f"\n📊 Final Order Status:")
    print(f"   - Payment Status: {'Paid' if test_order.payment_status else 'Unpaid'}")
    print(f"   - Last Updated: {test_order.updated_at}")
    
    print(f"\n💡 Recommendations:")
    print(f"1. Check browser console for JavaScript errors when testing frontend")
    print(f"2. Check network tab to see if API calls are being made")
    print(f"3. Verify that the Select component value is being handled correctly")
    print(f"4. Check if there are any validation errors in the frontend")
    
    return test_order

if __name__ == '__main__':
    debug_payment_status_issue()