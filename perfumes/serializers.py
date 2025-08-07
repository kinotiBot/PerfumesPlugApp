from rest_framework import serializers
from .models import Category, Brand, Perfume, PerfumeImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo']

class PerfumeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfumeImage
        fields = ['id', 'image', 'is_primary']

class PerfumeSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = PerfumeImageSerializer(many=True, read_only=True)
    slug = serializers.SlugField(read_only=True)  # Make slug read-only since it's auto-generated
    
    class Meta:
        model = Perfume
        fields = [
            'id', 'name', 'slug', 'brand', 'brand_name', 'category', 'category_name',
            'description', 'price', 'discount_price', 'stock', 'gender',
            'image', 'is_featured', 'is_active', 'images', 'is_in_stock', 'is_on_sale'
        ]

class PerfumeDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = PerfumeImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Perfume
        fields = [
            'id', 'name', 'slug', 'brand', 'category', 'description',
            'price', 'discount_price', 'stock', 'gender', 'image',
            'is_featured', 'is_active', 'images', 'is_in_stock', 'is_on_sale',
            'created_at', 'updated_at'
        ]