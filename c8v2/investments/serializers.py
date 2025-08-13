from rest_framework import serializers
from .models import Investment, ChartData, PriceAlert
from decimal import Decimal


class ChartDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartData
        fields = ['date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume', 'timestamp']


class InvestmentSerializer(serializers.ModelSerializer):
    chart_data = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            'id', 'symbol', 'name', 'asset_type', 'exchange', 'currency',
            'quantity', 'average_purchase_price', 'current_price', 'total_value',
            'daily_change', 'daily_change_percent', 'total_gain_loss', 'total_gain_loss_percent',
            'chart_data', 'last_updated', 'ai_analysis', 'risk_level', 'recommendation',
            'logo_url', 'sector', 'market_cap', 'dividend_yield',
            'created_at', 'updated_at', 'progress_percentage'
        ]
        read_only_fields = [
            'total_value', 'daily_change', 'daily_change_percent', 
            'total_gain_loss', 'total_gain_loss_percent', 'last_updated',
            'created_at', 'updated_at', 'progress_percentage'
        ]

    def get_chart_data(self, obj):
        # Get last 30 days of chart data
        chart_data = obj.historical_data.all()[:30]
        return ChartDataSerializer(chart_data, many=True).data

    def get_progress_percentage(self, obj):
        if obj.average_purchase_price > 0:
            return float((obj.current_price - obj.average_purchase_price) / obj.average_purchase_price * 100)
        return 0.0


class CreateInvestmentSerializer(serializers.ModelSerializer):
    purchase_date = serializers.DateField(required=False)

    class Meta:
        model = Investment
        fields = ['symbol', 'quantity', 'average_purchase_price', 'purchase_date']

    def validate_symbol(self, value):
        # Basic symbol validation
        if not value or len(value) < 1:
            raise serializers.ValidationError("Symbol is required")
        return value.upper()

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_average_purchase_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Average purchase price must be greater than 0")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        symbol = validated_data['symbol']
        quantity = validated_data['quantity']
        purchase_price = validated_data['average_purchase_price']
        
        # Check if investment already exists for this user
        existing_investment = Investment.objects.filter(user=user, symbol=symbol).first()
        
        if existing_investment:
            # Update existing investment (average down/up)
            total_quantity = existing_investment.quantity + quantity
            total_cost = (existing_investment.quantity * existing_investment.average_purchase_price) + (quantity * purchase_price)
            new_average_price = total_cost / total_quantity
            
            existing_investment.quantity = total_quantity
            existing_investment.average_purchase_price = new_average_price
            existing_investment.save()
            
            return existing_investment
        else:
            # Create new investment
            # In a real implementation, you'd fetch current price and company info from an API
            investment_data = {
                'user': user,
                'symbol': symbol,
                'name': f"{symbol} Company",  # Would be fetched from API
                'quantity': quantity,
                'average_purchase_price': purchase_price,
                'current_price': purchase_price,  # Would be fetched from API
                'exchange': 'NASDAQ',  # Would be determined from symbol
                'ai_analysis': f"Initial analysis for {symbol}. Monitor performance and market trends.",
            }
            
            return Investment.objects.create(**investment_data)


class UpdateInvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['quantity', 'average_purchase_price']

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