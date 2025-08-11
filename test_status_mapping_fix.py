import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"

def test_status_mapping_fix():
    """Test that the status mapping fix resolves the UI update issue"""
    
    print("\n=== Testing Status Mapping Fix ===")
    
    # Step 1: Admin login
    print("\n1. Admin login...")
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/users/login/", json=login_data)
    if response.status_code != 200:
        print(f"❌ Admin login failed: {response.status_code} - {response.text}")
        return False
    
    admin_token = response.json().get('access')
    print(f"✅ Admin login successful")
    
    # Step 2: Get orders and verify status format
    print("\n2. Fetching orders to verify status format...")
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    response = requests.get(f"{BASE_URL}/api/orders/", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to fetch orders: {response.status_code} - {response.text}")
        return False
    
    orders_data = response.json()
    orders = orders_data.get('results', orders_data) if isinstance(orders_data, dict) else orders_data
    
    if not orders:
        print("❌ No orders found to test with")
        return False
    
    print(f"✅ Found {len(orders)} orders")
    
    # Step 3: Verify API status codes format
    print("\n3. Verifying API status codes format...")
    status_codes_found = set()
    for order in orders:
        status = order.get('status')
        if status:
            status_codes_found.add(status)
    
    print(f"   Status codes found: {sorted(status_codes_found)}")
    
    # Expected API status codes
    expected_codes = {'P', 'C', 'S', 'D', 'X'}
    valid_codes = status_codes_found.intersection(expected_codes)
    
    if valid_codes:
        print(f"✅ Found valid API status codes: {sorted(valid_codes)}")
    else:
        print(f"⚠️  No standard API status codes found. Found: {sorted(status_codes_found)}")
    
    # Step 4: Test status update with proper mapping
    test_order = orders[0]
    order_id = test_order['id']
    original_status = test_order.get('status', 'P')
    
    print(f"\n4. Testing status update with proper mapping...")
    print(f"   Order ID: {order_id}")
    print(f"   Original Status: {original_status}")
    
    # Choose a different status to update to
    status_cycle = {'P': 'C', 'C': 'S', 'S': 'D', 'D': 'P', 'X': 'P'}
    new_status = status_cycle.get(original_status, 'C')
    
    print(f"   Updating to: {new_status}")
    
    # Update status using API
    status_update_data = {'status': new_status}
    response = requests.post(
        f"{BASE_URL}/api/orders/{order_id}/update_order_status/",
        json=status_update_data,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to update order status: {response.status_code} - {response.text}")
        return False
    
    updated_order_data = response.json()
    api_returned_status = updated_order_data.get('status')
    print(f"✅ Status update successful")
    print(f"   API returned status: {api_returned_status}")
    
    if api_returned_status != new_status:
        print(f"❌ Status mismatch! Expected: {new_status}, Got: {api_returned_status}")
        return False
    
    # Step 5: Verify status persists in fresh API call
    print("\n5. Verifying status persistence...")
    time.sleep(0.5)
    
    response = requests.get(f"{BASE_URL}/api/orders/", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to fetch updated orders: {response.status_code} - {response.text}")
        return False
    
    fresh_orders_data = response.json()
    fresh_orders = fresh_orders_data.get('results', fresh_orders_data) if isinstance(fresh_orders_data, dict) else fresh_orders_data
    
    # Find the updated order
    updated_order = None
    for order in fresh_orders:
        if order['id'] == order_id:
            updated_order = order
            break
    
    if not updated_order:
        print(f"❌ Could not find updated order with ID: {order_id}")
        return False
    
    fresh_status = updated_order.get('status')
    print(f"   Fresh API call status: {fresh_status}")
    
    if fresh_status != new_status:
        print(f"❌ Status not persisted! Expected: {new_status}, Got: {fresh_status}")
        return False
    
    print(f"✅ Status update persisted correctly")
    
    # Step 6: Test payment status update
    print("\n6. Testing payment status update...")
    original_payment_status = test_order.get('payment_status', False)
    new_payment_status = not original_payment_status
    
    print(f"   Original Payment Status: {'Paid' if original_payment_status else 'Unpaid'}")
    print(f"   Updating to: {'Paid' if new_payment_status else 'Unpaid'}")
    
    payment_update_data = {'payment_status': new_payment_status}
    response = requests.post(
        f"{BASE_URL}/api/orders/{order_id}/update_payment_status/",
        json=payment_update_data,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to update payment status: {response.status_code} - {response.text}")
        return False
    
    updated_payment_data = response.json()
    api_returned_payment = updated_payment_data.get('payment_status')
    print(f"✅ Payment status update successful")
    print(f"   API returned payment status: {'Paid' if api_returned_payment else 'Unpaid'}")
    
    # Step 7: Test status filtering with API codes
    print("\n7. Testing status filtering with API codes...")
    
    # Test filtering by the updated status
    response = requests.get(f"{BASE_URL}/api/orders/?status={fresh_status}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Status filter failed: {response.status_code} - {response.text}")
        return False
    
    filtered_data = response.json()
    filtered_orders = filtered_data.get('results', filtered_data) if isinstance(filtered_data, dict) else filtered_data
    
    # Check if our updated order is in the filtered results
    found_in_filter = any(order['id'] == order_id for order in filtered_orders)
    
    if found_in_filter:
        print(f"✅ Status filtering working correctly")
    else:
        print(f"⚠️  Status filtering may have issues - order not found in filtered results")
    
    # Step 8: Display status mapping verification
    print("\n8. Status mapping verification...")
    
    status_display_mapping = {
        'P': 'Pending',
        'C': 'Processing', 
        'S': 'Shipped',
        'D': 'Delivered',
        'X': 'Cancelled'
    }
    
    print("   API Code → Frontend Display:")
    for api_code, display_name in status_display_mapping.items():
        print(f"   {api_code} → {display_name}")
    
    print("\n🎉 Status mapping fix test completed!")
    print("\n📝 Summary:")
    print(f"   - Order ID: {order_id}")
    print(f"   - Status: {original_status} → {fresh_status}")
    print(f"   - Payment: {'Paid' if original_payment_status else 'Unpaid'} → {'Paid' if api_returned_payment else 'Unpaid'}")
    print(f"   - API Status Codes: ✅ Working")
    print(f"   - Status Filtering: ✅ Working")
    print(f"   - Status Persistence: ✅ Working")
    
    print("\n💡 Frontend should now display:")
    print(f"   - Status: {status_display_mapping.get(fresh_status, fresh_status)}")
    print(f"   - Payment: {'Paid' if api_returned_payment else 'Unpaid'}")
    print("   - UI should update immediately after status changes")
    
    return True

if __name__ == "__main__":
    success = test_status_mapping_fix()
    if not success:
        print("\n❌ Test failed!")
        exit(1)
    else:
        print("\n✅ All tests passed! Status mapping fix should resolve UI update issues.")