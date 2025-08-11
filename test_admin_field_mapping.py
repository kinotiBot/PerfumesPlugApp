#!/usr/bin/env python
"""
Test to verify that the admin order details field mapping is correct.
This test specifically checks that 'total' field from API maps correctly 
to the admin interface (not 'total_amount').
"""

import os
import django
import sys
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from perfumes.models import Perfume, Brand, Category

User = get_user_model()

class AdminFieldMappingTest(TestCase):
    """Test that admin field mapping works correctly"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )
        
        self.brand = Brand.objects.create(
            name='Test Brand',
            slug='test-brand'
        )
        
        self.perfume = Perfume.objects.create(
            name='Test Perfume',
            slug='test-perfume',
            brand=self.brand,
            category=self.category,
            price=Decimal('50.00'),
            stock=10,
            gender='U',
            description='Test description'
        )
        
        self.order = Order.objects.create(
            user=self.user,
            payment_method='mobile_money',
            payment_status=True,
            subtotal=Decimal('50.00'),
            tax=Decimal('0.00'),
            shipping=Decimal('0.00'),
            total=Decimal('50.00')
        )
        
        self.order_item = OrderItem.objects.create(
            order=self.order,
            perfume=self.perfume,
            price=Decimal('50.00'),
            quantity=1
        )
    
    def test_order_serializer_returns_total_field(self):
        """Test that OrderSerializer returns 'total' field (not 'total_amount')"""
        serializer = OrderSerializer(self.order)
        data = serializer.data
        
        # Check that 'total' field exists
        self.assertIn('total', data, "OrderSerializer should return 'total' field")
        
        # Check that 'total_amount' field does NOT exist
        self.assertNotIn('total_amount', data, "OrderSerializer should NOT return 'total_amount' field")
        
        # Check that the total value is correct
        self.assertEqual(str(data['total']), '50.00', "Total value should be '50.00'")
        
        print("✅ OrderSerializer correctly returns 'total' field")
        print(f"✅ Total value: {data['total']}")
    
    def test_order_model_has_total_field(self):
        """Test that Order model has 'total' field (not 'total_amount')"""
        # Check that the model has 'total' field
        self.assertTrue(hasattr(self.order, 'total'), "Order model should have 'total' field")
        
        # Check that the model does NOT have 'total_amount' field
        self.assertFalse(hasattr(self.order, 'total_amount'), "Order model should NOT have 'total_amount' field")
        
        # Check the value
        self.assertEqual(self.order.total, Decimal('50.00'), "Order total should be 50.00")
        
        print("✅ Order model correctly has 'total' field")
        print(f"✅ Model total value: {self.order.total}")
    
    def test_serializer_fields_match_admin_expectations(self):
        """Test that serializer fields match what admin interface expects"""
        serializer = OrderSerializer(self.order)
        data = serializer.data
        
        # Fields that admin interface expects
        expected_fields = [
            'id', 'order_number', 'user', 'status', 'payment_method', 
            'payment_status', 'total', 'created_at', 'items'
        ]
        
        for field in expected_fields:
            self.assertIn(field, data, f"Missing expected field: {field}")
        
        # Check that items have the correct structure
        if data['items']:
            item = data['items'][0]
            item_expected_fields = ['id', 'perfume', 'perfume_details', 'price', 'quantity', 'total']
            
            for field in item_expected_fields:
                self.assertIn(field, item, f"Missing expected item field: {field}")
        
        print("✅ All expected fields present in serializer output")
        print(f"✅ Available fields: {list(data.keys())}")

def run_tests():
    """Run the field mapping tests"""
    print("=== Admin Field Mapping Test ===")
    print("Testing that API returns 'total' field (not 'total_amount')\n")
    
    # Create test instance
    test_case = AdminFieldMappingTest()
    test_case.setUp()
    
    try:
        # Run tests
        test_case.test_order_serializer_returns_total_field()
        test_case.test_order_model_has_total_field()
        test_case.test_serializer_fields_match_admin_expectations()
        
        print("\n🎉 SUCCESS: All field mapping tests passed!")
        print("\nThe admin interface fix is working correctly:")
        print("- API returns 'total' field (not 'total_amount')")
        print("- Admin Orders.js now uses 'selectedOrder.total'")
        print("- Order details should display the total amount properly")
        
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)