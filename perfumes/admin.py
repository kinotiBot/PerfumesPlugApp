from django.contrib import admin
from .models import Category, Brand, Perfume, PerfumeImage


class PerfumeImageInline(admin.TabularInline):
    model = PerfumeImage
    extra = 1
    fields = ('image', 'is_primary')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Perfume)
class PerfumeAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'discount_price', 'stock', 'gender', 'is_featured', 'is_active', 'created_at')
    list_filter = ('brand', 'category', 'gender', 'is_featured', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'brand__name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PerfumeImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'brand', 'category', 'description')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'discount_price', 'stock')
        }),
        ('Product Details', {
            'fields': ('gender', 'image', 'is_featured', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(PerfumeImage)
class PerfumeImageAdmin(admin.ModelAdmin):
    list_display = ('perfume', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('perfume__name',)
    readonly_fields = ('created_at',)