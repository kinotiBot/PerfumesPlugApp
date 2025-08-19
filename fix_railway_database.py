#!/usr/bin/env python
"""
Railway Database Fix Script

This script helps fix the Railway production database issue by:
1. Checking current database connection
2. Guiding user to set up Railway DATABASE_URL
3. Populating the database with required data

Usage:
    # First, set your Railway DATABASE_URL:
    # Windows PowerShell:
    $env:DATABASE_URL="postgresql://postgres:password@host:port/database"
    
    # Then run this script:
    python fix_railway_database.py
"""

import os
import sys

def check_database_url():
    """Check if DATABASE_URL is set and valid"""
    print("🔍 Checking DATABASE_URL...")
    
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL environment variable is not set!")
        print("\n📋 To fix this:")
        print("1. Go to your Railway project dashboard")
        print("2. Click on your PostgreSQL service")
        print("3. Go to 'Connect' tab")
        print("4. Copy the 'Database URL' (starts with postgresql://)")
        print("5. Set it as environment variable:")
        print("   Windows PowerShell:")
        print('   $env:DATABASE_URL="postgresql://postgres:password@host:port/database"')
        print("   Linux/Mac:")
        print('   export DATABASE_URL="postgresql://postgres:password@host:port/database"')
        print("6. Run this script again")
        return False
    
    if not database_url.startswith('postgresql://'):
        print(f"⚠️  DATABASE_URL doesn't look like a PostgreSQL URL: {database_url[:50]}...")
        print("   Make sure it starts with 'postgresql://'")
        return False
    
    print(f"✅ DATABASE_URL is set: {database_url[:30]}...")
    return True

def setup_django():
    """Setup Django environment"""
    print("🔧 Setting up Django...")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
        import django
        django.setup()
        print("✅ Django setup complete")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    print("🔌 Testing database connection...")
    
    try:
        from django.db import connection
        from django.conf import settings
        
        db_config = settings.DATABASES['default']
        print(f"Database Engine: {db_config['ENGINE']}")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()[0]
            print(f"✅ Connected to database: {db_name}")
            
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
            print(f"PostgreSQL Version: {db_version.split(',')[0]}")
            
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Verify DATABASE_URL is correct")
        print("2. Check if Railway PostgreSQL service is running")
        print("3. Ensure your IP is allowed to connect")
        return False

def run_migrations():
    """Run Django migrations"""
    print("🔄 Running migrations...")
    
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def populate_database():
    """Populate database with required data"""
    print("📊 Populating database with sample data...")
    
    try:
        # Import the setup functions from the existing script
        sys.path.append(os.path.dirname(__file__))
        
        # Import Django models
        from django.contrib.auth import get_user_model
        from django.db import transaction
        from perfumes.models import Category, Brand, Perfume
        from decimal import Decimal
        
        User = get_user_model()
        
        with transaction.atomic():
            # Create admin user
            admin_user, created = User.objects.get_or_create(
                email='admin@example.com',
                defaults={
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True
                }
            )
            admin_user.set_password('admin123')
            admin_user.save()
            print(f"✅ Admin user: {admin_user.email}")
            
            # Create test user
            test_user, created = User.objects.get_or_create(
                email='kinoti.ke@gmail.com',
                defaults={
                    'first_name': 'Kinoti',
                    'last_name': 'User',
                    'is_staff': False,
                    'is_superuser': False,
                    'is_active': True
                }
            )
            test_user.set_password('abc12345')
            test_user.save()
            print(f"✅ Test user: {test_user.email}")
            
            # Create categories
            men_cat, _ = Category.objects.get_or_create(
                name='Men', defaults={'description': 'Fragrances for men'}
            )
            women_cat, _ = Category.objects.get_or_create(
                name='Women', defaults={'description': 'Fragrances for women'}
            )
            unisex_cat, _ = Category.objects.get_or_create(
                name='Unisex', defaults={'description': 'Fragrances for everyone'}
            )
            print("✅ Categories created")
            
            # Create brands
            tom_ford, _ = Brand.objects.get_or_create(
                name='Tom Ford', defaults={'description': 'American luxury fashion house'}
            )
            chanel, _ = Brand.objects.get_or_create(
                name='Chanel', defaults={'description': 'French luxury fashion house'}
            )
            print("✅ Brands created")
            
            # Create sample perfumes
            perfumes_data = [
                {
                    'name': 'Tom Ford Black Orchid',
                    'brand': tom_ford,
                    'category': unisex_cat,
                    'description': 'A luxurious and sensual fragrance with black truffle, ylang-ylang, and dark chocolate.',
                    'price': Decimal('150.00'),
                    'stock': 25,
                    'gender': 'U',
                    'is_featured': True
                },
                {
                    'name': 'Chanel No. 5',
                    'brand': chanel,
                    'category': women_cat,
                    'description': 'The iconic fragrance with aldehydes, ylang-ylang, rose, and sandalwood.',
                    'price': Decimal('120.00'),
                    'stock': 30,
                    'gender': 'F',
                    'is_featured': True
                },
                {
                    'name': 'Tom Ford Oud Wood',
                    'brand': tom_ford,
                    'category': men_cat,
                    'description': 'A sophisticated blend of exotic oud, sandalwood, and rosewood.',
                    'price': Decimal('200.00'),
                    'stock': 15,
                    'gender': 'M',
                    'is_featured': False
                }
            ]
            
            for perfume_data in perfumes_data:
                perfume, created = Perfume.objects.get_or_create(
                    name=perfume_data['name'],
                    brand=perfume_data['brand'],
                    defaults=perfume_data
                )
                if created:
                    print(f"✅ Created perfume: {perfume.name}")
            
        print("✅ Database populated successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database population failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_data():
    """Verify that data was created successfully"""
    print("🔍 Verifying data...")
    
    try:
        from django.contrib.auth import get_user_model
        from perfumes.models import Category, Brand, Perfume
        
        User = get_user_model()
        
        # Check users
        user_count = User.objects.count()
        print(f"✅ Users in database: {user_count}")
        
        # Check perfumes
        perfume_count = Perfume.objects.count()
        featured_count = Perfume.objects.filter(is_featured=True).count()
        print(f"✅ Perfumes in database: {perfume_count}")
        print(f"✅ Featured perfumes: {featured_count}")
        
        # Check categories
        category_count = Category.objects.count()
        print(f"✅ Categories in database: {category_count}")
        
        # Check brands
        brand_count = Brand.objects.count()
        print(f"✅ Brands in database: {brand_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Data verification failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Railway Database Fix Script")
    print("=" * 50)
    
    # Step 1: Check DATABASE_URL
    if not check_database_url():
        return False
    
    # Step 2: Setup Django
    if not setup_django():
        return False
    
    # Step 3: Test database connection
    if not test_database_connection():
        return False
    
    # Step 4: Run migrations
    if not run_migrations():
        return False
    
    # Step 5: Populate database
    if not populate_database():
        return False
    
    # Step 6: Verify data
    if not verify_data():
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Railway Database Fix Complete!")
    print("\n📋 What was fixed:")
    print("✅ Database connection established")
    print("✅ Migrations applied")
    print("✅ Admin user created (admin@example.com / admin123)")
    print("✅ Test user created (kinoti.ke@gmail.com / abc12345)")
    print("✅ Sample perfumes and categories added")
    print("\n🔄 Next steps:")
    print("1. Update frontend to use Railway API URL")
    print("2. Test mobile app login")
    print("3. Verify images and data are loading")
    
    return True

if __name__ == '__main__':
    try:
        success = main()
        if not success:
            print("\n❌ Fix script failed. Please check the errors above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Script interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)