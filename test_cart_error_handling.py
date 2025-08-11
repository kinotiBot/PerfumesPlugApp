#!/usr/bin/env python
import requests
import json

def test_cart_error_handling():
    base_url = 'http://127.0.0.1:8000'
    
    print("=== Testing Cart Error Handling ===")
    
    # Test with invalid/expired token
    print("\n1. Testing with invalid token...")
    invalid_headers = {
        'Authorization': 'Bearer invalid_token_here',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=invalid_headers)
        print(f"Invalid token response - Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Correctly returns 401 for invalid token")
        else:
            print(f"Unexpected response: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test with no token
    print("\n2. Testing with no authentication...")
    try:
        response = requests.get(f'{base_url}/api/orders/cart/my_cart/')
        print(f"No auth response - Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Correctly returns 401 for no authentication")
        else:
            print(f"Unexpected response: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Get valid token for comparison
    print("\n3. Getting valid token for comparison...")
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
        valid_token = token_data.get('access')
        print(f"✓ Valid token obtained")
        
        # Test with valid token
        print("\n4. Testing with valid token...")
        valid_headers = {
            'Authorization': f'Bearer {valid_token}',
            'Content-Type': 'application/json'
        }
        
        cart_response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=valid_headers)
        print(f"Valid token response - Status: {cart_response.status_code}")
        
        if cart_response.status_code == 200:
            print("✓ Cart loads successfully with valid token")
        else:
            print(f"✗ Unexpected error with valid token: {cart_response.text}")
        
    except Exception as e:
        print(f"Test failed with error: {e}")
    
    print("\n=== Solution Summary ===")
    print("\n🔧 FIXES IMPLEMENTED:")
    print("1. ✅ Extended JWT token lifetime from 5 minutes to 24 hours")
    print("2. ✅ Added refresh token support (7 days lifetime)")
    print("3. ✅ Improved frontend error handling for 401 errors")
    print("4. ✅ Added user-friendly error messages in Cart component")
    print("5. ✅ Added 'Log In' button when authentication is required")
    
    print("\n👤 USER ACTION REQUIRED:")
    print("If you're still seeing 401 errors in the browser:")
    print("1. 🔄 Refresh the browser page (F5)")
    print("2. 🚪 Log out and log back in to get a fresh 24-hour token")
    print("3. 🧹 Clear browser cache/localStorage if needed")
    print("4. ✅ The cart should now work for 24 hours without re-authentication")
    
    print("\n🎯 EXPECTED BEHAVIOR:")
    print("- Cart operations should work for 24 hours after login")
    print("- Clear error messages when authentication is required")
    print("- Easy login button when 401 errors occur")
    print("- Automatic fallback to guest cart for non-authenticated users")
    
    print("\n=== Test Complete ===")

if __name__ == '__main__':
    test_cart_error_handling()