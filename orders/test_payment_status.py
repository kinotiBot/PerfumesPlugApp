from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from .models import Order, OrderItem
from perfumes.models import Perfume, Category, Brand
from users.models import Address

User = get_user_model()


class PaymentStatusUpdateTestCase(APITestCase):
    """Test cases for payment status update functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Create test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        
        # Create test data for perfumes
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
            price=Decimal('99.99'),
            stock=10,
            gender='U'
        )
        
        # Create test address
        self.address = Address.objects.create(
            user=self.user,
            address_type='S',
            street_address='123 Test St',
            city='Test City',
            state='Test State',
            zip_code='12345',
            country='Test Country'
        )
        
        # Create test order
        self.order = Order.objects.create(
            user=self.user,
            order_number='TEST001',
            status='P',
            payment_method='credit_card',
            payment_status=False,
            shipping_address=self.address,
            billing_address=self.address,
            subtotal=Decimal('99.99'),
            tax=Decimal('10.00'),
            shipping=Decimal('5.00'),
            total=Decimal('114.99')
        )
        
        # Create order item
        self.order_item = OrderItem.objects.create(
            order=self.order,
            perfume=self.perfume,
            price=Decimal('99.99'),
            quantity=1
        )
        
        self.client = APIClient()
    
    def test_update_payment_status_to_paid_success(self):
        """Test successfully updating payment status to paid"""
        self.client.force_authenticate(user=self.user)
        url = reverse('order-update-payment-status', kwargs={'pk': self.order.id})
        data = {'payment_status': True}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Payment status updated to paid')
        self.assertEqual(response.data['order_id'], self.order.id)
        self.assertEqual(response.data['payment_status'], True)
        
        # Verify database update
        self.order.refresh_from_db()
        self.assertTrue(self.order.payment_status)
    
    def test_update_payment_status_to_unpaid_success(self):
        """Test successfully updating payment status to unpaid"""
        # First set order as paid
        self.order.payment_status = True
        self.order.save()
        
        self.client.force_authenticate(user=self.user)
        url = reverse('order-update-payment-status', kwargs={'pk': self.order.id})
        data = {'payment_status': False}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Payment status updated to unpaid')
        self.assertEqual(response.data['order_id'], self.order.id)
        self.assertEqual(response.data['payment_status'], False)
        
        # Verify database update
        self.order.refresh_from_db()
        self.assertFalse(self.order.payment_status)
    
    def test_update_payment_status_missing_field(self):
        """Test updating payment status without providing payment_status field"""
        self.client.force_authenticate(user=self.user)
        url = reverse('order-update-payment-status', kwargs={'pk': self.order.id})
        data = {}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_status', response.data)
    
    def test_update_payment_status_invalid_type(self):
        """Test updating payment status with invalid data type"""
        self.client.force_authenticate(user=self.user)
        url = reverse('order-update-payment-status', kwargs={'pk': self.order.id})
        data = {'payment_status': 'invalid'}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('payment_status', response.data)
    
    def test_update_payment_status_nonexistent_order(self):
        """Test updating payment status for non-existent order"""
        self.client.force_authenticate(user=self.user)
        url = reverse('order-update-payment-status', kwargs={'pk': 99999})
        data = {'payment_status': True}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_payment_status_unauthenticated(self):
        """Test updating payment status without authentication"""
        url = reverse('order-update-payment-status', kwargs={'pk': self.order.id})
        data = {'payment_status': True}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_payment_status_different_user_order(self):
        """Test updating payment status for another user's order"""
        # Create another user
        other_user = User.objects.create_user(
            email='otheruser@example.com',
            password='otherpass123'
        )
        
        self.client.force_authenticate(user=other_user)
        url = reverse('order-update-payment-status', kwargs={'pk': self.order.id})
        data = {'payment_status': True}
        
        response = self.client.post(url, data, format='json')
        
        # Should return 404 because user can only access their own orders
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_payment_status_serializer_validation(self):
        """Test PaymentStatusUpdateSerializer validation"""
        from .serializers import PaymentStatusUpdateSerializer
        
        # Test valid data
        serializer = PaymentStatusUpdateSerializer(data={'payment_status': True})
        self.assertTrue(serializer.is_valid())
        
        serializer = PaymentStatusUpdateSerializer(data={'payment_status': False})
        self.assertTrue(serializer.is_valid())
        
        # Test invalid data
        serializer = PaymentStatusUpdateSerializer(data={'payment_status': 'invalid'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('payment_status', serializer.errors)
        
        # Test missing data
        serializer = PaymentStatusUpdateSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('payment_status', serializer.errors)


class OrderAdminTestCase(TestCase):
    """Test cases for Order admin functionality"""
    
    def setUp(self):
        """Set up test data"""
        # Create test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        
        # Create test data for perfumes
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
            price=Decimal('99.99'),
            stock=10,
            gender='U'
        )
        
        # Create test orders
        self.order1 = Order.objects.create(
            user=self.user,
            order_number='TEST001',
            status='P',
            payment_method='credit_card',
            payment_status=False,
            subtotal=Decimal('99.99'),
            tax=Decimal('10.00'),
            shipping=Decimal('5.00'),
            total=Decimal('114.99')
        )
        
        self.order2 = Order.objects.create(
            user=self.user,
            order_number='TEST002',
            status='C',
            payment_method='paypal',
            payment_status=False,
            subtotal=Decimal('199.99'),
            tax=Decimal('20.00'),
            shipping=Decimal('5.00'),
            total=Decimal('224.99')
        )
    
    def test_order_admin_payment_status_display(self):
        """Test payment status display in admin"""
        from .admin import OrderAdmin
        from django.contrib.admin.sites import AdminSite
        
        admin = OrderAdmin(Order, AdminSite())
        
        # Test unpaid status display
        unpaid_display = admin.payment_status_display(self.order1)
        self.assertIn('Unpaid', unpaid_display)
        self.assertIn('color: red', unpaid_display)
        
        # Test paid status display
        self.order1.payment_status = True
        self.order1.save()
        paid_display = admin.payment_status_display(self.order1)
        self.assertIn('Paid', paid_display)
        self.assertIn('color: green', paid_display)
    
    def test_order_admin_user_display(self):
        """Test user display in admin"""
        from .admin import OrderAdmin
        from django.contrib.admin.sites import AdminSite
        
        admin = OrderAdmin(Order, AdminSite())
        
        # Test user display
        user_display = admin.user_display(self.order1)
        self.assertEqual(user_display, 'Test User')
        
        # Test guest user display
        guest_order = Order.objects.create(
            order_number='GUEST001',
            status='P',
            payment_method='cash_on_delivery',
            payment_status=False,
            guest_name='Guest User',
            guest_email='guest@example.com',
            subtotal=Decimal('50.00'),
            tax=Decimal('5.00'),
            shipping=Decimal('5.00'),
            total=Decimal('60.00')
        )
        
        guest_display = admin.user_display(guest_order)
        self.assertEqual(guest_display, 'Guest User')
    
    def test_order_admin_bulk_actions(self):
        """Test bulk payment status actions in admin"""
        from .admin import OrderAdmin
        from django.contrib.admin.sites import AdminSite
        from django.http import HttpRequest
        from django.contrib.messages.storage.fallback import FallbackStorage
        
        admin = OrderAdmin(Order, AdminSite())
        request = HttpRequest()
        request.session = {}
        request._messages = FallbackStorage(request)
        
        # Test mark as paid action
        queryset = Order.objects.filter(id__in=[self.order1.id, self.order2.id])
        admin.mark_payment_paid(request, queryset)
        
        # Verify orders are marked as paid
        self.order1.refresh_from_db()
        self.order2.refresh_from_db()
        self.assertTrue(self.order1.payment_status)
        self.assertTrue(self.order2.payment_status)
        
        # Test mark as unpaid action
        admin.mark_payment_unpaid(request, queryset)
        
        # Verify orders are marked as unpaid
        self.order1.refresh_from_db()
        self.order2.refresh_from_db()
        self.assertFalse(self.order1.payment_status)
        self.assertFalse(self.order2.payment_status)