#!/usr/bin/env python
import os
import requests
import json

def test_railway_comprehensive():
    print("=== Comprehensive Railway Authentication Test ===")
    
    # Test 1: Test API endpoint with detailed error info
    print("\n1. Testing Railway API with detailed debugging...")
    try:
        url = 'https://perfumesplugapp-production.up.railway.app/api/users/login/'
        data = {
            'email': 'admin@example.com',
            'password': 'admin123'
        }
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'PerfumesPlug-Debug/1.0'
        }
        
        print(f"URL: {url}")
        print(f"Data: {data}")
        print(f"Headers: {headers}")
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 200:
            print("✅ Railway API login successful!")
            response_data = response.json()
            print(f"Access Token: {response_data.get('access', 'N/A')[:50]}...")
            print(f"User Email: {response_data.get('user', {}).get('email', 'N/A')}")
            return True
        else:
            print(f"❌ Railway API login failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API request error: {e}")
        return False
    
    # Test 2: Test with different credentials
    print("\n2. Testing with different user credentials...")
    test_users = [
        {'email': 'admin@example.com', 'password': 'admin123'},
        {'email': 'test@example.com', 'password': 'testpass123'},
    ]
    
    for user in test_users:
        try:
            response = requests.post(url, json=user, headers=headers, timeout=30)
            print(f"User {user['email']}: Status {response.status_code}")
            if response.status_code != 200:
                print(f"  Error: {response.text}")
        except Exception as e:
            print(f"User {user['email']}: Error - {e}")
    
    # Test 3: Test other endpoints to verify Railway is working
    print("\n3. Testing other Railway endpoints...")
    test_endpoints = [
        '/api/perfumes/',
        '/api/users/register/',
        '/admin/',
    ]
    
    for endpoint in test_endpoints:
        try:
            test_url = f'https://perfumesplugapp-production.up.railway.app{endpoint}'
            response = requests.get(test_url, timeout=10)
            print(f"{endpoint}: Status {response.status_code}")
        except Exception as e:
            print(f"{endpoint}: Error - {e}")
    
    return False

if __name__ == '__main__':
    success = test_railway_comprehensive()
    if success:
        print("\n🎉 Railway authentication is working!")
    else:
        print("\n❌ Railway authentication issues persist.")
        print("\nNext steps:")
        print("1. Check if Railway service is properly deployed")
        print("2. Verify database migrations on Railway")
        print("3. Check Railway environment variables")
        print("4. Consider redeploying the entire application")