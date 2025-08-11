import requests
import json

# Comprehensive test script to verify both order and payment status updates

def test_complete_status_updates():
    base_url = "http://localhost:8000"
    
    # Admin login
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    login_response = requests.post(f"{base_url}/api/users/login/", json=login_data)
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code} - {login_response.text}")
        return
    
    token = login_response.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("✓ Admin login successful")
    
    # Get orders to find one to test
    orders_response = requests.get(f"{base_url}/api/orders/", headers=headers)
    if orders_response.status_code != 200:
        print(f"Failed to get orders: {orders_response.status_code}")
        return
    
    orders = orders_response.json()["results"]
    if not orders:
        print("No orders found")
        return
    
    test_order = orders[0]
    order_id = test_order["id"]
    original_status = test_order["status"]
    original_payment_status = test_order["payment_status"]
    
    print(f"✓ Found test order {order_id}")
    print(f"  Original order status: {original_status}")
    print(f"  Original payment status: {original_payment_status}")
    
    # Test 1: Update order status
    print(f"\n🔄 Test 1: Updating order status...")
    new_status = 'S' if original_status != 'S' else 'P'  # Switch between Shipped and Pending
    
    status_update_data = {"status": new_status}
    status_update_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_order_status/",
        json=status_update_data,
        headers=headers
    )
    
    if status_update_response.status_code != 200:
        print(f"❌ Order status update failed: {status_update_response.status_code} - {status_update_response.text}")
        return
    
    updated_order = status_update_response.json()
    print(f"✓ Order status updated successfully")
    print(f"  New order status: {updated_order['status']}")
    
    # Test 2: Update payment status
    print(f"\n🔄 Test 2: Updating payment status...")
    new_payment_status = not original_payment_status
    
    payment_update_data = {"payment_status": new_payment_status}
    payment_update_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=payment_update_data,
        headers=headers
    )
    
    if payment_update_response.status_code != 200:
        print(f"❌ Payment status update failed: {payment_update_response.status_code} - {payment_update_response.text}")
        return
    
    updated_order = payment_update_response.json()
    print(f"✓ Payment status updated successfully")
    print(f"  New payment status: {updated_order['payment_status']}")
    
    # Test 3: Verify both changes persisted
    print(f"\n🔍 Test 3: Verifying both changes persisted...")
    verify_response = requests.get(f"{base_url}/api/orders/", headers=headers)
    if verify_response.status_code != 200:
        print(f"❌ Failed to verify orders: {verify_response.status_code}")
        return
    
    verify_orders = verify_response.json()["results"]
    verify_order = next((order for order in verify_orders if order["id"] == order_id), None)
    
    if verify_order is None:
        print(f"❌ Could not find order {order_id} in verification")
        return
    
    status_correct = verify_order["status"] == new_status
    payment_correct = verify_order["payment_status"] == new_payment_status
    
    if status_correct and payment_correct:
        print(f"✓ Both status changes persisted correctly")
        print(f"  Verified order status: {verify_order['status']}")
        print(f"  Verified payment status: {verify_order['payment_status']}")
    else:
        print(f"❌ Status changes did not persist correctly")
        if not status_correct:
            print(f"  Order status - Expected: {new_status}, Got: {verify_order['status']}")
        if not payment_correct:
            print(f"  Payment status - Expected: {new_payment_status}, Got: {verify_order['payment_status']}")
        return
    
    # Test 4: Test status filtering
    print(f"\n🔍 Test 4: Testing status filtering...")
    filter_response = requests.get(f"{base_url}/api/orders/?status={new_status}", headers=headers)
    if filter_response.status_code != 200:
        print(f"❌ Status filtering failed: {filter_response.status_code}")
        return
    
    filtered_orders = filter_response.json()["results"]
    filtered_order = next((order for order in filtered_orders if order["id"] == order_id), None)
    
    if filtered_order:
        print(f"✓ Status filtering works correctly")
        print(f"  Order {order_id} found in status '{new_status}' filter")
    else:
        print(f"❌ Status filtering failed - order not found in filtered results")
        return
    
    # Test 5: Restore original values
    print(f"\n🔄 Test 5: Restoring original values...")
    
    # Restore order status
    restore_status_data = {"status": original_status}
    restore_status_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_order_status/",
        json=restore_status_data,
        headers=headers
    )
    
    if restore_status_response.status_code != 200:
        print(f"❌ Order status restore failed: {restore_status_response.status_code}")
        return
    
    # Restore payment status
    restore_payment_data = {"payment_status": original_payment_status}
    restore_payment_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=restore_payment_data,
        headers=headers
    )
    
    if restore_payment_response.status_code != 200:
        print(f"❌ Payment status restore failed: {restore_payment_response.status_code}")
        return
    
    print(f"✓ Original values restored successfully")
    
    print(f"\n🎉 All status update tests passed!")
    print(f"   ✓ Order status updates work correctly")
    print(f"   ✓ Payment status updates work correctly")
    print(f"   ✓ Both changes persist in the database")
    print(f"   ✓ Status filtering works correctly")
    print(f"   ✓ API accepts correct data formats")
    print(f"\n💡 Frontend should now show immediate UI updates for both status types!")

if __name__ == "__main__":
    test_complete_status_updates()