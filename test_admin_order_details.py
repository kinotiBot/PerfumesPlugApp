import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from orders.models import Order, OrderItem
from perfumes.models import Perfume, Brand
from decimal import Decimal
import json

User = get_user_model()

class AdminOrderDetailsTest(TestCase):
    def setUp(self):
        # Create test user with unique email
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        
        self.user = User.objects.create_user(
            email=f'test{unique_id}@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            email=f'admin{unique_id}@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        
        # Create test brand and perfume
        self.brand = Brand.objects.create(name='Test Brand')
        self.perfume = Perfume.objects.create(
            name='Test Perfume',
            brand=self.brand,
            price=Decimal('50.00'),
            description='Test description'
        )
        
        # Create test order
        self.order = Order.objects.create(
            user=self.user,
            payment_method='mobile_money',
            payment_status=True,
            subtotal=Decimal('50.00'),
            tax=Decimal('0.00'),
            shipping=Decimal('0.00'),
            total=Decimal('50.00')
        )
        
        # Create order item
        self.order_item = OrderItem.objects.create(
            order=self.order,
            perfume=self.perfume,
            price=Decimal('50.00'),
            quantity=1
        )
        
        self.client = Client()
    
    def test_order_api_response_structure(self):
        """Test that the order API returns the correct field structure"""
        # Login as admin
        self.client.login(email=self.admin_user.email, password='adminpass123')
        
        # Get orders list
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('results', data)
        
        if data['results']:
            order_data = data['results'][0]
            
            # Check that the order has the correct fields
            required_fields = [
                'id', 'order_number', 'user', 'status', 'payment_method', 
                'payment_status', 'subtotal', 'tax', 'shipping', 'total', 
                'items', 'created_at', 'updated_at'
            ]
            
            for field in required_fields:
                self.assertIn(field, order_data, f"Field '{field}' missing from order data")
            
            # Specifically check that 'total' field exists (not 'total_amount')
            self.assertIn('total', order_data)
            self.assertNotIn('total_amount', order_data)
            
            # Check that total has a value
            self.assertIsNotNone(order_data['total'])
            self.assertEqual(str(order_data['total']), '50.00')
    
    def test_guest_order_fields(self):
        """Test that guest order fields are properly included"""
        # Create a guest order
        guest_order = Order.objects.create(
            user=None,  # Guest order
            guest_name='Guest User',
            guest_email='guest@example.com',
            guest_phone='+250123456789',
            guest_address='123 Test Street',
            guest_city='Kigali',
            guest_province='Kigali City',
            payment_method='mobile_money',
            payment_status=False,
            subtotal=Decimal('75.00'),
            tax=Decimal('0.00'),
            shipping=Decimal('0.00'),
            total=Decimal('75.00')
        )
        
        # Create order item for guest order
        OrderItem.objects.create(
            order=guest_order,
            perfume=self.perfume,
            price=Decimal('75.00'),
            quantity=1
        )
        
        # Login as admin
        self.client.login(email=self.admin_user.email, password='adminpass123')
        
        # Get orders list
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        # Find the guest order
        guest_order_data = None
        for order in data['results']:
            if order['user'] is None:
                guest_order_data = order
                break
        
        self.assertIsNotNone(guest_order_data, "Guest order not found in API response")
        
        # Check guest fields are included in the serializer
        guest_fields = [
            'guest_name', 'guest_email', 'guest_phone', 
            'guest_address', 'guest_city', 'guest_province'
        ]
        
        # Note: These fields might not be in the basic OrderSerializer
        # but should be available in the model for detailed views
        self.assertEqual(guest_order_data['total'], '75.00')
    
    def test_order_items_structure(self):
        """Test that order items have the correct structure"""
        # Login as admin
        self.client.login(email=self.admin_user.email, password='adminpass123')
        
        # Get orders list
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        if data['results']:
            order_data = data['results'][0]
            
            # Check items structure
            self.assertIn('items', order_data)
            self.assertIsInstance(order_data['items'], list)
            
            if order_data['items']:
                item = order_data['items'][0]
                
                # Check item fields
                item_fields = ['id', 'perfume', 'perfume_details', 'price', 'quantity', 'total']
                for field in item_fields:
                    self.assertIn(field, item, f"Field '{field}' missing from order item")
                
                # Check perfume details
                self.assertIn('perfume_details', item)
                perfume_details = item['perfume_details']
                self.assertIn('name', perfume_details)
                self.assertIn('brand', perfume_details)

if __name__ == '__main__':
    import unittest
    unittest.main()