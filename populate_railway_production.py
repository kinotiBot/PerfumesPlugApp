#!/usr/bin/env python3
"""
Script to populate Railway production database with sample data
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
from perfumes.models import Category, Brand, Perfume
from orders.models import Cart, CartItem
from django.db import transaction

def populate_railway_production():
    """Populate Railway production database with sample data"""
    print("=== Populating Railway Production Database ===")
    
    try:
        with transaction.atomic():
            # Create categories
            print("Creating categories...")
            men_category, _ = Category.objects.get_or_create(
                name="Men",
                defaults={"description": "Fragrances for men"}
            )
            women_category, _ = Category.objects.get_or_create(
                name="Women", 
                defaults={"description": "Fragrances for women"}
            )
            unisex_category, _ = Category.objects.get_or_create(
                name="Unisex",
                defaults={"description": "Fragrances for everyone"}
            )
            
            print(f"✅ Categories created: {Category.objects.count()}")
            
            # Create brands
            print("Creating brands...")
            tom_ford, _ = Brand.objects.get_or_create(
                name="Tom Ford",
                defaults={"description": "Luxury American fashion house"}
            )
            chanel, _ = Brand.objects.get_or_create(
                name="Chanel",
                defaults={"description": "French luxury fashion house"}
            )
            
            print(f"✅ Brands created: {Brand.objects.count()}")
            
            # Create perfumes
            print("Creating perfumes...")
            
            # Tom Ford Black Orchid
            black_orchid, _ = Perfume.objects.get_or_create(
                name="Tom Ford Black Orchid",
                defaults={
                    "slug": "tom-ford-tom-ford-black-orchid",
                    "brand": tom_ford,
                    "category": unisex_category,
                    "description": "A luxurious and sensual fragrance with black truffle, ylang-ylang, and dark chocolate.",
                    "price": 150.00,
                    "stock": 25,
                    "gender": "U",
                    "is_featured": True,
                    "is_active": True
                }
            )
            
            # Chanel No. 5
            chanel_no5, _ = Perfume.objects.get_or_create(
                name="Chanel No. 5",
                defaults={
                    "slug": "chanel-chanel-no-5",
                    "brand": chanel,
                    "category": women_category,
                    "description": "The world's most iconic fragrance with aldehydes, ylang-ylang, and sandalwood.",
                    "price": 120.00,
                    "stock": 30,
                    "gender": "F",
                    "is_featured": True,
                    "is_active": True
                }
            )
            
            # Tom Ford Oud Wood
            oud_wood, _ = Perfume.objects.get_or_create(
                name="Tom Ford Oud Wood",
                defaults={
                    "slug": "tom-ford-oud-wood",
                    "brand": tom_ford,
                    "category": unisex_category,
                    "description": "A sophisticated blend of exotic oud wood with sandalwood and rosewood.",
                    "price": 200.00,
                    "stock": 15,
                    "gender": "U",
                    "is_featured": False,
                    "is_active": True
                }
            )
            
            print(f"✅ Perfumes created: {Perfume.objects.count()}")
            
            # Create admin user
            print("Creating admin user...")
            admin_user, created = User.objects.get_or_create(
                email="admin@example.com",
                defaults={
                    "first_name": "Admin",
                    "last_name": "User",
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                    "password": make_password("admin123")
                }
            )
            
            if created:
                print(f"✅ Admin user created: {admin_user.email}")
            else:
                print(f"✅ Admin user already exists: {admin_user.email}")
            
            # Create test user
            print("Creating test user...")
            test_user, created = User.objects.get_or_create(
                email="test@example.com",
                defaults={
                    "first_name": "Test",
                    "last_name": "User",
                    "is_staff": False,
                    "is_superuser": False,
                    "is_active": True,
                    "password": make_password("test123")
                }
            )
            
            if created:
                print(f"✅ Test user created: {test_user.email}")
            else:
                print(f"✅ Test user already exists: {test_user.email}")
            
            print("\n=== Database Population Summary ===")
            print(f"Users: {User.objects.count()}")
            print(f"Categories: {Category.objects.count()}")
            print(f"Brands: {Brand.objects.count()}")
            print(f"Perfumes: {Perfume.objects.count()}")
            print(f"Featured Perfumes: {Perfume.objects.filter(is_featured=True).count()}")
            
            print("\n✅ Railway production database populated successfully!")
            
    except Exception as e:
        print(f"❌ Error populating database: {e}")
        raise

if __name__ == "__main__":
    populate_railway_production()