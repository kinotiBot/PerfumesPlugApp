import requests
import json
import os

def test_cart_api_authentication():
    """Test cart API authentication requirements"""
    print("\n=== Testing Cart API Authentication ===")
    
    base_url = "http://localhost:8000"
    
    # Test unauthenticated access to cart
    print("\n1. Testing unauthenticated cart access...")
    try:
        response = requests.get(f"{base_url}/api/orders/cart/my_cart/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("✓ Cart API correctly requires authentication")
        elif response.status_code == 400:
            print("⚠️  Cart API returns 400 - might be authentication issue")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Error accessing cart API: {e}")
    
    # Test admin login
    print("\n2. Testing admin login...")
    try:
        login_data = {
            "email": "admin@example.com",
            "password": "admin123"
        }
        response = requests.post(f"{base_url}/api/users/login/", json=login_data)
        print(f"Login Status Code: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print("✓ Admin login successful")
            
            # Test authenticated cart access
            print("\n3. Testing authenticated cart access...")
            headers = {"Authorization": f"Bearer {access_token}"}
            cart_response = requests.get(f"{base_url}/api/orders/cart/my_cart/", headers=headers)
            print(f"Cart Status Code: {cart_response.status_code}")
            print(f"Cart Response: {cart_response.text[:200]}...")
            
            if cart_response.status_code == 200:
                print("✓ Authenticated cart access works")
                return access_token
            else:
                print(f"❌ Authenticated cart access failed: {cart_response.status_code}")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during authentication test: {e}")
    
    return None

def test_media_file_access():
    """Test media file access and CORS configuration"""
    print("\n=== Testing Media File Access ===")
    
    base_url = "http://localhost:8000"
    
    # Test direct media file access
    print("\n1. Testing direct media file access...")
    try:
        # Try to access a test media file
        response = requests.get(f"{base_url}/media/test.jpg")
        print(f"Media file status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 404:
            print("⚠️  Media file not found (expected if test.jpg doesn't exist)")
        elif response.status_code == 200:
            print("✓ Media file accessible")
        else:
            print(f"❌ Unexpected media file status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error accessing media file: {e}")
    
    # Check if media directory exists
    print("\n2. Checking media directory...")
    media_dir = "media"
    if os.path.exists(media_dir):
        print(f"✓ Media directory exists: {os.path.abspath(media_dir)}")
        files = os.listdir(media_dir)
        print(f"Files in media directory: {files[:5]}...")  # Show first 5 files
    else:
        print("⚠️  Media directory doesn't exist")
        # Create a test media file
        os.makedirs(media_dir, exist_ok=True)
        test_file = os.path.join(media_dir, "test.jpg")
        with open(test_file, "w") as f:
            f.write("test image content")
        print(f"✓ Created test media file: {test_file}")

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n=== Testing CORS Configuration ===")
    
    base_url = "http://localhost:8000"
    
    # Test CORS headers
    print("\n1. Testing CORS headers...")
    try:
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type"
        }
        response = requests.options(f"{base_url}/api/orders/cart/my_cart/", headers=headers)
        print(f"CORS preflight status: {response.status_code}")
        print(f"CORS headers: {dict(response.headers)}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        print(f"CORS configuration: {cors_headers}")
    except Exception as e:
        print(f"❌ Error testing CORS: {e}")

def test_frontend_auth_flow():
    """Test the authentication flow that frontend should use"""
    print("\n=== Testing Frontend Auth Flow ===")
    
    base_url = "http://localhost:8000"
    
    # Test guest cart behavior
    print("\n1. Testing guest cart behavior...")
    print("Frontend should handle guest cart in localStorage when user is not authenticated")
    print("Cart API endpoint requires authentication, so frontend must:")
    print("  - Use localStorage for guest users")
    print("  - Only call API when user is authenticated")
    print("  - Handle 401 errors gracefully")
    
    # Test token validation
    print("\n2. Testing token validation...")
    try:
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{base_url}/api/orders/cart/my_cart/", headers=headers)
        print(f"Invalid token status: {response.status_code}")
        
        if response.status_code == 401:
            print("✓ API correctly rejects invalid tokens")
        else:
            print(f"❌ Unexpected response to invalid token: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing token validation: {e}")

def main():
    """Run all diagnostic tests"""
    print("🔍 Diagnosing Cart and Media Issues")
    print("=" * 50)
    
    token = test_cart_api_authentication()
    test_media_file_access()
    test_cors_configuration()
    test_frontend_auth_flow()
    
    print("\n=== Summary and Recommendations ===")
    print("\n🔍 CART LOADING ERROR (400):")
    print("  - Cart API requires authentication (IsAuthenticated permission)")
    print("  - Frontend must check if user is authenticated before calling cart API")
    print("  - For guest users, use localStorage-based cart (already implemented)")
    print("  - 400 error likely occurs when frontend calls API without valid token")
    
    print("\n🔍 MEDIA FILE ORB ERROR:")
    print("  - ORB (Opaque Response Blocking) prevents cross-origin media access")
    print("  - Need to add CORS headers for media files")
    print("  - Django's static file serving doesn't include CORS headers by default")
    
    print("\n🛠️  FIXES NEEDED:")
    print("  1. Fix cart authentication handling in frontend")
    print("  2. Add CORS headers for media files")
    print("  3. Ensure proper error handling for unauthenticated users")

if __name__ == "__main__":
    main()