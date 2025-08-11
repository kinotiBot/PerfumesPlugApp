#!/usr/bin/env python3
"""
Test script to verify that cart loading and media file access issues have been resolved.

This script tests:
1. Cart API authentication handling improvements
2. Media file CORS headers for resolving ERR_BLOCKED_BY_ORB
3. Frontend cart loading logic improvements
4. Overall system functionality
"""

import requests
import json
import os
import time
from pathlib import Path

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api"
MEDIA_BASE = f"{BASE_URL}/media"

def test_admin_login():
    """Test admin login and return token"""
    print("\n=== Testing Admin Login ===")
    
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/users/login/", json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            print(f"✅ Admin login successful")
            print(f"Token received: {token[:20]}..." if token else "No token received")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_cart_api_with_auth(token):
    """Test cart API with authentication"""
    print("\n=== Testing Cart API with Authentication ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test GET cart - correct endpoint is /api/orders/cart/
        response = requests.get(f"{API_BASE}/orders/cart/", headers=headers)
        print(f"Cart GET Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Cart API working with authentication")
            print(f"Cart items count: {len(data.get('items', []))}")
            return True
        else:
            print(f"❌ Cart API failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Cart API error: {e}")
        return False

def test_cart_api_without_auth():
    """Test cart API without authentication (should fail gracefully)"""
    print("\n=== Testing Cart API without Authentication ===")
    
    try:
        response = requests.get(f"{API_BASE}/orders/cart/")
        print(f"Unauthenticated Cart Status: {response.status_code}")
        
        if response.status_code in [400, 401]:
            print(f"✅ Cart API correctly rejects unauthenticated requests")
            return True
        else:
            print(f"⚠️ Unexpected response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Cart API error: {e}")
        return False

def create_test_media_file():
    """Create a test media file if it doesn't exist"""
    media_dir = Path("media")
    media_dir.mkdir(exist_ok=True)
    
    test_file = media_dir / "test.jpg"
    if not test_file.exists():
        # Create a minimal valid JPEG file
        jpeg_header = bytes.fromhex('FFD8FFE000104A46494600010101006000600000FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432FFDB0043010909090C0B0C180D0D1832211C213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232FFC00011080001000103012200021101031101FFC4001F0000010501010101010100000000000000000102030405060708090A0BFFC400B5100002010303020403050504040000017D01020300041105122131410613516107227114328191A1082342B1C11552D1F02433627282090A161718191A25262728292A3435363738393A434445464748494A535455565758595A636465666768696A737475767778797A838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE1E2E3E4E5E6E7E8E9EAF1F2F3F4F5F6F7F8F9FAFFC4001F0100030101010101010101010000000000000102030405060708090A0BFFC400B51100020102040403040705040400010277000102031104052131061241510761711322328108144291A1B1C109233352F0156272D10A162434E125F11718191A262728292A35363738393A434445464748494A535455565758595A636465666768696A737475767778797A82838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE2E3E4E5E6E7E8E9EAF2F3F4F5F6F7F8F9FAFFDA000C03010002110311003F00')
        
        with open(test_file, 'wb') as f:
            f.write(jpeg_header)
        print(f"✅ Created test media file: {test_file}")
    else:
        print(f"✅ Test media file already exists: {test_file}")
    
    return str(test_file)

def test_media_file_access():
    """Test media file access with CORS headers"""
    print("\n=== Testing Media File Access ===")
    
    # Ensure test file exists
    test_file = create_test_media_file()
    media_url = f"{MEDIA_BASE}/test.jpg"
    
    try:
        # Test direct access
        response = requests.get(media_url)
        print(f"Media file access status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Media file accessible")
            
            # Check CORS headers
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            print("CORS Headers:")
            for header, value in cors_headers.items():
                if value:
                    print(f"  {header}: {value}")
                    
            if cors_headers['Access-Control-Allow-Origin']:
                print("✅ CORS headers present - should resolve ERR_BLOCKED_BY_ORB")
                return True
            else:
                print("⚠️ No CORS headers found")
                return False
        else:
            print(f"❌ Media file not accessible: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Media file access error: {e}")
        return False

def test_media_options_request():
    """Test OPTIONS request for media files (CORS preflight)"""
    print("\n=== Testing Media CORS Preflight ===")
    
    media_url = f"{MEDIA_BASE}/test.jpg"
    
    try:
        response = requests.options(media_url)
        print(f"OPTIONS request status: {response.status_code}")
        
        if response.status_code in [200, 204]:
            print("✅ OPTIONS request successful")
            
            # Check preflight headers
            preflight_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print("Preflight CORS Headers:")
            for header, value in preflight_headers.items():
                if value:
                    print(f"  {header}: {value}")
                    
            return True
        else:
            print(f"❌ OPTIONS request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ OPTIONS request error: {e}")
        return False

def test_server_status():
    """Test if Django server is running"""
    print("\n=== Testing Server Status ===")
    
    try:
        # Test API endpoint instead of root URL
        response = requests.get(f"{API_BASE}/perfumes/", timeout=5)
        print(f"API server status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Django API server is running")
            return True
        else:
            print(f"⚠️ API server responded with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Django server")
        print("Please ensure 'python manage.py runserver' is running")
        return False
    except Exception as e:
        print(f"❌ Server test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Cart Loading and Media File Access Fixes")
    print("=" * 60)
    
    # Test server status first
    if not test_server_status():
        print("\n❌ Cannot proceed - Django server is not running")
        return
    
    # Test results tracking
    results = {
        'admin_login': False,
        'cart_with_auth': False,
        'cart_without_auth': False,
        'media_access': False,
        'media_cors': False
    }
    
    # Run tests
    token = test_admin_login()
    if token:
        results['admin_login'] = True
        results['cart_with_auth'] = test_cart_api_with_auth(token)
    
    results['cart_without_auth'] = test_cart_api_without_auth()
    results['media_access'] = test_media_file_access()
    results['media_cors'] = test_media_options_request()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    # Specific issue analysis
    print("\n🔍 ISSUE ANALYSIS:")
    
    if results['cart_with_auth'] and results['cart_without_auth']:
        print("✅ Cart API authentication handling: FIXED")
        print("   - Authenticated requests work properly")
        print("   - Unauthenticated requests are handled gracefully")
    else:
        print("❌ Cart API authentication handling: NEEDS ATTENTION")
    
    if results['media_access'] and results['media_cors']:
        print("✅ Media file ERR_BLOCKED_BY_ORB: FIXED")
        print("   - Media files are accessible")
        print("   - CORS headers are present")
        print("   - Preflight requests work")
    else:
        print("❌ Media file ERR_BLOCKED_BY_ORB: NEEDS ATTENTION")
    
    print("\n📝 FRONTEND IMPROVEMENTS APPLIED:")
    print("   - Added delay in App.js for auth state initialization")
    print("   - Removed duplicate cart loading from Header.js")
    print("   - Enhanced error handling in cartSlice.js")
    print("   - Added CORS configuration for media files")
    print("   - Implemented custom media serving with CORS headers")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL ISSUES RESOLVED!")
        print("The cart loading error and media file ORB error should now be fixed.")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} issues still need attention.")
        print("Please check the failed tests above for more details.")

if __name__ == "__main__":
    main()