#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model
from users.serializers import UserLoginSerializer
from rest_framework.request import Request
from django.test import RequestFactory

User = get_user_model()

def test_authentication_methods():
    """Test different authentication methods"""
    print("=== Testing Authentication Methods ===")
    
    email = 'admin@example.com'
    password = 'admin123'
    
    # Test 1: Direct user lookup and password check
    print("\n1. Testing direct user lookup and password check...")
    try:
        user = User.objects.get(email=email)
        password_valid = user.check_password(password)
        print(f"✅ User found: {user.email}")
        print(f"✅ Password valid: {password_valid}")
        print(f"✅ User active: {user.is_active}")
    except User.DoesNotExist:
        print("❌ User not found")
        return
    
    # Test 2: Django authenticate with username=email
    print("\n2. Testing Django authenticate with username=email...")
    auth_user = authenticate(username=email, password=password)
    if auth_user:
        print(f"✅ Authentication successful: {auth_user.email}")
    else:
        print("❌ Authentication failed with username=email")
    
    # Test 3: Django authenticate with email=email (old way)
    print("\n3. Testing Django authenticate with email=email...")
    auth_user_old = authenticate(email=email, password=password)
    if auth_user_old:
        print(f"✅ Authentication successful: {auth_user_old.email}")
    else:
        print("❌ Authentication failed with email=email")
    
    # Test 4: UserLoginSerializer validation
    print("\n4. Testing UserLoginSerializer validation...")
    factory = RequestFactory()
    request = factory.post('/api/users/login/')
    
    serializer = UserLoginSerializer(data={'email': email, 'password': password})
    serializer.context = {'request': request}
    
    if serializer.is_valid():
        print(f"✅ Serializer validation successful")
        print(f"✅ Authenticated user: {serializer.validated_data['user'].email}")
    else:
        print(f"❌ Serializer validation failed: {serializer.errors}")
    
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"- User exists: {'✅' if user else '❌'}")
    print(f"- Password valid: {'✅' if password_valid else '❌'}")
    print(f"- Auth with username=email: {'✅' if auth_user else '❌'}")
    print(f"- Auth with email=email: {'✅' if auth_user_old else '❌'}")
    print(f"- Serializer validation: {'✅' if serializer.is_valid() else '❌'}")

if __name__ == '__main__':
    test_authentication_methods()