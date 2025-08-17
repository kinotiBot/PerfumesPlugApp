#!/usr/bin/env python
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model
from users.serializers import UserLoginSerializer
from rest_framework.request import Request
from django.test import RequestFactory

User = get_user_model()

def test_railway_auth_detailed():
    print("=== Detailed Railway Authentication Debug ===")
    
    # Test 1: Direct Django authentication on Railway
    print("\n1. Testing direct Django authentication on Railway...")
    try:
        # This runs on Railway's database
        user = User.objects.get(email='admin@example.com')
        print(f"✅ User found: {user.email}")
        print(f"✅ User active: {user.is_active}")
        print(f"✅ User staff: {user.is_staff}")
        
        # Test password check
        password_valid = user.check_password('admin123')
        print(f"✅ Password check: {password_valid}")
        
        # Test authenticate function
        auth_user = authenticate(username='admin@example.com', password='admin123')
        print(f"✅ Authenticate result: {auth_user}")
        
    except Exception as e:
        print(f"❌ Django auth error: {e}")
    
    # Test 2: Test serializer validation
    print("\n2. Testing serializer validation...")
    try:
        factory = RequestFactory()
        request = factory.post('/api/users/login/')
        
        serializer = UserLoginSerializer(data={
            'email': 'admin@example.com',
            'password': 'admin123'
        }, context={'request': request})
        
        print(f"Serializer is_valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
        else:
            print(f"✅ Serializer validation passed")
            print(f"✅ Validated user: {serializer.validated_data.get('user')}")
            
    except Exception as e:
        print(f"❌ Serializer error: {e}")
    
    # Test 3: Test API endpoint directly
    print("\n3. Testing Railway API endpoint...")
    try:
        url = 'https://perfumesplugapp-production.up.railway.app/api/users/login/'
        data = {
            'email': 'admin@example.com',
            'password': 'admin123'
        }
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ API login successful!")
        else:
            print(f"❌ API login failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ API request error: {e}")

if __name__ == '__main__':
    test_railway_auth_detailed()