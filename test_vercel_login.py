#!/usr/bin/env python3
"""
Test script to verify admin login on Vercel deployment
"""

import requests
import json

def test_vercel_login():
    """
    Test admin login on Vercel deployment
    """
    # Vercel frontend URLs (from settings.py)
    vercel_urls = [
        "https://perfumes-plug-app.vercel.app",
        "https://perfumes-plug-m4bvqs3zv-joel-kinotis-projects.vercel.app"
    ]
    
    # Admin credentials
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    print("Testing admin login on Vercel...")
    print(f"Email: {login_data['email']}")
    print(f"Password: {'*' * len(login_data['password'])}")
    print("-" * 50)
    
    # The Vercel frontend should proxy API calls to the backend
    # But let's test the actual backend URL from vercel.json
    backend_url = "https://perfumesplugapp-production.up.railway.app/api/users/login/"
    
    print(f"Testing backend directly: {backend_url}")
    
    try:
        response = requests.post(
            backend_url,
            json=login_data,
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"Access token received: {data.get('access', 'N/A')[:20]}...")
            print(f"User info: {data.get('user', 'N/A')}")
        else:
            print("❌ Login failed!")
            try:
                error_data = response.json()
                print(f"Error response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response (raw): {response.text}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        print("This might indicate:")
        print("1. Backend is not deployed or URL is incorrect")
        print("2. Backend API is not accessible")
        print("3. Network connectivity issues")
    
    print("\n" + "=" * 60)
    print("TROUBLESHOOTING GUIDE:")
    print("=" * 60)
    print("If login fails, check:")
    print("1. Use EMAIL not username: admin@example.com (not 'admin')")
    print("2. Correct password: admin123")
    print("3. Vercel app URL is correct")
    print("4. Backend API is deployed and accessible")
    print("5. CORS settings allow Vercel domain")
    print("6. Admin user exists in production database")

if __name__ == "__main__":
    test_vercel_login()