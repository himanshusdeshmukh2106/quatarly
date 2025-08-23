from rest_framework import serializers
from .models import Investment, ChartData, PriceAlert
from .exceptions import AssetValidationException, AssetValidator
from decimal import Decimal


class ChartDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartData
        fields = ['date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume', 'timestamp']


class InvestmentSerializer(serializers.ModelSerializer):
    chart_data = serializers.SerializerMethodField()
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
            'logo_url', 'sector', 'market_cap', 'growth_rate', 'pe_ratio',
            'fifty_two_week_high', 'fifty_two_week_low', 'volume', 'unit',
            'data_enriched', 'enrichment_attempted', 'enrichment_error',
            'created_at', 'updated_at', 'progress_percentage', 'display_unit',
            'asset_specific_fields'
        ]
        read_only_fields = [
            'total_value', 'daily_change', 'daily_change_percent', 
            'total_gain_loss', 'total_gain_loss_percent', 'last_updated',
            'created_at', 'updated_at', 'progress_percentage', 'display_unit',
            'data_enriched', 'enrichment_attempted', 'enrichment_error'
        ]

    def get_chart_data(self, obj):
        # Only return chart data for assets that support it
        if obj.supports_chart_data:
            chart_data = obj.historical_data.all()[:30]
            return ChartDataSerializer(chart_data, many=True).data
        return []

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
            })
        
        if obj.is_tradeable:
            specific_fields.update({
                'pe_ratio': obj.pe_ratio,
                'fifty_two_week_high': obj.fifty_two_week_high,
                'fifty_two_week_low': obj.fifty_two_week_low,
                'market_cap': obj.market_cap,
                'volume': obj.volume,
                'growth_rate': obj.growth_rate,
            })
        
        return specific_fields


class CreateInvestmentSerializer(serializers.ModelSerializer):
    # Make symbol optional for physical assets
    symbol = serializers.CharField(required=False, allow_blank=True)
    purchase_date = serializers.DateField(required=False)
    
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
        
        # Use the AssetValidator for comprehensive validation
        try:
            AssetValidator.validate_asset_type(asset_type)
            
            if asset_type in ['stock', 'etf', 'bond', 'crypto', 'mutual_fund']:
                AssetValidator.validate_tradeable_asset(data)
            elif asset_type in ['gold', 'silver', 'commodity']:
                AssetValidator.validate_physical_asset(data)
            
            # Validate currency if provided
            currency = data.get('currency')
            if currency:
                AssetValidator.validate_currency(currency)
                
        except AssetValidationException as e:
            raise serializers.ValidationError(e.message)
        
        return data

    def validate_symbol(self, value):
        # Basic symbol validation for tradeable assets
        if value:
            return value.upper()
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        asset_type = validated_data.get('asset_type', 'stock')
        symbol = validated_data.get('symbol', '')
        quantity = validated_data['quantity']
        purchase_price = validated_data['average_purchase_price']
        
        # Set default values based on asset type
        if asset_type in ['gold', 'silver'] and not validated_data.get('unit'):
            validated_data['unit'] = 'grams'
        
        # Set current_price to purchase_price initially
        validated_data['current_price'] = purchase_price
        
        # Check if investment already exists for this user (for tradeable assets with symbols)
        if symbol and asset_type in ['stock', 'etf', 'bond', 'crypto', 'mutual_fund']:
            existing_investment = Investment.objects.filter(
                user=user, 
                symbol=symbol, 
                asset_type=asset_type
            ).first()
            
            if existing_investment:
                # Update existing investment (average down/up)
                total_quantity = existing_investment.quantity + quantity
                total_cost = (existing_investment.quantity * existing_investment.average_purchase_price) + (quantity * purchase_price)
                new_average_price = total_cost / total_quantity
                
                existing_investment.quantity = total_quantity
                existing_investment.average_purchase_price = new_average_price
                existing_investment.save()
                
                return existing_investment
        
        # Create new investment
        validated_data['user'] = user
        
        # Set default name if not provided
        if not validated_data.get('name'):
            if symbol:
                validated_data['name'] = f"{symbol} {asset_type.title()}"
            else:
                validated_data['name'] = f"{asset_type.title()} Investment"
        
        # Set default exchange if not provided
        if not validated_data.get('exchange') and asset_type in ['stock', 'etf']:
            validated_data['exchange'] = 'NASDAQ'  # Default exchange
        
        return Investment.objects.create(**validated_data)


class UpdateInvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['quantity', 'average_purchase_price', 'unit']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_average_purchase_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Average purchase price must be greater than 0")
        return value


class PriceAlertSerializer(serializers.ModelSerializer):
    investment_symbol = serializers.CharField(source='investment.symbol', read_only=True)

    class Meta:
        model = PriceAlert
        fields = [
            'id', 'investment', 'investment_symbol', 'alert_type', 
            'target_value', 'is_active', 'triggered_at', 'created_at'
        ]
        read_only_fields = ['triggered_at', 'created_at']

    def validate_target_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target value must be greater than 0")
        return value


