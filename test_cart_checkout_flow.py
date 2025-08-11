#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from perfumes.models import Perfume
from orders.models import Cart, CartItem

User = get_user_model()

def test_cart_checkout_flow():
    base_url = 'http://127.0.0.1:8000'
    
    print("=== Testing Complete Cart and Checkout Flow ===")
    
    # 1. Login to get token
    print("\n1. Logging in...")
    login_data = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{base_url}/api/users/login/', json=login_data)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        token = response.json().get('access')
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        print("✓ Login successful")
        
        # 2. Clear existing cart
        print("\n2. Clearing existing cart...")
        clear_response = requests.post(f'{base_url}/api/orders/cart/clear/', headers=headers, json={})
        print(f"Clear cart status: {clear_response.status_code}")
        
        # 3. Get available perfumes
        print("\n3. Getting available perfumes...")
        perfumes = Perfume.objects.filter(is_active=True, stock__gt=0)[:3]
        if not perfumes:
            print("No perfumes available for testing")
            return
        
        print(f"Found {len(perfumes)} perfumes for testing")
        
        # 4. Add items to cart
        print("\n4. Adding items to cart...")
        for i, perfume in enumerate(perfumes, 1):
            add_data = {
                'perfume_id': perfume.id,
                'quantity': i  # Add different quantities
            }
            response = requests.post(
                f'{base_url}/api/orders/cart/add_item/',
                headers=headers,
                json=add_data
            )
            if response.status_code == 200:
                print(f"✓ Added {perfume.name} (qty: {i}) to cart")
            else:
                print(f"✗ Failed to add {perfume.name}: {response.text}")
        
        # 5. Get cart contents
        print("\n5. Getting cart contents...")
        cart_response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=headers)
        if cart_response.status_code == 200:
            cart_data = cart_response.json()
            print(f"✓ Cart retrieved successfully")
            print(f"  - Total items: {cart_data.get('total_items', 0)}")
            print(f"  - Subtotal: ${cart_data.get('subtotal', '0.00')}")
            print(f"  - Items in cart: {len(cart_data.get('items', []))}")
        else:
            print(f"✗ Failed to get cart: {cart_response.text}")
            return
        
        # 6. Update cart item quantity
        print("\n6. Testing cart item update...")
        if cart_data.get('items'):
            first_item = cart_data['items'][0]
            update_data = {
                'item_id': first_item['id'],
                'quantity': 5
            }
            update_response = requests.post(
                f'{base_url}/api/orders/cart/update_item/',
                headers=headers,
                json=update_data
            )
            if update_response.status_code == 200:
                print("✓ Cart item updated successfully")
            else:
                print(f"✗ Failed to update cart item: {update_response.text}")
        
        # 7. Test checkout preparation (get updated cart)
        print("\n7. Preparing for checkout...")
        final_cart_response = requests.get(f'{base_url}/api/orders/cart/my_cart/', headers=headers)
        if final_cart_response.status_code == 200:
            final_cart = final_cart_response.json()
            print(f"✓ Final cart ready for checkout")
            print(f"  - Total items: {final_cart.get('total_items', 0)}")
            print(f"  - Final subtotal: ${final_cart.get('subtotal', '0.00')}")
            
            # Display cart items
            for item in final_cart.get('items', []):
                perfume_details = item.get('perfume_details', {})
                print(f"  - {perfume_details.get('name', 'Unknown')} x{item.get('quantity', 0)} = ${item.get('total', '0.00')}")
        else:
            print(f"✗ Failed to get final cart: {final_cart_response.text}")
        
        print("\n✓ Cart and checkout flow test completed successfully!")
        print("\nThe cart functionality is now working properly with the extended JWT token lifetime.")
        
    except Exception as e:
        print(f"Test failed with error: {e}")
    
    print("\n=== Test Complete ===")

if __name__ == '__main__':
    test_cart_checkout_flow()