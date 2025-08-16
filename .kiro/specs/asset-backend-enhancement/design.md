# Design Document

## Overview

The asset backend enhancement will expand the existing Django investment backend to support comprehensive asset management including both traditional investments and physical assets. The system will provide RESTful APIs for manual asset addition, automatic data enrichment using Perplexity API, and seamless integration with the existing frontend asset management interface. The design maintains backward compatibility with the current investment system while adding support for physical assets like gold, silver, real estate, and commodities.

## Architecture

### System Architecture

```
Frontend (React Native)
├── AssetsScreen
├── AddAssetModal
├── AssetCard Components
└── API Service Layer
    │
    ├── HTTP Requests
    │
Backend (Django)
├── Asset Management API
│   ├── AssetViewSet
│   ├── TradableAssetViewSet
│   └── PhysicalAssetViewSet
├── Data Enrichment Service
│   ├── PerplexityAPIService
│   ├── MarketDataService
│   └── PriceUpdateService
├── Database Models
│   ├── Asset (Base Model)
│   ├── TradableAsset
│   ├── PhysicalAsset
│   └── RealEstate
└── Background Tasks
    ├── Daily Price Updates
    └── Data Enrichment Jobs
```

### Database Architecture

The system will use a polymorphic model structure with a base Asset model and specialized submodels:

```
Asset (Base Model)
├── TradableAsset (stocks, ETFs, bonds, crypto)
├── PhysicalAsset (gold, silver, commodities)
└── RealEstate (properties)
```

### API Architecture

The backend will enhance the existing `/api/investments/` endpoints to support comprehensive asset management while maintaining full backward compatibility:
- `/api/investments/` - Enhanced to handle all asset types (stocks, ETFs, bonds, crypto, gold, silver, commodities)
- Asset type differentiation handled through the `asset_type` field in the existing Investment model
- No separate "assets" API needed - the frontend already uses the investments endpoint for all asset types
- Existing API structure maintained to ensure zero breaking changes

## Components and Interfaces

### Database Models

#### Enhanced Investment Model

The existing Investment model will be enhanced to support all asset types while maintaining backward compatibility:

```python
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
        ('monitor', 'Monitor'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    symbol = models.CharField(max_length=20, blank=True)  # Optional for physical assets
    name = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES, default='stock')
    exchange = models.CharField(max_length=50, blank=True)
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
    
    # Enhanced Market Data (from BharatSM/Perplexity API)
    volume = models.CharField(max_length=20, blank=True, null=True)  # Formatted string like "1.2M", "500K"
    market_cap = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    pe_ratio = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    growth_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # Replaces dividend_yield
    fifty_two_week_high = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    fifty_two_week_low = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    
    # Physical Asset Fields (minimal set to match current UI)
    unit = models.CharField(max_length=20, blank=True, null=True)  # grams, ounces, etc.
    # Note: purity, storage, certificate fields should be removed from UI components
    # as they are not collected in AddAssetModal
    

    
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
    
    # Data enrichment status
    data_enriched = models.BooleanField(default=False)
    enrichment_attempted = models.BooleanField(default=False)
    enrichment_error = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['user', 'symbol', 'asset_type']]  # Allow same symbol for different asset types
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'asset_type']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['symbol']),
        ]

    def save(self, *args, **kwargs):
        # Calculate derived fields
        self.total_value = self.quantity * self.current_price
        total_cost = self.quantity * self.average_purchase_price
        self.total_gain_loss = self.total_value - total_cost
        
        if total_cost > 0:
            self.total_gain_loss_percent = (self.total_gain_loss / total_cost) * 100
        
        super().save(*args, **kwargs)

    def __str__(self):
        if self.symbol:
            return f"{self.user.username} - {self.symbol} ({self.quantity} {self.unit or 'shares'})"
        return f"{self.user.username} - {self.name} ({self.quantity} {self.unit or 'units'})"
```

#### Asset Type Validation and Helper Methods

```python
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

# Add to Investment model
class Investment(models.Model):
    # ... existing fields ...
    
    objects = InvestmentManager()
    
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
```

### API Views and Serializers

#### Enhanced InvestmentViewSet

The existing InvestmentViewSet will be enhanced to support all asset types:

