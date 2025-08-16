from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Investment, ChartData, PriceAlert
from .serializers import (
    InvestmentSerializer, CreateInvestmentSerializer, UpdateInvestmentSerializer,
    ChartDataSerializer, PriceAlertSerializer, PortfolioSummarySerializer,
    AssetSuggestionSerializer, AssetTypeStatsSerializer
)
from .services import InvestmentService, MarketDataService, AIInsightsService
from .data_enrichment_service import DataEnrichmentService
from .bharatsm_service import final_bharatsm_service, get_bharatsm_basic_info
try:
    from .tasks import enrich_investment_data_task, refresh_user_assets_task
    CELERY_AVAILABLE = True
except ImportError:
    # Celery not available, create dummy functions
    def enrich_investment_data_task(*args, **kwargs):
        class DummyResult:
            def delay(self, *args, **kwargs):
                return None
        return DummyResult()
    
    def refresh_user_assets_task(*args, **kwargs):
        class DummyResult:
            def delay(self, *args, **kwargs):
                return None
        return DummyResult()
    
    CELERY_AVAILABLE = False
from .exceptions import (
    AssetAPIException, DataEnrichmentException, AssetValidationException,
    AssetValidator, handle_api_errors
)
import logging

logger = logging.getLogger(__name__)


class InvestmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing investments"""
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination by default, enable for large portfolios
    
    def get_queryset(self):
        queryset = Investment.objects.filter(user=self.request.user).select_related('user')
        asset_type = self.request.query_params.get('asset_type', None)
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateInvestmentSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateInvestmentSerializer
        return InvestmentSerializer
    
    @handle_api_errors
    def perform_create(self, serializer):
        """Enhanced create method with data enrichment"""
        asset_type = serializer.validated_data['asset_type']
        
        # Validate asset type
        AssetValidator.validate_asset_type(asset_type)
        
        # Validate based on asset type
        if asset_type in ['stock', 'etf', 'crypto', 'bond', 'mutual_fund']:
            AssetValidator.validate_tradeable_asset(serializer.validated_data)
        elif asset_type in ['gold', 'silver', 'commodity']:
            AssetValidator.validate_physical_asset(serializer.validated_data)
        
        # Validate currency if provided
        currency = serializer.validated_data.get('currency')
        if currency:
            AssetValidator.validate_currency(currency)
        
        # For tradeable assets, fetch basic market data immediately
        if asset_type in ['stock', 'etf', 'crypto', 'bond']:
            symbol = serializer.validated_data.get('symbol')
            if symbol:
                try:
                    # Get basic company info using BharatSM first, then fallback
                    market_data = DataEnrichmentService.get_basic_market_data(symbol, asset_type)
                    
                    # Update serializer data with market info
                    if market_data:
                        if 'name' in market_data and market_data['name']:
                            serializer.validated_data['name'] = market_data['name']
                        if 'current_price' in market_data and market_data['current_price']:
                            serializer.validated_data['current_price'] = market_data['current_price']
                        if 'sector' in market_data and market_data['sector']:
                            serializer.validated_data['sector'] = market_data['sector']
                        if 'exchange' in market_data and market_data['exchange']:
                            serializer.validated_data['exchange'] = market_data['exchange']
                except Exception as e:
                    logger.warning(f"Failed to fetch market data for {symbol}: {e}")
                    # Continue with asset creation even if market data fetch fails
        
        # Create the investment
        investment = serializer.save()
        
        # Trigger background data enrichment for more detailed info
        if investment.is_tradeable and investment.symbol:
            try:
                enrich_investment_data_task.delay(investment.id)
            except Exception as e:
                logger.warning(f"Failed to trigger background enrichment for {investment.id}: {e}")
                # Don't fail the creation if background task fails
    
    def perform_update(self, serializer):
        """Update an existing investment"""
        investment = serializer.save()
        
        # Regenerate AI analysis after update
        InvestmentService.generate_ai_analysis(investment)
    
    @action(detail=False, methods=['post'], url_path='price-refresh')
    @handle_api_errors
    def price_refresh(self, request):
        """Refresh prices for all tradeable assets"""
        asset_types = request.data.get('asset_types', None)
        
        # Validate asset types if provided
        if asset_types:
            for asset_type in asset_types:
                AssetValidator.validate_asset_type(asset_type)
        
        updated_investments = DataEnrichmentService.refresh_investment_prices(
            user=request.user,
            asset_types=asset_types
        )
        serializer = InvestmentSerializer(updated_investments, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def chart_data(self, request, pk=None):
        """Get chart data for a specific investment"""
        investment = self.get_object()
        timeframe = request.query_params.get('timeframe', 'daily')
        
        try:
            # Update chart data if needed
            InvestmentService.update_chart_data(investment)
            
            chart_data = investment.historical_data.all()
            
            # Filter based on timeframe
            if timeframe == 'weekly':
                chart_data = chart_data.filter(
                    date__gte=timezone.now().date() - timedelta(weeks=12)
                )[::7]  # Every 7th day
            elif timeframe == 'monthly':
                chart_data = chart_data.filter(
                    date__gte=timezone.now().date() - timedelta(days=365)
                )[::30]  # Every 30th day
            else:  # daily
                chart_data = chart_data.filter(
                    date__gte=timezone.now().date() - timedelta(days=30)
                )
            
            serializer = ChartDataSerializer(chart_data, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching chart data: {e}")
            return Response(
                {'error': 'Failed to fetch chart data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def real_time_prices(self, request):
        """Get real-time prices for multiple symbols"""
        symbols = request.data.get('symbols', [])
        
        if not symbols:
            return Response(
                {'error': 'No symbols provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            price_updates = []
            for symbol in symbols:
                current_price = MarketDataService.get_current_price(symbol)
                if current_price:
                    # Get previous price for change calculation
                    investment = Investment.objects.filter(
                        user=request.user, symbol=symbol
                    ).first()
                    
                    previous_price = investment.current_price if investment else current_price
                    change = current_price - previous_price
                    change_percent = (change / previous_price * 100) if previous_price > 0 else 0
                    
                    price_updates.append({
                        'symbol': symbol,
                        'price': float(current_price),
                        'change': float(change),
                        'changePercent': float(change_percent),
                        'timestamp': timezone.now().isoformat()
                    })
            
            return Response(price_updates)
            
        except Exception as e:
            logger.error(f"Error fetching real-time prices: {e}")
            return Response(
                {'error': 'Failed to fetch real-time prices'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def portfolio_summary(self, request):
        """Get comprehensive portfolio summary"""
        try:
            summary = InvestmentService.get_portfolio_summary(request.user)
            serializer = PortfolioSummarySerializer(summary)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching portfolio summary: {e}")
            return Response(
                {'error': 'Failed to fetch portfolio summary'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    @handle_api_errors
    def enrich_data(self, request, pk=None):
        """Manually trigger data enrichment for an investment"""
        investment = self.get_object()
        
        if not investment.is_tradeable or not investment.symbol:
            raise AssetValidationException(
                'Data enrichment not available for this asset type',
                field='asset_type'
            )
        
        success = DataEnrichmentService.enrich_investment_data(investment.id)
        if not success:
            raise DataEnrichmentException('Data enrichment failed')
        
        investment.refresh_from_db()
        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    @handle_api_errors
    def asset_suggestions(self, request):
        """Get asset suggestions for the AddAssetModal"""
        query = request.query_params.get('q', '')
        asset_type = request.query_params.get('type', '')
        
        if len(query) < 2:
            return Response([])
        
        # Validate asset type if provided
        if asset_type:
            AssetValidator.validate_asset_type(asset_type)
        
        suggestions = DataEnrichmentService.get_asset_suggestions(query, asset_type)
        return Response(suggestions)
    
    @action(detail=False, methods=['get'])
    def asset_type_stats(self, request):
        """Get statistics by asset type"""
        try:
            investments = Investment.objects.filter(user=request.user)
            stats = {}
            
            for investment in investments:
                asset_type = investment.asset_type
                if asset_type not in stats:
                    stats[asset_type] = {
                        'count': 0,
                        'total_value': 0,
                        'total_gain_loss': 0
                    }
                
                stats[asset_type]['count'] += 1
                stats[asset_type]['total_value'] += float(investment.total_value)
                stats[asset_type]['total_gain_loss'] += float(investment.total_gain_loss)
            
            # Calculate percentages
            total_portfolio_value = sum(stat['total_value'] for stat in stats.values())
            
            result = []
            for asset_type, data in stats.items():
                percentage = (data['total_value'] / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
                result.append({
                    'asset_type': asset_type,
                    'count': data['count'],
                    'total_value': data['total_value'],
                    'total_gain_loss': data['total_gain_loss'],
                    'percentage_of_portfolio': round(percentage, 2)
                })
            
            return Response(result)
            
        except Exception as e:
            logger.error(f"Error getting asset type stats: {e}")
            return Response(
                {'error': 'Failed to get asset type statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def bulk_refresh(self, request):
        """Trigger bulk refresh for user's assets in background"""
        try:
            asset_types = request.data.get('asset_types', None)
            refresh_user_assets_task.delay(request.user.id, asset_types)
            
            return Response({
                'message': 'Bulk refresh started in background',
                'status': 'processing'
            })
        except Exception as e:
            logger.error(f"Error starting bulk refresh: {e}")
            return Response(
                {'error': 'Failed to start bulk refresh'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def ai_insights(self, request):
        """Get AI insights for the portfolio"""
        try:
            insights = AIInsightsService.generate_portfolio_insights(request.user)
            return Response({'insights': insights})
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return Response(
                {'error': 'Failed to generate AI insights'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def generate_image(self, request, pk=None):
        """Generate AI image for investment (placeholder)"""
        investment = self.get_object()
        
        # Placeholder implementation - in production, this would generate actual images
        investment.logo_url = f"https://logo.clearbit.com/{investment.symbol.lower()}.com"
        investment.save()
        
        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)


class PriceAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for managing price alerts"""
    serializer_class = PriceAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def check_alerts(self, request):
        """Check and trigger price alerts"""
        alerts = self.get_queryset().filter(is_active=True, triggered_at__isnull=True)
        triggered_alerts = []
        
        for alert in alerts:
            investment = alert.investment
            current_price = investment.current_price
            
            should_trigger = False
            
            if alert.alert_type == 'above' and current_price >= alert.target_value:
                should_trigger = True
            elif alert.alert_type == 'below' and current_price <= alert.target_value:
                should_trigger = True
            elif alert.alert_type == 'change_percent':
                change_percent = abs(investment.daily_change_percent)
                if change_percent >= alert.target_value:
                    should_trigger = True
            
            if should_trigger:
                alert.triggered_at = timezone.now()
                alert.is_active = False
                alert.save()
                triggered_alerts.append(alert)
        
        serializer = PriceAlertSerializer(triggered_alerts, many=True)
        return Response({
            'triggered_count': len(triggered_alerts),
            'alerts': serializer.data
        })

    @action(detail=False, methods=['get'])
    @handle_api_errors
    def portfolio_insights(self, request):
        """Get detailed portfolio insights and recommendations"""
        insights = InvestmentService.get_portfolio_insights(request.user)
        return Response(insights)
    
    @action(detail=False, methods=['get'])
    @handle_api_errors
    def asset_type_performance(self, request):
        """Get performance breakdown by asset type"""
        performance = InvestmentService.get_asset_type_performance(request.user)
        return Response(performance)
    
    @action(detail=False, methods=['get'])
    @handle_api_errors
    def market_sentiment(self, request):
        """Get market sentiment insights"""
        insights = AIInsightsService.generate_market_sentiment_insights(request.user)
        return Response({'insights': insights})
    
    @action(detail=False, methods=['get'])
    @handle_api_errors
    def diversification_analysis(self, request):
        """Get detailed diversification analysis"""
        summary = InvestmentService.get_portfolio_summary(request.user)
        
        analysis = {
            'diversification_score': summary['diversification_score'],
            'asset_allocation': summary['asset_allocation'],
            'risk_assessment': summary['risk_assessment'],
            'recommendations': []
        }
        
        # Add specific diversification recommendations
        if summary['diversification_score'] < 60:
            analysis['recommendations'].append(
                "Your portfolio needs better diversification across asset types and sectors."
            )
        
        # Check for over-concentration
        for asset_type, data in summary['asset_allocation'].items():
            if float(data['percentage']) > 50:
                analysis['recommendations'].append(
                    f"Consider reducing {asset_type} allocation ({data['percentage']:.1f}%) to improve balance."
                )
        
        return Response(analysis)