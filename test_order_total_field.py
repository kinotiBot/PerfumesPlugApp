import os
import django
import sys

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
import json

User = get_user_model()

class OrderTotalFieldTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        
        # Create test data
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
            description='Test perfume description'
        )
        
        # Create test order
        self.order = Order.objects.create(
            user=self.user,
            order_number='TEST001',
            payment_method='credit_card',
            subtotal=Decimal('50.00'),
            tax=Decimal('5.00'),
            shipping=Decimal('10.00'),
            total=Decimal('65.00')
        )
        
        # Create order item
        self.order_item = OrderItem.objects.create(
            order=self.order,
            perfume=self.perfume,
            price=Decimal('50.00'),
            quantity=1
        )
        
        self.client = Client()
    
    def test_order_serializer_has_total_field(self):
        """Test that OrderSerializer includes the total field"""
        from orders.serializers import OrderSerializer
        
        serializer = OrderSerializer(instance=self.order)
        data = serializer.data
        
        # Check that total field exists
        self.assertIn('total', data)
        self.assertEqual(str(data['total']), '65.00')
        
        # Check that total_amount field does not exist
        self.assertNotIn('total_amount', data)
        
        print(f"✓ Order serializer includes 'total' field: {data['total']}")
        print(f"✓ Order serializer does not include 'total_amount' field")
    
    def test_admin_order_api_response(self):
        """Test that admin can retrieve order with correct total field"""
        # Login as admin
        login_success = self.client.login(email='admin@example.com', password='adminpass123')
        self.assertTrue(login_success, "Admin login failed")
        
        # Get order details
        response = self.client.get(f'/api/orders/{self.order.id}/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        # Check that total field exists and has correct value
        self.assertIn('total', data)
        self.assertEqual(data['total'], '65.00')
        
        # Check that total_amount field does not exist
        self.assertNotIn('total_amount', data)
        
        print(f"✓ Admin API returns order with 'total' field: {data['total']}")
        print(f"✓ Admin API does not return 'total_amount' field")
    
    def test_order_list_api_response(self):
        """Test that order list API returns orders with correct total field"""
        # Login as admin
        login_success = self.client.login(email='admin@example.com', password='adminpass123')
        self.assertTrue(login_success, "Admin login failed")
        
        # Get orders list
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        # Check that we have results
        self.assertIn('results', data)
        self.assertGreater(len(data['results']), 0)
        
        # Check first order has total field
        first_order = data['results'][0]
        self.assertIn('total', first_order)
        self.assertEqual(first_order['total'], '65.00')
        
        # Check that total_amount field does not exist
        self.assertNotIn('total_amount', first_order)
        
        print(f"✓ Order list API returns orders with 'total' field: {first_order['total']}")
        print(f"✓ Order list API does not return 'total_amount' field")

if __name__ == '__main__':
    import unittest
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(OrderTotalFieldTest)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print("\n✅ All tests passed! The order total field is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")
        sys.exit(1)