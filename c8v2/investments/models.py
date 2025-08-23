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
    
    def get_current_price(self):
        """Get current price for unified card display"""
        if self.is_tradeable:
            return self.current_price
        elif self.is_physical:
            # For physical assets, use current_price if available, otherwise average_purchase_price
            return self.current_price if self.current_price > 0 else self.average_purchase_price
        return self.current_price or self.average_purchase_price
    
    def get_symbol_or_abbreviation(self):
        """Get symbol or generate abbreviation for unified card display"""
        if self.symbol:
            return self.symbol
        # Generate abbreviation from name
        words = self.name.split()
        if len(words) >= 2:
            return ''.join(word[0].upper() for word in words[:2])
        return self.name[:2].upper()
    
    def get_formatted_volume(self):
        """Get formatted volume for display"""
        if self.volume:
            return self.volume
        # Generate mock volume based on total value
        base_volume = int(self.total_value / 1000)
        if base_volume > 1000:
            return f"{base_volume / 1000:.1f}M"
        return f"{base_volume / 1000:.1f}K"
    
    def get_formatted_market_cap(self):
        """Get formatted market cap for display"""
        if self.market_cap:
            if self.market_cap > 1000000000:
                return f"{self.market_cap / 1000000000:.1f}B"
            return f"{self.market_cap / 1000000:.1f}M"
        
        # Generate mock market cap
        multiplier = 50 if self.is_physical else 100
        base_cap = float(self.total_value) * multiplier
        if base_cap > 1000000000:
            return f"{base_cap / 1000000000:.1f}B"
        return f"{base_cap / 1000000:.1f}M"
    
    def get_stats_for_unified_card(self):
        """Get statistics appropriate for the asset type for unified card display"""
        if self.is_tradeable:
            return [
                {'label': 'Volume', 'value': self.get_formatted_volume()},
                {'label': 'Market Cap', 'value': self.get_formatted_market_cap()},
                {'label': 'P/E Ratio', 'value': f"{self.pe_ratio:.2f}" if self.pe_ratio else "N/A"},
                {
                    'label': 'Growth Rate', 
                    'value': f"{self.growth_rate:.1f}%" if self.growth_rate is not None else "N/A",
                    'color': '#22c55e' if self.growth_rate and self.growth_rate > 0 else '#ef4444' if self.growth_rate and self.growth_rate < 0 else None
                }
            ]
        elif self.is_physical:
            return [
                {'label': 'Volume', 'value': self.get_formatted_volume()},
                {'label': 'Market Cap', 'value': self.get_formatted_market_cap()},
                {'label': 'Purchase Price', 'value': f"₹{self.average_purchase_price:.2f}"},
                {'label': 'Quantity', 'value': f"{self.quantity} {self.get_display_unit()}"}
            ]
        else:
            return [
                {'label': 'Volume', 'value': self.get_formatted_volume()},
                {'label': 'Market Cap', 'value': self.get_formatted_market_cap()},
                {'label': 'Total Value', 'value': f"₹{self.total_value:.2f}"},
                {'label': 'Asset Type', 'value': self.asset_type.upper()}
            ]
    
    def to_unified_card_data(self):
        """Convert investment to unified card data format"""
        return {
            'id': str(self.id),
            'name': self.name,
            'assetType': self.asset_type,
            'symbol': self.get_symbol_or_abbreviation(),
            'currentPrice': float(self.get_current_price()),
            'currency': self.currency if self.is_tradeable else None,
            'totalValue': float(self.total_value),
            'totalGainLoss': float(self.total_gain_loss),
            'totalGainLossPercent': float(self.total_gain_loss_percent),
            'aiAnalysis': self.ai_analysis or self._generate_default_analysis(),
            'riskLevel': self.risk_level,
            'recommendation': self.recommendation,
            'stats': self.get_stats_for_unified_card(),
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else self.updated_at.isoformat(),
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            # Additional fields for tradeable assets
            'quantity': float(self.quantity) if self.is_tradeable else None,
            'averagePurchasePrice': float(self.average_purchase_price) if self.is_tradeable else None,
            'exchange': self.exchange if self.is_tradeable else None,
            'volume': self.volume if self.is_tradeable else None,
            'marketCap': float(self.market_cap) if self.market_cap else None,
            'peRatio': float(self.pe_ratio) if self.pe_ratio else None,
            'growthRate': float(self.growth_rate) if self.growth_rate is not None else None,
            # Additional fields for physical assets
            'unit': self.unit if self.is_physical else None,
            'purchasePrice': float(self.average_purchase_price) if self.is_physical else None,
            'currentMarketPrice': float(self.current_price) if self.is_physical and self.current_price > 0 else None,
            'manuallyUpdated': True if self.is_physical else False,
        }
    
    def _generate_default_analysis(self):
        """Generate default AI analysis if none exists"""
        asset_type_text = {
            'stock': 'shares',
            'crypto': 'cryptocurrency',
            'gold': 'gold holdings',
            'silver': 'silver holdings',
            'etf': 'ETF position',
            'bond': 'bond position',
            'commodity': 'commodity holdings',
        }.get(self.asset_type, f'{self.asset_type} position')
        
        is_positive = self.total_gain_loss >= 0
        
        if is_positive:
            return f"{self.name} {asset_type_text} showed positive performance with strong fundamentals and favorable market conditions supporting continued growth potential in the current economic environment."
        else:
            return f"{self.name} {asset_type_text} experienced some volatility due to market conditions and sector-specific factors, but maintains solid underlying value with potential for recovery in the medium term."

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