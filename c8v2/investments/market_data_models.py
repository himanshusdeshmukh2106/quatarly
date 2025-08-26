"""
Centralized Market Data Models for Server-Side Data Management

These models store OHLC and market data that can be shared across all users,
eliminating the need for individual API calls and providing consistent data.
"""
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
import json


class AssetSymbolManager(models.Manager):
    """Manager for AssetSymbol model with common queries"""
    
    def get_active_symbols(self):
        """Get all active symbols that should be updated"""
        return self.filter(is_active=True)
    
    def get_by_symbol_and_type(self, symbol, asset_type):
        """Get asset symbol by symbol and type"""
        return self.filter(symbol=symbol, asset_type=asset_type).first()
    
    def get_tradeable_symbols(self):
        """Get all tradeable asset symbols"""
        return self.filter(
            asset_type__in=['stock', 'etf', 'crypto', 'mutual_fund', 'bond'],
            is_active=True
        )


class AssetSymbol(models.Model):
    """
    Central registry of all asset symbols across the platform.
    This model tracks which symbols need data updates.
    """
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
    
    symbol = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=200, blank=True)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    exchange = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    
    # Metadata
    sector = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True, help_text="Whether this symbol should be updated in scheduled tasks")
    
    # Tracking
    first_requested = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    update_frequency = models.IntegerField(default=1, help_text="How often this symbol is requested (for prioritization)")
    
    objects = AssetSymbolManager()
    
    class Meta:
        unique_together = [['symbol', 'asset_type']]
        indexes = [
            models.Index(fields=['symbol', 'asset_type']),
            models.Index(fields=['asset_type', 'is_active']),
            models.Index(fields=['last_updated']),
        ]
    
    def __str__(self):
        return f"{self.symbol} ({self.asset_type})"
    
    def increment_frequency(self):
        """Increment the update frequency counter"""
        self.update_frequency += 1
        self.save(update_fields=['update_frequency'])


