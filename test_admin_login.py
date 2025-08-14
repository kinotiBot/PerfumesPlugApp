#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_and_create_admin():
    """Check if admin user exists and create if needed"""
    print("Checking admin user...")
    
    try:
        admin_user = User.objects.get(email='admin@example.com')
        print(f"✅ Admin user exists: {admin_user.email}")
        print(f"   - Is active: {admin_user.is_active}")
        print(f"   - Is staff: {admin_user.is_staff}")
        print(f"   - Is superuser: {admin_user.is_superuser}")
        
        # Test password
        if admin_user.check_password('admin123'):
            print("   - Password check: ✅ Valid")
        else:
            print("   - Password check: ❌ Invalid - updating password")
            admin_user.set_password('admin123')
            admin_user.save()
            print("   - Password updated")
            
    except User.DoesNotExist:
        print("❌ Admin user not found. Creating...")
        admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("✅ Admin user created successfully")
        print(f"   - Email: {admin_user.email}")
        print(f"   - Is staff: {admin_user.is_staff}")
        print(f"   - Is superuser: {admin_user.is_superuser}")

if __name__ == '__main__':
    check_and_create_admin()
    print("\nDone! You can now try logging in with:")
    print("Email: admin@example.com")
    print("Password: admin123")