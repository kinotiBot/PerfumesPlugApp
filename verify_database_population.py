#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()

from perfumes.models import Perfume, Category, Brand
from users.models import User

print("=== Database Population Verification ===")
print()

# Check users
user_count = User.objects.count()
print(f"👥 Users in database: {user_count}")
if user_count > 0:
    for user in User.objects.all():
        print(f"   - {user.email} (Active: {user.is_active})")
print()

# Check categories
category_count = Category.objects.count()
print(f"📂 Categories in database: {category_count}")
if category_count > 0:
    for category in Category.objects.all():
        print(f"   - {category.name}")
print()

# Check brands
brand_count = Brand.objects.count()
print(f"🏷️ Brands in database: {brand_count}")
if brand_count > 0:
    for brand in Brand.objects.all():
        print(f"   - {brand.name}")
print()

# Check perfumes
perfume_count = Perfume.objects.count()
print(f"🌸 Perfumes in database: {perfume_count}")
if perfume_count > 0:
    for perfume in Perfume.objects.all():
        brand_name = perfume.brand.name if perfume.brand else "Unknown"
        print(f"   - {perfume.name} by {brand_name} (${perfume.price})")
print()

# Check featured perfumes
featured_count = Perfume.objects.filter(is_featured=True).count()
print(f"⭐ Featured perfumes: {featured_count}")

print()
print("=== Verification Complete ===")
if user_count > 0 and perfume_count > 0 and category_count > 0:
    print("✅ Database population successful!")
    print("✅ Ready for API testing")
else:
    print("❌ Database population incomplete")
    print(f"   Users: {user_count}, Perfumes: {perfume_count}, Categories: {category_count}")