```python
class InvestmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Investment.objects.filter(user=self.request.user)
        asset_type = self.request.query_params.get('asset_type', None)
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateInvestmentSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateInvestmentSerializer
        return InvestmentSerializer
    
    def perform_create(self, serializer):
        """Enhanced create method with data enrichment"""
        try:
            asset_type = serializer.validated_data['asset_type']
            
            # For tradeable assets, fetch market data
            if asset_type in ['stock', 'etf', 'crypto', 'bond']:
                symbol = serializer.validated_data.get('symbol')
                if symbol:
                    # Get basic company info and current price
                    market_data = DataEnrichmentService.get_basic_market_data(symbol, asset_type)
                    
                    # Update serializer data with market info
                    if market_data:
                        serializer.validated_data.update({
                            'name': market_data.get('name', serializer.validated_data.get('name', symbol)),
                            'current_price': market_data.get('current_price', serializer.validated_data['average_purchase_price']),
                            'sector': market_data.get('sector'),
                            'exchange': market_data.get('exchange', serializer.validated_data.get('exchange', 'NASDAQ')),
                            'logo_url': market_data.get('logo_url'),
                        })
            
            # Create the investment
            investment = serializer.save(user=self.request.user)
            
            # Trigger background data enrichment for more detailed info
            if investment.is_tradeable and investment.symbol:
                DataEnrichmentService.enrich_investment_data.delay(investment.id)
            
        except Exception as e:
            logger.error(f"Error creating investment: {e}")
            raise
    
    @action(detail=False, methods=['get'])
    def portfolio_summary(self, request):
        """Get comprehensive portfolio summary"""
        summary = InvestmentService.get_portfolio_summary(request.user)
        return Response(summary)
    
    @action(detail=False, methods=['post'])
    def refresh_prices(self, request):
        """Refresh prices for all tradeable assets"""
        updated_investments = InvestmentService.refresh_investment_prices(user=request.user)
        serializer = InvestmentSerializer(updated_investments, many=True)
        return Response({
            'message': f'Updated {len(updated_investments)} investments',
            'investments': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def enrich_data(self, request, pk=None):
        """Manually trigger data enrichment for an investment"""
        investment = self.get_object()
        if investment.is_tradeable and investment.symbol:
            DataEnrichmentService.enrich_investment_data(investment.id)
            investment.refresh_from_db()
            serializer = InvestmentSerializer(investment)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Data enrichment not available for this asset type'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def asset_suggestions(self, request):
        """Get asset suggestions for the AddAssetModal"""
        query = request.query_params.get('q', '')
        asset_type = request.query_params.get('type', '')
        
        if len(query) < 2:
            return Response([])
        
        suggestions = DataEnrichmentService.get_asset_suggestions(query, asset_type)
        return Response(suggestions)
```

#### Enhanced Investment Serializers

The existing serializers will be enhanced to support all asset types:

```python
class InvestmentSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    display_unit = serializers.SerializerMethodField()
    asset_specific_fields = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            'id', 'symbol', 'name', 'asset_type', 'exchange', 'currency',
            'quantity', 'average_purchase_price', 'current_price', 'total_value',
            'daily_change', 'daily_change_percent', 'total_gain_loss', 'total_gain_loss_percent',
            'chart_data', 'last_updated', 'ai_analysis', 'risk_level', 'recommendation',
            'logo_url', 'sector', 'volume', 'market_cap', 'pe_ratio', 'growth_rate',
            'fifty_two_week_high', 'fifty_two_week_low',
            'created_at', 'updated_at', 'progress_percentage', 'display_unit',
            'asset_specific_fields'
        ]
        read_only_fields = [
            'total_value', 'daily_change', 'daily_change_percent', 
            'total_gain_loss', 'total_gain_loss_percent', 'last_updated',
            'created_at', 'updated_at', 'progress_percentage', 'display_unit'
        ]

    def get_progress_percentage(self, obj):
        if obj.average_purchase_price > 0:
            return float((obj.current_price - obj.average_purchase_price) / obj.average_purchase_price * 100)
        return 0.0

    def get_display_unit(self, obj):
        return obj.get_display_unit()

    def get_asset_specific_fields(self, obj):
        """Return asset-type specific fields"""
        specific_fields = {}
        
        if obj.is_physical:
            specific_fields.update({
                'unit': obj.unit,
                # Note: purity, storage, certificate not included as they're not in AddAssetModal
            })
        

        
        return specific_fields

class CreateInvestmentSerializer(serializers.ModelSerializer):
    # Make symbol optional for physical assets
    symbol = serializers.CharField(required=False, allow_blank=True)
    
    # Asset-type specific fields (only unit is used, others should be removed from UI)
    unit = serializers.CharField(required=False, allow_blank=True)
    


    class Meta:
        model = Investment
        fields = [
            'asset_type', 'name', 'symbol', 'exchange', 'currency',
            'quantity', 'average_purchase_price', 'purchase_date',
            'unit'
        ]

    def validate(self, data):
        asset_type = data.get('asset_type', 'stock')
        
        # Validate required fields based on asset type
        if asset_type in ['stock', 'etf', 'bond', 'crypto', 'mutual_fund']:
            if not data.get('symbol'):
                raise serializers.ValidationError("Symbol is required for tradeable assets")
        
        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        
        if data.get('average_purchase_price', 0) <= 0:
            raise serializers.ValidationError("Average purchase price must be greater than 0")
        
        return data

    def create(self, validated_data):
        # Set default values based on asset type
        asset_type = validated_data.get('asset_type', 'stock')
        
        if asset_type in ['gold', 'silver'] and not validated_data.get('unit'):
            validated_data['unit'] = 'grams'
        
        # Set current_price to purchase_price initially
        validated_data['current_price'] = validated_data['average_purchase_price']
        
        return super().create(validated_data)

class UpdateInvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = [
            'quantity', 'average_purchase_price', 'unit'
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_average_purchase_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Average purchase price must be greater than 0")
        return value

# Asset Suggestion Serializer for the frontend
class AssetSuggestionSerializer(serializers.Serializer):
    name = serializers.CharField()
    symbol = serializers.CharField(required=False, allow_blank=True)
    type = serializers.CharField()
    exchange = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    current_price = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
    currency = serializers.CharField(default='INR')
```

