from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import json

User = get_user_model()


class Investment(models.Model):
    ASSET_TYPE_CHOICES = [
        ('stock', 'Stock'),
        ('etf', 'ETF'),
        ('mutual_fund', 'Mutual Fund'),
        ('crypto', 'Cryptocurrency'),
        ('bond', 'Bond'),
    ]
    
    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    RECOMMENDATION_CHOICES = [
        ('buy', 'Buy'),
        ('hold', 'Hold'),
        ('sell', 'Sell'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    symbol = models.CharField(max_length=20)  # e.g., "AAPL", "RELIANCE.NS"
    name = models.CharField(max_length=200)  # e.g., "Apple Inc."
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES, default='stock')
    exchange = models.CharField(max_length=50)  # e.g., "NASDAQ", "NSE"
    currency = models.CharField(max_length=3, default='USD')  # e.g., "USD", "INR"
    
    # Holdings Information
    quantity = models.DecimalField(max_digits=15, decimal_places=4, validators=[MinValueValidator(0)])
    average_purchase_price = models.DecimalField(max_digits=15, decimal_places=4, validators=[MinValueValidator(0)])
    current_price = models.DecimalField(max_digits=15, decimal_places=4, default=0)
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Performance Metrics
    daily_change = models.DecimalField(max_digits=15, decimal_places=4, default=0)
    daily_change_percent = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    total_gain_loss = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_gain_loss_percent = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    
    # Chart Data (stored as JSON)
    chart_data = models.JSONField(default=list, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    # AI Insights
    ai_analysis = models.TextField(blank=True, null=True)
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES, default='medium')
    recommendation = models.CharField(max_length=10, choices=RECOMMENDATION_CHOICES, default='hold')
    
    # Metadata
    logo_url = models.URLField(blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)
    market_cap = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    dividend_yield = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'symbol']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.symbol} ({self.quantity} shares)"

    def save(self, *args, **kwargs):
        # Calculate derived fields
        self.total_value = self.quantity * self.current_price
        total_cost = self.quantity * self.average_purchase_price
        self.total_gain_loss = self.total_value - total_cost
        
        if total_cost > 0:
            self.total_gain_loss_percent = (self.total_gain_loss / total_cost) * 100
        
        super().save(*args, **kwargs)


class ChartData(models.Model):
    """Separate model for storing historical chart data"""
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='historical_data')
    date = models.DateField()
    open_price = models.DecimalField(max_digits=15, decimal_places=4)
    high_price = models.DecimalField(max_digits=15, decimal_places=4)
    low_price = models.DecimalField(max_digits=15, decimal_places=4)
    close_price = models.DecimalField(max_digits=15, decimal_places=4)
    volume = models.BigIntegerField(default=0)
    timestamp = models.BigIntegerField()  # Unix timestamp
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['investment', 'date']
        ordering = ['date']

    def __str__(self):
        return f"{self.investment.symbol} - {self.date}"


class PriceAlert(models.Model):
    """Model for price alerts"""
    ALERT_TYPE_CHOICES = [
        ('above', 'Price Above'),
        ('below', 'Price Below'),
        ('change_percent', 'Percentage Change'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='price_alerts')
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    target_value = models.DecimalField(max_digits=15, decimal_places=4)
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.investment.symbol} {self.alert_type} {self.target_value}"