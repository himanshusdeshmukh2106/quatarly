from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class UserProfile(models.Model):
    """Stores persistent user profile data generated from questionnaire responses"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='financial_profile')
    profile_data = models.JSONField(help_text="Structured profile data from Gemini API")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        indexes = [
            models.Index(fields=['updated_at']),
            models.Index(fields=['user']),
        ]
    
    def is_stale(self, days=7):
        """Check if profile is older than specified days (default 7)"""
        return timezone.now() - self.updated_at > timedelta(days=days)
    
    def __str__(self):
        return f"Profile for {self.user.username}"


class Opportunity(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='opportunities')
    profile = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, help_text="Associated user profile")
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    ai_insights = models.TextField()
    action_steps = models.JSONField(default=list)
    relevance_score = models.FloatField(default=0.0)
    image_url = models.URLField(blank=True, help_text="Image URL for the opportunity card")
    logo_url = models.URLField(blank=True, help_text="Logo URL for the opportunity provider")
    offer_details = models.JSONField(default=dict, help_text="Specific offer details like discount, validity, etc.")
    opportunity_hash = models.CharField(max_length=64, blank=True, help_text="Hash to prevent duplicates")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
        
    def __str__(self):
        return f"{self.title} - {self.user.username} ({self.priority})"

    @property
    def priority_order(self):
        """Return numeric priority for sorting"""
        priority_map = {'high': 3, 'medium': 2, 'low': 1}
        return priority_map.get(self.priority, 1)