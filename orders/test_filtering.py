from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Order, OrderItem
from perfumes.models import Perfume, Category, Brand
from decimal import Decimal

User = get_user_model()

class OrderFilteringTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            first_name='Admin',
            last_name='User',
            password='testpass123',
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            first_name='Regular',
            last_name='User',
            password='testpass123'
        )
        
        # Create test data
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        self.brand = Brand.objects.create(name='Test Brand', slug='test-brand')
        self.perfume = Perfume.objects.create(
            name='Test Perfume',
            slug='test-perfume',
            brand=self.brand,
            category=self.category,
            price=Decimal('50.00'),
            stock=10
        )
        
        # Create test orders with different statuses
        self.order1 = Order.objects.create(
            user=self.regular_user,
            status='P',  # Pending
            payment_method='mobile_money',
            payment_status=False,  # Not paid
            subtotal=Decimal('50.00'),
            tax=Decimal('5.00'),
            shipping=Decimal('10.00'),
            total=Decimal('65.00')
        )
        
        self.order2 = Order.objects.create(
            user=self.regular_user,
            status='C',  # Confirmed
            payment_method='credit_card',
            payment_status=True,  # Paid
            subtotal=Decimal('75.00'),
            tax=Decimal('7.50'),
            shipping=Decimal('10.00'),
            total=Decimal('92.50')
        )
        
        self.order3 = Order.objects.create(
            user=self.regular_user,
            status='D',  # Delivered
            payment_method='paypal',
            payment_status=True,  # Paid
            subtotal=Decimal('100.00'),
            tax=Decimal('10.00'),
            shipping=Decimal('15.00'),
            total=Decimal('125.00')
        )
    
    def test_filter_by_status(self):
        """Test filtering orders by status"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Filter by pending status
        response = self.client.get('/api/orders/?status=P')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'P')
        
        # Filter by confirmed status
        response = self.client.get('/api/orders/?status=C')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'C')
    
    def test_filter_by_order_id(self):
        """Test filtering orders by order ID"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Filter by specific order ID
        response = self.client.get(f'/api/orders/?order_id={self.order1.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.order1.id)
    
    def test_filter_by_payment_status(self):
        """Test filtering orders by payment status"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Filter by paid payment status (True)
        response = self.client.get('/api/orders/?payment_status=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        for order in response.data['results']:
            self.assertTrue(order['payment_status'])
    
    def test_combined_filters(self):
        """Test using multiple filters together"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Filter by status and payment_status
        response = self.client.get('/api/orders/?status=C&payment_status=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'C')
        self.assertTrue(response.data['results'][0]['payment_status'])
    
    def test_clear_filters(self):
        """Test that no filters returns all orders"""
        self.client.force_authenticate(user=self.admin_user)
        
        # No filters should return all orders
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)
    
    def test_non_admin_user_filtering(self):
        """Test that non-admin users can only see their own orders"""
        self.client.force_authenticate(user=self.regular_user)
        
        # Regular user should only see their own orders
        response = self.client.get('/api/orders/?status=P')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['user'], self.regular_user.id)
    
    def test_invalid_filter_values(self):
        """Test filtering with invalid values"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Invalid status should return 400 or no results depending on backend validation
        response = self.client.get('/api/orders/?status=INVALID')
        # Accept either 400 (validation error) or 200 (empty results)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
        if response.status_code == status.HTTP_200_OK:
            self.assertEqual(len(response.data['results']), 0)
        
        # Invalid order_id should return no results
        response = self.client.get('/api/orders/?order_id=99999')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)