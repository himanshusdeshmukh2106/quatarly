from django.urls import path
from . import views

urlpatterns = [
    path('', views.OpportunitiesListView.as_view(), name='opportunities-list'),
    path('refresh/', views.refresh_opportunities, name='opportunities-refresh'),
]