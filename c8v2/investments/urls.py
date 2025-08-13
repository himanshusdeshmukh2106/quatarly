from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvestmentViewSet, PriceAlertViewSet

router = DefaultRouter()
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'price-alerts', PriceAlertViewSet, basename='price-alert')

urlpatterns = [
    path('', include(router.urls)),
]