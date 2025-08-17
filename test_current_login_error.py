#!/usr/bin/env python
import requests
import json

def test_current_login_error():
    """Test the current login error scenario"""
    print("=== Testing Current Login Error ===\n")
    
    # Test both local and Railway endpoints
    endpoints = [
        {
            'name': 'Local Backend',
            'url': 'http://127.0.0.1:8000/api/users/login/',
            'headers': {'Content-Type': 'application/json'}
        },
        {
            'name': 'Railway Backend',
            'url': 'https://perfumesplugapp-production.up.railway.app/api/users/login/',
            'headers': {
                'Content-Type': 'application/json',
                'Origin': 'https://perfumes-plug-app.vercel.app',
                'Referer': 'https://perfumes-plug-app.vercel.app/'
            }
        }
    ]
    
    # Test credentials
    credentials = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    for endpoint in endpoints:
        print(f"\n🔍 Testing {endpoint['name']}")
        print(f"URL: {endpoint['url']}")
        print("-" * 50)
        
        try:
            response = requests.post(
                endpoint['url'],
                json=credentials,
                headers=endpoint['headers'],
                timeout=30
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ LOGIN SUCCESSFUL!")
                print(f"Access Token: {data.get('access', 'N/A')[:50]}...")
                print(f"User Email: {data.get('user', {}).get('email', 'N/A')}")
                print(f"Is Staff: {data.get('user', {}).get('is_staff', 'N/A')}")
            else:
                print("❌ LOGIN FAILED!")
                try:
                    error_data = response.json()
                    print(f"Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Raw Error: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ REQUEST FAILED: {e}")
            
    print("\n" + "=" * 60)
    print("\n🔧 DEBUGGING STEPS:")
    print("1. Check if both servers are running")
    print("2. Verify admin user exists in both databases")
    print("3. Test with browser developer tools")
    print("4. Check CORS configuration")
    print("5. Verify API endpoint URLs")
    
if __name__ == '__main__':
    test_current_login_error()