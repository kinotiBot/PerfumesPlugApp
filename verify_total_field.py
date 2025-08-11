import os
import django
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from perfumes.models import Perfume, Brand, Category
from decimal import Decimal
import uuid

User = get_user_model()

def verify_total_field():
    print("🔍 Verifying order total field...")
    
    try:
        # Create unique test data
        unique_id = str(uuid.uuid4())[:8]
        
        # Create or get test user
        user, created = User.objects.get_or_create(
            email=f'testuser_{unique_id}@example.com',
            defaults={
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        # Create or get test data
        category, created = Category.objects.get_or_create(
            slug=f'test-category-{unique_id}',
            defaults={'name': f'Test Category {unique_id}'}
        )
        
        brand, created = Brand.objects.get_or_create(
            slug=f'test-brand-{unique_id}',
            defaults={'name': f'Test Brand {unique_id}'}
        )
        
        perfume, created = Perfume.objects.get_or_create(
            slug=f'test-perfume-{unique_id}',
            defaults={
                'name': f'Test Perfume {unique_id}',
                'brand': brand,
                'category': category,
                'price': Decimal('50.00'),
                'description': 'Test perfume description'
            }
        )
        
        # Create test order
        order = Order.objects.create(
            user=user,
            order_number=f'TEST{unique_id}',
            payment_method='credit_card',
            subtotal=Decimal('50.00'),
            tax=Decimal('5.00'),
            shipping=Decimal('10.00'),
            total=Decimal('65.00')
        )
        
        # Create order item
        order_item = OrderItem.objects.create(
            order=order,
            perfume=perfume,
            price=Decimal('50.00'),
            quantity=1
        )
        
        print(f"✅ Created test order: {order.order_number}")
        
        # Test 1: Check Order model has total field
        print(f"\n📋 Order Model Check:")
        print(f"   Order ID: {order.id}")
        print(f"   Order Number: {order.order_number}")
        print(f"   Subtotal: ${order.subtotal}")
        print(f"   Tax: ${order.tax}")
        print(f"   Shipping: ${order.shipping}")
        print(f"   Total: ${order.total}")
        
        # Test 2: Check OrderSerializer output
        print(f"\n🔧 OrderSerializer Check:")
        serializer = OrderSerializer(instance=order)
        data = serializer.data
        
        # Check total field exists
        if 'total' in data:
            print(f"   ✅ 'total' field present: ${data['total']}")
        else:
            print(f"   ❌ 'total' field missing")
            return False
        
        # Check total_amount field does not exist
        if 'total_amount' not in data:
            print(f"   ✅ 'total_amount' field correctly absent")
        else:
            print(f"   ❌ 'total_amount' field incorrectly present: ${data['total_amount']}")
            return False
        
        # Test 3: Check serializer includes all expected fields
        expected_fields = [
            'id', 'order_number', 'user', 'status', 'payment_method', 'payment_status',
            'shipping_address', 'shipping_address_details', 'billing_address', 'billing_address_details',
            'subtotal', 'tax', 'shipping', 'total', 'items', 'created_at', 'updated_at'
        ]
        
        print(f"\n📝 Serializer Fields Check:")
        missing_fields = []
        for field in expected_fields:
            if field in data:
                print(f"   ✅ {field}: present")
            else:
                print(f"   ❌ {field}: missing")
                missing_fields.append(field)
        
        if missing_fields:
            print(f"\n❌ Missing fields: {missing_fields}")
            return False
        
        # Test 4: Verify total calculation
        expected_total = order.subtotal + order.tax + order.shipping
        actual_total = Decimal(str(data['total']))
        
        print(f"\n🧮 Total Calculation Check:")
        print(f"   Subtotal: ${order.subtotal}")
        print(f"   Tax: ${order.tax}")
        print(f"   Shipping: ${order.shipping}")
        print(f"   Expected Total: ${expected_total}")
        print(f"   Actual Total: ${actual_total}")
        
        if actual_total == expected_total:
            print(f"   ✅ Total calculation correct")
        else:
            print(f"   ❌ Total calculation incorrect")
            return False
        
        print(f"\n🎉 All checks passed! The order total field is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during verification: {str(e)}")
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
            print(f"\n🧹 Cleaned up test data")
        except:
            pass

if __name__ == '__main__':
    success = verify_total_field()
    if not success:
        sys.exit(1)