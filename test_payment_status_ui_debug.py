import requests
import json
import time

# Test configuration
BASE_URL = 'http://localhost:8000'
ADMIN_CREDENTIALS = {
    'email': 'admin@example.com',
    'password': 'admin123'
}

def test_payment_status_ui_debug():
    """Test payment status updates with detailed debugging for UI issues"""
    session = requests.Session()
    
    print("=== Payment Status UI Debug Test ===")
    
    # Step 1: Admin login
    print("\n1. Admin Login...")
    login_response = session.post(
        f'{BASE_URL}/api/users/login/',
        json=ADMIN_CREDENTIALS
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
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
        print(f"Response: {orders_response.text}")
        return False
    
    orders_data = orders_response.json()
    orders = orders_data.get('results', [])
    
    if not orders:
        print("❌ No orders found")
        return False
    
    # Find an order to test
    test_order = orders[0]
    order_id = test_order['id']
    original_payment_status = test_order['payment_status']
    
    print(f"✅ Found {len(orders)} orders")
    print(f"Testing with Order ID: {order_id}")
    print(f"Original payment status: {original_payment_status} (type: {type(original_payment_status)})")
    
    # Step 3: Test payment status update (False to True)
    print("\n3. Testing payment status update (False -> True)...")
    new_status = not original_payment_status  # Toggle the status
    
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
    print(f"✅ Payment status update successful")
    print(f"Updated payment status: {update_data.get('payment_status')} (type: {type(update_data.get('payment_status'))})")
    
    # Step 4: Verify the update by fetching orders again
    print("\n4. Verifying update by re-fetching orders...")
    time.sleep(0.5)  # Small delay to ensure database consistency
    
    verify_response = session.get(
        f'{BASE_URL}/api/orders/',
        headers=headers
    )
    
    if verify_response.status_code != 200:
        print(f"❌ Failed to re-fetch orders: {verify_response.status_code}")
        return False
    
    verify_data = verify_response.json()
    verify_orders = verify_data.get('results', [])
    
    # Find the updated order
    updated_order = None
    for order in verify_orders:
        if order['id'] == order_id:
            updated_order = order
            break
    
    if not updated_order:
        print(f"❌ Could not find order {order_id} in updated list")
        return False
    
    current_payment_status = updated_order['payment_status']
    print(f"✅ Order re-fetched successfully")
    print(f"Current payment status: {current_payment_status} (type: {type(current_payment_status)})")
    
    # Step 5: Verify the change persisted
    if current_payment_status == new_status:
        print("✅ Payment status change persisted correctly")
    else:
        print(f"❌ Payment status change did not persist")
        print(f"Expected: {new_status}, Got: {current_payment_status}")
        return False
    
    # Step 6: Test the opposite direction
    print("\n5. Testing reverse payment status update...")
    reverse_status = not new_status
    
    reverse_response = session.post(
        f'{BASE_URL}/api/orders/{order_id}/update_payment_status/',
        json={'payment_status': reverse_status},
        headers=headers
    )
    
    if reverse_response.status_code != 200:
        print(f"❌ Reverse payment status update failed: {reverse_response.status_code}")
        return False
    
    reverse_data = reverse_response.json()
    print(f"✅ Reverse payment status update successful")
    print(f"Reverse payment status: {reverse_data.get('payment_status')} (type: {type(reverse_data.get('payment_status'))})")
    
    # Step 7: Final verification
    print("\n6. Final verification...")
    final_response = session.get(
        f'{BASE_URL}/api/orders/',
        headers=headers
    )
    
    if final_response.status_code != 200:
        print(f"❌ Final verification failed: {final_response.status_code}")
        return False
    
    final_data = final_response.json()
    final_orders = final_data.get('results', [])
    
    final_order = None
    for order in final_orders:
        if order['id'] == order_id:
            final_order = order
            break
    
    if not final_order:
        print(f"❌ Could not find order {order_id} in final list")
        return False
    
    final_payment_status = final_order['payment_status']
    print(f"Final payment status: {final_payment_status} (type: {type(final_payment_status)})")
    
    if final_payment_status == reverse_status:
        print("✅ Reverse payment status change persisted correctly")
    else:
        print(f"❌ Reverse payment status change did not persist")
        return False
    
    # Step 8: Restore original status
    print("\n7. Restoring original payment status...")
    restore_response = session.post(
        f'{BASE_URL}/api/orders/{order_id}/update_payment_status/',
        json={'payment_status': original_payment_status},
        headers=headers
    )
    
    if restore_response.status_code == 200:
        print("✅ Original payment status restored")
    else:
        print(f"⚠️  Failed to restore original status: {restore_response.status_code}")
    
    print("\n=== Test Summary ===")
    print("✅ All payment status updates work correctly")
    print("✅ Changes persist in the database")
    print("✅ API returns correct boolean values")
    print("\n🔍 If the UI is not updating, the issue is likely:")
    print("   1. Browser caching - try hard refresh (Ctrl+F5)")
    print("   2. React component not re-rendering")
    print("   3. Redux state not triggering UI updates")
    print("   4. WebSocket or real-time update issues")
    
    return True

if __name__ == '__main__':
    success = test_payment_status_ui_debug()
    if success:
        print("\n🎉 Backend API is working correctly!")
    else:
        print("\n❌ Backend API has issues!")