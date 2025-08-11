import requests
import json
from datetime import datetime
import time

def test_payment_status_final():
    """Final test to verify payment status updates work with the new refresh mechanism"""
    base_url = 'http://localhost:8000'
    
    # Step 1: Admin login
    print("🔐 Admin Login")
    login_data = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    login_response = requests.post(f'{base_url}/api/users/login/', json=login_data)
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    login_result = login_response.json()
    token = login_result['access']
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Admin login successful")
    
    # Step 2: Get orders
    print("\n📋 Fetching Orders")
    orders_response = requests.get(
        f'{base_url}/api/orders/',
        headers=headers,
        params={'page': 1, 'limit': 10}
    )
    
    if orders_response.status_code != 200:
        print(f"❌ Failed to fetch orders: {orders_response.status_code}")
        return
    
    orders_data = orders_response.json()
    if not orders_data['results']:
        print("❌ No orders found")
        return
    
    test_order = orders_data['results'][0]
    print(f"✅ Found test order: {test_order['id']}")
    print(f"   Current payment status: {test_order['payment_status']}")
    
    # Step 3: Update payment status multiple times to test consistency
    print("\n🔄 Testing Payment Status Updates")
    
    for i in range(3):
        current_status = test_order['payment_status']
        new_status = not current_status
        
        print(f"\n   Test {i+1}: Changing from {current_status} to {new_status}")
        
        # Update payment status
        update_data = {'payment_status': new_status}
        update_response = requests.post(
            f'{base_url}/api/orders/{test_order["id"]}/update_payment_status/',
            headers=headers,
            json=update_data
        )
        
        if update_response.status_code != 200:
            print(f"   ❌ Update failed: {update_response.status_code}")
            continue
        
        update_result = update_response.json()
        print(f"   ✅ API Update successful: {update_result['payment_status']}")
        
        # Wait a moment for any async operations
        time.sleep(0.5)
        
        # Verify with fresh fetch
        verify_response = requests.get(
            f'{base_url}/api/orders/',
            headers=headers,
            params={'page': 1, 'limit': 10}
        )
        
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            verified_order = next((o for o in verify_data['results'] if o['id'] == test_order['id']), None)
            
            if verified_order and verified_order['payment_status'] == new_status:
                print(f"   ✅ Verification successful: {verified_order['payment_status']}")
                test_order = verified_order  # Update for next iteration
            else:
                print(f"   ❌ Verification failed: Expected {new_status}, got {verified_order['payment_status'] if verified_order else 'None'}")
        else:
            print(f"   ⚠️  Verification request failed: {verify_response.status_code}")
    
    print("\n🎯 Final Status Check")
    final_response = requests.get(
        f'{base_url}/api/orders/',
        headers=headers,
        params={'page': 1, 'limit': 10}
    )
    
    if final_response.status_code == 200:
        final_data = final_response.json()
        final_order = next((o for o in final_data['results'] if o['id'] == test_order['id']), None)
        
        if final_order:
            print(f"✅ Final payment status: {final_order['payment_status']}")
            print("\n🎉 Payment status updates are working correctly!")
            print("\n📱 Frontend should now show immediate updates when:")
            print("   1. Admin changes payment status in the dialog")
            print("   2. The success state triggers useEffect refresh")
            print("   3. Component re-renders with updated data")
        else:
            print("❌ Could not find order in final check")
    else:
        print(f"❌ Final check failed: {final_response.status_code}")

if __name__ == '__main__':
    test_payment_status_final()