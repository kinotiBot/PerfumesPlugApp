#!/usr/bin/env python
"""
Comprehensive test to debug frontend payment status update issues.
This script creates a test scenario and provides detailed debugging steps.
"""

import os
import sys
import django
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from perfumes.models import Perfume
from decimal import Decimal

User = get_user_model()

def create_test_scenario():
    """Create a comprehensive test scenario for payment status debugging"""
    
    print("=== Frontend Payment Status Debug Test ===")
    print(f"Test started at: {datetime.now()}")
    print()
    
    # 1. Ensure admin user exists
    admin_email = "testadmin@test.com"
    admin_password = "admin123"
    
    try:
        admin_user = User.objects.get(email=admin_email)
        admin_user.set_password(admin_password)
        admin_user.save()
        print(f"✓ Updated existing admin user: {admin_email}")
    except User.DoesNotExist:
        admin_user = User.objects.create_user(
            email=admin_email,
            password=admin_password,
            first_name="Test",
            last_name="Admin",
            is_staff=True,
            is_superuser=True
        )
        print(f"✓ Created new admin user: {admin_email}")
    
    # 2. Get an active perfume
    try:
        perfume = Perfume.objects.filter(is_active=True).first()
        if not perfume:
            raise Exception("No active perfumes found")
        print(f"✓ Using perfume: {perfume.name} (ID: {perfume.id})")
    except Exception as e:
        print(f"✗ Error getting perfume: {e}")
        return
    
    # 3. Create test orders with different payment statuses
    test_orders = []
    
    # Create unpaid order
    unpaid_order = Order.objects.create(
        user=admin_user,
        payment_method="credit_card",
        payment_status=False,  # Unpaid
        status="pending",
        subtotal=Decimal('99.99'),
        tax=Decimal('10.00'),
        shipping=Decimal('5.00'),
        total=Decimal('114.99'),
        guest_name="Test Customer",
        guest_email="customer@test.com",
        guest_phone="123-456-7890",
        guest_address="123 Test St",
        guest_city="Test City",
        guest_province="Test Province"
    )
    
    OrderItem.objects.create(
        order=unpaid_order,
        perfume=perfume,
        price=perfume.price,
        quantity=1
    )
    
    test_orders.append(unpaid_order)
    print(f"✓ Created unpaid order: {unpaid_order.order_number} (ID: {unpaid_order.id})")
    
    # Create paid order for comparison
    paid_order = Order.objects.create(
        user=admin_user,
        payment_method="credit_card",
        payment_status=True,  # Paid
        status="processing",
        subtotal=Decimal('79.99'),
        tax=Decimal('8.00'),
        shipping=Decimal('5.00'),
        total=Decimal('92.99'),
        guest_name="Test Customer 2",
        guest_email="customer2@test.com",
        guest_phone="123-456-7891",
        guest_address="456 Test Ave",
        guest_city="Test City",
        guest_province="Test Province"
    )
    
    OrderItem.objects.create(
        order=paid_order,
        perfume=perfume,
        price=perfume.price,
        quantity=1
    )
    
    test_orders.append(paid_order)
    print(f"✓ Created paid order: {paid_order.order_number} (ID: {paid_order.id})")
    
    print()
    print("=== Test Scenario Created Successfully ===")
    print()
    print("MANUAL TESTING INSTRUCTIONS:")
    print("1. Open browser and go to: http://localhost:3000")
    print(f"2. Login with admin credentials: {admin_email} / {admin_password}")
    print("3. Navigate to Admin Dashboard -> Orders")
    print()
    print("DEBUGGING STEPS:")
    print(f"4. Find unpaid order: {unpaid_order.order_number} (should show 'Unpaid' status)")
    print("5. Click on the order to open details dialog")
    print("6. Open browser Developer Tools (F12)")
    print("7. Go to Console tab to monitor for errors")
    print("8. Go to Network tab to monitor API calls")
    print("9. In the dialog, change Payment Status from 'Unpaid' to 'Paid'")
    print("10. Observe the following:")
    print("    - Check Console for any JavaScript errors")
    print("    - Check Network tab for API call to update_payment_status")
    print("    - Verify API response status and data")
    print("    - Check if dialog closes automatically")
    print("    - Check if order list refreshes")
    print("    - Verify if payment status updates in the UI")
    print()
    print("EXPECTED BEHAVIOR:")
    print("- API call should return 200 status")
    print("- Dialog should close after successful update")
    print("- Order list should refresh")
    print("- Payment status should change from 'Unpaid' to 'Paid'")
    print()
    print("COMMON ISSUES TO CHECK:")
    print("- Network errors (check API endpoint availability)")
    print("- Authentication errors (check token validity)")
    print("- Data format errors (check request payload)")
    print("- State management errors (check Redux state updates)")
    print("- UI refresh errors (check component re-rendering)")
    print()
    print(f"For comparison, also test paid order: {paid_order.order_number}")
    print("Try changing it from 'Paid' to 'Unpaid' and back to 'Paid'")
    print()
    print("=== Additional Debug Information ===")
    print(f"Admin User ID: {admin_user.id}")
    print(f"Admin User Permissions: Staff={admin_user.is_staff}, Superuser={admin_user.is_superuser}")
    print(f"Unpaid Order Details: ID={unpaid_order.id}, Status={unpaid_order.status}, Payment={unpaid_order.payment_status}")
    print(f"Paid Order Details: ID={paid_order.id}, Status={paid_order.status}, Payment={paid_order.payment_status}")
    print()
    print("If issues persist, check:")
    print("1. Backend server is running (python manage.py runserver)")
    print("2. Frontend server is running (npm start)")
    print("3. Database connectivity")
    print("4. CORS settings")
    print("5. API authentication")

if __name__ == "__main__":
    create_test_scenario()