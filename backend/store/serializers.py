from datetime import date
from decimal import Decimal

from django.db import transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

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


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username"]

    def validate_email(self, value):
        queryset = User.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Cette adresse courriel est déjà utilisée.")
        return value.lower()


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cette adresse courriel est déjà utilisée.")
        return value.lower()

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "full_name",
            "address_line_1",
            "address_line_2",
            "city",
            "province",
            "postal_code",
            "country",
            "phone",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "product_count"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image_url", "alt_text", "position"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_slug = serializers.SlugRelatedField(
        source="category",
        slug_field="slug",
        queryset=Category.objects.filter(is_active=True),
        write_only=True,
    )
    images = ProductImageSerializer(many=True, read_only=True)
    occasion_label = serializers.CharField(
        source="get_occasion_display",
        read_only=True,
    )
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "color",
            "occasion",
            "occasion_label",
            "is_featured",
            "is_available",
            "source_url",
            "category",
            "category_slug",
            "images",
        ]


class CartProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "price", "stock", "occasion", "image_url"]

    def get_image_url(self, product) -> str | None:
        image = product.images.first()
        return image.image_url if image else None


class CartItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "subtotal"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "item_count", "total", "updated_at"]

    def get_item_count(self, cart) -> int:
        return sum(item.quantity for item in cart.items.all())


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=50, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=50)


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_label = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_email",
            "customer_phone",
            "delivery_name",
            "delivery_address_1",
            "delivery_address_2",
            "delivery_city",
            "delivery_province",
            "delivery_postal_code",
            "delivery_country",
            "delivery_date",
            "gift_message",
            "status",
            "status_label",
            "total",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(min_value=1)
    customer_phone = serializers.CharField(max_length=32)
    delivery_date = serializers.DateField()
    gift_message = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_delivery_date(self, value):
        if value < date.today():
            raise serializers.ValidationError(
                "La date de livraison ne peut pas être dans le passé."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        try:
            address = Address.objects.get(
                pk=validated_data["address_id"],
                user=user,
            )
        except Address.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"address_id": "Cette adresse n'est pas disponible."}
            ) from exc

        try:
            cart = Cart.objects.select_for_update().get(user=user, is_active=True)
        except Cart.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"detail": "Votre panier est vide."}
            ) from exc

        cart_items = list(
            CartItem.objects.filter(cart=cart).select_related("product")
        )
        if not cart_items:
            raise serializers.ValidationError({"detail": "Votre panier est vide."})

        product_ids = [item.product_id for item in cart_items]
        products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(
                id__in=product_ids,
                is_active=True,
            )
        }

        if len(products) != len(cart_items):
            raise serializers.ValidationError(
                {"detail": "Un ou plusieurs produits sont indisponibles."}
            )

        total = Decimal("0.00")
        prepared_items = []

        for cart_item in cart_items:
            product = products[cart_item.product_id]
            quantity = cart_item.quantity

            if product.stock < quantity:
                raise serializers.ValidationError(
                    {
                        "detail": (
                            f"Stock insuffisant pour {product.name}. "
                            f"Quantité disponible : {product.stock}."
                        )
                    }
                )

            total += product.price * quantity
            prepared_items.append(
                OrderItem(
                    product=product,
                    product_name=product.name,
                    unit_price=product.price,
                    quantity=quantity,
                )
            )

        order = Order.objects.create(
            customer=user,
            customer_email=user.email,
            customer_phone=validated_data["customer_phone"],
            delivery_name=address.full_name,
            delivery_address_1=address.address_line_1,
            delivery_address_2=address.address_line_2,
            delivery_city=address.city,
            delivery_province=address.province,
            delivery_postal_code=address.postal_code,
            delivery_country=address.country,
            delivery_date=validated_data["delivery_date"],
            gift_message=validated_data.get("gift_message", ""),
            total=total,
        )
        for item in prepared_items:
            item.order = order
        OrderItem.objects.bulk_create(prepared_items)
        cart.items.all().delete()

        return order
