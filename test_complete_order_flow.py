import os
import django
import sys
import json

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from perfumes.models import Perfume, Brand, Category
from decimal import Decimal
import uuid

User = get_user_model()

def test_complete_order_flow():
    print("🔍 Testing complete order flow from backend to frontend...")
    
    try:
        # Create unique test data
        unique_id = str(uuid.uuid4())[:8]
        
        # Create test user
        user = User.objects.create_user(
            email=f'testuser_{unique_id}@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create admin user
        admin_user = User.objects.create_user(
            email=f'admin_{unique_id}@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        
        # Create test data
        category = Category.objects.create(
            name=f'Test Category {unique_id}',
            slug=f'test-category-{unique_id}'
        )
        
        brand = Brand.objects.create(
            name=f'Test Brand {unique_id}',
            slug=f'test-brand-{unique_id}'
        )
        
        perfume = Perfume.objects.create(
            name=f'Test Perfume {unique_id}',
            slug=f'test-perfume-{unique_id}',
            brand=brand,
            category=category,
            price=Decimal('99.99'),
            description='Test perfume description'
        )
        
        # Create test order
        order = Order.objects.create(
            user=user,
            order_number=f'TEST{unique_id}',
            payment_method='credit_card',
            subtotal=Decimal('99.99'),
            tax=Decimal('10.00'),
            shipping=Decimal('5.00'),
            total=Decimal('114.99')
        )
        
        # Create order item
        order_item = OrderItem.objects.create(
            order=order,
            perfume=perfume,
            price=Decimal('99.99'),
            quantity=1
        )
        
        print(f"✅ Created test order: {order.order_number}")
        print(f"   Order ID: {order.id}")
        print(f"   Total: ${order.total}")
        
        # Test 1: Direct API call to get order details
        print(f"\n🔧 Testing API Response:")
        client = Client()
        
        # Login as admin
        login_response = client.post('/api/auth/login/', {
            'email': admin_user.email,
            'password': 'adminpass123'
        })
        
        if login_response.status_code == 200:
            print(f"   ✅ Admin login successful")
            
            # Get the token from login response
            login_data = login_response.json()
            token = login_data.get('access')
            
            if token:
                # Make authenticated request to get order details
                headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
                order_response = client.get(f'/api/orders/{order.id}/', **headers)
                
                if order_response.status_code == 200:
                    print(f"   ✅ Order API call successful")
                    order_data = order_response.json()
                    
                    # Check total field
                    if 'total' in order_data:
                        print(f"   ✅ 'total' field present: ${order_data['total']}")
                        
                        # Verify the value matches
                        if str(order_data['total']) == str(order.total):
                            print(f"   ✅ Total value matches database: ${order_data['total']}")
                        else:
                            print(f"   ❌ Total value mismatch - API: ${order_data['total']}, DB: ${order.total}")
                            return False
                    else:
                        print(f"   ❌ 'total' field missing from API response")
                        print(f"   Available fields: {list(order_data.keys())}")
                        return False
                    
                    # Check that total_amount is not present
                    if 'total_amount' not in order_data:
                        print(f"   ✅ 'total_amount' field correctly absent")
                    else:
                        print(f"   ❌ 'total_amount' field incorrectly present")
                        return False
                    
                    # Print full order data for debugging
                    print(f"\n📋 Complete Order Data:")
                    print(f"   ID: {order_data.get('id')}")
                    print(f"   Order Number: {order_data.get('order_number')}")
                    print(f"   Subtotal: ${order_data.get('subtotal')}")
                    print(f"   Tax: ${order_data.get('tax')}")
                    print(f"   Shipping: ${order_data.get('shipping')}")
                    print(f"   Total: ${order_data.get('total')}")
                    print(f"   Status: {order_data.get('status')}")
                    print(f"   Payment Status: {order_data.get('payment_status')}")
                    
                else:
                    print(f"   ❌ Order API call failed: {order_response.status_code}")
                    print(f"   Response: {order_response.content.decode()}")
                    return False
            else:
                print(f"   ❌ No token received from login")
                return False
        else:
            print(f"   ❌ Admin login failed: {login_response.status_code}")
            print(f"   Response: {login_response.content.decode()}")
            return False
        
        # Test 2: Test orders list API
        print(f"\n📋 Testing Orders List API:")
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        orders_response = client.get('/api/orders/', **headers)
        
        if orders_response.status_code == 200:
            print(f"   ✅ Orders list API call successful")
            orders_data = orders_response.json()
            
            # Check if our order is in the list
            results = orders_data.get('results', [])
            our_order = None
            for order_item in results:
                if order_item.get('id') == order.id:
                    our_order = order_item
                    break
            
            if our_order:
                print(f"   ✅ Our order found in list")
                if 'total' in our_order:
                    print(f"   ✅ 'total' field present in list: ${our_order['total']}")
                else:
                    print(f"   ❌ 'total' field missing from list")
                    return False
            else:
                print(f"   ❌ Our order not found in list")
                return False
        else:
            print(f"   ❌ Orders list API call failed: {orders_response.status_code}")
            return False
        
        print(f"\n🎉 All tests passed! The complete order flow is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up test data
        try:
            if 'order' in locals():
                order.delete()
            if 'perfume' in locals():
                perfume.delete()
            if 'brand' in locals():
                brand.delete()
            if 'category' in locals():
                category.delete()
            if 'user' in locals():
                user.delete()
            if 'admin_user' in locals():
                admin_user.delete()
            print(f"\n🧹 Cleaned up test data")
        except:
            pass

if __name__ == '__main__':
    success = test_complete_order_flow()
    if not success:
        sys.exit(1)