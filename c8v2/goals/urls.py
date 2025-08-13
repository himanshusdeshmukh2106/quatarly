from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet
from .budget_views import budget_notes

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
    path('budget/notes/', budget_notes, name='budget-notes'),
]