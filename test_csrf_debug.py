import requests
import json

def test_login_with_csrf():
    """Test login with proper CSRF handling"""
    base_url = "https://perfumesplugapp-production.up.railway.app"
    
    # Step 1: Get CSRF token from any GET endpoint
    try:
        csrf_resp = requests.get(f"{base_url}/api/users/me/", timeout=10)
        print(f"CSRF Get Status: {csrf_resp.status_code}")
        csrf_token = csrf_resp.cookies.get('csrftoken')
        print(f"CSRF Token: {csrf_token}")
    except Exception as e:
        print(f"CSRF Error: {e}")
        csrf_token = None
    
    # Step 2: Try login without CSRF token first
    print("\n=== Test 1: Login without CSRF token ===")
    try:
        login_data = {
            'email': 'admin@example.com',
            'password': 'admin123'
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        response = requests.post(
            f"{base_url}/api/users/login/",
            json=login_data,
            headers=headers,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Content: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Step 3: Try login with CSRF token if we got one
    if csrf_token:
        print("\n=== Test 2: Login with CSRF token ===")
        try:
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': csrf_token,
                'Referer': base_url,
            }
            
            cookies = {'csrftoken': csrf_token}
            
            response = requests.post(
                f"{base_url}/api/users/login/",
                json=login_data,
                headers=headers,
                cookies=cookies,
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            print(f"Content: {response.text}")
            
        except Exception as e:
            print(f"Error: {e}")
    
    # Step 4: Try with Django admin login to get session
    print("\n=== Test 3: Get session from admin ===")
    try:
        session = requests.Session()
        
        # Get admin login page for CSRF
        admin_resp = session.get(f"{base_url}/admin/login/", timeout=10)
        print(f"Admin page status: {admin_resp.status_code}")
        
        # Extract CSRF token from form if present
        import re
        csrf_match = re.search(r'name=["\']csrfmiddlewaretoken["\'] value=["\']([^"\']+)["\']', admin_resp.text)
        if csrf_match:
            csrf_token = csrf_match.group(1)
            print(f"Admin CSRF token: {csrf_token}")
            
            # Now try API login with session
            headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token,
                'Referer': f"{base_url}/admin/login/",
            }
            
            api_resp = session.post(
                f"{base_url}/api/users/login/",
                json=login_data,
                headers=headers,
                timeout=10
            )
            
            print(f"API with session status: {api_resp.status_code}")
            print(f"API with session content: {api_resp.text}")
        else:
            print("No CSRF token found in admin page")
            
    except Exception as e:
        print(f"Session test error: {e}")

if __name__ == "__main__":
    test_login_with_csrf()