### Data Enrichment Services

#### BharatSMService (Primary Data Source)

```python
from Fundamentals import MoneyControl
import pandas as pd
from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class BharatSMService:
    """Service to fetch data using Bharat SM MoneyControl library"""
    
    def __init__(self):
        self.mc = MoneyControl()
    
    def get_frontend_display_data(self, symbol: str) -> Dict:
        """
        Fetch the exact 4 data fields displayed on frontend:
        - Volume (formatted string like "1.2M")
        - Market Cap (number)
        - P/E Ratio (number) 
        - Growth Rate (number, replaces dividend yield)
        """
        try:
            # Get ticker information
            ticker_result, ticker_raw = self.mc.get_ticker(symbol)
            if not ticker_result or not ticker_raw:
                return {}
            
            ticker_id = ticker_result
            company_url = ticker_raw[0].get('link_src')
            
            # Fetch all required data
            volume = self._get_volume_data(ticker_id)
            market_cap = self._get_market_cap(ticker_id, company_url)
            pe_ratio = self._get_pe_ratio(ticker_id, company_url)
            growth_rate = self._get_growth_rate(ticker_id, company_url)
            
            return {
                'volume': volume,
                'market_cap': market_cap,
                'pe_ratio': pe_ratio,
                'growth_rate': growth_rate,
                'company_name': ticker_raw[0].get('name'),
                'sector': ticker_raw[0].get('sc_sector')
            }
            
        except Exception as e:
            logger.error(f"BharatSM API error for {symbol}: {e}")
            return {}
    
    def _get_volume_data(self, ticker_id: str) -> Optional[str]:
        """Get trading volume and format as string (e.g., '1.2M', '500K')"""
        try:
            # Get India VIX or stock data with volume
            vix_data = self.mc.get_india_vix(interval='1')
            if not vix_data.empty and 'v' in vix_data.columns:
                # Get latest volume
                latest_volume = vix_data['v'].iloc[-1]
                return self._format_volume(latest_volume)
            return "N/A"
        except Exception as e:
            logger.error(f"Error fetching volume for {ticker_id}: {e}")
            return "N/A"
    
    def _get_market_cap(self, ticker_id: str, company_url: str) -> Optional[float]:
        """Get market capitalization from financial data"""
        try:
            # Get ratios data which includes market cap information
            ratios_df = self.mc.get_complete_ratios_data(company_url, statement_type='standalone', num_years=5)
            if not ratios_df.empty:
                # Look for market cap or calculate from available data
                # Market cap might be in enterprise value or calculated from share price * shares
                for idx, row in ratios_df.iterrows():
                    if 'Enterprise Value' in str(row.get('ratios', '')):
                        # Extract enterprise value as proxy for market cap
                        ev_value = row.get(ratios_df.columns[1])  # Latest year column
                        if pd.notna(ev_value) and str(ev_value).replace('.', '').isdigit():
                            return float(ev_value) * 10000000  # Convert Cr to actual value
            return None
        except Exception as e:
            logger.error(f"Error fetching market cap for {ticker_id}: {e}")
            return None
    
    def _get_pe_ratio(self, ticker_id: str, company_url: str) -> Optional[float]:
        """Get P/E ratio from ratios data"""
        try:
            ratios_df = self.mc.get_complete_ratios_data(company_url, statement_type='standalone', num_years=5)
            if not ratios_df.empty:
                # Find P/E ratio row
                for idx, row in ratios_df.iterrows():
                    ratio_name = str(row.get('ratios', '')).lower()
                    if 'p/e' in ratio_name or 'pe' in ratio_name:
                        pe_value = row.get(ratios_df.columns[1])  # Latest year column
                        if pd.notna(pe_value) and str(pe_value).replace('.', '').replace('-', '').isdigit():
                            return float(pe_value)
            return None
        except Exception as e:
            logger.error(f"Error fetching P/E ratio for {ticker_id}: {e}")
            return None
    
    def _get_growth_rate(self, ticker_id: str, company_url: str) -> Optional[float]:
        """Calculate revenue growth rate from quarterly data to replace dividend yield"""
        try:
            # Get quarterly results for growth calculation
            quarterly_df = self.mc.get_complete_quarterly_results(company_url, statement_type='standalone', num_quarters=5)
            if not quarterly_df.empty and len(quarterly_df.columns) >= 3:
                # Find revenue row
                for idx, row in quarterly_df.iterrows():
                    row_name = str(row.get(quarterly_df.columns[0], '')).lower()
                    if 'revenue' in row_name or 'sales' in row_name or 'income from operations' in row_name:
                        # Get latest quarter and same quarter previous year
                        latest_revenue = row.get(quarterly_df.columns[1])  # Latest quarter
                        prev_year_revenue = row.get(quarterly_df.columns[-1])  # Oldest quarter (same quarter prev year)
                        
                        if (pd.notna(latest_revenue) and pd.notna(prev_year_revenue) and 
                            str(latest_revenue).replace('.', '').replace('-', '').isdigit() and
                            str(prev_year_revenue).replace('.', '').replace('-', '').isdigit()):
                            
                            latest = float(latest_revenue)
                            previous = float(prev_year_revenue)
                            
                            if previous > 0:
                                growth_rate = ((latest - previous) / previous) * 100
                                return round(growth_rate, 2)
            return None
        except Exception as e:
            logger.error(f"Error calculating growth rate for {ticker_id}: {e}")
            return None
    
    def _format_volume(self, volume: float) -> str:
        """Format volume as string (e.g., '1.2M', '500K')"""
        if volume >= 1000000000:
            return f"{volume / 1000000000:.1f}B"
        elif volume >= 1000000:
            return f"{volume / 1000000:.1f}M"
        elif volume >= 1000:
            return f"{volume / 1000:.1f}K"
        else:
            return str(int(volume))
    
    def get_basic_stock_info(self, symbol: str) -> Dict:
        """Get basic stock information for asset creation"""
        try:
            ticker_result, ticker_raw = self.mc.get_ticker(symbol)
            if ticker_result and ticker_raw:
                return {
                    'name': ticker_raw[0].get('name'),
                    'sector': ticker_raw[0].get('sc_sector'),
                    'symbol': ticker_result,
                    'exchange': 'NSE'  # Default for Indian stocks
                }
            return {}
        except Exception as e:
            logger.error(f"Error fetching basic info for {symbol}: {e}")
            return {}

#### PerplexityAPIService (Fallback)

class PerplexityAPIService:
    """Fallback service when BharatSM fails"""
    BASE_URL = "https://api.perplexity.ai"
    
    @classmethod
    def get_fallback_data(cls, symbol: str) -> dict:
        """Fetch basic data as fallback when BharatSM fails"""
        prompt = f"""
        Get basic financial data for stock symbol {symbol}:
        - Current price
        - Market capitalization (in millions)
        - P/E ratio
        - Revenue growth rate (quarterly YoY)
        - Trading volume
        
        Return the data in JSON format with numeric values.
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def _make_api_call(cls, prompt: str) -> dict:
        """Make API call to Perplexity"""
        headers = {
            'Authorization': f'Bearer {settings.PERPLEXITY_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3.1-sonar-small-128k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a financial data assistant. Always return data in valid JSON format with numeric values.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 1000,
            'temperature': 0.1
        }
        
        try:
            response = requests.post(
                f"{cls.BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            content = response.json()['choices'][0]['message']['content']
            import json
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return {}
```

