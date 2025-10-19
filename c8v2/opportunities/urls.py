from django.urls import path
from . import compatibility_views

# Backward compatible endpoints using NEW enhanced system under the hood
urlpatterns = [
    # Main endpoints (frontend calls these)
    path('', compatibility_views.list_opportunities, name='opportunities-list'),
    path('refresh/', compatibility_views.refresh_opportunities, name='opportunities-refresh'),
    path('<int:pk>/', compatibility_views.opportunity_detail, name='opportunity-detail'),
]