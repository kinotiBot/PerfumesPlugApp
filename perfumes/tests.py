from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Category, Brand, Perfume
from .serializers import PerfumeSerializer
from PIL import Image
import io

class PerfumeModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Men', slug='men')
        self.brand = Brand.objects.create(name='Tom Ford', slug='tom-ford')
    
    def test_slug_generation(self):
        """Test that slug is automatically generated from brand and name"""
        perfume = Perfume.objects.create(
            name='Oud Wood',
            brand=self.brand,
            category=self.category,
            description='A luxurious fragrance',
            price=250.00,
            stock=10,
            image=self._create_test_image()
        )
        
        expected_slug = 'tom-ford-oud-wood'
        self.assertEqual(perfume.slug, expected_slug)
    
    def test_slug_uniqueness(self):
        """Test that duplicate slugs are handled properly"""
        # Create first perfume
        perfume1 = Perfume.objects.create(
            name='Oud Wood',
            brand=self.brand,
            category=self.category,
            description='A luxurious fragrance',
            price=250.00,
            stock=10,
            image=self._create_test_image()
        )
        
        # Try to create another perfume with same name and brand
        # This should raise an IntegrityError due to unique constraint
        with self.assertRaises(Exception):
            Perfume.objects.create(
                name='Oud Wood',
                brand=self.brand,
                category=self.category,
                description='Another fragrance',
                price=300.00,
                stock=5,
                image=self._create_test_image()
            )
    
    def _create_test_image(self):
        """Create a test image file"""
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        return SimpleUploadedFile(
            'test_image.jpg',
            image_io.getvalue(),
            content_type='image/jpeg'
        )

class PerfumeSerializerTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Men', slug='men')
        self.brand = Brand.objects.create(name='Tom Ford', slug='tom-ford')
    
    def test_serializer_excludes_slug_from_validation(self):
        """Test that slug field is read-only in serializer"""
        data = {
            'name': 'Oud Wood',
            'brand': self.brand.id,
            'category': self.category.id,
            'description': 'A luxurious fragrance',
            'price': '250.00',
            'stock': 10,
            'gender': 'U',
            'is_featured': False,
            'is_active': True,
            'image': self._create_test_image()
        }
        
        serializer = PerfumeSerializer(data=data)
        self.assertTrue(serializer.is_valid(), f"Serializer errors: {serializer.errors}")
        
        # Verify that slug is not required for validation
        self.assertNotIn('slug', serializer.errors)
    
    def _create_test_image(self):
        """Create a test image file"""
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        return SimpleUploadedFile(
            'test_image.jpg',
            image_io.getvalue(),
            content_type='image/jpeg'
        )

class PerfumeAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Men', slug='men')
        self.brand = Brand.objects.create(name='Tom Ford', slug='tom-ford')
        self.client.force_authenticate(user=self.user)
    
    def test_create_perfume_without_slug(self):
        """Test creating a perfume without providing slug"""
        data = {
            'name': 'Oud Wood',
            'brand': self.brand.id,
            'category': self.category.id,
            'description': 'A luxurious fragrance',
            'price': '250.00',
            'stock': 10,
            'gender': 'U',
            'is_featured': False,
            'is_active': True,
            'image': self._create_test_image()
        }
        
        response = self.client.post('/api/perfumes/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Oud Wood')
        self.assertEqual(response.data['slug'], 'tom-ford-oud-wood')
    
    def test_create_perfume_requires_image(self):
        """Test that creating a perfume requires an image"""
        data = {
            'name': 'Oud Wood',
            'brand': self.brand.id,
            'category': self.category.id,
            'description': 'A luxurious fragrance',
            'price': '250.00',
            'stock': 10,
            'gender': 'U',
            'is_featured': False,
            'is_active': True
            # No image provided
        }
        
        response = self.client.post('/api/perfumes/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('image', response.data)
    
    def _create_test_image(self):
        """Create a test image file"""
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        return SimpleUploadedFile(
            'test_image.jpg',
            image_io.getvalue(),
            content_type='image/jpeg'
        )