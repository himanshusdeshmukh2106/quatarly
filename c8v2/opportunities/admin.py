from django.contrib import admin
from .models import Opportunity, UserProfile
from .enhanced_models import (
    OpportunityCache,
    UserShownOpportunity,
    UserProfileVector,
    OpportunityFetchLog,
    ClusterStatistics
)


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'category', 'priority', 'relevance_score', 'created_at']
    list_filter = ['category', 'priority', 'created_at']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'updated_at', 'is_stale']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    def is_stale(self, obj):
        return obj.is_stale()
    is_stale.boolean = True
    is_stale.short_description = 'Stale (>7 days)?'


@admin.register(OpportunityCache)
class OpportunityCacheAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'sub_category', 'cluster_key', 'priority', 'shown_count', 'click_count', 'conversion_rate', 'expires_at', 'is_active']
    list_filter = ['category', 'sub_category', 'is_active', 'priority', 'fetched_at']
    search_fields = ['title', 'description', 'cluster_key', 'content_hash']
    readonly_fields = ['content_hash', 'fetched_at', 'created_at', 'updated_at', 'shown_count', 'click_count', 'conversion_rate']
    ordering = ['-fetched_at']
    date_hierarchy = 'fetched_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'sub_category', 'priority')
        }),
        ('URLs and Media', {
            'fields': ('source_url', 'image_url', 'logo_url')
        }),
        ('Offer Details', {
            'fields': ('offer_details',),
            'classes': ('collapse',)
        }),
        ('Targeting', {
            'fields': ('cluster_key', 'target_profile', 'relevance_base_score')
        }),
        ('Cache Management', {
            'fields': ('content_hash', 'fetched_at', 'expires_at', 'is_active')
        }),
        ('Analytics', {
            'fields': ('shown_count', 'click_count', 'conversion_rate'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserShownOpportunity)
class UserShownOpportunityAdmin(admin.ModelAdmin):
    list_display = ['user', 'opportunity_title', 'shown_at', 'clicked', 'clicked_at', 'dismissed', 'dismissed_at']
    list_filter = ['clicked', 'dismissed', 'shown_at']
    search_fields = ['user__username', 'opportunity_title', 'opportunity_hash']
    readonly_fields = ['shown_at']
    ordering = ['-shown_at']
    date_hierarchy = 'shown_at'
    
    def has_add_permission(self, request):
        return False  # Prevent manual creation


@admin.register(UserProfileVector)
class UserProfileVectorAdmin(admin.ModelAdmin):
    list_display = ['user', 'cluster_key', 'embedding_model', 'embedding_dims', 'updated_at']
    list_filter = ['cluster_key', 'embedding_model', 'updated_at']
    search_fields = ['user__username', 'cluster_key']
    readonly_fields = ['created_at', 'updated_at', 'embedding_dims']
    ordering = ['-updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'profile')
        }),
        ('Embedding', {
            'fields': ('embedding_model', 'embedding_dims'),
        }),
        ('Clustering', {
            'fields': ('cluster_key', 'characteristics', 'similar_users', 'similarity_scores'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    def embedding_dims(self, obj):
        return len(obj.embedding) if obj.embedding else 0
    embedding_dims.short_description = 'Embedding Dimensions'
    
    def has_add_permission(self, request):
        return False  # Prevent manual creation


@admin.register(OpportunityFetchLog)
class OpportunityFetchLogAdmin(admin.ModelAdmin):
    list_display = ['fetch_type', 'cluster_key', 'category', 'status', 'opportunities_cached', 'duplicates_filtered', 'duration_seconds', 'api_calls', 'created_at']
    list_filter = ['fetch_type', 'status', 'category', 'created_at']
    search_fields = ['cluster_key', 'error_message']
    readonly_fields = ['created_at', 'duration_seconds']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def duration_seconds(self, obj):
        return f"{obj.duration_ms / 1000:.2f}s"
    duration_seconds.short_description = 'Duration'
    
    def has_add_permission(self, request):
        return False  # Prevent manual creation
    
    def has_change_permission(self, request, obj=None):
        return False  # Read-only


@admin.register(ClusterStatistics)
class ClusterStatisticsAdmin(admin.ModelAdmin):
    list_display = ['cluster_key', 'user_count', 'active_user_count', 'cached_opportunities', 'expired_opportunities', 'avg_click_rate_pct', 'last_fetch_at', 'needs_refresh_status']
    list_filter = ['active_user_count', 'cached_opportunities', 'last_fetch_at']
    search_fields = ['cluster_key']
    readonly_fields = ['updated_at', 'avg_click_rate_pct', 'needs_refresh_status']
    ordering = ['-active_user_count']
    
    fieldsets = (
        ('Cluster Information', {
            'fields': ('cluster_key',)
        }),
        ('User Statistics', {
            'fields': ('user_count', 'active_user_count')
        }),
        ('Opportunity Statistics', {
            'fields': ('cached_opportunities', 'expired_opportunities')
        }),
        ('Engagement Metrics', {
            'fields': ('total_opportunities_shown', 'total_opportunities_clicked', 'avg_click_rate', 'avg_click_rate_pct')
        }),
        ('Refresh Schedule', {
            'fields': ('last_fetch_at', 'next_fetch_at', 'needs_refresh_status')
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
        }),
    )
    
    def avg_click_rate_pct(self, obj):
        return f"{obj.avg_click_rate * 100:.2f}%"
    avg_click_rate_pct.short_description = 'Click Rate %'
    
    def needs_refresh_status(self, obj):
        return obj.needs_refresh()
    needs_refresh_status.boolean = True
    needs_refresh_status.short_description = 'Needs Refresh?'