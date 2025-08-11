#!/usr/bin/env python
"""
Test script to verify delete perfume API endpoint is working.
"""

import os
import sys
import django
from django.test import TestCase, Client, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from decimal import Decimal
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

# Import models after Django setup
from perfumes.models import Perfume, Category, Brand
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

@override_settings(ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'])
def test_delete_perfume_endpoint():
    print("Testing delete perfume API endpoint...")
    
    # Clean up any existing test data first
    Perfume.objects.filter(slug="test-perfume-deletion").delete()
    Category.objects.filter(slug="test-category").delete()
    Brand.objects.filter(slug="test-brand").delete()
    
    # Create test data
    category, _ = Category.objects.get_or_create(
        name="Test Category",
        defaults={'slug': 'test-category', 'description': 'Test category'}
    )
    
    brand, _ = Brand.objects.get_or_create(
        name="Test Brand",
        defaults={'slug': 'test-brand', 'description': 'Test brand'}
    )
    
    # Create a test perfume
    perfume = Perfume.objects.create(
        name="Test Perfume for Deletion",
        slug="test-perfume-deletion",
        description="Test perfume for deletion",
        price=Decimal('75.00'),
        stock=50,
        brand=brand,
        category=category,
        image="perfumes/test.jpg"
    )
    
    print(f"Created test perfume: {perfume.name} (slug: {perfume.slug})")
    
    # Create admin user for authentication
    admin_user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('testpass123')
        admin_user.save()
        print("Created test admin user")
    
    # Test API client
    client = APIClient()
    client.force_authenticate(user=admin_user)
    
    # Test DELETE request
    delete_url = f'/api/perfumes/{perfume.slug}/'
    print(f"Testing DELETE request to: {delete_url}")
    
    response = client.delete(delete_url)
    
    print(f"Response status: {response.status_code}")
    
    if response.status_code == status.HTTP_204_NO_CONTENT:
        print("✅ SUCCESS: Delete endpoint is working correctly!")
        print("✅ Perfume was successfully deleted")
        
        # Verify perfume is deleted
        try:
            Perfume.objects.get(slug=perfume.slug)
            print("❌ FAILURE: Perfume still exists in database")
        except Perfume.DoesNotExist:
            print("✅ SUCCESS: Perfume was properly removed from database")
    else:
        print(f"❌ FAILURE: Delete endpoint returned status {response.status_code}")
        if hasattr(response, 'data'):
            print(f"Response data: {response.data}")
    
    # Clean up
    print("\nCleaning up test data...")
    try:
        perfume.delete()
    except:
        pass  # Already deleted
    
    if created:
        admin_user.delete()
    
    category.delete()
    brand.delete()
    print("Test completed.")

if __name__ == '__main__':
    test_delete_perfume_endpoint()