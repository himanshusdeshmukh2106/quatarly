from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import json

User = get_user_model()


class InvestmentManager(models.Manager):
    def get_by_asset_type(self, user, asset_type):
        """Get investments filtered by asset type"""
        return self.filter(user=user, asset_type=asset_type)
    
    def get_tradeable_assets(self, user):
        """Get all tradeable assets (stocks, ETFs, bonds, crypto)"""
        return self.filter(
            user=user, 
            asset_type__in=['stock', 'etf', 'bond', 'crypto', 'mutual_fund']
        )
    
    def get_physical_assets(self, user):
        """Get all physical assets (gold, silver, commodities)"""
        return self.filter(
            user=user, 
            asset_type__in=['gold', 'silver', 'commodity']
        )


class Investment(models.Model):
    ASSET_TYPE_CHOICES = [
        ('stock', 'Stock'),
        ('etf', 'ETF'),
        ('mutual_fund', 'Mutual Fund'),
        ('crypto', 'Cryptocurrency'),
        ('bond', 'Bond'),
        ('gold', 'Gold'),
        ('silver', 'Silver'),
        ('commodity', 'Commodity'),
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
    symbol = models.CharField(max_length=20, blank=True)  # Optional for physical assets
    name = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES, default='stock')
    exchange = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    
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
    
    # Enhanced Market Data (from Perplexity API)
    pe_ratio = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    fifty_two_week_high = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    fifty_two_week_low = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    volume = models.CharField(max_length=20, blank=True, null=True)  # Trading volume (e.g., "1.2M", "500K")
    
    # Physical Asset Fields (minimal set to match current UI)
    unit = models.CharField(max_length=20, blank=True, null=True)  # grams, ounces, etc.
    
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
    growth_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # Replaces dividend_yield
    
    # Data enrichment status
    data_enriched = models.BooleanField(default=False)
    enrichment_attempted = models.BooleanField(default=False)
    enrichment_error = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = InvestmentManager()

    class Meta:
        unique_together = [['user', 'symbol', 'asset_type']]  # Allow same symbol for different asset types
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'asset_type']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['symbol']),
        ]

    @property
    def is_tradeable(self):
        """Check if asset is tradeable (has market prices)"""
        return self.asset_type in ['stock', 'etf', 'bond', 'crypto', 'mutual_fund']
    
    @property
    def is_physical(self):
        """Check if asset is physical"""
        return self.asset_type in ['gold', 'silver', 'commodity']
    
    @property
    def requires_symbol(self):
        """Check if asset type requires a symbol"""
        return self.asset_type in ['stock', 'etf', 'bond', 'crypto', 'mutual_fund']
    
    @property
    def supports_chart_data(self):
        """Check if asset type supports chart data"""
        return self.asset_type in ['stock', 'etf', 'crypto']
    
    def get_display_unit(self):
        """Get appropriate display unit for the asset"""
        if self.asset_type in ['stock', 'etf', 'mutual_fund']:
            return 'shares'
        elif self.asset_type == 'crypto':
            return 'coins'
        elif self.asset_type in ['gold', 'silver']:
            return self.unit or 'grams'
        else:
            return self.unit or 'units'

    def __str__(self):
        if self.symbol:
            return f"{self.user.username} - {self.symbol} ({self.quantity} {self.get_display_unit()})"
        return f"{self.user.username} - {self.name} ({self.quantity} {self.get_display_unit()})"

    def save(self, *args, **kwargs):
        # Calculate derived fields
        self.total_value = self.quantity * self.current_price
        total_cost = self.quantity * self.average_purchase_price
        self.total_gain_loss = self.total_value - total_cost
        
        if total_cost > 0:
            self.total_gain_loss_percent = (self.total_gain_loss / total_cost) * 100
        
        super().save(*args, **kwargs)
        
        # Clear cache when investment is updated
        self._clear_user_cache()
    
    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        # Clear cache when investment is deleted
        self._clear_user_cache()
    
    def _clear_user_cache(self):
        """Clear cached data for the user"""
        from django.core.cache import cache
        cache_keys = [
            f"portfolio_summary_{self.user.id}",
            f"portfolio_insights_{self.user.id}",
            f"asset_type_performance_{self.user.id}",
        ]
        cache.delete_many(cache_keys)


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