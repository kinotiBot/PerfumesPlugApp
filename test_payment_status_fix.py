import requests
import json

# Test script to verify payment status update fix

def test_payment_status_fix():
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
    original_payment_status = test_order["payment_status"]
    
    print(f"✓ Found test order {order_id}")
    print(f"  Original payment status: {original_payment_status}")
    
    # Test updating payment status to opposite value
    new_payment_status = not original_payment_status
    print(f"\n🔄 Updating payment status to {new_payment_status}")
    
    update_data = {"payment_status": new_payment_status}
    update_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=update_data,
        headers=headers
    )
    
    if update_response.status_code != 200:
        print(f"❌ Payment status update failed: {update_response.status_code} - {update_response.text}")
        return
    
    updated_order = update_response.json()
    print(f"✓ Payment status updated successfully")
    print(f"  New payment status: {updated_order['payment_status']}")
    
    # Verify the change persisted by fetching the order again
    print(f"\n🔍 Verifying payment status persistence...")
    verify_response = requests.get(f"{base_url}/api/orders/", headers=headers)
    if verify_response.status_code != 200:
        print(f"❌ Failed to verify orders: {verify_response.status_code}")
        return
    
    verify_orders = verify_response.json()["results"]
    verify_order = next((order for order in verify_orders if order["id"] == order_id), None)
    
    if verify_order is None:
        print(f"❌ Could not find order {order_id} in verification")
        return
    
    if verify_order["payment_status"] == new_payment_status:
        print(f"✓ Payment status change persisted correctly")
        print(f"  Verified payment status: {verify_order['payment_status']}")
    else:
        print(f"❌ Payment status change did not persist")
        print(f"  Expected: {new_payment_status}, Got: {verify_order['payment_status']}")
        return
    
    # Test updating back to original value
    print(f"\n🔄 Updating payment status back to {original_payment_status}")
    
    restore_data = {"payment_status": original_payment_status}
    restore_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=restore_data,
        headers=headers
    )
    
    if restore_response.status_code != 200:
        print(f"❌ Payment status restore failed: {restore_response.status_code} - {restore_response.text}")
        return
    
    restored_order = restore_response.json()
    print(f"✓ Payment status restored successfully")
    print(f"  Restored payment status: {restored_order['payment_status']}")
    
    print(f"\n🎉 All payment status update tests passed!")
    print(f"   - Payment status updates work correctly")
    print(f"   - Changes persist in the database")
    print(f"   - API accepts boolean values as expected")

if __name__ == "__main__":
    test_payment_status_fix()