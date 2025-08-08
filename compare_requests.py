import os
import django
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate

from orders.models import Order
from orders.views import OrderViewSet

User = get_user_model()

def test_request_formats():
    print("=== Testing Different Request Formats ===\n")
    
    # Get admin user and order
    admin_user = User.objects.get(email='admin@test.com')
    order = Order.objects.get(id=48)
    
    print(f"Testing with Order ID: {order.id}")
    print(f"Current status: {order.status}\n")
    
    # Create request factory
    factory = RequestFactory()
    
    # Test different data formats
    test_cases = [
        {'status': 'C'},  # Simple dict
        json.dumps({'status': 'C'}),  # JSON string
        {'status': 'C', 'extra_field': 'ignored'},  # Extra fields
        {'status': ''},  # Empty status
        {},  # Empty dict
    ]
    
    for i, data in enumerate(test_cases, 1):
        print(f"=== Test Case {i}: {data} ===")
        
        try:
            # Create POST request
            if isinstance(data, str):
                request = factory.post(
                    f'/api/orders/{order.id}/update_order_status/',
                    data=data,
                    content_type='application/json'
                )
            else:
                request = factory.post(
                    f'/api/orders/{order.id}/update_order_status/',
                    data=data,
                    content_type='application/json'
                )
            
            # Authenticate request
            force_authenticate(request, user=admin_user)
            
            # Create viewset and call action
            viewset = OrderViewSet()
            viewset.request = request
            viewset.format_kwarg = None
            
            # Call the action
            response = viewset.update_order_status(request, pk=order.id)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Data: {response.data}")
            
            # Refresh order
            order.refresh_from_db()
            print(f"Order status after: {order.status}")
            
        except Exception as e:
            print(f"Error: {e}")
        
        print()
        
        # Reset order status for next test
        order.status = 'P'
        order.save()

if __name__ == '__main__':
    test_request_formats()