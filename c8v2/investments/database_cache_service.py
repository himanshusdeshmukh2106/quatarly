"""
Database Cache Service
Provides efficient methods to retrieve cached financial data from the database
with 24-hour cache validity for the new daily data cycle.
"""
import logging
from typing import Dict, List, Optional, Tuple
from django.utils import timezone
from django.db.models import Q
from decimal import Decimal

from .market_data_models import CentralizedOHLCData, CentralizedMarketData, AssetSymbol

logger = logging.getLogger(__name__)


class DatabaseCacheService:
    """Service for efficiently retrieving cached financial data from the database"""
    
    CACHE_VALIDITY_HOURS = 24  # 24-hour cache validity
    
    @classmethod
    def get_market_data(cls, symbol: str, asset_type: str) -> Optional[Dict]:
        """Get market data for a single symbol from database cache"""
        try:
            market_data = CentralizedMarketData.objects.get_latest_for_symbol(symbol, asset_type)
            
            if market_data and cls._is_data_fresh(market_data.last_updated):
                return cls._format_market_data(market_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching cached market data for {symbol}: {e}")
            return None
    
    @classmethod
    def get_ohlc_data(cls, symbol: str, asset_type: str) -> Optional[Dict]:
        """Get OHLC data for a single symbol from database cache"""
        try:
            ohlc_data = CentralizedOHLCData.objects.get_latest_for_symbol(symbol, asset_type, '1Day')
            
            if ohlc_data and cls._is_data_fresh(ohlc_data.last_updated):
                return cls._format_ohlc_data(ohlc_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching cached OHLC data for {symbol}: {e}")
            return None
    
    @classmethod
    def get_batch_market_data(cls, symbols: List[str]) -> Dict[str, Dict]:
        """Get market data for multiple symbols efficiently"""
        try:
            # Get all fresh market data for the requested symbols
            market_data_queryset = CentralizedMarketData.objects.get_batch_data(
                symbols, cls.CACHE_VALIDITY_HOURS
            )
            
            result = {}
            for market_data in market_data_queryset:
                result[market_data.symbol] = cls._format_market_data(market_data)
            
            logger.info(f"Retrieved cached market data for {len(result)}/{len(symbols)} symbols")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching batch market data: {e}")
            return {}
    
    @classmethod
    def get_batch_ohlc_data(cls, symbols: List[str]) -> Dict[str, Dict]:
        """Get OHLC data for multiple symbols efficiently"""
        try:
            # Get all fresh OHLC data for the requested symbols
            ohlc_data_queryset = CentralizedOHLCData.objects.get_batch_data(
                symbols, cls.CACHE_VALIDITY_HOURS
            )
            
            result = {}
            for ohlc_data in ohlc_data_queryset:
                result[ohlc_data.symbol] = cls._format_ohlc_data(ohlc_data)
            
            logger.info(f"Retrieved cached OHLC data for {len(result)}/{len(symbols)} symbols")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching batch OHLC data: {e}")
            return {}
    
    @classmethod
    def get_portfolio_data(cls, user_symbols: List[Tuple[str, str]]) -> Dict:
        """Get complete portfolio data efficiently for given symbol-asset_type pairs"""
        try:
            symbols = [symbol for symbol, _ in user_symbols]
            
            # Get both market and OHLC data in parallel
            market_data = cls.get_batch_market_data(symbols)
            ohlc_data = cls.get_batch_ohlc_data(symbols)
            
            # Combine the data
            portfolio_data = {}
            for symbol, asset_type in user_symbols:
                if symbol in market_data or symbol in ohlc_data:
                    portfolio_data[symbol] = {
                        'market_data': market_data.get(symbol, {}),
                        'ohlc_data': ohlc_data.get(symbol, {}),
                        'asset_type': asset_type
                    }
            
            logger.info(f"Retrieved complete portfolio data for {len(portfolio_data)}/{len(user_symbols)} assets")
            return portfolio_data
            
        except Exception as e:
            logger.error(f"Error fetching portfolio data: {e}")
            return {}
    
    @classmethod
    def get_cache_status(cls) -> Dict:
        """Get status of the database cache"""
        try:
            cutoff_time = timezone.now() - timezone.timedelta(hours=cls.CACHE_VALIDITY_HOURS)
            
            fresh_market_data_count = CentralizedMarketData.objects.filter(
                last_updated__gte=cutoff_time
            ).count()
            
            fresh_ohlc_data_count = CentralizedOHLCData.objects.filter(
                last_updated__gte=cutoff_time
            ).count()
            
            total_market_data_count = CentralizedMarketData.objects.count()
            total_ohlc_data_count = CentralizedOHLCData.objects.count()
            
            return {
                'cache_validity_hours': cls.CACHE_VALIDITY_HOURS,
                'fresh_market_data': fresh_market_data_count,
                'total_market_data': total_market_data_count,
                'fresh_ohlc_data': fresh_ohlc_data_count,
                'total_ohlc_data': total_ohlc_data_count,
                'market_cache_hit_rate': (fresh_market_data_count / total_market_data_count * 100) if total_market_data_count > 0 else 0,
                'ohlc_cache_hit_rate': (fresh_ohlc_data_count / total_ohlc_data_count * 100) if total_ohlc_data_count > 0 else 0,
                'last_updated': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting cache status: {e}")
            return {}
    
    @classmethod
    def get_stale_symbols(cls) -> Tuple[List[str], List[str]]:
        """Get symbols that have stale data and need updating"""
        try:
            cutoff_time = timezone.now() - timezone.timedelta(hours=cls.CACHE_VALIDITY_HOURS)
            
            stale_market_symbols = list(CentralizedMarketData.objects.filter(
                Q(last_updated__lt=cutoff_time) | Q(last_updated__isnull=True),
                asset_symbol__is_active=True
            ).values_list('symbol', flat=True))
            
            stale_ohlc_symbols = list(CentralizedOHLCData.objects.filter(
                Q(last_updated__lt=cutoff_time) | Q(last_updated__isnull=True),
                asset_symbol__is_active=True
            ).values_list('symbol', flat=True))
            
            logger.info(f"Found {len(stale_market_symbols)} stale market symbols and {len(stale_ohlc_symbols)} stale OHLC symbols")
            return stale_market_symbols, stale_ohlc_symbols
            
        except Exception as e:
            logger.error(f"Error getting stale symbols: {e}")
            return [], []
    
    @classmethod
    def _is_data_fresh(cls, last_updated) -> bool:
        """Check if data is fresh based on 24-hour cache validity"""
        if not last_updated:
            return False
        
        hours_since_update = (timezone.now() - last_updated).total_seconds() / 3600
        return hours_since_update < cls.CACHE_VALIDITY_HOURS
    
    @classmethod
    def _format_market_data(cls, market_data: CentralizedMarketData) -> Dict:
        """Format market data object into dictionary"""
        return {
            'symbol': market_data.symbol,
            'asset_type': market_data.asset_type,
            'pe_ratio': float(market_data.pe_ratio) if market_data.pe_ratio else None,
            'market_cap': float(market_data.market_cap) if market_data.market_cap else None,
            'volume': market_data.volume,
            'volume_raw': int(market_data.volume_raw) if market_data.volume_raw else None,
            'fifty_two_week_high': float(market_data.fifty_two_week_high) if market_data.fifty_two_week_high else None,
            'fifty_two_week_low': float(market_data.fifty_two_week_low) if market_data.fifty_two_week_low else None,
            'beta': float(market_data.beta) if market_data.beta else None,
            'sector': market_data.sector,
            'industry': market_data.industry,
            'description': market_data.description,
            'data_source': f'database_cache_{market_data.data_source}',
            'last_updated': market_data.last_updated.isoformat(),
            'data_completeness_score': market_data.data_completeness_score,
            'is_stale': market_data.is_stale
        }
    
    @classmethod
    def _format_ohlc_data(cls, ohlc_data: CentralizedOHLCData) -> Dict:
        """Format OHLC data object into dictionary"""
        return {
            'symbol': ohlc_data.symbol,
            'asset_type': ohlc_data.asset_type,
            'timeframe': ohlc_data.timeframe,
            'data': ohlc_data.ohlc_data,
            'current_price': float(ohlc_data.current_price) if ohlc_data.current_price else None,
            'daily_change': float(ohlc_data.daily_change) if ohlc_data.daily_change else 0.0,
            'daily_change_percent': float(ohlc_data.daily_change_percent) if ohlc_data.daily_change_percent else 0.0,
            'data_source': f'database_cache_{ohlc_data.data_source}',
            'last_updated': ohlc_data.last_updated.isoformat(),
            'data_points_count': ohlc_data.data_points_count,
            'is_stale': ohlc_data.is_stale,
            'is_cache_valid': ohlc_data.is_cache_valid
        }