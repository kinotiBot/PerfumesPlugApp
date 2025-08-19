#!/usr/bin/env python3
"""
Script to fix admin user password in Railway production database
"""

import os
import django
from django.contrib.auth.hashers import make_password

# Set up Django environment for Railway production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')

# Set Railway production database URL
os.environ['DATABASE_URL'] = 'postgresql://postgres:COmiWzRPYjwswFHZAXNNMBGtGvIrrulk@centerbeam.proxy.rlwy.net:43338/railway'

django.setup()

from users.models import User
from django.db import transaction

def fix_admin_password():
    """Fix admin user password in Railway production database"""
    print("=== Fixing Admin Password in Railway Production ===")
    
    try:
        with transaction.atomic():
            # Get or create admin user
            admin_user, created = User.objects.get_or_create(
                email="admin@example.com",
                defaults={
                    "first_name": "Admin",
                    "last_name": "User",
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True
                }
            )
            
            # Set password explicitly
            admin_user.password = make_password("admin123")
            admin_user.is_active = True
            admin_user.save()
            
            print(f"✅ Admin user password updated: {admin_user.email}")
            print(f"   - Is active: {admin_user.is_active}")
            print(f"   - Is staff: {admin_user.is_staff}")
            print(f"   - Is superuser: {admin_user.is_superuser}")
            print(f"   - Password hash: {admin_user.password[:50]}...")
            
            # Also create/update test user
            test_user, created = User.objects.get_or_create(
                email="test@example.com",
                defaults={
                    "first_name": "Test",
                    "last_name": "User",
                    "is_staff": False,
                    "is_superuser": False,
                    "is_active": True
                }
            )
            
            test_user.password = make_password("test123")
            test_user.is_active = True
            test_user.save()
            
            print(f"✅ Test user password updated: {test_user.email}")
            
            # List all users
            print("\n=== All Users in Railway Production ===")
            for user in User.objects.all():
                print(f"- {user.email} (ID: {user.id}, Active: {user.is_active}, Staff: {user.is_staff})")
            
            print("\n✅ Password fix completed successfully!")
            
    except Exception as e:
        print(f"❌ Error fixing password: {e}")
        raise

if __name__ == "__main__":
    fix_admin_password()