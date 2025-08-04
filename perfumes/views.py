from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Category, Brand, Perfume, PerfumeImage
from .serializers import (
    CategorySerializer, BrandSerializer,
    PerfumeSerializer, PerfumeDetailSerializer, PerfumeImageSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class PerfumeViewSet(viewsets.ModelViewSet):
    queryset = Perfume.objects.filter(is_active=True)
    serializer_class = PerfumeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'category', 'gender', 'is_featured']
    search_fields = ['name', 'description', 'brand__name', 'category__name']
    ordering_fields = ['name', 'price', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PerfumeDetailSerializer
        return PerfumeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def get_queryset(self):
        queryset = Perfume.objects.all()
        
        # Admin can see inactive perfumes
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
            
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # Filter by stock availability
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)
            
        # Filter by on_sale
        on_sale = self.request.query_params.get('on_sale')
        if on_sale and on_sale.lower() == 'true':
            queryset = queryset.filter(
                discount_price__isnull=False
            ).exclude(discount_price__gte=models.F('price'))
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_perfumes = Perfume.objects.filter(is_featured=True, is_active=True)
        serializer = self.get_serializer(featured_perfumes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        on_sale_perfumes = Perfume.objects.filter(
            discount_price__isnull=False,
            is_active=True
        ).exclude(discount_price__gte=models.F('price'))
        
        serializer = self.get_serializer(on_sale_perfumes, many=True)
        return Response(serializer.data)