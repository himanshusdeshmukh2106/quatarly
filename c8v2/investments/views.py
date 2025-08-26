from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Investment, ChartData, PriceAlert
from .serializers import (
    InvestmentSerializer, CreateInvestmentSerializer, UpdateInvestmentSerializer,
    ChartDataSerializer, PriceAlertSerializer, PortfolioSummarySerializer,
    AssetSuggestionSerializer, AssetTypeStatsSerializer
)
from .services import InvestmentService, MarketDataService, AIInsightsService
from .data_enrichment_service import DataEnrichmentService
from .database_cache_service import DatabaseCacheService
from .bharatsm_service import final_bharatsm_service, get_bharatsm_basic_info, get_bharatsm_ohlc_data
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
    def ohlc_data(self, request, pk=None):
        """Get OHLC data for line chart display from centralized storage (daily timeframe only)"""
        investment = self.get_object()
        
        # Only fetch OHLC data for tradeable assets with symbols
        if not investment.is_tradeable or not investment.symbol:
            return Response(
                {'error': 'OHLC data only available for tradeable assets with symbols'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get query parameters (timeframe forced to daily)
        timeframe = '1Day'  # Fixed to daily timeframe only
        force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
        
        try:
            # Register this symbol in centralized system (for usage tracking)
            from .centralized_data_service import CentralizedDataFetchingService
            CentralizedDataFetchingService.register_symbol(
                symbol=investment.symbol,
                asset_type=investment.asset_type,
                name=investment.name,
                exchange=investment.exchange or '',
                currency=investment.currency or 'INR'
            )
            
            # Step 1: Try database cache first (24-hour cache)
            if not force_refresh:
                cached_ohlc = DatabaseCacheService.get_ohlc_data(
                    investment.symbol, investment.asset_type
                )
                
                if cached_ohlc:
                    logger.info(f"Returning database cached OHLC data for {investment.symbol} ({timeframe})")
                    return Response({
                        'success': True,
                        'data': cached_ohlc['data'],
                        'current_price': cached_ohlc['current_price'],
                        'daily_change': cached_ohlc['daily_change'],
                        'daily_change_percent': cached_ohlc['daily_change_percent'],
                        'last_updated': cached_ohlc['last_updated'],
                        'source': cached_ohlc['data_source'],
                        'data_points': cached_ohlc['data_points_count']
                    })
            
            # Step 2: Try to get data from centralized storage
            if not force_refresh:
                centralized_data = CentralizedDataFetchingService.get_centralized_ohlc_data(
                    investment.symbol, investment.asset_type, timeframe
                )
                
                if centralized_data and centralized_data.get('is_cache_valid'):
                    logger.info(f"Returning centralized OHLC data for {investment.symbol} ({timeframe})")
                    return Response({
                        'success': True,
                        'data': centralized_data['data'],
                        'current_price': centralized_data['current_price'],
                        'daily_change': centralized_data['daily_change'],
                        'daily_change_percent': centralized_data['daily_change_percent'],
                        'last_updated': centralized_data['last_updated'],
                        'source': f"centralized_{centralized_data['source']}",
                        'data_points': centralized_data['data_points']
                    })
            
            # Step 3: If no valid cached data, trigger refresh and try again
            logger.info(f"No valid cached data for {investment.symbol}, triggering refresh")
            
            # Trigger immediate refresh for this symbol
            ohlc_result = CentralizedDataFetchingService.fetch_ohlc_data_for_symbol(
                investment.symbol, investment.asset_type, timeframe
            )
            
            if ohlc_result:
                # Store the fresh data
                CentralizedDataFetchingService.store_ohlc_data(
                    investment.symbol, investment.asset_type, ohlc_result, timeframe
                )
                
                # Update the investment record with fresh data
                investment.ohlc_data = ohlc_result['data']
                investment.ohlc_last_updated = timezone.now()
                if ohlc_result['current_price']:
                    investment.current_price = Decimal(str(ohlc_result['current_price']))
                investment.save(update_fields=['ohlc_data', 'ohlc_last_updated', 'current_price'])
                
                daily_change, daily_change_percent = ohlc_result.get('daily_change', (0.0, 0.0))
                
                return Response({
                    'success': True,
                    'data': ohlc_result['data'],
                    'current_price': ohlc_result['current_price'],
                    'daily_change': daily_change,
                    'daily_change_percent': daily_change_percent,
                    'last_updated': timezone.now().isoformat(),
                    'source': f"fresh_{ohlc_result['source']}",
                    'data_points': len(ohlc_result['data']) if ohlc_result['data'] else 0
                })
            
            # Step 4: Fallback to legacy individual fetch if centralized fails
            logger.warning(f"Centralized data fetch failed for {investment.symbol}, using legacy fallback")
            
            # Legacy fallback - fetch directly using BharatSM
            days = int(request.query_params.get('days', 30))
            ohlc_data = get_bharatsm_ohlc_data(investment.symbol, timeframe, days)
            
            if ohlc_data:
                # Store in investment model for backward compatibility
                investment.ohlc_data = ohlc_data
                investment.ohlc_last_updated = timezone.now()
                investment.save(update_fields=['ohlc_data', 'ohlc_last_updated'])
                
                return Response({
                    'success': True,
                    'data': ohlc_data,
                    'last_updated': investment.ohlc_last_updated.isoformat(),
                    'source': 'legacy_bharatsm_fallback'
                })
            else:
                return Response(
                    {'error': f'No OHLC data available for {investment.symbol}'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            logger.error(f"Error fetching OHLC data for {investment.symbol}: {e}")
            return Response(
                {'error': 'Failed to fetch OHLC data'},
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
    
    @action(detail=False, methods=['get'])
    @handle_api_errors
    def get_ohlc_data(self, request):
        """Get OHLC data for any symbol from centralized storage (daily timeframe only)"""
        symbol = request.query_params.get('symbol')
        timeframe = '1Day'  # Fixed to daily timeframe only
        asset_type = request.query_params.get('asset_type', 'stock')
        force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
        days = int(request.query_params.get('days', 30))  # Support for monthly data (30 days)
        
        if not symbol:
            return Response(
                {'error': 'Symbol parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate asset type
        AssetValidator.validate_asset_type(asset_type)
        
        try:
            # Register this symbol in centralized system (for usage tracking)
            from .centralized_data_service import CentralizedDataFetchingService
            CentralizedDataFetchingService.register_symbol(
                symbol=symbol,
                asset_type=asset_type,
                name='',  # Will be filled later if available
                exchange='',
                currency='INR'
            )
            
            # Step 1: Try to get data from centralized storage
            if not force_refresh:
                centralized_data = CentralizedDataFetchingService.get_centralized_ohlc_data(
                    symbol, asset_type, timeframe
                )
                
                if centralized_data and centralized_data.get('is_cache_valid'):
                    # Check if cached data has enough historical points for the requested days
                    cached_data = centralized_data['data']
                    if isinstance(cached_data, list) and len(cached_data) >= min(days, 5):  # At least 5 points or requested days
                        logger.info(f"Returning centralized OHLC data for {symbol} ({timeframe}) - {len(cached_data)} points")
                        return Response({
                            'success': True,
                            'data': cached_data[-days:] if len(cached_data) > days else cached_data,  # Return last 'days' points
                            'current_price': centralized_data['current_price'],
                            'daily_change': centralized_data['daily_change'],
                            'daily_change_percent': centralized_data['daily_change_percent'],
                            'last_updated': centralized_data['last_updated'],
                            'source': f"centralized_{centralized_data['source']}",
                            'data_points': min(len(cached_data), days),
                            'timeframe': timeframe,
                            'requested_days': days
                        })
            
            # Step 2: Check if user has existing investment with cached data (backward compatibility)
            user_investment = None
            if request.user.is_authenticated:
                try:
                    user_investment = Investment.objects.filter(
                        user=request.user,
                        symbol__iexact=symbol,
                        asset_type__in=['stock', 'etf', 'bond', 'crypto', 'mutual_fund']
                    ).first()
                    
                    # If user has investment data and it's recent, use it as fallback
                    if (user_investment and user_investment.ohlc_data and 
                        user_investment.ohlc_last_updated and not force_refresh):
                        
                        hours_since_update = (timezone.now() - user_investment.ohlc_last_updated).total_seconds() / 3600
                        
                        # Use cached data if less than 24 hours old (daily timeframe)
                        if hours_since_update < 24.0:
                            logger.info(f"Using user investment OHLC cache for {symbol}")
                            return Response({
                                'success': True,
                                'data': user_investment.ohlc_data,
                                'last_updated': user_investment.ohlc_last_updated.isoformat(),
                                'source': 'user_investment_cache'
                            })
                except Investment.DoesNotExist:
                    pass
            
            # Step 3: No valid cached data, trigger fresh fetch
            logger.info(f"No valid cached data for {symbol}, triggering fresh fetch for {days} days")
            
            # Trigger immediate refresh for this symbol with requested days
            ohlc_result = CentralizedDataFetchingService.fetch_ohlc_data_for_symbol(
                symbol, asset_type, timeframe, days
            )
            
            if ohlc_result:
                # Store the fresh data in centralized storage
                CentralizedDataFetchingService.store_ohlc_data(
                    symbol, asset_type, ohlc_result, timeframe
                )
                
                # Also update user investment if exists
                if user_investment:
                    user_investment.ohlc_data = ohlc_result['data']
                    user_investment.ohlc_last_updated = timezone.now()
                    if ohlc_result['current_price']:
                        user_investment.current_price = Decimal(str(ohlc_result['current_price']))
                    user_investment.save(update_fields=['ohlc_data', 'ohlc_last_updated', 'current_price'])
                    logger.info(f"Updated OHLC data in user investment {user_investment.id}")
                
                daily_change, daily_change_percent = ohlc_result.get('daily_change', (0.0, 0.0))
                
                return Response({
                    'success': True,
                    'data': ohlc_result['data'][-days:] if len(ohlc_result['data']) > days else ohlc_result['data'],
                    'current_price': ohlc_result['current_price'],
                    'daily_change': daily_change,
                    'daily_change_percent': daily_change_percent,
                    'timestamp': timezone.now().isoformat(),
                    'source': f"fresh_{ohlc_result['source']}",
                    'data_points': min(len(ohlc_result['data']), days) if ohlc_result['data'] else 0,
                    'timeframe': timeframe,
                    'requested_days': days
                })
            
            # Step 4: Fallback to legacy individual API call
            logger.warning(f"Centralized fetch failed for {symbol}, using legacy BharatSM fallback")
            
            ohlc_data = get_bharatsm_ohlc_data(symbol, timeframe, days)
            
            if ohlc_data:
                # Store in user investment if exists (backward compatibility)
                if user_investment:
                    user_investment.ohlc_data = ohlc_data
                    user_investment.ohlc_last_updated = timezone.now()
                    user_investment.save(update_fields=['ohlc_data', 'ohlc_last_updated'])
                
                return Response({
                    'success': True,
                    'data': ohlc_data[-days:] if len(ohlc_data) > days else ohlc_data,
                    'timestamp': timezone.now().isoformat(),
                    'source': 'legacy_bharatsm_fallback',
                    'data_points': min(len(ohlc_data), days) if ohlc_data else 0,
                    'timeframe': timeframe,
                    'requested_days': days
                })
            else:
                return Response(
                    {'error': f'No OHLC data available for {symbol}'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            logger.error(f"Error fetching OHLC data for {symbol}: {e}")
            return Response(
                {'error': 'Failed to fetch OHLC data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    @handle_api_errors
    def enhanced_data(self, request):
        """Get enhanced asset data from centralized storage for frontend cards"""
        symbol = request.query_params.get('symbol')
        asset_type = request.query_params.get('asset_type', 'stock')
        force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
        
        if not symbol:
            return Response(
                {'error': 'Symbol parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate asset type
        AssetValidator.validate_asset_type(asset_type)
        
        try:
            # Register this symbol in centralized system (for usage tracking)
            from .centralized_data_service import CentralizedDataFetchingService
            CentralizedDataFetchingService.register_symbol(
                symbol=symbol,
                asset_type=asset_type,
                name='',
                exchange='',
                currency='INR'
            )
            
            # Step 1: Try to get data from centralized storage
            if not force_refresh:
                centralized_market_data = CentralizedDataFetchingService.get_centralized_market_data(
                    symbol, asset_type
                )
                
                if centralized_market_data and centralized_market_data.get('is_cache_valid'):
                    logger.info(f"Returning centralized market data for {symbol}")
                    
                    # Format for frontend consumption
                    response_data = {
                        'symbol': symbol,
                        'name': centralized_market_data.get('name', symbol),
                        'sector': centralized_market_data.get('sector'),
                        'industry': centralized_market_data.get('industry'),
                        'volume': centralized_market_data.get('volume'),
                        'market_cap': centralized_market_data.get('market_cap'),
                        'pe_ratio': centralized_market_data.get('pe_ratio'),
                        'growth_rate': centralized_market_data.get('growth_rate'),
                        'fifty_two_week_high': centralized_market_data.get('fifty_two_week_high'),
                        'fifty_two_week_low': centralized_market_data.get('fifty_two_week_low'),
                        'beta': centralized_market_data.get('beta'),
                        'exchange': 'NSE',  # Default for Indian stocks
                        'currency': 'INR',  # Default for Indian stocks
                        'last_updated': centralized_market_data.get('last_updated'),
                        'source': f"centralized_{centralized_market_data.get('source')}",
                        'completeness_score': centralized_market_data.get('completeness_score', 0)
                    }
                    
                    # Remove None values
                    response_data = {k: v for k, v in response_data.items() if v is not None}
                    
                    return Response(response_data)
            
            # Step 2: Check user investment for cached data (backward compatibility)
            user_investment = None
            if request.user.is_authenticated:
                try:
                    user_investment = Investment.objects.filter(
                        user=request.user,
                        symbol__iexact=symbol,
                        asset_type__in=['stock', 'etf', 'bond', 'crypto', 'mutual_fund']
                    ).first()
                    
                    # If user has enriched investment data and it's recent, use it as fallback
                    if (user_investment and user_investment.data_enriched and 
                        user_investment.enhanced_data_last_updated and not force_refresh):
                        
                        hours_since_update = (timezone.now() - user_investment.enhanced_data_last_updated).total_seconds() / 3600
                        
                        # Use cached enhanced data if less than 24 hours old
                        if hours_since_update < 24.0:
                            logger.info(f"Using user investment market data cache for {symbol}")
                            
                            response_data = {
                                'symbol': symbol,
                                'name': user_investment.name or symbol,
                                'sector': user_investment.sector,
                                'volume': user_investment.volume,
                                'market_cap': float(user_investment.market_cap) if user_investment.market_cap else None,
                                'pe_ratio': float(user_investment.pe_ratio) if user_investment.pe_ratio else None,
                                'growth_rate': float(user_investment.growth_rate) if user_investment.growth_rate is not None else None,
                                'current_price': float(user_investment.current_price) if user_investment.current_price else None,
                                'exchange': user_investment.exchange or 'NSE',
                                'currency': user_investment.currency or 'INR',
                                'last_updated': user_investment.enhanced_data_last_updated.isoformat(),
                                'source': 'user_investment_cache'
                            }
                            
                            # Remove None values
                            response_data = {k: v for k, v in response_data.items() if v is not None}
                            
                            return Response(response_data)
                            
                except Investment.DoesNotExist:
                    pass
            
            # Step 3: No valid cached data, trigger fresh fetch
            logger.info(f"No valid cached market data for {symbol}, triggering fresh fetch")
            
            # Trigger immediate refresh for this symbol
            market_data = CentralizedDataFetchingService.fetch_market_data_for_symbol(symbol, asset_type)
            
            if market_data:
                # Store the fresh data in centralized storage
                CentralizedDataFetchingService.store_market_data(symbol, asset_type, market_data)
                
                # Also update user investment if exists
                if user_investment:
                    # Update the investment with fresh data
                    if market_data.get('pe_ratio'):
                        user_investment.pe_ratio = Decimal(str(market_data['pe_ratio']))
                    if market_data.get('market_cap'):
                        user_investment.market_cap = Decimal(str(market_data['market_cap']))
                    if market_data.get('volume'):
                        user_investment.volume = market_data['volume']
                    if market_data.get('growth_rate'):
                        user_investment.growth_rate = Decimal(str(market_data['growth_rate']))
                    if market_data.get('sector'):
                        user_investment.sector = market_data['sector']
                    if market_data.get('current_price'):
                        user_investment.current_price = Decimal(str(market_data['current_price']))
                    if market_data.get('exchange'):
                        user_investment.exchange = market_data['exchange']
                    
                    user_investment.data_enriched = True
                    user_investment.enrichment_attempted = True
                    user_investment.enrichment_error = None
                    user_investment.enhanced_data_last_updated = timezone.now()
                    
                    user_investment.save(update_fields=[
                        'pe_ratio', 'market_cap', 'volume', 'growth_rate', 'sector', 
                        'current_price', 'exchange', 'data_enriched', 'enrichment_attempted', 
                        'enrichment_error', 'enhanced_data_last_updated'
                    ])
                    logger.info(f"Updated enhanced data in user investment {user_investment.id}")
                
                # Format the response for frontend consumption
                response_data = {
                    'symbol': symbol,
                    'name': market_data.get('company_name', market_data.get('name', symbol)),
                    'sector': market_data.get('sector'),
                    'industry': market_data.get('industry'),
                    'volume': market_data.get('volume'),
                    'market_cap': market_data.get('market_cap'),
                    'pe_ratio': market_data.get('pe_ratio'),
                    'growth_rate': market_data.get('growth_rate'),
                    'fifty_two_week_high': market_data.get('fifty_two_week_high'),
                    'fifty_two_week_low': market_data.get('fifty_two_week_low'),
                    'beta': market_data.get('beta'),
                    'current_price': market_data.get('current_price'),
                    'exchange': market_data.get('exchange', 'NSE'),
                    'currency': market_data.get('currency', 'INR'),
                    'timestamp': timezone.now().isoformat(),
                    'source': f"fresh_{market_data.get('source', 'unknown')}"
                }
                
                # Remove None values
                response_data = {k: v for k, v in response_data.items() if v is not None}
                
                return Response(response_data)
            
            # Step 4: Fallback to legacy API calls
            logger.warning(f"Centralized market data fetch failed for {symbol}, using legacy fallback")
            
            enhanced_data = DataEnrichmentService.get_basic_market_data(symbol, asset_type)
            
            if not enhanced_data and final_bharatsm_service:
                enhanced_data = final_bharatsm_service.get_frontend_display_data(symbol)
            
            if enhanced_data:
                # Format the response for frontend consumption
                response_data = {
                    'symbol': symbol,
                    'name': enhanced_data.get('company_name', symbol),
                    'sector': enhanced_data.get('sector'),
                    'volume': enhanced_data.get('volume'),
                    'market_cap': enhanced_data.get('market_cap'),
                    'pe_ratio': enhanced_data.get('pe_ratio'),
                    'growth_rate': enhanced_data.get('growth_rate'),
                    'current_price': enhanced_data.get('current_price'),
                    'exchange': enhanced_data.get('exchange', 'NSE'),
                    'currency': enhanced_data.get('currency', 'INR'),
                    'timestamp': timezone.now().isoformat(),
                    'source': 'legacy_api_fallback'
                }
                
                # Remove None values
                response_data = {k: v for k, v in response_data.items() if v is not None}
                
                return Response(response_data)
            else:
                return Response(
                    {'error': f'No data available for symbol {symbol}'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            logger.error(f"Error fetching enhanced data for {symbol}: {e}")
            return Response(
                {'error': f'Failed to fetch data for {symbol}'},
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
    
    @action(detail=False, methods=['get'])
    def unified_cards(self, request):
        """Get investments optimized for UnifiedAssetCard component"""
        try:
            investments = self.get_queryset().select_related().prefetch_related('historical_data')
            
            # Apply filters
            asset_type = request.query_params.get('asset_type')
            if asset_type:
                investments = investments.filter(asset_type=asset_type)
            
            # Apply sorting
            sort_by = request.query_params.get('sort_by', '-created_at')
            investments = investments.order_by(sort_by)
            
            # Limit results for performance
            limit = int(request.query_params.get('limit', 100))
            investments = investments[:limit]
            
            # Use optimized serializer
            from .serializers import UnifiedAssetCardSerializer
            serializer = UnifiedAssetCardSerializer(investments, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'count': len(serializer.data),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error fetching unified cards: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to fetch asset data',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def performance_summary(self, request):
        """Get portfolio performance summary for unified cards"""
        try:
            investments = self.get_queryset()
            
            # Calculate summary statistics
            total_value = sum(float(inv.total_value) for inv in investments)
            total_gain_loss = sum(float(inv.total_gain_loss) for inv in investments)
            total_invested = total_value - total_gain_loss
            total_gain_loss_percent = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0
            
            # Get asset type breakdown
            asset_types = {}
            for inv in investments:
                asset_type = inv.asset_type
                if asset_type not in asset_types:
                    asset_types[asset_type] = {
                        'count': 0,
                        'total_value': 0,
                        'total_gain_loss': 0,
                        'assets': []
                    }
                asset_types[asset_type]['count'] += 1
                asset_types[asset_type]['total_value'] += float(inv.total_value)
                asset_types[asset_type]['total_gain_loss'] += float(inv.total_gain_loss)
                asset_types[asset_type]['assets'].append(inv.to_unified_card_data())
            
            # Calculate percentages for each asset type
            for asset_type_data in asset_types.values():
                invested = asset_type_data['total_value'] - asset_type_data['total_gain_loss']
                asset_type_data['gain_loss_percent'] = (
                    asset_type_data['total_gain_loss'] / invested * 100
                ) if invested > 0 else 0
            
            return Response({
                'success': True,
                'data': {
                    'total_value': total_value,
                    'total_gain_loss': total_gain_loss,
                    'total_gain_loss_percent': total_gain_loss_percent,
                    'total_invested': total_invested,
                    'asset_count': len(investments),
                    'asset_types': asset_types,
                    'last_updated': timezone.now().isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Error calculating performance summary: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to calculate performance summary',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['patch'])
    def update_physical_value(self, request, pk=None):
        """Update physical asset market value"""
        try:
            investment = self.get_object()
            
            if not investment.is_physical:
                return Response({
                    'success': False,
                    'error': 'This endpoint is only for physical assets'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            new_price = request.data.get('current_price')
            if not new_price or float(new_price) <= 0:
                return Response({
                    'success': False,
                    'error': 'Valid current_price is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            investment.current_price = float(new_price)
            investment.save()
            
            from .serializers import UnifiedAssetCardSerializer
            serializer = UnifiedAssetCardSerializer(investment)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Physical asset value updated successfully'
            })
            
        except Exception as e:
            logger.error(f"Error updating physical asset value: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to update asset value',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_create_unified(self, request):
        """Bulk create investments optimized for unified cards"""
        try:
            from .serializers import BulkInvestmentSerializer
            
            serializer = BulkInvestmentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                result = serializer.save()
                
                # Return unified card data
                from .serializers import UnifiedAssetCardSerializer
                unified_serializer = UnifiedAssetCardSerializer(result['investments'], many=True)
                
                return Response({
                    'success': True,
                    'data': unified_serializer.data,
                    'count': len(result['investments']),
                    'message': f'Successfully created {len(result["investments"])} investments'
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error bulk creating investments: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create investments',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)