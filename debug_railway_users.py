#!/usr/bin/env python3
"""
Script to debug Railway production database users and create fresh admin
"""

import os
import django
from django.contrib.auth.hashers import make_password, check_password

# Set up Django environment for Railway production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')

# Set Railway production database URL
os.environ['DATABASE_URL'] = 'postgresql://postgres:COmiWzRPYjwswFHZAXNNMBGtGvIrrulk@centerbeam.proxy.rlwy.net:43338/railway'

django.setup()

from users.models import User
from perfumes.models import Category, Brand, Perfume
from django.db import transaction

def debug_and_fix_railway():
    """Debug Railway production database and create fresh admin"""
    print("=== Debugging Railway Production Database ===")
    
    try:
        # Check current state
        print(f"Total users: {User.objects.count()}")
        print(f"Total perfumes: {Perfume.objects.count()}")
        print(f"Total categories: {Category.objects.count()}")
        print(f"Total brands: {Brand.objects.count()}")
        
        print("\n=== Current Users ===")
        for user in User.objects.all():
            print(f"- {user.email} (ID: {user.id}, Active: {user.is_active}, Staff: {user.is_staff})")
            print(f"  Password hash: {user.password[:50]}...")
        
        # Delete existing admin and create fresh one
        print("\n=== Creating Fresh Admin User ===")
        
        # Delete existing admin if exists
        User.objects.filter(email="admin@example.com").delete()
        print("Deleted existing admin user")
        
        # Create completely fresh admin
        admin_user = User.objects.create_user(
            email="admin@example.com",
            password="admin123",
            first_name="Admin",
            last_name="User"
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()
        
        print(f"✅ Fresh admin created: {admin_user.email}")
        print(f"   Password hash: {admin_user.password[:50]}...")
        
        # Test password
        password_check = check_password("admin123", admin_user.password)
        print(f"   Password verification: {password_check}")
        
        # Also ensure we have perfumes data
        if Perfume.objects.count() == 0:
            print("\n=== Adding Sample Perfumes ===")
            
            # Create categories
            unisex_cat, _ = Category.objects.get_or_create(
                name="Unisex",
                defaults={"description": "Fragrances for everyone"}
            )
            
            # Create brand
            tom_ford, _ = Brand.objects.get_or_create(
                name="Tom Ford",
                defaults={"description": "Luxury American fashion house"}
            )
            
            # Create perfume
            perfume = Perfume.objects.create(
                name="Tom Ford Black Orchid",
                slug="tom-ford-black-orchid",
                brand=tom_ford,
                category=unisex_cat,
                description="A luxurious and sensual fragrance.",
                price=150.00,
                stock=25,
                gender="U",
                is_featured=True,
                is_active=True
            )
            
            print(f"✅ Sample perfume created: {perfume.name}")
        
        print("\n=== Final State ===")
        print(f"Users: {User.objects.count()}")
        print(f"Perfumes: {Perfume.objects.count()}")
        print(f"Categories: {Category.objects.count()}")
        print(f"Brands: {Brand.objects.count()}")
        
        print("\n✅ Railway production database fixed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_and_fix_railway()