class CentralizedOHLCDataManager(models.Manager):
    """Manager for OHLC data with common queries"""
    
    def get_latest_for_symbol(self, symbol, asset_type, timeframe='1Day'):
        """Get the latest OHLC data for a symbol"""
        return self.filter(
            symbol=symbol,
            asset_type=asset_type,
            timeframe=timeframe
        ).order_by('-last_updated').first()
    
    def get_symbols_needing_update(self, hours_threshold=24):
        """Get symbols that need OHLC data updates (24-hour cache)"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            models.Q(last_updated__lt=cutoff_time) | models.Q(last_updated__isnull=True),
            asset_symbol__is_active=True
        ).values_list('symbol', 'asset_type').distinct()
    
    def get_fresh_data(self, hours_threshold=24):
        """Get all OHLC data that is fresh (within cache period)"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            last_updated__gte=cutoff_time,
            is_stale=False
        ).select_related('asset_symbol')
    
    def get_batch_data(self, symbols_list, hours_threshold=24):
        """Get OHLC data for a batch of symbols efficiently"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            symbol__in=symbols_list,
            last_updated__gte=cutoff_time,
            is_stale=False,
            timeframe='1Day'
        ).select_related('asset_symbol')


class CentralizedOHLCData(models.Model):
    """
    Centralized OHLC data storage for all assets.
    This data is fetched server-side and shared across all users.
    Daily timeframe only.
    """
    TIMEFRAME_CHOICES = [
        ('1Day', '1 Day'),
    ]
    
    asset_symbol = models.ForeignKey(AssetSymbol, on_delete=models.CASCADE, related_name='ohlc_data')
    symbol = models.CharField(max_length=20, db_index=True)  # Denormalized for performance
    asset_type = models.CharField(max_length=20, db_index=True)  # Denormalized for performance
    timeframe = models.CharField(max_length=10, choices=TIMEFRAME_CHOICES, default='1Day')
    
    # OHLC Data (stored as JSON for historical data)
    ohlc_data = models.JSONField(
        default=list,
        help_text="OHLC data with timestamps: [{'timestamp': '2024-01-01', 'open': 100, 'high': 105, 'low': 95, 'close': 102, 'volume': 1000}, ...]"
    )
    
    # Current price information
    current_price = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    daily_change = models.DecimalField(max_digits=15, decimal_places=4, default=0)
    daily_change_percent = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    
    # Data source tracking
    data_source = models.CharField(max_length=50, default='bharatsm', help_text="Source of the data (bharatsm, perplexity, finnhub, etc.)")
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Data quality
    data_points_count = models.IntegerField(default=0, help_text="Number of data points in OHLC data")
    is_stale = models.BooleanField(default=False, help_text="Whether the data is considered stale")
    
    objects = CentralizedOHLCDataManager()
    
    class Meta:
        unique_together = [['symbol', 'asset_type', 'timeframe']]
        indexes = [
            models.Index(fields=['symbol', 'asset_type', 'timeframe']),
            models.Index(fields=['last_updated']),
            models.Index(fields=['asset_type', 'is_stale']),
        ]
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"OHLC {self.symbol} ({self.timeframe}) - {self.last_updated}"
    
    @property
    def is_cache_valid(self):
        """Check if the cached data is still valid (24 hours for daily data)"""
        if not self.last_updated:
            return False
        
        hours_since_update = (timezone.now() - self.last_updated).total_seconds() / 3600
        
        # 24 hours cache threshold for daily data (matching the new cycle)
        return hours_since_update < 24.0
    
    def get_latest_price(self):
        """Get the latest closing price from OHLC data"""
        if self.current_price:
            return float(self.current_price)
        
        if self.ohlc_data and len(self.ohlc_data) > 0:
            latest_data = self.ohlc_data[-1]
            return float(latest_data.get('close', 0))
        
        return 0.0
    
    def calculate_daily_change(self):
        """Calculate daily change from OHLC data"""
        if not self.ohlc_data or len(self.ohlc_data) < 2:
            return 0.0, 0.0
        
        latest = self.ohlc_data[-1]
        previous = self.ohlc_data[-2]
        
        current_close = float(latest.get('close', 0))
        previous_close = float(previous.get('close', 0))
        
        if previous_close == 0:
            return 0.0, 0.0
        
        daily_change = current_close - previous_close
        daily_change_percent = (daily_change / previous_close) * 100
        
        return daily_change, daily_change_percent


class CentralizedMarketDataManager(models.Manager):
    """Manager for market data with common queries"""
    
    def get_latest_for_symbol(self, symbol, asset_type):
        """Get the latest market data for a symbol"""
        return self.filter(symbol=symbol, asset_type=asset_type).first()
    
    def get_fresh_data(self, hours_threshold=24):
        """Get all market data that is fresh (within 24-hour cache period)"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            last_updated__gte=cutoff_time,
            is_stale=False
        ).select_related('asset_symbol')
    
    def get_batch_data(self, symbols_list, hours_threshold=24):
        """Get market data for a batch of symbols efficiently"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            symbol__in=symbols_list,
            last_updated__gte=cutoff_time,
            is_stale=False
        ).select_related('asset_symbol')
    
    def get_symbols_needing_update(self, hours_threshold=24):
        """Get symbols that need market data updates (24-hour cache)"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            models.Q(last_updated__lt=cutoff_time) | models.Q(last_updated__isnull=True),
            asset_symbol__is_active=True
        ).values_list('symbol', 'asset_type').distinct()
    
    def get_symbols_needing_update(self, hours_threshold=24):
        """Get symbols that need market data updates"""
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        return self.filter(
            models.Q(last_updated__lt=cutoff_time) | models.Q(last_updated__isnull=True),
            asset_symbol__is_active=True
        ).values_list('symbol', 'asset_type').distinct()
    
    def get_by_symbols(self, symbols_list):
        """Get market data for a list of symbols"""
        return self.filter(symbol__in=symbols_list)


