from rest_framework import serializers
from .models import Goal


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'target_amount', 'current_amount', 
            'description', 'category', 'image_url', 'ai_analysis',
            'created_at', 'updated_at', 'progress_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'ai_analysis']


class CreateGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['title', 'target_amount', 'description', 'category']
        
    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0")
        return value
        
    def validate_title(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Title must be at least 2 characters long")
        return value.strip()


class UpdateGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['title', 'target_amount', 'current_amount', 'description', 'category']
        
    def validate_target_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0")
        return value
        
    def validate_current_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Current amount cannot be negative")
        return value