class PortfolioSummarySerializer(serializers.Serializer):
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_gain_loss = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_gain_loss_percent = serializers.DecimalField(max_digits=8, decimal_places=4)
    daily_change = serializers.DecimalField(max_digits=15, decimal_places=2)
    daily_change_percent = serializers.DecimalField(max_digits=8, decimal_places=4)
    investment_count = serializers.IntegerField()
    top_performer = serializers.CharField()
    worst_performer = serializers.CharField()

# Asset Suggestion Serializer for the frontend
class AssetSuggestionSerializer(serializers.Serializer):
    name = serializers.CharField()
    symbol = serializers.CharField(required=False, allow_blank=True)
    type = serializers.CharField()
    exchange = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    current_price = serializers.DecimalField(max_digits=15, decimal_places=4, required=False)
    currency = serializers.CharField(default='USD')


class AssetTypeStatsSerializer(serializers.Serializer):
    """Serializer for asset type statistics"""
    asset_type = serializers.CharField()
    count = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_gain_loss = serializers.DecimalField(max_digits=15, decimal_places=2)
    percentage_of_portfolio = serializers.DecimalField(max_digits=5, decimal_places=2)


class UnifiedAssetCardSerializer(serializers.ModelSerializer):
    """Optimized serializer for UnifiedAssetCard component"""
    
    # Computed fields for unified card display
    symbol = serializers.SerializerMethodField()
    currentPrice = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    aiAnalysis = serializers.CharField(source='ai_analysis')
    assetType = serializers.CharField(source='asset_type')
    totalGainLoss = serializers.DecimalField(source='total_gain_loss', max_digits=15, decimal_places=2, read_only=True)
    totalGainLossPercent = serializers.DecimalField(source='total_gain_loss_percent', max_digits=8, decimal_places=4, read_only=True)
    lastUpdated = serializers.DateTimeField(source='last_updated', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    # Conditional fields based on asset type
    exchange = serializers.SerializerMethodField()
    volume = serializers.SerializerMethodField()
    marketCap = serializers.SerializerMethodField()
    peRatio = serializers.DecimalField(source='pe_ratio', max_digits=8, decimal_places=2, read_only=True, allow_null=True)
    growthRate = serializers.DecimalField(source='growth_rate', max_digits=8, decimal_places=2, read_only=True, allow_null=True)
    
    # Physical asset fields
    unit = serializers.SerializerMethodField()
    purchasePrice = serializers.SerializerMethodField()
    currentMarketPrice = serializers.SerializerMethodField()
    manuallyUpdated = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            'id', 'name', 'assetType', 'symbol', 'currentPrice', 'currency',
            'totalValue', 'totalGainLoss', 'totalGainLossPercent',
            'aiAnalysis', 'riskLevel', 'recommendation', 'stats',
            'lastUpdated', 'createdAt', 'updatedAt',
            # Tradeable asset fields
            'quantity', 'averagePurchasePrice', 'exchange', 'volume', 
            'marketCap', 'peRatio', 'growthRate',
            # Physical asset fields
            'unit', 'purchasePrice', 'currentMarketPrice', 'manuallyUpdated'
        ]
        read_only_fields = [
            'totalValue', 'totalGainLoss', 'totalGainLossPercent',
            'lastUpdated', 'createdAt', 'updatedAt', 'stats'
        ]

    def get_symbol(self, obj):
        return obj.get_symbol_or_abbreviation()
    
    def get_currentPrice(self, obj):
        return float(obj.get_current_price())
    
    def get_stats(self, obj):
        return obj.get_stats_for_unified_card()
    
    def get_exchange(self, obj):
        return obj.exchange if obj.is_tradeable else None
    
    def get_volume(self, obj):
        return obj.volume if obj.is_tradeable else None
    
    def get_marketCap(self, obj):
        return float(obj.market_cap) if obj.market_cap else None
    
    def get_unit(self, obj):
        return obj.unit if obj.is_physical else None
    
    def get_purchasePrice(self, obj):
        return float(obj.average_purchase_price) if obj.is_physical else None
    
    def get_currentMarketPrice(self, obj):
        return float(obj.current_price) if obj.is_physical and obj.current_price > 0 else None
    
    def get_manuallyUpdated(self, obj):
        return True if obj.is_physical else False

    def to_representation(self, instance):
        """Optimize representation for unified card"""
        data = super().to_representation(instance)
        
        # Remove null fields to reduce payload size
        return {k: v for k, v in data.items() if v is not None}


class BulkInvestmentSerializer(serializers.Serializer):
    """Serializer for bulk investment operations"""
    investments = UnifiedAssetCardSerializer(many=True)
    
    def create(self, validated_data):
        investments_data = validated_data['investments']
        investments = []
        
        for investment_data in investments_data:
            investment = Investment.objects.create(
                user=self.context['request'].user,
                **investment_data
            )
            investments.append(investment)
        
        return {'investments': investments}


class AssetPerformanceSerializer(serializers.Serializer):
    """Serializer for asset performance analytics"""
    asset_type = serializers.CharField()
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_gain_loss = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_gain_loss_percent = serializers.DecimalField(max_digits=8, decimal_places=4)
    asset_count = serializers.IntegerField()
    best_performer = UnifiedAssetCardSerializer(allow_null=True)
    worst_performer = UnifiedAssetCardSerializer(allow_null=True)