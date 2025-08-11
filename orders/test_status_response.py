import os
import django
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.response import Response
from perfumes.models import Perfume, Brand, Category
from orders.models import Order
from orders.views import OrderViewSet
from django.contrib.auth import get_user_model
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

User = get_user_model()

class OrderStatusResponseTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin_user = User.objects.create_superuser('admin', 'password')
        self.brand = Brand.objects.create(name='Test Brand')
        self.category = Category.objects.create(name='Test Category')
        self.perfume = Perfume.objects.create(
            name='Test Perfume',
            brand=self.brand,
            category=self.category,
            price=Decimal('100.00'),
            stock=10,
            gender='Unisex'
        )
        self.order = Order.objects.create(
            user=self.admin_user,
            status='P',  # Pending
            payment_status=False,  # Unpaid
            subtotal=Decimal('100.00'),
            tax=Decimal('0.00'),
            shipping=Decimal('0.00'),
            total=Decimal('100.00')
        )

    def test_update_order_status_response(self):
        view = OrderViewSet.as_view({'post': 'update_order_status'})
        request = self.factory.post(f'/api/orders/{self.order.id}/update_order_status/', {'status': 'R'}, format='json')
        force_authenticate(request, user=self.admin_user)
        response = view(request, pk=self.order.id)

        self.assertEqual(response.status_code, 200)
        self.assertIn('id', response.data)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'R')
        self.assertIn('items', response.data)  # Check for a nested field

    def test_update_payment_status_response(self):
        view = OrderViewSet.as_view({'post': 'update_payment_status'})
        request = self.factory.post(f'/api/orders/{self.order.id}/update_payment_status/', {'payment_status': True}, format='json')
        force_authenticate(request, user=self.admin_user)
        response = view(request, pk=self.order.id)

        self.assertEqual(response.status_code, 200)
        self.assertIn('id', response.data)
        self.assertIn('payment_status', response.data)
        self.assertTrue(response.data['payment_status'])
        self.assertIn('items', response.data)  # Check for a nested field