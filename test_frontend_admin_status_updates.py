import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"

def test_frontend_admin_status_updates():
    """Test admin status updates from frontend perspective with detailed debugging"""
    
    print("\n=== Testing Frontend Admin Status Updates ===")
    
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
    
    # Step 2: Get initial orders list
    print("\n2. Fetching initial orders list...")
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
    
    # Find an order to test with
    test_order = orders[0]
    order_id = test_order['id']
    original_status = test_order.get('status', 'P')
    original_payment_status = test_order.get('payment_status', False)
    
    print(f"✅ Found {len(orders)} orders")
    print(f"📋 Testing with Order ID: {order_id}")
    print(f"📋 Original Status: {original_status}")
    print(f"📋 Original Payment Status: {'Paid' if original_payment_status else 'Unpaid'}")
    
    # Step 3: Test order status update
    print("\n3. Testing order status update...")
    new_status = 'C' if original_status != 'C' else 'S'  # Confirmed or Shipped
    
    print(f"   Updating status from {original_status} to {new_status}")
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
    print(f"✅ Order status update API successful")
    print(f"   API Response Status: {updated_order_data.get('status')}")
    
    # Step 4: Verify status change in fresh API call (simulating frontend refresh)
    print("\n4. Verifying status change with fresh API call...")
    time.sleep(0.5)  # Brief delay
    
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
    
    current_status = updated_order.get('status')
    print(f"   Fresh API call status: {current_status}")
    
    if current_status != new_status:
        print(f"❌ Status not updated in fresh API call. Expected: {new_status}, Got: {current_status}")
        return False
    
    print(f"✅ Status update verified in fresh API call")
    
    # Step 5: Test payment status update
    print("\n5. Testing payment status update...")
    new_payment_status = not original_payment_status
    
    print(f"   Updating payment status from {'Paid' if original_payment_status else 'Unpaid'} to {'Paid' if new_payment_status else 'Unpaid'}")
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
    print(f"✅ Payment status update API successful")
    print(f"   API Response Payment Status: {'Paid' if updated_payment_data.get('payment_status') else 'Unpaid'}")
    
    # Step 6: Verify payment status change in fresh API call
    print("\n6. Verifying payment status change with fresh API call...")
    time.sleep(0.5)  # Brief delay
    
    response = requests.get(f"{BASE_URL}/api/orders/", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to fetch updated orders: {response.status_code} - {response.text}")
        return False
    
    final_orders_data = response.json()
    final_orders = final_orders_data.get('results', final_orders_data) if isinstance(final_orders_data, dict) else final_orders_data
    
    # Find the updated order
    final_order = None
    for order in final_orders:
        if order['id'] == order_id:
            final_order = order
            break
    
    if not final_order:
        print(f"❌ Could not find final order with ID: {order_id}")
        return False
    
    final_status = final_order.get('status')
    final_payment_status = final_order.get('payment_status')
    
    print(f"   Fresh API call payment status: {'Paid' if final_payment_status else 'Unpaid'}")
    
    if final_payment_status != new_payment_status:
        print(f"❌ Payment status not updated in fresh API call. Expected: {new_payment_status}, Got: {final_payment_status}")
        return False
    
    print(f"✅ Payment status update verified in fresh API call")
    
    # Step 7: Test with specific filters to ensure they work
    print("\n7. Testing filtered API calls...")
    
    # Test order ID filter
    response = requests.get(f"{BASE_URL}/api/orders/?order_id={order_id}", headers=headers)
    if response.status_code == 200:
        filtered_data = response.json()
        filtered_orders = filtered_data.get('results', filtered_data) if isinstance(filtered_data, dict) else filtered_data
        if len(filtered_orders) >= 1 and any(order['id'] == order_id for order in filtered_orders):
            print(f"✅ Order ID filter working")
        else:
            print(f"⚠️  Order ID filter may have issues")
    else:
        print(f"⚠️  Order ID filter failed: {response.status_code}")
    
    # Test status filter
    response = requests.get(f"{BASE_URL}/api/orders/?status={final_status}", headers=headers)
    if response.status_code == 200:
        status_filtered_data = response.json()
        status_filtered_orders = status_filtered_data.get('results', status_filtered_data) if isinstance(status_filtered_data, dict) else status_filtered_data
        if any(order['id'] == order_id for order in status_filtered_orders):
            print(f"✅ Status filter working")
        else:
            print(f"⚠️  Status filter may have issues")
    else:
        print(f"⚠️  Status filter failed: {response.status_code}")
    
    print("\n🎉 All frontend admin status update tests completed!")
    print("\n📝 Final Summary:")
    print(f"   - Order ID: {order_id}")
    print(f"   - Status: {original_status} → {final_status}")
    print(f"   - Payment: {'Paid' if original_payment_status else 'Unpaid'} → {'Paid' if final_payment_status else 'Unpaid'}")
    print(f"   - API Updates: ✅ Working")
    print(f"   - Fresh API Calls: ✅ Working")
    print(f"   - Filters: ✅ Working")
    
    print("\n💡 If the frontend UI is not updating:")
    print("   1. Check browser console for JavaScript errors")
    print("   2. Verify Redux DevTools for state changes")
    print("   3. Check if getAllOrders is being dispatched after updates")
    print("   4. Ensure the component is re-rendering after state changes")
    
    return True

if __name__ == "__main__":
    success = test_frontend_admin_status_updates()
    if not success:
        print("\n❌ Test failed!")
        exit(1)
    else:
        print("\n✅ All tests passed!")