class CentralizedMarketData(models.Model):
    """
    Centralized market data storage for enhanced asset information.
    This includes PE ratios, market cap, volume, etc.
    """
    asset_symbol = models.OneToOneField(AssetSymbol, on_delete=models.CASCADE, related_name='market_data')
    symbol = models.CharField(max_length=20, db_index=True)  # Denormalized for performance
    asset_type = models.CharField(max_length=20, db_index=True)  # Denormalized for performance
    
    # Enhanced Market Data
    pe_ratio = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    market_cap = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    volume = models.CharField(max_length=20, blank=True, null=True)  # Formatted volume (e.g., "1.2M")
    volume_raw = models.BigIntegerField(blank=True, null=True)  # Raw volume number
    
    # Price ranges
    fifty_two_week_high = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    fifty_two_week_low = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    
    # Growth and performance
    growth_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    beta = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    
    # Company information
    sector = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Data source and freshness
    data_source = models.CharField(max_length=50, default='bharatsm')
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Data quality indicators
    data_completeness_score = models.IntegerField(default=0, help_text="Score out of 100 for data completeness")
    is_stale = models.BooleanField(default=False)
    
    objects = CentralizedMarketDataManager()
    
    class Meta:
        unique_together = [['symbol', 'asset_type']]
        indexes = [
            models.Index(fields=['symbol', 'asset_type']),
            models.Index(fields=['last_updated']),
            models.Index(fields=['sector']),
        ]
    
    def __str__(self):
        return f"Market Data {self.symbol} - {self.last_updated}"
    
    @property
    def is_cache_valid(self):
        """Check if the cached market data is still valid (24 hours)"""
        if not self.last_updated:
            return False
        
        hours_since_update = (timezone.now() - self.last_updated).total_seconds() / 3600
        return hours_since_update < 24.0  # 24-hour cache for market data
    
    def calculate_completeness_score(self):
        """Calculate data completeness score"""
        fields_to_check = [
            'pe_ratio', 'market_cap', 'volume', 'fifty_two_week_high',
            'fifty_two_week_low', 'growth_rate', 'sector'
        ]
        
        filled_fields = sum(1 for field in fields_to_check if getattr(self, field) is not None)
        score = int((filled_fields / len(fields_to_check)) * 100)
        
        self.data_completeness_score = score
        return score
    
    def get_formatted_market_cap(self):
        """Get formatted market cap for display"""
        if not self.market_cap:
            return None
        
        if self.market_cap >= 1000000000000:  # Trillion
            return f"₹{self.market_cap / 1000000000000:.1f}T"
        elif self.market_cap >= 1000000000:  # Billion
            return f"₹{self.market_cap / 1000000000:.1f}B"
        elif self.market_cap >= 1000000:  # Million
            return f"₹{self.market_cap / 1000000:.1f}M"
        else:
            return f"₹{self.market_cap:.0f}"


class DataFetchLog(models.Model):
    """
    Log of data fetch operations for monitoring and debugging
    """
    OPERATION_CHOICES = [
        ('ohlc_fetch', 'OHLC Data Fetch'),
        ('market_data_fetch', 'Market Data Fetch'),
        ('daily_update', 'Daily Data Update'),
        ('emergency_update', 'Emergency Data Update'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial_success', 'Partial Success'),
        ('failed', 'Failed'),
        ('in_progress', 'In Progress'),
    ]
    
    operation_type = models.CharField(max_length=20, choices=OPERATION_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    
    # Operation details
    symbols_requested = models.JSONField(default=list, help_text="List of symbols requested")
    symbols_successful = models.JSONField(default=list, help_text="List of symbols successfully updated")
    symbols_failed = models.JSONField(default=list, help_text="List of symbols that failed")
    
    # Timing information
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    duration_seconds = models.IntegerField(blank=True, null=True)
    
    # Error information
    error_message = models.TextField(blank=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    # Statistics
    total_symbols = models.IntegerField(default=0)
    successful_symbols = models.IntegerField(default=0)
    failed_symbols = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['operation_type', 'status']),
            models.Index(fields=['started_at']),
        ]
    
    def __str__(self):
        return f"{self.operation_type} - {self.status} ({self.started_at})"
    
    def mark_completed(self, status='success'):
        """Mark the operation as completed"""
        self.completed_at = timezone.now()
        self.status = status
        if self.started_at:
            self.duration_seconds = int((self.completed_at - self.started_at).total_seconds())
        self.save()
    
    def add_successful_symbol(self, symbol):
        """Add a symbol to the successful list"""
        if symbol not in self.symbols_successful:
            self.symbols_successful.append(symbol)
            self.successful_symbols = len(self.symbols_successful)
    
    def add_failed_symbol(self, symbol, error=None):
        """Add a symbol to the failed list"""
        if symbol not in self.symbols_failed:
            self.symbols_failed.append(symbol)
            self.failed_symbols = len(self.symbols_failed)
            
            if error:
                if 'symbol_errors' not in self.error_details:
                    self.error_details['symbol_errors'] = {}
                self.error_details['symbol_errors'][symbol] = str(error)