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

from django.contrib.auth import get_user_model
from orders.models import Order
from rest_framework.test import APIRequestFactory, force_authenticate
from orders.views import OrderViewSet
import json

User = get_user_model()

def test_order_status_updates():
    """Test order status and payment status update functionality"""
    
    print("=== Testing Order Status Update Functionality ===")
    
    # Create or get test admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('testpass123')
        admin_user.save()
        print(f"Created admin user: {admin_user.email}")
    else:
        print(f"Using existing admin user: {admin_user.email}")
    
    # Create test order
    test_order = Order.objects.create(
        user=admin_user,
        status='P',  # Pending
        payment_status=False,  # Unpaid
        payment_method='card',
        subtotal=100.00,
        tax=10.00,
        shipping=5.00,
        total=115.00
    )
    
    print(f"\nCreated test order: {test_order.id}")
    print(f"Initial status: {test_order.status} ({test_order.get_status_display()})")
    print(f"Initial payment status: {test_order.payment_status}")
    
    factory = APIRequestFactory()
    
    # Test 1: Update order status using new custom endpoint
    print("\n=== Test 1: Order Status Update (Custom Endpoint) ===")
    view = OrderViewSet.as_view({'post': 'update_order_status'})
    
    request = factory.post(f'/api/orders/{test_order.id}/update_order_status/', 
                          {'status': 'C'}, format='json')  # Confirmed
    force_authenticate(request, user=admin_user)
    
    response = view(request, pk=test_order.id)
    print(f"Order status update response: {response.status_code}")
    
    if response.status_code == 200:
        test_order.refresh_from_db()
        print(f"Order status after update: {test_order.status} ({test_order.get_status_display()})")
        print(f"Response data: {response.data}")
    else:
        print(f"Order status update failed: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Test 2: Update order status to Shipped
    print("\n=== Test 2: Order Status Update to Shipped ===")
    request = factory.post(f'/api/orders/{test_order.id}/update_order_status/', 
                          {'status': 'S'}, format='json')  # Shipped
    force_authenticate(request, user=admin_user)
    
    response = view(request, pk=test_order.id)
    print(f"Order status update response: {response.status_code}")
    
    if response.status_code == 200:
        test_order.refresh_from_db()
        print(f"Order status after update: {test_order.status} ({test_order.get_status_display()})")
        print(f"Response data: {response.data}")
    else:
        print(f"Order status update failed: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Test 3: Test invalid status
    print("\n=== Test 3: Invalid Status Test ===")
    request = factory.post(f'/api/orders/{test_order.id}/update_order_status/', 
                          {'status': 'INVALID'}, format='json')
    force_authenticate(request, user=admin_user)
    
    response = view(request, pk=test_order.id)
    print(f"Invalid status update response: {response.status_code}")
    print(f"Response data: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Test 4: Test missing status field
    print("\n=== Test 4: Missing Status Field Test ===")
    request = factory.post(f'/api/orders/{test_order.id}/update_order_status/', 
                          {}, format='json')
    force_authenticate(request, user=admin_user)
    
    response = view(request, pk=test_order.id)
    print(f"Missing status field response: {response.status_code}")
    print(f"Response data: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Test 5: Update payment status
    print("\n=== Test 5: Payment Status Update ===")
    view = OrderViewSet.as_view({'post': 'update_payment_status'})
    
    request = factory.post(f'/api/orders/{test_order.id}/update_payment_status/', 
                          {'payment_status': True}, format='json')
    force_authenticate(request, user=admin_user)
    
    response = view(request, pk=test_order.id)
    print(f"Payment status update response: {response.status_code}")
    
    if response.status_code == 200:
        test_order.refresh_from_db()
        print(f"Payment status after update: {test_order.payment_status}")
        print(f"Response data: {response.data}")
    else:
        print(f"Payment status update failed: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Test 6: Update payment status back to unpaid
    print("\n=== Test 6: Payment Status Update to Unpaid ===")
    request = factory.post(f'/api/orders/{test_order.id}/update_payment_status/', 
                          {'payment_status': False}, format='json')
    force_authenticate(request, user=admin_user)
    
    response = view(request, pk=test_order.id)
    print(f"Payment status update response: {response.status_code}")
    
    if response.status_code == 200:
        test_order.refresh_from_db()
        print(f"Payment status after update: {test_order.payment_status}")
        print(f"Response data: {response.data}")
    else:
        print(f"Payment status update failed: {response.data if hasattr(response, 'data') else 'No data'}")
    
    # Test 7: Check available status choices
    print("\n=== Test 7: Available Status Choices ===")
    print(f"Order status choices: {Order.STATUS_CHOICES}")
    for code, display in Order.STATUS_CHOICES:
        print(f"  {code}: {display}")
    
    print(f"\nFinal order state:")
    print(f"  Status: {test_order.status} ({test_order.get_status_display()})")
    print(f"  Payment Status: {test_order.payment_status}")
    
    # Cleanup
    test_order.delete()
    if created:
        admin_user.delete()
    
    print("\n=== Test completed successfully ===")

if __name__ == '__main__':
    test_order_status_updates()