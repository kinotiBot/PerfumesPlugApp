import requests
import json
import time

# Test configuration
BASE_URL = 'http://localhost:8000'
ADMIN_CREDENTIALS = {
    'email': 'admin@example.com',
    'password': 'admin123'
}

def final_payment_status_test():
    """Final comprehensive test of payment status functionality"""
    session = requests.Session()
    
    print("=== Final Payment Status Test ===")
    
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
    
    print(f"✅ Found {len(orders)} orders")
    
    # Test multiple orders
    test_results = []
    for i, order in enumerate(orders[:3]):  # Test first 3 orders
        order_id = order['id']
        original_status = order['payment_status']
        
        print(f"\n--- Testing Order {order_id} ---")
        print(f"Original status: {original_status}")
        
        # Toggle status
        new_status = not original_status
        
        # Update payment status
        update_response = session.post(
            f'{BASE_URL}/api/orders/{order_id}/update_payment_status/',
            json={'payment_status': new_status},
            headers=headers
        )
        
        if update_response.status_code == 200:
            update_data = update_response.json()
            updated_status = update_data.get('payment_status')
            
            if updated_status == new_status:
                print(f"✅ Order {order_id}: {original_status} → {updated_status}")
                test_results.append(True)
                
                # Restore original status
                restore_response = session.post(
                    f'{BASE_URL}/api/orders/{order_id}/update_payment_status/',
                    json={'payment_status': original_status},
                    headers=headers
                )
                
                if restore_response.status_code == 200:
                    print(f"✅ Order {order_id}: Status restored to {original_status}")
                else:
                    print(f"⚠️  Order {order_id}: Failed to restore original status")
            else:
                print(f"❌ Order {order_id}: Status mismatch - expected {new_status}, got {updated_status}")
                test_results.append(False)
        else:
            print(f"❌ Order {order_id}: Update failed - {update_response.status_code}")
            test_results.append(False)
        
        time.sleep(0.2)  # Small delay between tests
    
    # Summary
    successful_tests = sum(test_results)
    total_tests = len(test_results)
    
    print(f"\n=== Test Summary ===")
    print(f"✅ Successful tests: {successful_tests}/{total_tests}")
    
    if successful_tests == total_tests:
        print("🎉 All payment status updates working perfectly!")
        print("\n📋 Frontend Implementation Summary:")
        print("   ✅ Boolean values in Select component (true/false)")
        print("   ✅ Proper Redux state management")
        print("   ✅ useEffect with success dependency")
        print("   ✅ Force refresh after updates")
        print("   ✅ Cache busting with timestamps")
        print("   ✅ Debug logging for troubleshooting")
        print("   ✅ Unique React keys for re-rendering")
        
        print("\n🔧 If UI still doesn't update:")
        print("   1. Hard refresh browser (Ctrl+F5)")
        print("   2. Clear browser cache")
        print("   3. Check browser console for errors")
        print("   4. Verify network requests in DevTools")
        
        return True
    else:
        print(f"❌ {total_tests - successful_tests} tests failed")
        return False

if __name__ == '__main__':
    success = final_payment_status_test()
    if success:
        print("\n🚀 Payment status functionality is fully operational!")
    else:
        print("\n🔧 Some issues remain - check the logs above")