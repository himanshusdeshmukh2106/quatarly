from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    image_url = models.URLField(blank=True)
    ai_analysis = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    @property
    def progress_percentage(self):
        if self.target_amount <= 0:
            return 0
        return min((self.current_amount / self.target_amount) * 100, 100)