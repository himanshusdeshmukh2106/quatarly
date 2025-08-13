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
    ChartDataSerializer, PriceAlertSerializer, PortfolioSummarySerializer
)
from .services import InvestmentService, MarketDataService, AIInsightsService
import logging

logger = logging.getLogger(__name__)


class InvestmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing investments"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateInvestmentSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateInvestmentSerializer
        return InvestmentSerializer
    
    def perform_create(self, serializer):
        """Create a new investment"""
        try:
            # Get company info from market data service
            symbol = serializer.validated_data['symbol']
            company_info = MarketDataService.get_company_info(symbol)
            current_price = MarketDataService.get_current_price(symbol)
            
            # Create investment with additional data
            investment = serializer.save(
                user=self.request.user,
                name=company_info.get('name', f"{symbol} Company"),
                sector=company_info.get('sector'),
                market_cap=company_info.get('market_cap'),
                dividend_yield=company_info.get('dividend_yield'),
                exchange=company_info.get('exchange', 'NASDAQ'),
                currency=company_info.get('currency', 'USD'),
                current_price=current_price or serializer.validated_data['average_purchase_price']
            )
            
            # Update chart data
            InvestmentService.update_chart_data(investment)
            
            # Generate AI analysis
            InvestmentService.generate_ai_analysis(investment)
            
        except Exception as e:
            logger.error(f"Error creating investment: {e}")
            raise
    
    def perform_update(self, serializer):
        """Update an existing investment"""
        investment = serializer.save()
        
        # Regenerate AI analysis after update
        InvestmentService.generate_ai_analysis(investment)
    
    @action(detail=False, methods=['post'])
    def refresh_prices(self, request):
        """Refresh prices for all user investments"""
        try:
            updated_investments = InvestmentService.refresh_investment_prices(user=request.user)
            serializer = InvestmentSerializer(updated_investments, many=True)
            
            return Response({
                'message': f'Updated {len(updated_investments)} investments',
                'investments': serializer.data
            })
        except Exception as e:
            logger.error(f"Error refreshing prices: {e}")
            return Response(
                {'error': 'Failed to refresh prices'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        """Get portfolio summary"""
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