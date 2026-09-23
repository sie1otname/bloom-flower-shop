from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Address, Cart, CartItem, Category, Order, Product


User = get_user_model()


class CatalogApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Naissance")
        self.product = Product.objects.create(
            category=self.category,
            name="Douce arrivée",
            description="Un bouquet lumineux pour célébrer une naissance.",
            price=Decimal("69.00"),
            stock=8,
            occasion=Product.Occasion.BIRTH,
            is_featured=True,
        )

    def test_product_list_is_public(self):
        response = self.client.get(reverse("product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Douce arrivée")

    def test_product_detail_uses_slug(self):
        response = self.client.get(
            reverse("product-detail", kwargs={"slug": self.product.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], "douce-arrivee")
        self.assertEqual(response.data["category"]["slug"], "naissance")

    def test_catalog_filters_can_be_combined(self):
        Product.objects.create(
            category=self.category,
            name="Petit matin",
            description="Une composition pastel.",
            price=Decimal("59.00"),
            stock=4,
            occasion=Product.Occasion.BIRTH,
            is_featured=False,
        )

        response = self.client.get(
            reverse("product-list"),
            {
                "category": self.category.slug,
                "occasion": Product.Occasion.BIRTH,
                "featured": "true",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Douce arrivée")

    def test_catalog_search_checks_name_description_and_color(self):
        self.product.color = "Crème et rose"
        self.product.save()

        response = self.client.get(reverse("product-list"), {"q": "crème"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_inactive_products_are_hidden(self):
        self.product.is_active = False
        self.product.save()

        list_response = self.client.get(reverse("product-list"))
        detail_response = self.client.get(
            reverse("product-detail", kwargs={"slug": self.product.slug})
        )

        self.assertEqual(list_response.data["count"], 0)
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="samuel",
            email="samuel@example.com",
            password="FloralPass!2026",
            first_name="Samuel",
        )

    def authenticate(self, user=None):
        response = self.client.post(
            reverse("login"),
            {"username": (user or self.user).username, "password": "FloralPass!2026"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
        return response

    def test_registration_returns_token_and_safe_user(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "flora",
                "email": "flora@example.com",
                "first_name": "Flora",
                "last_name": "Martin",
                "password": "SecureBloom!2026",
                "password_confirm": "SecureBloom!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertNotIn("password", response.data["user"])

    def test_login_and_current_profile(self):
        login_response = self.authenticate()
        profile_response = self.client.get(reverse("me"))

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["username"], "samuel")

    def test_current_profile_requires_authentication(self):
        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_invalidates_token(self):
        self.authenticate()
        logout_response = self.client.post(reverse("logout"))
        profile_response = self.client.get(reverse("me"))

        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(profile_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_update_profile(self):
        self.authenticate()
        response = self.client.patch(
            reverse("me"),
            {"first_name": "Sié Samuel", "last_name": "Traore"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["last_name"], "Traore")

    def test_addresses_are_scoped_to_authenticated_user(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="FloralPass!2026",
        )
        Address.objects.create(
            user=other_user,
            label="Bureau",
            full_name="Autre Client",
            address_line_1="1 Rue Privée",
            city="Ottawa",
            postal_code="K1A 0A1",
        )
        self.authenticate()

        create_response = self.client.post(
            reverse("address-list"),
            {
                "label": "Maison",
                "full_name": "Samuel Traore",
                "address_line_1": "75 Laurier Ave",
                "address_line_2": "",
                "city": "Ottawa",
                "province": "ON",
                "postal_code": "K1N 6N5",
                "country": "CA",
                "phone": "6135550100",
            },
            format="json",
        )
        list_response = self.client.get(reverse("address-list"))

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(list_response.data["count"], 1)
        self.assertEqual(list_response.data["results"][0]["label"], "Maison")


class CartApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="client",
            email="client@example.com",
            password="FloralPass!2026",
        )
        category = Category.objects.create(name="Plaisir d'offrir")
        self.product = Product.objects.create(
            category=category,
            name="Fresca",
            description="Bouquet officiel.",
            price=Decimal("75000.00"),
            stock=5,
        )
        login_response = self.client.post(
            reverse("login"),
            {"username": "client", "password": "FloralPass!2026"},
            format="json",
        )
        self.token = login_response.data["token"]

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token}")

    def test_cart_requires_authentication(self):
        response = self.client.get(reverse("cart"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_item_recalculates_total_from_database_price(self):
        self.authenticate()
        response = self.client.post(
            reverse("cart-items"),
            {"product_id": self.product.id, "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["item_count"], 2)
        self.assertEqual(response.data["total"], "150000.00")

    def test_adding_same_product_increases_quantity(self):
        self.authenticate()
        payload = {"product_id": self.product.id, "quantity": 1}
        self.client.post(reverse("cart-items"), payload, format="json")
        response = self.client.post(reverse("cart-items"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"][0]["quantity"], 2)

    def test_quantity_cannot_exceed_stock(self):
        self.authenticate()
        response = self.client.post(
            reverse("cart-items"),
            {"product_id": self.product.id, "quantity": 6},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_user_cannot_modify_another_users_cart_item(self):
        other_user = User.objects.create_user(username="other-cart")
        other_cart = Cart.objects.create(user=other_user)
        other_item = CartItem.objects.create(
            cart=other_cart,
            product=self.product,
            quantity=1,
        )
        self.authenticate()

        response = self.client.patch(
            reverse("cart-item-detail", kwargs={"item_id": other_item.id}),
            {"quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class OrderApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="order-client",
            email="client@example.com",
            password="FloralPass!2026",
        )
        self.other_user = User.objects.create_user(
            username="other-order-client",
            email="other@example.com",
            password="FloralPass!2026",
        )
        category = Category.objects.create(name="Écrin Fleuri")
        self.product = Product.objects.create(
            category=category,
            name="Harmonie ensoleillée",
            description="Composition officielle.",
            price=Decimal("50000.00"),
            stock=5,
        )
        self.address = Address.objects.create(
            user=self.user,
            label="Maison",
            full_name="Client Bloom",
            address_line_1="75 Laurier Ave",
            city="Ottawa",
            province="ON",
            postal_code="K1N 6N5",
            country="CA",
            phone="6135550100",
        )

    def authenticate(self, user=None):
        selected_user = user or self.user
        response = self.client.post(
            reverse("login"),
            {
                "username": selected_user.username,
                "password": "FloralPass!2026",
            },
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")

    def add_cart_item(self, quantity=2):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=quantity,
        )
        return cart

    def payload(self, **overrides):
        data = {
            "address_id": self.address.id,
            "customer_phone": "6135550100",
            "delivery_date": str(timezone.localdate() + timedelta(days=2)),
            "gift_message": "Une attention fleurie.",
        }
        data.update(overrides)
        return data

    def test_checkout_requires_authentication(self):
        response = self.client.post(reverse("order-list"), self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_checkout_uses_cart_and_database_prices(self):
        self.authenticate()
        cart = self.add_cart_item(quantity=2)

        response = self.client.post(reverse("order-list"), self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(customer=self.user)
        self.assertEqual(order.total, Decimal("100000.00"))
        self.assertEqual(order.items.get().unit_price, Decimal("50000.00"))
        self.assertEqual(order.delivery_name, self.address.full_name)
        self.assertEqual(cart.items.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)

    def test_checkout_rejects_another_users_address(self):
        self.authenticate()
        self.add_cart_item()
        other_address = Address.objects.create(
            user=self.other_user,
            full_name="Autre Client",
            address_line_1="1 Rue Privée",
            city="Ottawa",
            postal_code="K1A 0A1",
        )

        response = self.client.post(
            reverse("order-list"),
            self.payload(address_id=other_address.id),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_checkout_rejects_empty_cart(self):
        self.authenticate()

        response = self.client.post(reverse("order-list"), self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_checkout_revalidates_stock(self):
        self.authenticate()
        cart = self.add_cart_item(quantity=5)
        self.product.stock = 2
        self.product.save(update_fields=["stock"])

        response = self.client.post(reverse("order-list"), self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(cart.items.count(), 1)

    def test_checkout_rejects_past_delivery_date(self):
        self.authenticate()
        self.add_cart_item()
        past_date = timezone.localdate() - timedelta(days=1)

        response = self.client.post(
            reverse("order-list"),
            self.payload(delivery_date=str(past_date)),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_history_is_scoped_to_current_user(self):
        Order.objects.create(
            customer=self.user,
            customer_email=self.user.email,
            customer_phone="6135550100",
            delivery_name="Client Bloom",
            delivery_address_1="75 Laurier Ave",
            delivery_city="Ottawa",
            delivery_postal_code="K1N 6N5",
        )
        Order.objects.create(
            customer=self.other_user,
            customer_email=self.other_user.email,
            customer_phone="6135550101",
            delivery_name="Autre Client",
            delivery_address_1="1 Rue Privée",
            delivery_city="Ottawa",
            delivery_postal_code="K1A 0A1",
        )
        self.authenticate()

        response = self.client.get(reverse("order-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["delivery_name"], "Client Bloom")


class ApiDocumentationTests(APITestCase):
    def test_openapi_schema_is_available(self):
        response = self.client.get(reverse("schema"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("openapi:", response.content.decode())
        self.assertIn("/api/products/", response.content.decode())

    def test_swagger_interface_is_available(self):
        response = self.client.get(reverse("swagger-ui"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, '<div id="swagger-ui"></div>', html=True)
