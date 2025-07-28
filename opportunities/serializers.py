from rest_framework import serializers
from .models import Opportunity


class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'description', 'category', 'priority',
            'ai_insights', 'action_steps', 'relevance_score',
            'image_url', 'logo_url', 'offer_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.Serializer):
    """Serializer for internal user profile data handling"""
    demographics = serializers.DictField()
    financial = serializers.DictField()
    goals = serializers.DictField()
    personality = serializers.DictField()