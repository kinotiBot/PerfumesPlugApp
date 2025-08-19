#!/usr/bin/env python3
"""
Test script to verify frontend authentication and data creation issues
"""

import os
import django
import requests
import json
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from users.models import User
from orders.models import Cart, CartItem
from perfumes.models import Perfume

def test_api_endpoints():
    """Test API endpoints that the frontend should be using"""
    base_url = "http://127.0.0.1:8000"
    
    print("=== Frontend Authentication & Data Creation Test ===")
    print(f"Testing API at: {base_url}")
    print(f"Time: {datetime.now()}")
    print()
    
    # Test 1: Login with admin user
    print("1. Testing login endpoint...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{base_url}/api/users/login/", json=login_data)
        if response.status_code == 200:
            login_result = response.json()
            access_token = login_result.get('access')
            print(f"✅ Login successful! Token received: {access_token[:50]}...")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test 2: Test authenticated endpoints
    headers = {"Authorization": f"Bearer {access_token}"}
    
    print("\n2. Testing profile endpoint...")
    try:
        response = requests.get(f"{base_url}/api/users/profile/me/", headers=headers)
        if response.status_code == 200:
            profile = response.json()
            print(f"✅ Profile access successful: {profile['email']}")
        else:
            print(f"❌ Profile access failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Profile error: {e}")
    
    # Test 3: Test cart functionality
    print("\n3. Testing cart functionality...")
    
    # Get available perfume
    perfumes = Perfume.objects.filter(is_active=True).first()
    if not perfumes:
        print("❌ No active perfumes found")
        return
    
    print(f"Using perfume: {perfumes.name} (ID: {perfumes.id})")
    
    # Add to cart
    cart_data = {
        "perfume_id": perfumes.id,
        "quantity": 1
    }
    
    try:
        response = requests.post(f"{base_url}/api/orders/cart/add_item/", 
                               json=cart_data, headers=headers)
        if response.status_code == 200:
            cart_result = response.json()
            print(f"✅ Item added to cart successfully!")
            print(f"   Cart ID: {cart_result.get('id')}")
            print(f"   Items: {len(cart_result.get('items', []))}")
            print(f"   Subtotal: ${cart_result.get('subtotal', 0)}")
        else:
            print(f"❌ Add to cart failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Cart error: {e}")
    
    # Test 4: Check database state
    print("\n4. Checking database state...")
    
    try:
        user = User.objects.get(email="admin@example.com")
        cart = Cart.objects.filter(user=user).first()
        
        if cart:
            cart_items = CartItem.objects.filter(cart=cart)
            print(f"✅ Database verification:")
            print(f"   User: {user.email}")
            print(f"   Cart ID: {cart.id}")
            print(f"   Cart items: {cart_items.count()}")
            
            for item in cart_items:
                print(f"   - {item.perfume.name}: {item.quantity} x ${item.perfume.price}")
        else:
            print("❌ No cart found in database")
            
    except Exception as e:
        print(f"❌ Database check error: {e}")
    
    print("\n=== Test Complete ===")
    print("\nIf all tests pass, the backend is working correctly.")
    print("Frontend issues might be:")
    print("1. Users not logging in properly")
    print("2. Tokens not being stored/sent correctly")
    print("3. Frontend making requests to wrong endpoints")
    print("4. CORS or network connectivity issues")

if __name__ == "__main__":
    test_api_endpoints()