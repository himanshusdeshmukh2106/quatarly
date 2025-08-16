from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvestmentViewSet, PriceAlertViewSet

router = DefaultRouter()
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'price-alerts', PriceAlertViewSet, basename='price-alert')

urlpatterns = [
    path('', include(router.urls)),
    path('investments/asset_type_performance/', InvestmentViewSet.as_view({'get': 'asset_type_performance'}), name='asset-type-performance'),
    path('investments/diversification_analysis/', InvestmentViewSet.as_view({'get': 'diversification_analysis'}), name='diversification-analysis'),
    path('investments/portfolio_insights/', InvestmentViewSet.as_view({'get': 'portfolio_insights'}), name='portfolio-insights'),
]