#!/usr/bin/env python
import os
import sys
import django
import requests
import json
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.settings import api_settings

User = get_user_model()

def test_frontend_auth_flow():
    base_url = 'http://127.0.0.1:8000'
    
    print("=== Testing Frontend Authentication Flow ===")
    
    # 1. Test login endpoint
    print("\n1. Testing Login Endpoint")
    login_data = {
        'email': 'admin@example.com',
        'password': 'admin123'  # Assuming this is the password
    }
    
    try:
        response = requests.post(f'{base_url}/api/users/login/', json=login_data)
        print(f"Login Status Code: {response.status_code}")
        if response.status_code == 200:
            login_response = response.json()
            token = login_response.get('access')
            user_info = login_response.get('user')
            print(f"Login successful! Token: {token[:50]}...")
            print(f"User info: {json.dumps(user_info, indent=2)}")
            
            # 2. Test profile endpoint with token
            print("\n2. Testing Profile Endpoint")
            headers = {'Authorization': f'Bearer {token}'}
            profile_response = requests.get(f'{base_url}/api/users/profile/me/', headers=headers)
            print(f"Profile Status Code: {profile_response.status_code}")
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print(f"Profile data: {json.dumps(profile_data, indent=2)}")
            else:
                print(f"Profile Error: {profile_response.text}")
            
            # 3. Test cart endpoint with token
            print("\n3. Testing Cart Endpoint with Token")
            cart_response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=headers)
            print(f"Cart Status Code: {cart_response.status_code}")
            if cart_response.status_code == 200:
                cart_data = cart_response.json()
                print(f"Cart data: {json.dumps(cart_data, indent=2)}")
            else:
                print(f"Cart Error: {cart_response.text}")
                
        else:
            print(f"Login failed: {response.text}")
            # Try with different password
            print("\nTrying with different password...")
            login_data['password'] = 'password123'
            response = requests.post(f'{base_url}/api/users/login/', json=login_data)
            print(f"Login Status Code: {response.status_code}")
            if response.status_code != 200:
                print(f"Login failed again: {response.text}")
                
    except Exception as e:
        print(f"Request failed: {e}")
    
    # 4. Test token expiration
    print("\n4. Testing Token Expiration Settings")
    try:
        user = User.objects.get(email='admin@example.com')
        token = AccessToken.for_user(user)
        print(f"Token lifetime: {api_settings.ACCESS_TOKEN_LIFETIME}")
        print(f"Token created: {datetime.now()}")
        print(f"Token expires: {datetime.now() + api_settings.ACCESS_TOKEN_LIFETIME}")
    except Exception as e:
        print(f"Token test failed: {e}")
    
    print("\n=== Test Complete ===")

if __name__ == '__main__':
    test_frontend_auth_flow()