from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.urls import reverse
from django.utils.text import slugify


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    class Occasion(models.TextChoices):
        BIRTH = "birth", "Naissance"
        COLORFUL = "colorful", "Frénésie colorée"
        VALENTINE = "valentine", "Saint-Valentin"
        CELEBRATION = "celebration", "Festive et fleurie"
        WEDDING = "wedding", "Mariage"
        OTHER = "other", "Autre"

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    stock = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=80, blank=True)
    occasion = models.CharField(
        max_length=24,
        choices=Occasion.choices,
        default=Occasion.OTHER,
    )
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    source_url = models.URLField(max_length=500, blank=True)

    class Meta:
        ordering = ["-is_featured", "name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["occasion", "is_active"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def is_available(self):
        return self.is_active and self.stock > 0

    def get_absolute_url(self):
        return reverse("product-detail", kwargs={"slug": self.slug})

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image_url = models.URLField(max_length=500)
    alt_text = models.CharField(max_length=180, blank=True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return self.alt_text or f"Image de {self.product.name}"


class Address(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bloom_addresses",
    )
    label = models.CharField(max_length=60, default="Maison")
    full_name = models.CharField(max_length=160)
    address_line_1 = models.CharField(max_length=200)
    address_line_2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=24)
    country = models.CharField(max_length=2, default="CA")
    phone = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.label} — {self.full_name}"


class Cart(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bloom_carts",
        null=True,
        blank=True,
    )
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(user__isnull=False, is_active=True),
                name="unique_active_cart_per_user",
            )
        ]

    @property
    def total(self):
        return sum((item.subtotal for item in self.items.all()), Decimal("0.00"))

    def __str__(self):
        owner = self.user or self.session_key or "visiteur"
        return f"Panier #{self.pk} — {owner}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "product"],
                name="unique_product_per_cart",
            )
        ]

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.quantity} × {self.product.name}"


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        CONFIRMED = "confirmed", "Confirmée"
        PREPARING = "preparing", "En préparation"
        READY = "ready", "Prête"
        DELIVERED = "delivered", "Livrée"
        CANCELLED = "cancelled", "Annulée"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="bloom_orders",
        null=True,
        blank=True,
    )
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=32)
    delivery_name = models.CharField(max_length=160)
    delivery_address_1 = models.CharField(max_length=200)
    delivery_address_2 = models.CharField(max_length=200, blank=True)
    delivery_city = models.CharField(max_length=100)
    delivery_province = models.CharField(max_length=100, blank=True)
    delivery_postal_code = models.CharField(max_length=24)
    delivery_country = models.CharField(max_length=2, default="CA")
    delivery_date = models.DateField(null=True, blank=True)
    gift_message = models.TextField(blank=True, max_length=500)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Demande #{self.pk} — {self.get_status_display()}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    product_name = models.CharField(max_length=160)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} × {self.product_name}"
