import requests
import json

# Test script to verify payment status update issue

def test_payment_status_update():
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
    current_payment_status = test_order["payment_status"]
    
    print(f"Testing order {order_id}")
    print(f"Current payment status: {current_payment_status}")
    
    # Test 1: Try updating with boolean (correct format)
    new_payment_status = not current_payment_status
    print(f"\nTest 1: Updating payment status to {new_payment_status} (boolean)")
    
    update_data = {"payment_status": new_payment_status}
    update_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=update_data,
        headers=headers
    )
    
    print(f"Response status: {update_response.status_code}")
    if update_response.status_code == 200:
        updated_order = update_response.json()
        print(f"Updated payment status: {updated_order['payment_status']}")
    else:
        print(f"Error: {update_response.text}")
    
    # Test 2: Try updating with string (incorrect format)
    print(f"\nTest 2: Updating payment status to 'paid' (string)")
    
    update_data = {"payment_status": "paid"}
    update_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=update_data,
        headers=headers
    )
    
    print(f"Response status: {update_response.status_code}")
    if update_response.status_code == 200:
        updated_order = update_response.json()
        print(f"Updated payment status: {updated_order['payment_status']}")
    else:
        print(f"Error: {update_response.text}")

if __name__ == "__main__":
    test_payment_status_update()