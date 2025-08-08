from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, Cart, CartItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('perfume', 'price', 'quantity', 'total')
    can_delete = False
    
    def total(self, obj):
        return obj.total
    total.short_description = 'Total'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'user_display', 'status', 'payment_method', 
        'payment_status_display', 'total', 'created_at'
    )
    list_filter = ('status', 'payment_status', 'payment_method', 'created_at')
    search_fields = (
        'order_number', 'user__first_name', 'user__last_name', 
        'user__email', 'guest_name', 'guest_email'
    )
    readonly_fields = (
        'order_number', 'user', 'subtotal', 'tax', 'shipping', 'total',
        'created_at', 'updated_at'
    )
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'created_at', 'updated_at')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_status')
        }),
        ('Address Information', {
            'fields': ('shipping_address', 'billing_address'),
            'classes': ('collapse',)
        }),
        ('Guest Information', {
            'fields': (
                'guest_name', 'guest_email', 'guest_phone', 
                'guest_address', 'guest_city', 'guest_province', 'guest_notes'
            ),
            'classes': ('collapse',)
        }),
        ('Order Totals', {
            'fields': ('subtotal', 'tax', 'shipping', 'total')
        })
    )
    
    actions = ['mark_payment_paid', 'mark_payment_unpaid']
    
    def user_display(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.guest_name or "Guest User"
    user_display.short_description = 'Customer'
    
    def payment_status_display(self, obj):
        if obj.payment_status:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Paid</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Unpaid</span>'
        )
    payment_status_display.short_description = 'Payment Status'
    
    def mark_payment_paid(self, request, queryset):
        updated = queryset.update(payment_status=True)
        self.message_user(
            request, 
            f'{updated} order(s) marked as paid.'
        )
    mark_payment_paid.short_description = "Mark selected orders as paid"
    
    def mark_payment_unpaid(self, request, queryset):
        updated = queryset.update(payment_status=False)
        self.message_user(
            request, 
            f'{updated} order(s) marked as unpaid.'
        )
    mark_payment_unpaid.short_description = "Mark selected orders as unpaid"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'perfume', 'price', 'quantity', 'total')
    list_filter = ('order__status', 'order__payment_status')
    search_fields = ('order__order_number', 'perfume__name')
    readonly_fields = ('total',)
    
    def total(self, obj):
        return obj.total
    total.short_description = 'Total'


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('perfume', 'quantity', 'total')
    
    def total(self, obj):
        return obj.total
    total.short_description = 'Total'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'subtotal', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    readonly_fields = ('total_items', 'subtotal', 'created_at', 'updated_at')
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'perfume', 'quantity', 'total')
    list_filter = ('cart__created_at',)
    search_fields = ('cart__user__first_name', 'cart__user__last_name', 'perfume__name')
    readonly_fields = ('total',)
    
    def total(self, obj):
        return obj.total
    total.short_description = 'Total'