#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

def test_cart_api():
    # Get a test user
    try:
        user = User.objects.get(email='admin@example.com')
        print(f"Testing with user: {user.email}")
    except User.DoesNotExist:
        print("Test user not found")
        return
    
    # Generate JWT token
    token = AccessToken.for_user(user)
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    base_url = 'http://127.0.0.1:8000'
    
    # Test cart endpoints
    print("\n=== Testing Cart API Endpoints ===")
    
    # 1. Test get cart
    print("\n1. Testing GET /api/orders/cart/my_cart/")
    try:
        response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Cart data: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    
    # 2. Test add to cart (need a perfume ID)
    print("\n2. Testing POST /api/orders/cart/add_item/")
    try:
        # Get a perfume ID first
        from perfumes.models import Perfume
        perfume = Perfume.objects.filter(is_active=True).first()
        if perfume:
            add_data = {
                'perfume_id': perfume.id,
                'quantity': 1
            }
            response = requests.post(
                f'{base_url}/api/orders/cart/add_item/', 
                headers=headers,
                json=add_data
            )
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Add to cart response: {json.dumps(data, indent=2)}")
            else:
                print(f"Error: {response.text}")
        else:
            print("No active perfumes found for testing")
    except Exception as e:
        print(f"Request failed: {e}")
    
    print("\n=== Test Complete ===")

if __name__ == '__main__':
    test_cart_api()