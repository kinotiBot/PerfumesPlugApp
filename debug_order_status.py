import os
import django
import requests
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def debug_order_status_update():
    print("=== Debugging Order Status Update ===\n")
    
    # Get or create admin user
    try:
        admin_user = User.objects.get(email='admin@test.com')
        print(f"Using existing admin user: {admin_user.email}")
    except User.DoesNotExist:
        admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        print(f"Created new admin user: {admin_user.email}")
    
    # Generate JWT token
    refresh = RefreshToken.for_user(admin_user)
    access_token = str(refresh.access_token)
    print(f"Auth token: {access_token[:10]}...\n")
    
    # Get an existing order or create one
    order = Order.objects.filter(user=admin_user).first()
    if not order:
        order = Order.objects.create(
            user=admin_user,
            status='P',
            payment_status=False,
            payment_method='card',
            subtotal=100.00,
            tax=10.00,
            shipping=5.00,
            total=115.00
        )
        print(f"Created test order: {order.id}")
    else:
        print(f"Using existing order: {order.id}")
    
    print(f"Current order status: {order.status} ({order.get_status_display()})\n")
    
    # Test the API endpoint
    url = f'http://127.0.0.1:8000/api/orders/{order.id}/update_order_status/'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Test data variations
    test_cases = [
        {'status': 'C'},  # Valid status
        {'status': 'INVALID'},  # Invalid status
        {},  # Missing status
        {'status': ''},  # Empty status
        {'status': None},  # Null status
    ]
    
    for i, data in enumerate(test_cases, 1):
        print(f"=== Test Case {i}: {data} ===")
        
        try:
            response = requests.post(url, headers=headers, json=data)
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            try:
                response_data = response.json()
                print(f"Response Data: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Response Text: {response.text}")
                
        except Exception as e:
            print(f"Request failed: {e}")
        
        print()
        
        # Refresh order status
        order.refresh_from_db()
        print(f"Order status after test: {order.status} ({order.get_status_display()})\n")
        
        if i == 1:  # Only test the first valid case, then break
            break

if __name__ == '__main__':
    debug_order_status_update()