#### DataEnrichmentService

```python
class DataEnrichmentService:
    
    @classmethod
    def enrich_investment_data(cls, investment_id: int):
        """Enrich investment data using BharatSM with Perplexity fallback"""
        try:
            investment = Investment.objects.get(id=investment_id)
            
            if investment.asset_type in ['stock', 'etf']:
                cls.enrich_stock_data_with_bharatsm(investment)
            elif investment.asset_type == 'crypto':
                cls.enrich_crypto_data_fallback(investment)
            elif investment.asset_type in ['gold', 'silver']:
                cls.enrich_precious_metal_data_fallback(investment)
            
            investment.data_enriched = True
            investment.enrichment_attempted = True
            investment.save()
            
        except Exception as e:
            logger.error(f"Data enrichment failed for investment {investment_id}: {e}")
            investment.enrichment_attempted = True
            investment.enrichment_error = str(e)
            investment.save()
    
    @classmethod
    def enrich_stock_data_with_bharatsm(cls, investment: Investment):
        """Enrich stock/ETF data using BharatSM with Perplexity fallback"""
        bharatsm_service = BharatSMService()
        
        # Try BharatSM first
        data = bharatsm_service.get_frontend_display_data(investment.symbol)
        
        if not data:
            # Fallback to Perplexity
            logger.warning(f"BharatSM failed for {investment.symbol}, using Perplexity fallback")
            data = PerplexityAPIService.get_fallback_data(investment.symbol)
        
        if data:
            # Update the exact fields displayed on frontend
            investment.volume = data.get('volume', 'N/A')  # String format like "1.2M"
            investment.market_cap = data.get('market_cap')  # Number
            investment.pe_ratio = data.get('pe_ratio')  # Number
            investment.growth_rate = data.get('growth_rate')  # Number (replaces dividend_yield)
            
            # Update other fields
            investment.sector = data.get('sector')
            
            # Update investment name if not provided
            if not investment.name or investment.name == investment.symbol:
                investment.name = data.get('company_name', investment.name)
            
            investment.save()
    
    @classmethod
    def enrich_crypto_data_fallback(cls, investment: Investment):
        """Enrich cryptocurrency data using Perplexity (BharatSM doesn't support crypto)"""
        data = PerplexityAPIService.get_fallback_data(investment.symbol)
        
        if data:
            investment.volume = data.get('volume', 'N/A')
            investment.market_cap = data.get('market_cap')
            investment.pe_ratio = None  # N/A for crypto
            investment.growth_rate = data.get('growth_rate')
            investment.save()
    
    @classmethod
    def enrich_precious_metal_data_fallback(cls, investment: Investment):
        """Enrich precious metal data using Perplexity (BharatSM doesn't support commodities)"""
        data = PerplexityAPIService.get_fallback_data(investment.symbol or investment.asset_type)
        
        if data:
            # Physical assets use mock data for volume/market cap
            investment.volume = 'N/A'
            investment.market_cap = None
            investment.pe_ratio = None
            investment.growth_rate = data.get('growth_rate')
            investment.save()
    
    @classmethod
    def get_basic_market_data(cls, symbol: str, asset_type: str) -> Dict:
        """Get basic market data for asset creation"""
        if asset_type in ['stock', 'etf']:
            bharatsm_service = BharatSMService()
            data = bharatsm_service.get_basic_stock_info(symbol)
            if data:
                return data
        
        # Fallback to Perplexity for basic info
        return PerplexityAPIService.get_fallback_data(symbol)
```

