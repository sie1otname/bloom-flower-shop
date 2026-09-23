from django.contrib import admin

from .models import (
    Address,
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Product,
    ProductImage,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "stock",
        "occasion",
        "is_featured",
        "is_active",
    )
    list_filter = ("category", "occasion", "is_featured", "is_active")
    list_editable = ("price", "stock", "is_featured", "is_active")
    search_fields = ("name", "description", "color")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    readonly_fields = ("product", "product_name", "unit_price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "delivery_name",
        "customer_email",
        "delivery_date",
        "status",
        "total",
        "created_at",
    )
    list_filter = ("status", "delivery_date", "created_at")
    list_editable = ("status",)
    search_fields = ("customer_email", "customer_phone", "delivery_name")
    readonly_fields = ("total", "created_at", "updated_at")
    inlines = [OrderItemInline]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("label", "full_name", "city", "country", "user")
    search_fields = ("full_name", "city", "postal_code", "user__email")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_key", "is_active", "updated_at")
    list_filter = ("is_active",)
    inlines = [CartItemInline]

