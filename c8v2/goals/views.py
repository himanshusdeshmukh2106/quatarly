import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Goal
from .serializers import GoalSerializer, CreateGoalSerializer, UpdateGoalSerializer
from .services import GeminiGoalService

logger = logging.getLogger(__name__)


class GoalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateGoalSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateGoalSerializer
        return GoalSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        goal = serializer.save(user=self.request.user)
        
        # Prepare simplified goal data for image generation
        goal_data = {
            'title': goal.title,
            'description': goal.description,
            'category': goal.category
        }
        
        # Generate AI-selected image for the goal
        goal_service = GeminiGoalService()
        goal.image_url = goal_service.generate_goal_image(goal_data)
        goal.save()
        
        # Return full goal data using GoalSerializer
        response_serializer = GoalSerializer(goal)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        goal = serializer.save()
        
        # Return full goal data using GoalSerializer
        response_serializer = GoalSerializer(goal)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['post'])
    def generate_image(self, request, pk=None):
        """Generate high-quality, specific image for a goal"""
        goal = self.get_object()
        
        # Prepare simplified goal data for image generation
        goal_data = {
            'title': goal.title,
            'description': goal.description,
            'category': goal.category
        }
        
        # Generate new AI-selected image for the goal
        goal_service = GeminiGoalService()
        new_image_url = goal_service.generate_goal_image(goal_data)
        
        # Update the goal with new image
        goal.image_url = new_image_url
        goal.save()
        
        # Return updated goal data
        response_serializer = GoalSerializer(goal)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['post'])
    def generate_insights(self, request, pk=None):
        """Generate AI insights - currently disabled (controlled elsewhere)"""
        goal = self.get_object()
        
        # AI insights generation is disabled - keep endpoint for UI compatibility
        logger.info(f"AI insights generation requested for goal '{goal.title}' but feature is disabled")
        
        # Return current goal data without changes
        response_serializer = GoalSerializer(goal)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['post'])
    def refresh_ai_content(self, request, pk=None):
        """Refresh image only (insights generation disabled)"""
        goal = self.get_object()
        
        # Prepare simplified goal data for image generation
        goal_data = {
            'title': goal.title,
            'description': goal.description,
            'category': goal.category
        }
        
        # Generate only image (insights disabled)
        goal_service = GeminiGoalService()
        goal.image_url = goal_service.generate_goal_image(goal_data)
        goal.save()
        
        # Return updated goal data
        response_serializer = GoalSerializer(goal)
        return Response(response_serializer.data)