### Background Tasks

#### Celery Tasks for Price Updates

```python
from celery import shared_task

@shared_task
def daily_price_and_data_update():
    """Daily task to update prices and frontend display data for all tradeable assets"""
    investments = Investment.objects.filter(asset_type__in=['stock', 'etf', 'crypto'])
    bharatsm_service = BharatSMService()
    
    for investment in investments:
        try:
            if investment.asset_type in ['stock', 'etf']:
                # Use BharatSM for Indian stocks
                data = bharatsm_service.get_frontend_display_data(investment.symbol)
                if not data:
                    # Fallback to Perplexity
                    data = PerplexityAPIService.get_fallback_data(investment.symbol)
                
                if data:
                    # Update frontend display fields
                    investment.volume = data.get('volume', investment.volume)
                    investment.market_cap = data.get('market_cap', investment.market_cap)
                    investment.pe_ratio = data.get('pe_ratio', investment.pe_ratio)
                    investment.growth_rate = data.get('growth_rate', investment.growth_rate)
                    
                    # Update price if available
                    if 'current_price' in data:
                        old_price = investment.current_price
                        investment.current_price = data['current_price']
                        investment.daily_change = investment.current_price - old_price
                        investment.daily_change_percent = (investment.daily_change / old_price * 100) if old_price > 0 else 0
                    
                    investment.save()
            
            elif investment.asset_type == 'crypto':
                # Use Perplexity for crypto (BharatSM doesn't support crypto)
                data = PerplexityAPIService.get_fallback_data(investment.symbol)
                if data:
                    investment.volume = data.get('volume', investment.volume)
                    investment.market_cap = data.get('market_cap', investment.market_cap)
                    investment.growth_rate = data.get('growth_rate', investment.growth_rate)
                    
                    if 'current_price' in data:
                        old_price = investment.current_price
                        investment.current_price = data['current_price']
                        investment.daily_change = investment.current_price - old_price
                        investment.daily_change_percent = data.get('daily_change_percent', 0)
                    
                    investment.save()
                    
        except Exception as e:
            logger.error(f"Failed to update data for {investment.symbol}: {e}")

@shared_task
def enrich_investment_data_task(investment_id: int):
    """Background task for data enrichment using BharatSM"""
    DataEnrichmentService.enrich_investment_data(investment_id)
```

