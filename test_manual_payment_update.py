import requests
import json

# Test configuration
BASE_URL = 'http://localhost:8000'
ADMIN_CREDENTIALS = {
    'email': 'admin@example.com',
    'password': 'admin123'
}

def manual_payment_update_test():
    """Manually update a payment status for UI testing"""
    session = requests.Session()
    
    print("=== Manual Payment Status Update Test ===")
    
    # Step 1: Admin login
    print("\n1. Admin Login...")
    login_response = session.post(
        f'{BASE_URL}/api/users/login/',
        json=ADMIN_CREDENTIALS
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    login_data = login_response.json()
    token = login_data.get('access')
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Admin login successful")
    
    # Step 2: Get orders
    print("\n2. Fetching orders...")
    orders_response = session.get(
        f'{BASE_URL}/api/orders/',
        headers=headers
    )
    
    if orders_response.status_code != 200:
        print(f"❌ Failed to fetch orders: {orders_response.status_code}")
        return False
    
    orders_data = orders_response.json()
    orders = orders_data.get('results', [])
    
    if not orders:
        print("❌ No orders found")
        return False
    
    # Find the first order
    test_order = orders[0]
    order_id = test_order['id']
    current_status = test_order['payment_status']
    
    print(f"✅ Found {len(orders)} orders")
    print(f"Order ID: {order_id}")
    print(f"Current payment status: {current_status} (type: {type(current_status)})")
    
    # Step 3: Toggle payment status
    new_status = not current_status
    print(f"\n3. Updating payment status to: {new_status}...")
    
    update_response = session.post(
        f'{BASE_URL}/api/orders/{order_id}/update_payment_status/',
        json={'payment_status': new_status},
        headers=headers
    )
    
    if update_response.status_code != 200:
        print(f"❌ Payment status update failed: {update_response.status_code}")
        print(f"Response: {update_response.text}")
        return False
    
    update_data = update_response.json()
    print(f"✅ Payment status updated successfully")
    print(f"New payment status: {update_data.get('payment_status')} (type: {type(update_data.get('payment_status'))})")
    
    print("\n🔍 Now check the frontend at http://localhost:3000/admin/orders")
    print(f"   Look for Order ID {order_id} and verify its payment status shows: {new_status}")
    print("   Check the browser console for debugging output")
    print("   If the status doesn't update, try a hard refresh (Ctrl+F5)")
    
    return True

if __name__ == '__main__':
    success = manual_payment_update_test()
    if success:
        print("\n✅ Manual update completed - check the frontend!")
    else:
        print("\n❌ Manual update failed!")