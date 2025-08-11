import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"

def test_admin_order_status_updates():
    """Test that admin can update order status and payment status, and changes are reflected in the orders list"""
    
    print("\n=== Testing Admin Order Status Updates ===")
    
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
    
    # Step 2: Get all orders
    print("\n2. Fetching all orders...")
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    response = requests.get(f"{BASE_URL}/api/orders/", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to fetch orders: {response.status_code} - {response.text}")
        return False
    
    orders_data = response.json()
    # Django REST framework returns results in 'results' key for paginated responses
    orders = orders_data.get('results', orders_data) if isinstance(orders_data, dict) else orders_data
    
    if not orders:
        print("❌ No orders found to test with")
        return False
    
    # Find an order to test with
    test_order = orders[0]
    order_id = test_order['id']
    original_status = test_order.get('status', 'pending')
    original_payment_status = test_order.get('payment_status', False)
    
    print(f"✅ Found {len(orders)} orders")
    print(f"📋 Testing with Order ID: {order_id}")
    print(f"📋 Original Status: {original_status}")
    print(f"📋 Original Payment Status: {'Paid' if original_payment_status else 'Unpaid'}")
    
    # Step 3: Update order status
    print("\n3. Updating order status...")
    # Use correct status codes: P=Pending, C=Confirmed, S=Shipped, D=Delivered, X=Cancelled
    new_status = 'S' if original_status != 'S' else 'D'  # Shipped or Delivered
    
    status_update_data = {'status': new_status}
    response = requests.post(
        f"{BASE_URL}/api/orders/{order_id}/update_order_status/",
        json=status_update_data,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to update order status: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Order status updated to: {new_status}")
    
    # Step 4: Update payment status
    print("\n4. Updating payment status...")
    new_payment_status = not original_payment_status
    
    payment_update_data = {'payment_status': new_payment_status}
    response = requests.post(
        f"{BASE_URL}/api/orders/{order_id}/update_payment_status/",
        json=payment_update_data,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to update payment status: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Payment status updated to: {'Paid' if new_payment_status else 'Unpaid'}")
    
    # Step 5: Verify changes in orders list
    print("\n5. Verifying changes in orders list...")
    time.sleep(1)  # Brief delay to ensure database is updated
    
    response = requests.get(f"{BASE_URL}/api/orders/", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to fetch updated orders: {response.status_code} - {response.text}")
        return False
    
    updated_orders_data = response.json()
    # Django REST framework returns results in 'results' key for paginated responses
    updated_orders = updated_orders_data.get('results', updated_orders_data) if isinstance(updated_orders_data, dict) else updated_orders_data
    
    # Find the updated order
    updated_order = None
    for order in updated_orders:
        if order['id'] == order_id:
            updated_order = order
            break
    
    if not updated_order:
        print(f"❌ Could not find updated order with ID: {order_id}")
        return False
    
    # Verify status update
    current_status = updated_order.get('status')
    current_payment_status = updated_order.get('payment_status')
    
    print(f"📋 Current Status: {current_status}")
    print(f"📋 Current Payment Status: {'Paid' if current_payment_status else 'Unpaid'}")
    
    if current_status != new_status:
        print(f"❌ Order status not updated correctly. Expected: {new_status}, Got: {current_status}")
        return False
    
    if current_payment_status != new_payment_status:
        print(f"❌ Payment status not updated correctly. Expected: {new_payment_status}, Got: {current_payment_status}")
        return False
    
    print("✅ All status updates verified successfully!")
    
    # Step 6: Test with specific order ID filter
    print("\n6. Testing order ID filter...")
    response = requests.get(
        f"{BASE_URL}/api/orders/?order_id={order_id}",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch filtered orders: {response.status_code} - {response.text}")
        return False
    
    filtered_orders_data = response.json()
    # Django REST framework returns results in 'results' key for paginated responses
    filtered_orders = filtered_orders_data.get('results', filtered_orders_data) if isinstance(filtered_orders_data, dict) else filtered_orders_data
    
    if len(filtered_orders) != 1 or filtered_orders[0]['id'] != order_id:
        print(f"❌ Order ID filter not working correctly")
        return False
    
    print(f"✅ Order ID filter working correctly")
    
    # Step 7: Test with status filter
    print("\n7. Testing status filter...")
    response = requests.get(
        f"{BASE_URL}/api/orders/?status={new_status}",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch status filtered orders: {response.status_code} - {response.text}")
        return False
    
    status_filtered_orders_data = response.json()
    # Django REST framework returns results in 'results' key for paginated responses
    status_filtered_orders = status_filtered_orders_data.get('results', status_filtered_orders_data) if isinstance(status_filtered_orders_data, dict) else status_filtered_orders_data
    
    # Check if our updated order is in the filtered results
    found_updated_order = any(order['id'] == order_id for order in status_filtered_orders)
    
    if not found_updated_order:
        print(f"❌ Updated order not found in status filter results")
        return False
    
    print(f"✅ Status filter working correctly")
    
    print("\n🎉 All admin order status update tests passed!")
    print("\n📝 Summary:")
    print(f"   - Order ID: {order_id}")
    print(f"   - Status: {original_status} → {new_status}")
    print(f"   - Payment: {'Paid' if original_payment_status else 'Unpaid'} → {'Paid' if new_payment_status else 'Unpaid'}")
    print(f"   - List refresh: ✅ Working")
    print(f"   - Filters: ✅ Working")
    
    return True

if __name__ == "__main__":
    success = test_admin_order_status_updates()
    if not success:
        print("\n❌ Test failed!")
        exit(1)
    else:
        print("\n✅ All tests passed!")