## Error Handling

### API Error Responses

```python
class AssetAPIException(APIException):
    status_code = 400
    default_detail = 'Asset operation failed'
    default_code = 'asset_error'

class DataEnrichmentException(APIException):
    status_code = 503
    default_detail = 'Data enrichment service unavailable'
    default_code = 'enrichment_error'

# Error handling in views
def handle_api_errors(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': 'Validation failed', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PerplexityAPIException as e:
            return Response(
                {'error': 'External data service unavailable', 'message': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return wrapper
```

### Data Validation

```python
class AssetValidator:
    @staticmethod
    def validate_tradeable_asset(data):
        """Validate tradeable asset data"""
        if not data.get('symbol'):
            raise ValidationError("Symbol is required for tradeable assets")
        
        if data.get('quantity', 0) <= 0:
            raise ValidationError("Quantity must be greater than 0")
        
        if data.get('purchase_price', 0) <= 0:
            raise ValidationError("Purchase price must be greater than 0")
    
    @staticmethod
    def validate_physical_asset(data):
        """Validate physical asset data"""
        if not data.get('unit'):
            raise ValidationError("Unit is required for physical assets")
        
        if data.get('quantity', 0) <= 0:
            raise ValidationError("Quantity must be greater than 0")
    
    @staticmethod
    def validate_real_estate(data):
        """Validate real estate data"""
        required_fields = ['property_type', 'address', 'city', 'state']
        for field in required_fields:
            if not data.get(field):
                raise ValidationError(f"{field} is required for real estate")
```

## Testing Strategy

### Unit Tests

```python
class AssetModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
    
    def test_asset_creation(self):
        """Test basic asset creation"""
        asset = Asset.objects.create(
            user=self.user,
            name='Test Asset',
            asset_type='stock',
            quantity=10,
            purchase_price=100
        )
        self.assertEqual(asset.total_value, 1000)
    
    def test_tradeable_asset_creation(self):
        """Test tradeable asset creation"""
        asset = TradableAsset.objects.create(
            user=self.user,
            name='Apple Inc.',
            asset_type='stock',
            symbol='AAPL',
            quantity=10,
            purchase_price=150,
            current_price=160
        )
        self.assertEqual(asset.total_gain_loss, 100)
        self.assertEqual(asset.total_gain_loss_percent, 6.67)

class AssetAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
    
    def test_create_stock_asset(self):
        """Test creating a stock asset via API"""
        data = {
            'name': 'Apple Inc.',
            'asset_type': 'stock',
            'symbol': 'AAPL',
            'quantity': 10,
            'purchase_price': 150
        }
        response = self.client.post('/api/assets/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Asset.objects.count(), 1)
    
    def test_portfolio_summary(self):
        """Test portfolio summary endpoint"""
        # Create test assets
        TradableAsset.objects.create(
            user=self.user,
            name='Apple Inc.',
            asset_type='stock',
            symbol='AAPL',
            quantity=10,
            purchase_price=150,
            current_price=160
        )
        
        response = self.client.get('/api/assets/portfolio_summary/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_value', response.data)
```

### Integration Tests

