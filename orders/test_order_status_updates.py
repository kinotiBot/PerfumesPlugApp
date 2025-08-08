from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from orders.models import Order

User = get_user_model()

class OrderStatusUpdateTestCase(TestCase):
    """Test cases for order status and payment status updates"""
    
    def setUp(self):
        """Set up test data"""
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            password='testpass123',
            first_name='Regular',
            last_name='User'
        )
        
        self.test_order = Order.objects.create(
            user=self.regular_user,
            status='P',  # Pending
            payment_status=False,  # Unpaid
            payment_method='card',
            subtotal=100.00,
            tax=10.00,
            shipping=5.00,
            total=115.00
        )
        
        self.client = APIClient()
    
    def test_update_order_status_success(self):
        """Test successful order status update"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_order_status/'
        data = {'status': 'C'}  # Confirmed
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.test_order.refresh_from_db()
        self.assertEqual(self.test_order.status, 'C')
        self.assertIn('message', response.data)
        self.assertIn('order_id', response.data)
        self.assertIn('status', response.data)
    
    def test_update_order_status_invalid_status(self):
        """Test order status update with invalid status"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_order_status/'
        data = {'status': 'INVALID'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Invalid status', response.data['error'])
    
    def test_update_order_status_missing_status(self):
        """Test order status update with missing status field"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_order_status/'
        data = {}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Status field is required')
    
    def test_update_order_status_unauthorized(self):
        """Test order status update without authentication"""
        url = f'/api/orders/{self.test_order.id}/update_order_status/'
        data = {'status': 'C'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_order_status_non_admin(self):
        """Test order status update with non-admin user"""
        self.client.force_authenticate(user=self.regular_user)
        
        url = f'/api/orders/{self.test_order.id}/update_order_status/'
        data = {'status': 'C'}
        
        response = self.client.post(url, data, format='json')
        
        # Should still work as the user owns the order, but in production
        # you might want to restrict this to admin users only
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_payment_status_success(self):
        """Test successful payment status update"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_payment_status/'
        data = {'payment_status': True}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.test_order.refresh_from_db()
        self.assertTrue(self.test_order.payment_status)
        self.assertIn('message', response.data)
        self.assertIn('order_id', response.data)
        self.assertIn('payment_status', response.data)
    
    def test_update_payment_status_to_unpaid(self):
        """Test payment status update to unpaid"""
        self.client.force_authenticate(user=self.admin_user)
        
        # First set to paid
        self.test_order.payment_status = True
        self.test_order.save()
        
        url = f'/api/orders/{self.test_order.id}/update_payment_status/'
        data = {'payment_status': False}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.test_order.refresh_from_db()
        self.assertFalse(self.test_order.payment_status)
    
    def test_update_payment_status_invalid_data(self):
        """Test payment status update with invalid data"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_payment_status/'
        data = {'payment_status': 'invalid'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_payment_status_missing_field(self):
        """Test payment status update with missing payment_status field"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_payment_status/'
        data = {}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_nonexistent_order(self):
        """Test updating status of non-existent order"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = '/api/orders/99999/update_order_status/'
        data = {'status': 'C'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_all_status_transitions(self):
        """Test all valid status transitions"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = f'/api/orders/{self.test_order.id}/update_order_status/'
        
        # Test all valid status codes
        valid_statuses = ['P', 'C', 'S', 'D', 'X']
        
        for status_code in valid_statuses:
            data = {'status': status_code}
            response = self.client.post(url, data, format='json')
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.test_order.refresh_from_db()
            self.assertEqual(self.test_order.status, status_code)
    
    def tearDown(self):
        """Clean up test data"""
        Order.objects.all().delete()
        User.objects.all().delete()