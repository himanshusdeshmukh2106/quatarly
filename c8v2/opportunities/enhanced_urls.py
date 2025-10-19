"""
URL configuration for enhanced opportunities system
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .enhanced_views import EnhancedOpportunityViewSet, ProfileVectorViewSet

router = DefaultRouter()
router.register(r'opportunities', EnhancedOpportunityViewSet, basename='enhanced-opportunity')
router.register(r'profile-vectors', ProfileVectorViewSet, basename='profile-vector')

urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# GET /api/opportunities/ - List opportunities for user
# POST /api/opportunities/refresh/ - Force refresh opportunities
# POST /api/opportunities/{id}/click/ - Mark opportunity as clicked
# POST /api/opportunities/{id}/dismiss/ - Mark opportunity as dismissed
# GET /api/opportunities/stats/ - Get user statistics
# GET /api/opportunities/history/ - Get opportunity history
# 
# GET /api/profile-vectors/ - Get user's profile vector
# POST /api/profile-vectors/regenerate/ - Regenerate profile vector