```python
class DataEnrichmentIntegrationTests(TestCase):
    @patch('assets.services.PerplexityAPIService.get_stock_data')
    def test_stock_data_enrichment(self, mock_api):
        """Test stock data enrichment integration"""
        mock_api.return_value = {
            'current_price': 160.50,
            'market_cap': 2500000000000,
            'pe_ratio': 25.5,
            'company_name': 'Apple Inc.'
        }
        
        asset = TradableAsset.objects.create(
            user=self.user,
            name='AAPL',
            asset_type='stock',
            symbol='AAPL',
            quantity=10,
            purchase_price=150
        )
        
        DataEnrichmentService.enrich_stock_data(asset)
        asset.refresh_from_db()
        
        self.assertEqual(asset.current_price, 160.50)
        self.assertEqual(asset.market_cap, 2500000000000)
        self.assertEqual(asset.name, 'Apple Inc.')
```

## Frontend Integration

### API Service Updates

The existing frontend API service will be updated to support the new asset endpoints while maintaining backward compatibility:

```typescript
// Updated fetchAssets function
export const fetchAssets = async (assetType?: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const params = assetType ? { asset_type: assetType } : {};
  const response = await apiClient.get('/assets/', { headers, params });

  return response.data.map((asset: any) => ({
    id: asset.id.toString(),
    name: asset.name,
    assetType: asset.asset_type,
    totalValue: parseFloat(asset.total_value),
    totalGainLoss: parseFloat(asset.total_gain_loss),
    totalGainLossPercent: parseFloat(asset.total_gain_loss_percent),
    aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
    riskLevel: asset.risk_level || 'medium',
    recommendation: asset.recommendation || 'hold',
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
    lastUpdated: asset.last_updated,
    // Asset-specific data
    ...asset.asset_specific_data
  })) as Asset[];
};

// Updated createAsset function
export const createAsset = async (assetData: CreateAssetRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const response = await apiClient.post('/assets/', assetData, { headers });
  
  const asset = response.data;
  return {
    id: asset.id.toString(),
    name: asset.name,
    assetType: asset.asset_type,
    totalValue: parseFloat(asset.total_value),
    totalGainLoss: parseFloat(asset.total_gain_loss),
    totalGainLossPercent: parseFloat(asset.total_gain_loss_percent),
    aiAnalysis: asset.ai_analysis || 'AI analysis will be generated for this asset.',
    riskLevel: asset.risk_level || 'medium',
    recommendation: asset.recommendation || 'hold',
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
    lastUpdated: asset.last_updated,
    ...asset.asset_specific_data
  } as Asset;
};
```

### Component Compatibility

The existing frontend components will work seamlessly with the new backend:

- **AssetCard**: Will receive properly formatted data from the new API
- **AddAssetModal**: Will submit data in the format expected by the new endpoints
- **TradableAssetCard/PhysicalAssetCard**: Will receive asset-specific data in the `asset_specific_data` field

## Performance Optimizations

### Database Optimizations

```python
# Optimized queries with select_related and prefetch_related
class AssetViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Asset.objects.filter(user=self.request.user)\
            .select_related('user')\
            .prefetch_related('tradableasset', 'physicalasset', 'realestate')

# Database indexes for common queries
class Asset(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['user', 'asset_type']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['asset_type', 'last_updated']),
        ]
```

### Caching Strategy

```python
from django.core.cache import cache

class AssetService:
    @staticmethod
    def get_portfolio_summary(user):
        cache_key = f"portfolio_summary_{user.id}"
        summary = cache.get(cache_key)
        
        if not summary:
            summary = AssetService._calculate_portfolio_summary(user)
            cache.set(cache_key, summary, timeout=300)  # 5 minutes
        
        return summary
    
    @staticmethod
    def invalidate_portfolio_cache(user):
        cache_key = f"portfolio_summary_{user.id}"
        cache.delete(cache_key)
```

### API Rate Limiting

```python
from django_ratelimit.decorators import ratelimit

class AssetViewSet(viewsets.ModelViewSet):
    @ratelimit(key='user', rate='100/h', method='POST')
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @ratelimit(key='user', rate='10/m', method='POST')
    @action(detail=False, methods=['post'])
    def refresh_prices(self, request):
        return super().refresh_prices(request)
```

This comprehensive design provides a robust foundation for the asset backend enhancement while maintaining compatibility with the existing frontend and ensuring scalability for future growth.
## Frontend
 Integration

The backend will maintain compatibility with the existing frontend by using the same `/api/investments/` endpoints with enhanced functionality:

### API Service Compatibility

The existing frontend API service will work without changes, but can be enhanced to support new features:

