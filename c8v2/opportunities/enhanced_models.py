"""
Enhanced models for centralized opportunity caching with duplicate prevention
and user profile similarity matching
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import hashlib
import json

User = get_user_model()


class OpportunityCache(models.Model):
    """
    Centralized pool of opportunities shared across similar users.
    Reduces API calls and improves efficiency.
    """
    CATEGORY_CHOICES = [
        ('travel', 'Travel'),
        ('job', 'Job'),
        ('investment', 'Investment'),
    ]
    
    SUB_CATEGORY_CHOICES = [
        # Travel
        ('flight', 'Flight Deals'),
        ('hotel', 'Hotel Deals'),
        ('vacation_package', 'Vacation Packages'),
        # Jobs
        ('full_time', 'Full Time Job'),
        ('remote', 'Remote Job'),
        ('freelance', 'Freelance'),
        # Investment
        ('stock', 'Stock'),
        ('ipo', 'IPO'),
        ('mutual_fund', 'Mutual Fund'),
        ('bond', 'Bond'),
    ]
    
    # Content
    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    sub_category = models.CharField(max_length=50, choices=SUB_CATEGORY_CHOICES, blank=True)
    
    # Details
    source_url = models.URLField(max_length=500)
    image_url = models.URLField(max_length=500, blank=True)
    logo_url = models.URLField(max_length=500, blank=True)
    offer_details = models.JSONField(default=dict)  # price, discount, validity, location, etc.
    
    # Targeting (which user profiles this opportunity suits)
    target_profile = models.JSONField(
        default=dict,
        help_text="Profile characteristics this opportunity targets (income_range, location, goals, etc.)"
    )
    cluster_key = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Cluster key for grouping similar users (e.g., 'income_50k-100k_investment_mumbai_25-35')"
    )
    
    # Deduplication
    content_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="SHA-256 hash of content for deduplication"
    )
    
    # Cache Management
    fetched_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Analytics
    shown_count = models.IntegerField(default=0, help_text="Number of times shown to users")
    click_count = models.IntegerField(default=0, help_text="Number of times clicked by users")
    conversion_rate = models.FloatField(default=0.0, help_text="Click-through rate")
    
    # Priority
    priority = models.CharField(
        max_length=10,
        choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
        default='medium'
    )
    relevance_base_score = models.FloatField(
        default=0.5,
        help_text="Base relevance score (0.0-1.0) before personalization"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'opportunity_cache'
        ordering = ['-fetched_at']
        indexes = [
            models.Index(fields=['cluster_key', 'expires_at', 'is_active']),
            models.Index(fields=['category', 'sub_category', 'expires_at']),
            models.Index(fields=['content_hash']),
            models.Index(fields=['is_active', 'expires_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.category}) - {self.cluster_key}"
    
    @staticmethod
    def generate_content_hash(title: str, description: str, source_url: str = "") -> str:
        """Generate SHA-256 hash from content for deduplication"""
        content = f"{title.lower().strip()}|{description.lower().strip()}|{source_url.strip()}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    def is_expired(self) -> bool:
        """Check if opportunity has expired"""
        return timezone.now() > self.expires_at
    
    def increment_shown(self):
        """Increment shown count and update conversion rate"""
        self.shown_count += 1
        if self.shown_count > 0:
            self.conversion_rate = (self.click_count / self.shown_count) * 100
        self.save(update_fields=['shown_count', 'conversion_rate'])
    
    def increment_click(self):
        """Increment click count and update conversion rate"""
        self.click_count += 1
        if self.shown_count > 0:
            self.conversion_rate = (self.click_count / self.shown_count) * 100
        self.save(update_fields=['click_count', 'conversion_rate'])


class UserShownOpportunity(models.Model):
    """
    Tracks which opportunities each user has already seen.
    Prevents showing same opportunity twice within a time window.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shown_opportunities')
    opportunity_hash = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Content hash of the opportunity"
    )
    opportunity_title = models.CharField(max_length=300, help_text="For reference")
    
    # Tracking
    shown_at = models.DateTimeField(auto_now_add=True, db_index=True)
    clicked = models.BooleanField(default=False)
    clicked_at = models.DateTimeField(null=True, blank=True)
    
    # Feedback (optional)
    dismissed = models.BooleanField(default=False)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_shown_opportunities'
        unique_together = [['user', 'opportunity_hash']]
        ordering = ['-shown_at']
        indexes = [
            models.Index(fields=['user', 'shown_at']),
            models.Index(fields=['opportunity_hash', 'shown_at']),
            models.Index(fields=['user', 'clicked']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.opportunity_title[:50]}"
    
    @staticmethod
    def has_user_seen(user_id: int, opportunity_hash: str, days: int = 7) -> bool:
        """Check if user has seen this opportunity in the last N days"""
        cutoff = timezone.now() - timedelta(days=days)
        return UserShownOpportunity.objects.filter(
            user_id=user_id,
            opportunity_hash=opportunity_hash,
            shown_at__gte=cutoff
        ).exists()


class UserProfileVector(models.Model):
    """
    Stores vector embeddings of user profiles for similarity matching.
    Generated using Gemini 2.5 Flash.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile_vector')
    profile = models.ForeignKey(
        'UserProfile',
        on_delete=models.CASCADE,
        related_name='vectors'
    )
    
    # Vector representation (from Gemini 2.5 Flash)
    embedding = models.JSONField(
        help_text="Semantic vector representation of user profile (768-dimensional)"
    )
    embedding_model = models.CharField(
        max_length=50,
        default='gemini-2.5-flash',
        help_text="Model used for embedding generation"
    )
    
    # Clustering
    cluster_key = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Cluster identifier for grouping similar users"
    )
    similar_users = models.JSONField(
        default=list,
        help_text="List of user IDs with similar profiles (top 10)"
    )
    similarity_scores = models.JSONField(
        default=dict,
        help_text="Mapping of user_id -> similarity_score for similar users"
    )
    
    # Characteristics for quick matching (extracted from profile)
    characteristics = models.JSONField(
        default=dict,
        help_text="""
        {
            'income_bracket': '50k-100k',
            'age_group': '25-35',
            'location': 'mumbai',
            'goals': ['investment', 'savings'],
            'risk_tolerance': 'medium',
            'interests': ['stocks', 'travel']
        }
        """
    )
    
    # Cache management
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profile_vectors'
        indexes = [
            models.Index(fields=['cluster_key']),
            models.Index(fields=['updated_at']),
        ]
    
    def __str__(self):
        return f"Vector for {self.user.username} - Cluster: {self.cluster_key}"
    
    @staticmethod
    def generate_cluster_key(characteristics: dict) -> str:
        """
        Generate cluster key from user characteristics.
        Example: 'income_50k-100k_investment_mumbai_25-35'
        """
        income = characteristics.get('income_bracket', 'unknown')
        location = characteristics.get('location', 'india')
        age = characteristics.get('age_group', 'unknown')
        primary_goal = characteristics.get('goals', ['general'])[0] if characteristics.get('goals') else 'general'
        
        return f"income_{income}_{primary_goal}_{location}_{age}".lower().replace(' ', '_')
    
    def needs_refresh(self, days: int = 7) -> bool:
        """Check if vector needs to be regenerated"""
        return timezone.now() - self.updated_at > timedelta(days=days)


class OpportunityFetchLog(models.Model):
    """
    Logs all opportunity fetching operations for monitoring and debugging.
    """
    FETCH_TYPE_CHOICES = [
        ('scheduled', 'Scheduled Background Task'),
        ('manual', 'Manual Refresh'),
        ('on_demand', 'On-Demand User Request'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ]
    
    fetch_type = models.CharField(max_length=20, choices=FETCH_TYPE_CHOICES)
    cluster_key = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=50, blank=True)
    
    # Results
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    opportunities_fetched = models.IntegerField(default=0)
    opportunities_cached = models.IntegerField(default=0)
    duplicates_filtered = models.IntegerField(default=0)
    
    # Timing
    duration_ms = models.IntegerField(help_text="Duration in milliseconds")
    api_calls = models.IntegerField(default=0, help_text="Number of API calls made")
    
    # Errors
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'opportunity_fetch_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['status', 'fetch_type']),
            models.Index(fields=['cluster_key']),
        ]
    
    def __str__(self):
        return f"{self.fetch_type} - {self.status} - {self.opportunities_cached} cached"


class ClusterStatistics(models.Model):
    """
    Stores statistics about user clusters for optimization.
    """
    cluster_key = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Cluster info
    user_count = models.IntegerField(default=0)
    active_user_count = models.IntegerField(
        default=0,
        help_text="Users active in last 7 days"
    )
    
    # Opportunity stats
    cached_opportunities = models.IntegerField(default=0)
    expired_opportunities = models.IntegerField(default=0)
    
    # Performance
    avg_click_rate = models.FloatField(default=0.0)
    total_opportunities_shown = models.IntegerField(default=0)
    total_opportunities_clicked = models.IntegerField(default=0)
    
    # Last refresh
    last_fetch_at = models.DateTimeField(null=True, blank=True)
    next_fetch_at = models.DateTimeField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cluster_statistics'
        verbose_name_plural = 'Cluster statistics'
        ordering = ['-active_user_count']
    
    def __str__(self):
        return f"{self.cluster_key} - {self.active_user_count} active users"
    
    def needs_refresh(self) -> bool:
        """Check if cluster needs new opportunities"""
        if not self.next_fetch_at:
            return True
        return timezone.now() >= self.next_fetch_at
    
    def get_priority(self) -> str:
        """Calculate fetch priority based on user activity and cache status"""
        if self.active_user_count > 20 and self.cached_opportunities < 10:
            return 'high'
        elif self.active_user_count > 10:
            return 'medium'
        return 'low'
