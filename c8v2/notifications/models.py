from django.db import models
from django.conf import settings
import datetime

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=100, db_index=True, help_text="e.g., 'upi_notification'")
    app = models.CharField(max_length=100, help_text="The name of the source application, e.g., 'paytm'")
    title = models.CharField(max_length=255)
    text = models.TextField()
    big_text = models.TextField(blank=True, null=True, help_text="The extended text content of the notification, if available.")
    posted_time = models.DateTimeField(help_text="The original timestamp of the notification.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-posted_time']

    def __str__(self):
        return f"Notification for {self.user.email} from {self.app}: {self.title}"
