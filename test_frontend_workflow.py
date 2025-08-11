import requests
import json
from datetime import datetime

def test_frontend_workflow():
    """Test the exact workflow that happens in the frontend"""
    base_url = 'http://localhost:8000'
    
    # Step 1: Admin login (simulating frontend login)
    print("🔐 Step 1: Admin Login")
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
    
    # Step 2: Get all orders (simulating initial page load)
    print("\n📋 Step 2: Initial Orders Fetch")
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
    print(f"   Current payment status: {test_order['payment_status']} (type: {type(test_order['payment_status'])})")
    
    # Step 3: Simulate opening order management dialog
    print("\n🔍 Step 3: Order Management Dialog (Get Order Details)")
    order_detail_response = requests.get(
        f'{base_url}/api/orders/{test_order["id"]}/',
        headers=headers
    )
    
    if order_detail_response.status_code != 200:
        print(f"❌ Failed to get order details: {order_detail_response.status_code}")
        return
    
    order_details = order_detail_response.json()
    print(f"✅ Order details fetched")
    print(f"   Payment status in details: {order_details['payment_status']} (type: {type(order_details['payment_status'])})")
    
    # Step 4: Simulate payment status change
    print("\n🔄 Step 4: Payment Status Update")
    current_status = order_details['payment_status']
    new_status = not current_status  # Toggle the boolean
    
    print(f"   Changing from {current_status} to {new_status}")
    
    update_data = {'payment_status': new_status}
    update_response = requests.post(
        f'{base_url}/api/orders/{test_order["id"]}/update_payment_status/',
        headers=headers,
        json=update_data
    )
    
    if update_response.status_code != 200:
        print(f"❌ Payment status update failed: {update_response.status_code}")
        print(f"   Response: {update_response.text}")
        return
    
    update_result = update_response.json()
    print(f"✅ Payment status updated successfully")
    print(f"   New payment status: {update_result['payment_status']} (type: {type(update_result['payment_status'])})")
    
    # Step 5: Simulate frontend refresh (what getAllOrders does)
    print("\n🔄 Step 5: Frontend Refresh (getAllOrders)")
    refresh_response = requests.get(
        f'{base_url}/api/orders/',
        headers=headers,
        params={
            'page': 1, 
            'limit': 10,
            '_t': int(datetime.now().timestamp() * 1000)  # Cache busting
        }
    )
    
    if refresh_response.status_code != 200:
        print(f"❌ Failed to refresh orders: {refresh_response.status_code}")
        return
    
    refreshed_data = refresh_response.json()
    refreshed_order = next((o for o in refreshed_data['results'] if o['id'] == test_order['id']), None)
    
    if not refreshed_order:
        print(f"❌ Order {test_order['id']} not found in refreshed data")
        return
    
    print(f"✅ Order found in refreshed data")
    print(f"   Refreshed payment status: {refreshed_order['payment_status']} (type: {type(refreshed_order['payment_status'])})")
    
    # Step 6: Verify the change persisted
    if refreshed_order['payment_status'] == new_status:
        print("\n🎉 SUCCESS: Payment status change is working correctly!")
        print("   The issue might be in the frontend component re-rendering.")
    else:
        print(f"\n❌ ISSUE: Payment status didn't persist")
        print(f"   Expected: {new_status}, Got: {refreshed_order['payment_status']}")
    
    # Step 7: Restore original status
    print("\n🔄 Step 7: Restoring Original Status")
    restore_data = {'payment_status': current_status}
    restore_response = requests.post(
        f'{base_url}/api/orders/{test_order["id"]}/update_payment_status/',
        headers=headers,
        json=restore_data
    )
    
    if restore_response.status_code == 200:
        print("✅ Original status restored")
    else:
        print(f"⚠️  Failed to restore original status: {restore_response.status_code}")
    
    print("\n📊 Frontend Debugging Suggestions:")
    print("   1. Check browser console for React component re-render logs")
    print("   2. Verify Redux DevTools shows state updates")
    print("   3. Check if table rows are using correct keys for React reconciliation")
    print("   4. Ensure component is subscribed to the correct Redux state slice")
    print("   5. Try hard refresh (Ctrl+F5) to clear any browser cache")

if __name__ == '__main__':
    test_frontend_workflow()