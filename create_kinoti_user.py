#!/usr/bin/env python
"""
Create Kinoti User for Railway Database

This script creates the specific user account (kinoti.ke@gmail.com) 
that's being tested in the mobile app.

Usage:
    python create_kinoti_user.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.db import transaction

User = get_user_model()

def create_kinoti_user():
    """Create the kinoti.ke@gmail.com user account"""
    print("Creating kinoti.ke@gmail.com user account...")
    
    email = 'kinoti.ke@gmail.com'
    password = 'abc12345'  # Password from mobile screenshot
    
    try:
        with transaction.atomic():
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                print(f"User already exists: {email}")
                
                # Update password and ensure account is active
                user.set_password(password)
                user.is_active = True
                user.save()
                
                print(f"✅ Updated user: {email}")
            else:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name='Kinoti',
                    last_name='User'
                )
                
                print(f"✅ Created user: {email}")
            
            # Verify user properties
            print(f"   - Is active: {user.is_active}")
            print(f"   - Is staff: {user.is_staff}")
            print(f"   - Email verified: {user.email}")
            
            # Test password
            if user.check_password(password):
                print("   - Password: ✅ Valid")
            else:
                print("   - Password: ❌ Invalid")
            
            # Test Django authentication
            auth_user = authenticate(username=email, password=password)
            if auth_user:
                print("   - Authentication: ✅ Working")
            else:
                print("   - Authentication: ❌ Failed")
            
            print("\n" + "="*50)
            print("✅ User account ready!")
            print(f"Email: {email}")
            print(f"Password: {password}")
            print("\nYou can now test login in the mobile app.")
            
            return user
            
    except Exception as e:
        print(f"❌ Error creating user: {str(e)}")
        raise

def check_database_info():
    """Display database connection info"""
    from django.conf import settings
    from django.db import connection
    
    print("Database Connection Info:")
    db_config = settings.DATABASES['default']
    
    if 'postgresql' in db_config['ENGINE']:
        print("✅ Connected to PostgreSQL (Production/Railway)")
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_database();")
                db_name = cursor.fetchone()[0]
                print(f"   Database: {db_name}")
        except:
            print("   Database: Unable to determine")
    else:
        print("⚠️  Connected to SQLite (Local Development)")
        print(f"   Path: {db_config.get('NAME', 'Unknown')}")
    
    print()

if __name__ == '__main__':
    print("🚀 Creating Kinoti User Account")
    print("=" * 50)
    
    check_database_info()
    
    try:
        create_kinoti_user()
    except Exception as e:
        print(f"\n❌ Failed to create user: {e}")
        import traceback
        traceback.print_exc()