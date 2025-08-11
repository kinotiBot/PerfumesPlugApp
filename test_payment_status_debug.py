import requests
import json

# Debug test to simulate exact frontend behavior

def test_payment_status_debug():
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
    
    # Get orders
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
    
    print(f"\n📋 Order Details:")
    print(f"  Order ID: {order_id}")
    print(f"  Current payment status: {current_payment_status} (type: {type(current_payment_status)})")
    print(f"  Order status: {test_order['status']}")
    
    # Test the exact same sequence as frontend
    print(f"\n🔄 Simulating frontend payment status update...")
    
    # Step 1: Simulate selecting opposite value (like frontend dropdown)
    new_payment_status = not current_payment_status
    print(f"  Frontend would select: {new_payment_status} (type: {type(new_payment_status)})")
    
    # Step 2: Make the API call with the selected value
    update_data = {"payment_status": new_payment_status}
    print(f"  Sending API request with data: {update_data}")
    
    update_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=update_data,
        headers=headers
    )
    
    print(f"  API Response Status: {update_response.status_code}")
    
    if update_response.status_code == 200:
        updated_order = update_response.json()
        print(f"  ✓ API Update Successful")
        print(f"  Updated payment status: {updated_order['payment_status']} (type: {type(updated_order['payment_status'])})")
        
        # Step 3: Simulate the getAllOrders call that frontend makes
        print(f"\n🔄 Simulating frontend getAllOrders refresh...")
        refresh_response = requests.get(f"{base_url}/api/orders/", headers=headers)
        
        if refresh_response.status_code == 200:
            refreshed_orders = refresh_response.json()["results"]
            refreshed_order = next((order for order in refreshed_orders if order["id"] == order_id), None)
            
            if refreshed_order:
                print(f"  ✓ Order found in refreshed list")
                print(f"  Refreshed payment status: {refreshed_order['payment_status']} (type: {type(refreshed_order['payment_status'])})")
                
                # Check if the status actually changed
                if refreshed_order['payment_status'] == new_payment_status:
                    print(f"  ✅ Payment status change confirmed in refreshed data")
                else:
                    print(f"  ❌ Payment status did not change in refreshed data")
                    print(f"     Expected: {new_payment_status}, Got: {refreshed_order['payment_status']}")
            else:
                print(f"  ❌ Order not found in refreshed list")
        else:
            print(f"  ❌ Failed to refresh orders: {refresh_response.status_code}")
            
    else:
        print(f"  ❌ API Update Failed: {update_response.text}")
    
    # Additional debugging: Check what the frontend component would see
    print(f"\n🔍 Frontend Component Analysis:")
    print(f"  - Select component value would be: {current_payment_status}")
    print(f"  - MenuItem values are: false (Unpaid), true (Paid)")
    print(f"  - When user clicks opposite option, event.target.value would be: {new_payment_status}")
    print(f"  - This gets sent to API as paymentStatus: {new_payment_status}")
    
    # Test what happens if we send the wrong type (string instead of boolean)
    print(f"\n🧪 Testing with string values (potential issue):")
    string_status = "paid" if new_payment_status else "unpaid"
    string_data = {"payment_status": string_status}
    
    string_response = requests.post(
        f"{base_url}/api/orders/{order_id}/update_payment_status/",
        json=string_data,
        headers=headers
    )
    
    print(f"  String value '{string_status}' response: {string_response.status_code}")
    if string_response.status_code != 200:
        print(f"  Error with string: {string_response.text}")
    
    print(f"\n🎯 Conclusion:")
    if update_response.status_code == 200:
        print(f"  ✅ API accepts boolean values correctly")
        print(f"  ✅ Payment status updates work at API level")
        print(f"  🤔 If frontend still not working, issue is likely:")
        print(f"     - Browser caching")
        print(f"     - Component not re-rendering")
        print(f"     - Redux state not triggering UI update")
    else:
        print(f"  ❌ API issue found - payment status update failing")

if __name__ == "__main__":
    test_payment_status_debug()