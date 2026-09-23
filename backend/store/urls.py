from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    CartItemDetailView,
    CartItemsView,
    CartView,
    CategoryViewSet,
    HealthView,
    LoginView,
    LogoutView,
    MeView,
    OrderViewSet,
    ProductViewSet,
    RegisterView,
)


router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("orders", OrderViewSet, basename="order")
router.register("addresses", AddressViewSet, basename="address")

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/", CartItemsView.as_view(), name="cart-items"),
    path(
        "cart/items/<int:item_id>/",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),
    path("", include(router.urls)),
]
