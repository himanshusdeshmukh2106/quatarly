from django.db import models
from django.conf import settings

class EmailAccount(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email = models.EmailField()
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.email} for {self.user}"

class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email_account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    merchant = models.CharField(max_length=200)
    transaction_date = models.DateTimeField()
    transaction_id = models.CharField(max_length=100)
    payment_method = models.CharField(max_length=50)  # UPI, Card, etc.
    email_subject = models.CharField(max_length=500)
    email_body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction of {self.amount} {self.currency} for {self.user}" 