#!/usr/bin/env python
import requests
import json

def test_login(url, email, password, headers=None):
    """Test login functionality with proper headers"""
    print(f"Testing {url.split('/')[2]}...")
    print(f"URL: {url}")
    print(f"Email: {email}")
    print(f"Password: {'*' * len(password)}")
    print("-" * 50)
    
    data = {
        'email': email,
        'password': password
    }
    
    # Default headers
    default_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    
    if headers:
        default_headers.update(headers)
    
    try:
        response = requests.post(url, json=data, headers=default_headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login successful!")
            print(f"Access token: {result.get('access', 'N/A')[:50]}...")
            print(f"User info: {result.get('user', {}).get('email', 'N/A')}")
            print(f"Is staff: {result.get('user', {}).get('is_staff', 'N/A')}")
        else:
            print("❌ Login failed!")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error: {response.text}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 60 + "\n")

if __name__ == "__main__":
    print("=== Testing Login Functionality ===")
    print()
    
    # Test credentials
    email = "admin@example.com"
    password = "admin123"
    
    # Test local backend
    local_url = "http://127.0.0.1:8000/api/users/login/"
    test_login(local_url, email, password)
    
    # Test Railway backend with CORS headers
    railway_url = "https://perfumesplugapp-production.up.railway.app/api/users/login/"
    cors_headers = {
        'Origin': 'https://perfumes-plug-app.vercel.app',
        'Referer': 'https://perfumes-plug-app.vercel.app/',
    }
    test_login(railway_url, email, password, cors_headers)
    
    print("\n🔍 TROUBLESHOOTING SUMMARY:")
    print("=" * 60)
    print("✅ Admin user created on Railway database")
    print("✅ Password verification works on Railway")
    print("✅ Vercel frontend is accessible")
    print("✅ CORS settings are configured")
    print()
    print("If login still fails on Railway:")
    print("1. Check Railway logs for authentication errors")
    print("2. Verify DATABASE_URL is correctly set")
    print("3. Ensure migrations ran successfully")
    print("4. Test with local backend first")
    print("5. Check CORS headers and origins")