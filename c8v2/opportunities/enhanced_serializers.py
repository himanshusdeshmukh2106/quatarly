"""
Serializers for new opportunities system models
"""

from rest_framework import serializers
from .enhanced_models import (
    OpportunityCache,
    UserShownOpportunity,
    UserProfileVector,
    OpportunityFetchLog,
    ClusterStatistics
)


class OpportunityCacheSerializer(serializers.ModelSerializer):
    """Serializer for OpportunityCache model"""
    
    class Meta:
        model = OpportunityCache
        fields = [
            'id',
            'title',
            'description',
            'category',
            'sub_category',
            'source_url',
            'image_url',
            'logo_url',
            'offer_details',
            'priority',
            'relevance_base_score',
            'shown_count',
            'click_count',
            'conversion_rate',
            'fetched_at',
            'expires_at',
        ]
        read_only_fields = ['id', 'shown_count', 'click_count', 'conversion_rate', 'fetched_at']


class OpportunityDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all fields"""
    
    class Meta:
        model = OpportunityCache
        fields = '__all__'


class UserShownOpportunitySerializer(serializers.ModelSerializer):
    """Serializer for UserShownOpportunity model"""
    
    class Meta:
        model = UserShownOpportunity
        fields = [
            'id',
            'user',
            'opportunity_hash',
            'opportunity_title',
            'shown_at',
            'clicked',
            'clicked_at',
            'dismissed',
            'dismissed_at',
        ]
        read_only_fields = ['id', 'shown_at']


class UserProfileVectorSerializer(serializers.ModelSerializer):
    """Serializer for UserProfileVector model"""
    
    # Don't expose full embedding to frontend (too large)
    embedding_dimensions = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfileVector
        fields = [
            'id',
            'user',
            'embedding_model',
            'embedding_dimensions',
            'cluster_key',
            'characteristics',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_embedding_dimensions(self, obj):
        """Return embedding dimensions instead of full vector"""
        return len(obj.embedding) if obj.embedding else 0


class OpportunityFetchLogSerializer(serializers.ModelSerializer):
    """Serializer for OpportunityFetchLog model"""
    
    duration_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = OpportunityFetchLog
        fields = [
            'id',
            'fetch_type',
            'cluster_key',
            'category',
            'status',
            'opportunities_fetched',
            'opportunities_cached',
            'duplicates_filtered',
            'duration_ms',
            'duration_seconds',
            'api_calls',
            'error_message',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_duration_seconds(self, obj):
        """Convert milliseconds to seconds"""
        return round(obj.duration_ms / 1000, 2)


class ClusterStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for ClusterStatistics model"""
    
    click_rate_percentage = serializers.SerializerMethodField()
    needs_refresh = serializers.SerializerMethodField()
    
    class Meta:
        model = ClusterStatistics
        fields = [
            'id',
            'cluster_key',
            'user_count',
            'active_user_count',
            'cached_opportunities',
            'expired_opportunities',
            'avg_click_rate',
            'click_rate_percentage',
            'total_opportunities_shown',
            'total_opportunities_clicked',
            'last_fetch_at',
            'next_fetch_at',
            'needs_refresh',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']
    
    def get_click_rate_percentage(self, obj):
        """Convert click rate to percentage"""
        return round(obj.avg_click_rate * 100, 2)
    
    def get_needs_refresh(self, obj):
        """Check if cluster needs refresh"""
        return obj.needs_refresh()


# Lightweight serializer for lists
class OpportunityCacheLightSerializer(serializers.ModelSerializer):
    """Lightweight serializer for opportunity lists"""
    
    class Meta:
        model = OpportunityCache
        fields = [
            'id',
            'title',
            'category',
            'sub_category',
            'image_url',
            'priority',
            'offer_details',
        ]
