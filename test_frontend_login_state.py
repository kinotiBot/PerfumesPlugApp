#!/usr/bin/env python
import requests
import json

def test_frontend_login_state():
    base_url = 'http://127.0.0.1:8000'
    
    print("=== Testing Frontend Login State ===")
    
    # 1. Try to access cart without authentication
    print("\n1. Testing cart access without authentication...")
    try:
        response = requests.get(f'{base_url}/api/orders/cart/my_cart/')
        print(f"Cart access without auth - Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Expected 401 - Authentication required")
        else:
            print(f"Unexpected response: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    
    # 2. Login and get fresh token
    print("\n2. Getting fresh authentication token...")
    login_data = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{base_url}/api/users/login/', json=login_data)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        token_data = response.json()
        token = token_data.get('access')
        print(f"✓ Fresh token obtained: {token[:50]}...")
        
        # 3. Test cart access with fresh token
        print("\n3. Testing cart access with fresh token...")
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        cart_response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=headers)
        print(f"Cart access with fresh token - Status: {cart_response.status_code}")
        
        if cart_response.status_code == 200:
            cart_data = cart_response.json()
            print(f"✓ Cart loaded successfully")
            print(f"  - Items: {len(cart_data.get('items', []))}")
            print(f"  - Total: ${cart_data.get('subtotal', '0.00')}")
        else:
            print(f"✗ Cart access failed: {cart_response.text}")
        
        # 4. Test add to cart with fresh token
        print("\n4. Testing add to cart with fresh token...")
        add_data = {
            'perfume_id': 13,  # Test perfume ID
            'quantity': 1
        }
        
        add_response = requests.post(
            f'{base_url}/api/orders/cart/add_item/',
            headers=headers,
            json=add_data
        )
        print(f"Add to cart - Status: {add_response.status_code}")
        
        if add_response.status_code == 200:
            print("✓ Add to cart successful")
        else:
            print(f"✗ Add to cart failed: {add_response.text}")
        
        print("\n=== Frontend Authentication Instructions ===")
        print("If you're seeing 401 errors in the frontend:")
        print("1. Open browser developer tools (F12)")
        print("2. Go to Application/Storage tab")
        print("3. Check localStorage for 'userToken'")
        print("4. If token is missing or expired, please log in again")
        print(f"5. Fresh token for testing: {token}")
        
    except Exception as e:
        print(f"Test failed with error: {e}")
    
    print("\n=== Test Complete ===")

if __name__ == '__main__':
    test_frontend_login_state()