```typescript
// Enhanced fetchAssets function (maps to existing fetchInvestments)
export const fetchAssets = async (assetType?: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const params = assetType ? { asset_type: assetType } : {};
  const response = await apiClient.get('/investments/', { headers, params });

  // Transform backend response to frontend format (existing logic enhanced)
  return response.data.map((investment: any) => ({
    id: investment.id.toString(),
    name: investment.name,
    symbol: investment.symbol,
    assetType: investment.asset_type,
    exchange: investment.exchange,
    currency: investment.currency,
    quantity: parseFloat(investment.quantity),
    averagePurchasePrice: parseFloat(investment.average_purchase_price),
    currentPrice: parseFloat(investment.current_price),
    totalValue: parseFloat(investment.total_value),
    dailyChange: parseFloat(investment.daily_change),
    dailyChangePercent: parseFloat(investment.daily_change_percent),
    totalGainLoss: parseFloat(investment.total_gain_loss),
    totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
    chartData: investment.chart_data || [],
    lastUpdated: investment.last_updated,
    aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this asset.',
    riskLevel: investment.risk_level || 'medium',
    recommendation: investment.recommendation || 'hold',
    logoUrl: investment.logo_url,
    sector: investment.sector,
    marketCap: investment.market_cap ? parseFloat(investment.market_cap) : undefined,
    dividendYield: investment.dividend_yield ? parseFloat(investment.dividend_yield) : undefined,
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
    // Enhanced fields for different asset types
    displayUnit: investment.display_unit,
    progressPercentage: investment.progress_percentage,
    ...investment.asset_specific_fields
  })) as Asset[];
};

// Enhanced createAsset function (maps to existing createInvestment)
export const createAsset = async (assetData: CreateAssetRequest, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  // Transform frontend request to backend format
  const investmentData = {
    asset_type: assetData.assetType,
    name: assetData.name,
    symbol: assetData.symbol || '',
    exchange: assetData.exchange || '',
    currency: assetData.currency || 'INR',
    quantity: assetData.quantity,
    average_purchase_price: assetData.purchasePrice,
    purchase_date: assetData.purchaseDate,
    // Asset-specific fields (only unit is currently supported in UI)
    unit: assetData.unit,
  };

  const response = await apiClient.post('/investments/', investmentData, { headers });
  
  // Transform response back to frontend format
  const investment = response.data;
  return {
    id: investment.id.toString(),
    name: investment.name,
    symbol: investment.symbol,
    assetType: investment.asset_type,
    exchange: investment.exchange,
    currency: investment.currency,
    quantity: parseFloat(investment.quantity),
    averagePurchasePrice: parseFloat(investment.average_purchase_price),
    currentPrice: parseFloat(investment.current_price),
    totalValue: parseFloat(investment.total_value),
    totalGainLoss: parseFloat(investment.total_gain_loss),
    totalGainLossPercent: parseFloat(investment.total_gain_loss_percent),
    aiAnalysis: investment.ai_analysis || 'AI analysis will be generated for this asset.',
    riskLevel: investment.risk_level || 'medium',
    recommendation: investment.recommendation || 'hold',
    createdAt: investment.created_at,
    updatedAt: investment.updated_at,
    lastUpdated: investment.last_updated,
    displayUnit: investment.display_unit,
    progressPercentage: investment.progress_percentage,
    ...investment.asset_specific_fields
  } as Asset;
};

// New function for asset suggestions (for AddAssetModal)
export const fetchAssetSuggestions = async (query: string, assetType?: string, token?: string) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const params = { q: query };
  if (assetType) params.type = assetType;
  
  const response = await apiClient.get('/investments/asset_suggestions/', { headers, params });
  return response.data;
};
```

### Component Compatibility

The existing frontend components will work seamlessly with the enhanced backend:

1. **AddAssetModal**: Already supports the field structure needed for different asset types
2. **AssetCard Components**: Will receive enhanced data with asset-specific fields
3. **AssetTypeSelector**: Already supports the asset types that the backend will handle
4. **Investment/Asset Display**: Existing components will show enhanced data automatically

### Data Flow Integration

```
AddAssetModal (Frontend)
    ↓ (CreateAssetRequest)
Enhanced Investment API (Backend)
    ↓ (Data Enrichment via Perplexity)
Enhanced Investment Response
    ↓ (Formatted Response)
AssetCard Components (Frontend)
```

This comprehensive design provides a robust foundation for the asset backend enhancement while maintaining full compatibility with the existing frontend and ensuring seamless integration with the current UI components.