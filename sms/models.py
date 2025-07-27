from django.db import models
from django.conf import settings


class SmsMessage(models.Model):
    """Stores each SMS received by the mobile client.

    The mobile application will forward every SMS that matches its filter
    (e.g. banking/transaction messages) to this backend endpoint. Each
    message is linked to the authenticated user so we can build per-user
    transaction history or trigger further processing/notifications.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sms_messages",
    )
    sender = models.CharField(max_length=100, blank=True, null=True)
    body = models.TextField(help_text="Raw body/content of the SMS message")
    received_at = models.DateTimeField(
        help_text="Timestamp when the SMS was originally received on the device"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(
        default=False,
        help_text="Whether the message has been parsed and processed by other services",
    )

    class Meta:
        ordering = ["-received_at"]
        indexes = [models.Index(fields=["user", "received_at"])]
        verbose_name = "SMS Message"
        verbose_name_plural = "SMS Messages"

    def __str__(self):
        sender = self.sender or "Unknown"
        return f"SMS from {sender} @ {self.received_at.strftime('%Y-%m-%d %H:%M:%S')}" 