#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumesplug.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create or update test user
user, created = User.objects.get_or_create(
    email='apitest@perfumesplug.com',
    defaults={'is_active': True}
)
user.set_password('testpass123')
user.save()

print(f'User {"created" if created else "updated"}: {user.email}')
print(f'User is active: {user.is_active}')