import os
import django
from django.conf import settings

# Configure Django settings for production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')

# Initialize Django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

try:
    # Create test user
    user, created = User.objects.get_or_create(
        email='testuser@perfumesplug.com',
        defaults={
            'is_active': True,
            'is_staff': False,
            'is_superuser': False
        }
    )
    
    # Set password
    user.set_password('testpass123')
    user.save()
    
    print(f"User {'created' if created else 'updated'}: {user.email}")
    print(f"User ID: {user.id}")
    print(f"Is active: {user.is_active}")
    print(f"Password set successfully")
    
    # Verify password
    password_check = user.check_password('testpass123')
    print(f"Password verification: {password_check}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()