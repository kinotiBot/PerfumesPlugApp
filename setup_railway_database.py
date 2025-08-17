#!/usr/bin/env python
"""
Railway Database Setup Script

This script populates the Railway production database with:
1. Admin user (admin@example.com)
2. Test user (kinoti.ke@gmail.com) 
3. Sample perfumes and categories
4. Verifies authentication works

Usage:
    python setup_railway_database.py

Note: This script should be run with the DATABASE_URL environment variable
set to the Railway PostgreSQL connection string.
"""

import os
import django
import sys
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from perfumes.models import Category, Brand, Perfume

User = get_user_model()

def create_admin_user():
    """Create or update admin user"""
    print("\n=== Creating Admin User ===")
    
    email = 'admin@example.com'
    password = 'admin123'
    
    try:
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True
                }
            )
            
            # Always update password and permissions
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            
            status = "Created" if created else "Updated"
            print(f"✅ {status} admin user: {email}")
            print(f"   - Password: {password}")
            print(f"   - Is active: {user.is_active}")
            print(f"   - Is staff: {user.is_staff}")
            print(f"   - Is superuser: {user.is_superuser}")
            
            return user
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

def create_test_user():
    """Create or update test user (kinoti.ke@gmail.com)"""
    print("\n=== Creating Test User ===")
    
    email = 'kinoti.ke@gmail.com'
    password = 'abc12345'  # Password from the mobile screenshot
    
    try:
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': 'Kinoti',
                    'last_name': 'User',
                    'is_staff': False,
                    'is_superuser': False,
                    'is_active': True
                }
            )
            
            # Always update password
            user.set_password(password)
            user.is_active = True
            user.save()
            
            status = "Created" if created else "Updated"
            print(f"✅ {status} test user: {email}")
            print(f"   - Password: {password}")
            print(f"   - Is active: {user.is_active}")
            
            return user
            
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None

def create_sample_data():
    """Create sample categories, brands, and perfumes"""
    print("\n=== Creating Sample Data ===")
    
    try:
        with transaction.atomic():
            # Create categories
            men_category, _ = Category.objects.get_or_create(
                name='Men',
                defaults={'description': 'Fragrances for men'}
            )
            
            women_category, _ = Category.objects.get_or_create(
                name='Women', 
                defaults={'description': 'Fragrances for women'}
            )
            
            unisex_category, _ = Category.objects.get_or_create(
                name='Unisex',
                defaults={'description': 'Fragrances for everyone'}
            )
            
            print(f"✅ Created categories: {[c.name for c in [men_category, women_category, unisex_category]]}")
            
            # Create brands
            tom_ford_brand, _ = Brand.objects.get_or_create(
                name='Tom Ford',
                defaults={'description': 'American luxury fashion house'}
            )
            
            chanel_brand, _ = Brand.objects.get_or_create(
                name='Chanel',
                defaults={'description': 'French luxury fashion house'}
            )
            
            print(f"✅ Created brands: {[b.name for b in [tom_ford_brand, chanel_brand]]}")
            
            # Create sample perfumes
            perfumes_data = [
                {
                    'name': 'Tom Ford Black Orchid',
                    'brand': tom_ford_brand,
                    'category': unisex_category,
                    'description': 'A luxurious and sensual fragrance with black truffle, ylang-ylang, and dark chocolate.',
                    'price': Decimal('150.00'),
                    'stock': 25,
                    'gender': 'U',
                    'is_featured': True
                },
                {
                    'name': 'Chanel No. 5',
                    'brand': chanel_brand,
                    'category': women_category,
                    'description': 'The iconic fragrance with aldehydes, ylang-ylang, rose, and sandalwood.',
                    'price': Decimal('120.00'),
                    'stock': 30,
                    'gender': 'F',
                    'is_featured': True
                },
                {
                    'name': 'Tom Ford Oud Wood',
                    'brand': tom_ford_brand,
                    'category': men_category,
                    'description': 'A sophisticated blend of exotic oud, sandalwood, and rosewood.',
                    'price': Decimal('200.00'),
                    'stock': 15,
                    'gender': 'M',
                    'is_featured': False
                }
            ]
            
            created_perfumes = []
            for perfume_data in perfumes_data:
                perfume, created = Perfume.objects.get_or_create(
                    name=perfume_data['name'],
                    brand=perfume_data['brand'],
                    defaults=perfume_data
                )
                if created:
                    created_perfumes.append(perfume.name)
            
            print(f"✅ Created perfumes: {created_perfumes}")
            
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")

def test_authentication():
    """Test authentication for both users"""
    print("\n=== Testing Authentication ===")
    
    test_cases = [
        ('admin@example.com', 'admin123'),
        ('kinoti.ke@gmail.com', 'abc12345')
    ]
    
    for email, password in test_cases:
        print(f"\nTesting {email}...")
        
        try:
            # Test Django authenticate function
            user = authenticate(username=email, password=password)
            if user:
                print(f"✅ Django authenticate: SUCCESS")
                print(f"   - User: {user.email}")
                print(f"   - Active: {user.is_active}")
                print(f"   - Staff: {user.is_staff}")
            else:
                print(f"❌ Django authenticate: FAILED")
                
                # Try to get user and check password manually
                try:
                    db_user = User.objects.get(email=email)
                    password_valid = db_user.check_password(password)
                    print(f"   - User exists: {db_user.email}")
                    print(f"   - Password valid: {password_valid}")
                    print(f"   - Is active: {db_user.is_active}")
                except User.DoesNotExist:
                    print(f"   - User does not exist in database")
                    
        except Exception as e:
            print(f"❌ Authentication test error: {e}")

def check_database_connection():
    """Check if we're connected to the right database"""
    print("\n=== Database Connection Info ===")
    
    from django.conf import settings
    from django.db import connection
    
    db_config = settings.DATABASES['default']
    print(f"Database Engine: {db_config['ENGINE']}")
    
    if 'postgresql' in db_config['ENGINE']:
        print("✅ Using PostgreSQL (Production)")
        
        # Get database name from connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()[0]
            print(f"Database Name: {db_name}")
            
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
            print(f"PostgreSQL Version: {db_version.split(',')[0]}")
    else:
        print("⚠️  Using SQLite (Development)")
        print(f"Database Path: {db_config.get('NAME', 'Not specified')}")

def main():
    """Main setup function"""
    print("🚀 Railway Database Setup Script")
    print("=" * 50)
    
    # Check database connection
    check_database_connection()
    
    # Create users
    admin_user = create_admin_user()
    test_user = create_test_user()
    
    # Create sample data
    create_sample_data()
    
    # Test authentication
    test_authentication()
    
    print("\n" + "=" * 50)
    print("🎉 Railway Database Setup Complete!")
    print("\nYou can now test authentication with:")
    print("- Admin: admin@example.com / admin123")
    print("- Test User: kinoti.ke@gmail.com / abc12345")
    print("\nNext steps:")
    print("1. Test login via the mobile app")
    print("2. Verify API endpoints are working")
    print("3. Check that perfumes are visible in the app")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Setup failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)