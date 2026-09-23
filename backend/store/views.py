from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as api_serializers
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, Cart, CartItem, Category, Order, Product
from .serializers import (
    AddCartItemSerializer,
    AddressSerializer,
    CartSerializer,
    CategorySerializer,
    CheckoutSerializer,
    OrderSerializer,
    ProductSerializer,
    RegisterSerializer,
    UpdateCartItemSerializer,
    UserSerializer,
)


AuthResponseSerializer = inline_serializer(
    name="AuthResponse",
    fields={
        "token": api_serializers.CharField(),
        "user": UserSerializer(),
    },
)
LoginRequestSerializer = inline_serializer(
    name="LoginRequest",
    fields={
        "username": api_serializers.CharField(),
        "password": api_serializers.CharField(write_only=True),
    },
)
HealthResponseSerializer = inline_serializer(
    name="HealthResponse",
    fields={
        "status": api_serializers.CharField(),
        "service": api_serializers.CharField(),
        "payment_enabled": api_serializers.BooleanField(),
    },
)


def get_active_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user, is_active=True)
    return Cart.objects.prefetch_related(
        "items__product__images",
        "items__product__category",
    ).get(pk=cart.pk)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=["Panier"], responses=CartSerializer)
    def get(self, request):
        return Response(CartSerializer(get_active_cart(request.user)).data)


class CartItemsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=["Panier"],
        request=AddCartItemSerializer,
        responses={200: CartSerializer, 201: CartSerializer},
    )
    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(
            Product,
            pk=serializer.validated_data["product_id"],
            is_active=True,
        )
        cart = get_active_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        new_quantity = serializer.validated_data["quantity"]
        if not created:
            new_quantity += item.quantity

        if new_quantity > product.stock:
            if created:
                item.delete()
            return Response(
                {"quantity": f"Quantité disponible : {product.stock}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = new_quantity
        item.save(update_fields=["quantity"])
        cart = get_active_cart(request.user)
        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, item_id):
        return get_object_or_404(
            CartItem.objects.select_related("product"),
            pk=item_id,
            cart__user=request.user,
            cart__is_active=True,
        )

    @extend_schema(
        tags=["Panier"],
        request=UpdateCartItemSerializer,
        responses=CartSerializer,
    )
    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = self.get_item(request, item_id)
        quantity = serializer.validated_data["quantity"]

        if quantity > item.product.stock:
            return Response(
                {"quantity": f"Quantité disponible : {item.product.stock}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return Response(CartSerializer(get_active_cart(request.user)).data)

    @extend_schema(tags=["Panier"], request=None, responses=CartSerializer)
    def delete(self, request, item_id):
        self.get_item(request, item_id).delete()
        return Response(CartSerializer(get_active_cart(request.user)).data)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=["Authentification"],
        request=RegisterSerializer,
        responses={201: AuthResponseSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response(
            {"token": token.key, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=["Authentification"],
        request=LoginRequestSerializer,
        responses=AuthResponseSerializer,
    )
    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")
        user = authenticate(request, username=username, password=password)

        if not user:
            return Response(
                {"detail": "Nom d'utilisateur ou mot de passe incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=["Authentification"],
        request=None,
        responses={204: None},
    )
    def post(self, request):
        if request.auth:
            request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(tags=["Compte"], responses=UserSerializer)
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(
        tags=["Compte"],
        request=UserSerializer,
        responses=UserSerializer,
    )
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=["Service"],
        auth=[],
        responses=HealthResponseSerializer,
    )
    def get(self, request):
        return Response(
            {
                "status": "ok",
                "service": "Bloom API",
                "payment_enabled": False,
            }
        )


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(
                product_count=Count(
                    "products",
                    filter=Q(products__is_active=True),
                )
            )
            .order_by("name")
        )


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )
        query = self.request.query_params.get("q", "").strip()
        category = self.request.query_params.get("category", "").strip()
        occasion = self.request.query_params.get("occasion", "").strip()
        featured = self.request.query_params.get("featured", "").lower()

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(description__icontains=query)
                | Q(color__icontains=query)
            )
        if category:
            queryset = queryset.filter(category__slug=category)
        if occasion:
            queryset = queryset.filter(occasion=occasion)
        if featured in {"true", "1", "yes"}:
            queryset = queryset.filter(is_featured=True)

        return queryset


class OrderViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Order.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CheckoutSerializer
        return OrderSerializer

    def get_queryset(self):
        return (
            Order.objects.filter(customer=self.request.user)
            .prefetch_related("items__product")
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
