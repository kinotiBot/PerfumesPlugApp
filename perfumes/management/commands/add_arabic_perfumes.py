from django.core.management.base import BaseCommand
from django.core.files import File
from perfumes.models import Category, Brand, Perfume
import os
from django.conf import settings


class Command(BaseCommand):
    help = 'Add Arabic perfumes to the database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Adding Arabic perfumes...'))
        
        # Create or get categories
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
        
        luxury_category, _ = Category.objects.get_or_create(
            name='Luxury',
            defaults={'description': 'Premium luxury fragrances'}
        )
        
        # Create or get brands
        amouage_brand, _ = Brand.objects.get_or_create(
            name='Amouage',
            defaults={'description': 'Luxury Omani perfume house founded in 1983, known for exquisite Arabian fragrances'}
        )
        
        tom_ford_brand, _ = Brand.objects.get_or_create(
            name='Tom Ford',
            defaults={'description': 'American luxury fashion house known for sophisticated and bold fragrances'}
        )
        
        arabian_oud_brand, _ = Brand.objects.get_or_create(
            name='Arabian Oud',
            defaults={'description': 'Leading Middle Eastern perfume house specializing in traditional oud fragrances'}
        )
        
        creed_brand, _ = Brand.objects.get_or_create(
            name='Creed',
            defaults={'description': 'Historic French perfume house established in 1760, creators of luxury fragrances'}
        )
        
        # Arabic perfumes data
        arabic_perfumes = [
            {
                'name': 'Jubilation XXV',
                'brand': amouage_brand,
                'category': luxury_category,
                'description': 'A masterful Oriental Fougère fragrance featuring blackberry, frankincense, and oud. This regal composition celebrates 25 years of Amouage with honey, spices, and precious woods creating an opulent and sophisticated scent.',
                'price': 285.00,
                'discount_price': 255.00,
                'stock': 15,
                'gender': 'M',
                'image_name': 'amouage-jubilation-xxv.svg',
                'is_featured': True
            },
            {
                'name': 'Oud Wood',
                'brand': tom_ford_brand,
                'category': unisex_category,
                'description': 'An exotic and smoky blend featuring rare oud wood, sandalwood, and rosewood. This sophisticated fragrance combines Eastern mystique with Western elegance, creating a warm and enveloping scent.',
                'price': 320.00,
                'discount_price': 290.00,
                'stock': 12,
                'gender': 'U',
                'image_name': 'tom-ford-oud-wood.svg',
                'is_featured': True
            },
            {
                'name': 'Royal Oud',
                'brand': arabian_oud_brand,
                'category': luxury_category,
                'description': 'A majestic blend of premium oud, rose, and saffron. This traditional Arabic fragrance embodies royal elegance with deep, rich notes that create an aura of luxury and sophistication.',
                'price': 180.00,
                'discount_price': 160.00,
                'stock': 20,
                'gender': 'U',
                'image_name': 'arabian-oud-royal.svg',
                'is_featured': True
            },
            {
                'name': 'Royal Oud',
                'brand': creed_brand,
                'category': men_category,
                'description': 'A distinguished interpretation of oud by the historic House of Creed. Featuring pink pepper, rhubarb, and precious oud wood, this fragrance offers a refined and contemporary take on traditional Arabian perfumery.',
                'price': 395.00,
                'discount_price': 350.00,
                'stock': 8,
                'gender': 'M',
                'image_name': 'creed-royal-oud.svg',
                'is_featured': True
            },
            # Additional Arabic perfumes for different categories
            {
                'name': 'Interlude Man',
                'brand': amouage_brand,
                'category': men_category,
                'description': 'A bold and dramatic fragrance featuring oregano, pepper, and oud. This intense composition creates a powerful and memorable scent with smoky incense and rich amber.',
                'price': 275.00,
                'discount_price': 245.00,
                'stock': 10,
                'gender': 'M',
                'image_name': 'amouage-jubilation-xxv.svg',  # Reusing image
                'is_featured': False
            },
            {
                'name': 'Oud Mahal',
                'brand': arabian_oud_brand,
                'category': women_category,
                'description': 'An elegant feminine oud fragrance with rose, jasmine, and precious woods. This sophisticated blend offers a perfect balance of floral beauty and oriental mystique.',
                'price': 165.00,
                'discount_price': 145.00,
                'stock': 18,
                'gender': 'F',
                'image_name': 'arabian-oud-royal.svg',  # Reusing image
                'is_featured': False
            },
            {
                'name': 'Oud Fleur',
                'brand': tom_ford_brand,
                'category': unisex_category,
                'description': 'A luxurious blend of oud and white florals. This sophisticated fragrance combines the richness of oud with delicate rose and jasmine for an opulent and refined scent.',
                'price': 340.00,
                'stock': 6,
                'gender': 'U',
                'image_name': 'tom-ford-oud-wood.svg',  # Reusing image
                'is_featured': False
            },
            {
                'name': 'Silver Mountain Water',
                'brand': creed_brand,
                'category': men_category,
                'description': 'A fresh and invigorating fragrance inspired by the Swiss Alps. While not traditionally Arabic, this scent features precious ingredients and craftsmanship that complement any collection.',
                'price': 285.00,
                'stock': 14,
                'gender': 'M',
                'image_name': 'creed-royal-oud.svg',  # Reusing image
                'is_featured': False
            }
        ]
        
        # Add perfumes to database
        created_count = 0
        for perfume_data in arabic_perfumes:
            # Check if perfume already exists
            existing_perfume = Perfume.objects.filter(
                name=perfume_data['name'],
                brand=perfume_data['brand']
            ).first()
            
            if existing_perfume:
                self.stdout.write(
                    self.style.WARNING(f'Perfume "{perfume_data["name"]}" by {perfume_data["brand"].name} already exists. Skipping...')
                )
                continue
            
            # Create the perfume
            perfume = Perfume.objects.create(
                name=perfume_data['name'],
                brand=perfume_data['brand'],
                category=perfume_data['category'],
                description=perfume_data['description'],
                price=perfume_data['price'],
                discount_price=perfume_data.get('discount_price'),
                stock=perfume_data['stock'],
                gender=perfume_data['gender'],
                is_featured=perfume_data.get('is_featured', False),
                is_active=True
            )
            
            # Set the image path (SVG files are now in media/perfumes/)
            image_path = f"perfumes/{perfume_data['image_name']}"
            perfume.image = image_path
            perfume.save()
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created perfume: "{perfume.name}" by {perfume.brand.name}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully added {created_count} Arabic perfumes to the database!')
        )
        
        # Display summary
        total_perfumes = Perfume.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'Total perfumes in database: {total_perfumes}')
        )