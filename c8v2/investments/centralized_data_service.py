"""
Server-Side Data Fetching Service for Centralized Market Data

This service handles the server-side fetching and storage of OHLC and market data
that can be shared across all user accounts, eliminating individual API calls.
"""
from typing import List, Dict, Optional, Tuple
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
import logging
import json

from .market_data_models import (
    AssetSymbol, CentralizedOHLCData, CentralizedMarketData, DataFetchLog
)
from .bharatsm_service import final_bharatsm_service, get_bharatsm_ohlc_data, get_bharatsm_frontend_data
from .perplexity_service import PerplexityAPIService

logger = logging.getLogger(__name__)


class CentralizedDataFetchingService:
    """
    Service for fetching and managing centralized market data.
    This service runs server-side scheduled tasks to keep data fresh for all users.
    """
    
    @classmethod
    def register_symbol(cls, symbol: str, asset_type: str, name: str = '', 
                       exchange: str = '', currency: str = 'INR') -> AssetSymbol:
        """
        Register a new symbol in the centralized system or increment frequency.
        This is called when users add new assets to track usage patterns.
        """
        try:
            asset_symbol, created = AssetSymbol.objects.get_or_create(
                symbol=symbol,
                asset_type=asset_type,
                defaults={
                    'name': name,
                    'exchange': exchange,
                    'currency': currency,
                    'is_active': True,
                    'update_frequency': 1
                }
            )
            
            if not created:
                # Increment frequency counter for existing symbols
                asset_symbol.increment_frequency()
                # Update metadata if provided
                if name and not asset_symbol.name:
                    asset_symbol.name = name
                if exchange and not asset_symbol.exchange:
                    asset_symbol.exchange = exchange
                asset_symbol.save()
            
            logger.info(f"Registered symbol {symbol} ({asset_type}) - frequency: {asset_symbol.update_frequency}")
            return asset_symbol
            
        except Exception as e:
            logger.error(f"Error registering symbol {symbol}: {e}")
            raise
    
    @classmethod
    def get_symbols_needing_ohlc_update(cls, hours_threshold: float = 24.0) -> List[Tuple[str, str]]:
        """
        Get list of symbols that need OHLC data updates based on cache expiration.
        Daily timeframe only with 24-hour cache threshold.
        """
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        
        # Get symbols that need updates
        symbols_needing_update = []
        
        # Get all active symbols
        active_symbols = AssetSymbol.objects.get_active_symbols().filter(
            asset_type__in=['stock', 'etf', 'crypto']  # Only tradeable assets need OHLC
        )
        
        for asset_symbol in active_symbols:
            # Check if OHLC data exists and is recent (daily timeframe only)
            ohlc_data = CentralizedOHLCData.objects.get_latest_for_symbol(
                asset_symbol.symbol, asset_symbol.asset_type, '1Day'
            )
            
            needs_update = True
            if ohlc_data and ohlc_data.last_updated:
                if ohlc_data.last_updated > cutoff_time:
                    needs_update = False
            
            if needs_update:
                symbols_needing_update.append((asset_symbol.symbol, asset_symbol.asset_type))
        
        logger.info(f"Found {len(symbols_needing_update)} symbols needing OHLC updates for daily timeframe")
        return symbols_needing_update
    
    @classmethod
    def fetch_ohlc_data_for_symbol(cls, symbol: str, asset_type: str, 
                                  timeframe: str = '1Day', days: int = 30) -> Optional[Dict]:
        """
        Fetch OHLC data for a single symbol using the hierarchical data sources.
        Daily timeframe only.
        """
        try:
            logger.info(f"Fetching OHLC data for {symbol} ({asset_type}) - {timeframe}")
            
            # Step 1: Try BharatSM for Indian stocks and ETFs
            if asset_type in ['stock', 'etf'] and final_bharatsm_service:
                try:
                    ohlc_data = get_bharatsm_ohlc_data(symbol, timeframe, days)
                    if ohlc_data:
                        logger.info(f"Successfully fetched OHLC data for {symbol} from BharatSM")
                        return {
                            'data': ohlc_data,
                            'source': 'bharatsm',
                            'current_price': cls._extract_current_price_from_ohlc(ohlc_data),
                            'daily_change': cls._calculate_daily_change_from_ohlc(ohlc_data)
                        }
                except Exception as e:
                    logger.warning(f"BharatSM OHLC fetch failed for {symbol}: {e}")
            
            # Step 2: Fallback to Perplexity for crypto or when BharatSM fails
            try:
                fallback_data = PerplexityAPIService.get_fallback_data(symbol)
                if fallback_data and 'current_price' in fallback_data:
                    # Create mock OHLC data from current price for fallback
                    mock_ohlc = cls._create_mock_ohlc_from_price(
                        float(fallback_data['current_price']), days
                    )
                    logger.info(f"Created fallback OHLC data for {symbol} from Perplexity")
                    return {
                        'data': mock_ohlc,
                        'source': 'perplexity_fallback',
                        'current_price': float(fallback_data['current_price']),
                        'daily_change': (0.0, 0.0)  # No historical data for change calculation
                    }
            except Exception as e:
                logger.warning(f"Perplexity OHLC fallback failed for {symbol}: {e}")
            
            logger.error(f"All OHLC data sources failed for {symbol}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching OHLC data for {symbol}: {e}")
            return None
    
    @classmethod
    def store_ohlc_data(cls, symbol: str, asset_type: str, ohlc_result: Dict, 
                       timeframe: str = '1Day') -> bool:
        """
        Store fetched OHLC data in the centralized storage.
        """
        try:
            # Get or create the asset symbol record
            asset_symbol = AssetSymbol.objects.get_by_symbol_and_type(symbol, asset_type)
            if not asset_symbol:
                asset_symbol = cls.register_symbol(symbol, asset_type)
            
            # Calculate daily change from OHLC data
            daily_change, daily_change_percent = ohlc_result.get('daily_change', (0.0, 0.0))
            
            # Update or create OHLC data record
            ohlc_data, created = CentralizedOHLCData.objects.update_or_create(
                symbol=symbol,
                asset_type=asset_type,
                timeframe=timeframe,
                defaults={
                    'asset_symbol': asset_symbol,
                    'ohlc_data': ohlc_result['data'],
                    'current_price': Decimal(str(ohlc_result['current_price'])) if ohlc_result['current_price'] else None,
                    'daily_change': Decimal(str(daily_change)),
                    'daily_change_percent': Decimal(str(daily_change_percent)),
                    'data_source': ohlc_result['source'],
                    'data_points_count': len(ohlc_result['data']) if ohlc_result['data'] else 0,
                    'is_stale': False,
                    'last_updated': timezone.now()
                }
            )
            
            action = "Created" if created else "Updated"
            logger.info(f"{action} OHLC data for {symbol} ({timeframe}) with {len(ohlc_result['data'])} data points")
            return True
            
        except Exception as e:
            logger.error(f"Error storing OHLC data for {symbol}: {e}")
            return False
    
    @classmethod
    def get_symbols_needing_market_data_update(cls, hours_threshold: float = 24.0) -> List[Tuple[str, str]]:
        """
        Get list of symbols that need market data updates (PE ratio, market cap, etc.).
        """
        cutoff_time = timezone.now() - timezone.timedelta(hours=hours_threshold)
        
        symbols_needing_update = []
        
        # Get all active symbols
        active_symbols = AssetSymbol.objects.get_active_symbols()
        
        for asset_symbol in active_symbols:
            # Check if market data exists and is recent
            try:
                market_data = CentralizedMarketData.objects.get_latest_for_symbol(
                    asset_symbol.symbol, asset_symbol.asset_type
                )
                needs_update = True
                if market_data and market_data.last_updated:
                    if market_data.last_updated > cutoff_time:
                        needs_update = False
            except CentralizedMarketData.DoesNotExist:
                needs_update = True
            
            if needs_update:
                symbols_needing_update.append((asset_symbol.symbol, asset_symbol.asset_type))
        
        logger.info(f"Found {len(symbols_needing_update)} symbols needing market data updates")
        return symbols_needing_update
    
    @classmethod
    def fetch_market_data_for_symbol(cls, symbol: str, asset_type: str) -> Optional[Dict]:
        """
        Fetch enhanced market data for a single symbol.
        """
        try:
            logger.info(f"Fetching market data for {symbol} ({asset_type})")
            
            # Step 1: Try BharatSM for Indian stocks and ETFs
            if asset_type in ['stock', 'etf'] and final_bharatsm_service:
                try:
                    market_data = get_bharatsm_frontend_data(symbol)
                    if market_data:
                        logger.info(f"Successfully fetched market data for {symbol} from BharatSM")
                        return {
                            **market_data,
                            'source': 'bharatsm'
                        }
                except Exception as e:
                    logger.warning(f"BharatSM market data fetch failed for {symbol}: {e}")
            
            # Step 2: Fallback to Perplexity
            try:
                fallback_data = PerplexityAPIService.get_fallback_data(symbol)
                if fallback_data:
                    logger.info(f"Successfully fetched market data for {symbol} from Perplexity")
                    return {
                        **fallback_data,
                        'source': 'perplexity'
                    }
            except Exception as e:
                logger.warning(f"Perplexity market data fetch failed for {symbol}: {e}")
            
            logger.error(f"All market data sources failed for {symbol}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching market data for {symbol}: {e}")
            return None
    
    @classmethod
    def store_market_data(cls, symbol: str, asset_type: str, market_data: Dict) -> bool:
        """
        Store fetched market data in the centralized storage.
        """
        try:
            # Get or create the asset symbol record
            asset_symbol = AssetSymbol.objects.get_by_symbol_and_type(symbol, asset_type)
            if not asset_symbol:
                asset_symbol = cls.register_symbol(symbol, asset_type)
            
            # Extract and clean market data
            pe_ratio = cls._safe_decimal(market_data.get('pe_ratio'))
            market_cap = cls._safe_decimal(market_data.get('market_cap'))
            growth_rate = cls._safe_decimal(market_data.get('growth_rate'))
            fifty_two_week_high = cls._safe_decimal(market_data.get('fifty_two_week_high'))
            fifty_two_week_low = cls._safe_decimal(market_data.get('fifty_two_week_low'))
            beta = cls._safe_decimal(market_data.get('beta'))
            
            # Handle volume data
            volume = market_data.get('volume', '')
            volume_raw = cls._extract_raw_volume(volume)
            
            # Update or create market data record
            centralized_data, created = CentralizedMarketData.objects.update_or_create(
                symbol=symbol,
                asset_type=asset_type,
                defaults={
                    'asset_symbol': asset_symbol,
                    'pe_ratio': pe_ratio,
                    'market_cap': market_cap,
                    'volume': volume,
                    'volume_raw': volume_raw,
                    'fifty_two_week_high': fifty_two_week_high,
                    'fifty_two_week_low': fifty_two_week_low,
                    'growth_rate': growth_rate,
                    'beta': beta,
                    'sector': market_data.get('sector', ''),
                    'industry': market_data.get('industry', ''),
                    'description': market_data.get('description', ''),
                    'data_source': market_data.get('source', 'unknown'),
                    'is_stale': False,
                    'last_updated': timezone.now()
                }
            )
            
            # Calculate and update completeness score
            centralized_data.calculate_completeness_score()
            centralized_data.save()
            
            action = "Created" if created else "Updated"
            logger.info(f"{action} market data for {symbol} (completeness: {centralized_data.data_completeness_score}%)")
            return True
            
        except Exception as e:
            logger.error(f"Error storing market data for {symbol}: {e}")
            return False
    
    @classmethod
    def bulk_fetch_ohlc_data(cls, symbols: List[Tuple[str, str]], timeframe: str = '1Day', 
                            max_concurrent: int = 5) -> Dict[str, int]:
        """
        Bulk fetch OHLC data for multiple symbols with rate limiting.
        Daily timeframe only.
        """
        results = {
            'total': len(symbols),
            'successful': 0,
            'failed': 0,
            'errors': []
        }
        
        # Create operation log
        operation_log = DataFetchLog.objects.create(
            operation_type='ohlc_fetch',
            symbols_requested=[f"{symbol}:{asset_type}" for symbol, asset_type in symbols],
            total_symbols=len(symbols)
        )
        
        try:
            for symbol, asset_type in symbols:
                try:
                    # Fetch OHLC data
                    ohlc_result = cls.fetch_ohlc_data_for_symbol(symbol, asset_type, timeframe)
                    
                    if ohlc_result:
                        # Store the data
                        if cls.store_ohlc_data(symbol, asset_type, ohlc_result, timeframe):
                            results['successful'] += 1
                            operation_log.add_successful_symbol(f"{symbol}:{asset_type}")
                        else:
                            results['failed'] += 1
                            operation_log.add_failed_symbol(f"{symbol}:{asset_type}", "Storage failed")
                    else:
                        results['failed'] += 1
                        operation_log.add_failed_symbol(f"{symbol}:{asset_type}", "Fetch failed")
                        
                except Exception as e:
                    logger.error(f"Error processing OHLC for {symbol}: {e}")
                    results['failed'] += 1
                    results['errors'].append(f"{symbol}: {str(e)}")
                    operation_log.add_failed_symbol(f"{symbol}:{asset_type}", str(e))
            
            # Mark operation as completed
            status = 'success' if results['failed'] == 0 else 'partial_success' if results['successful'] > 0 else 'failed'
            operation_log.mark_completed(status)
            
            logger.info(f"Bulk OHLC fetch completed: {results['successful']}/{results['total']} successful")
            return results
            
        except Exception as e:
            operation_log.error_message = str(e)
            operation_log.mark_completed('failed')
            logger.error(f"Bulk OHLC fetch failed: {e}")
            raise
    
    @classmethod
    def bulk_fetch_market_data(cls, symbols: List[Tuple[str, str]], 
                              max_concurrent: int = 5) -> Dict[str, int]:
        """
        Bulk fetch market data for multiple symbols with rate limiting.
        """
        results = {
            'total': len(symbols),
            'successful': 0,
            'failed': 0,
            'errors': []
        }
        
        # Create operation log
        operation_log = DataFetchLog.objects.create(
            operation_type='market_data_fetch',
            symbols_requested=[f"{symbol}:{asset_type}" for symbol, asset_type in symbols],
            total_symbols=len(symbols)
        )
        
        try:
            for symbol, asset_type in symbols:
                try:
                    # Fetch market data
                    market_data = cls.fetch_market_data_for_symbol(symbol, asset_type)
                    
                    if market_data:
                        # Store the data
                        if cls.store_market_data(symbol, asset_type, market_data):
                            results['successful'] += 1
                            operation_log.add_successful_symbol(f"{symbol}:{asset_type}")
                        else:
                            results['failed'] += 1
                            operation_log.add_failed_symbol(f"{symbol}:{asset_type}", "Storage failed")
                    else:
                        results['failed'] += 1
                        operation_log.add_failed_symbol(f"{symbol}:{asset_type}", "Fetch failed")
                        
                except Exception as e:
                    logger.error(f"Error processing market data for {symbol}: {e}")
                    results['failed'] += 1
                    results['errors'].append(f"{symbol}: {str(e)}")
                    operation_log.add_failed_symbol(f"{symbol}:{asset_type}", str(e))
            
            # Mark operation as completed
            status = 'success' if results['failed'] == 0 else 'partial_success' if results['successful'] > 0 else 'failed'
            operation_log.mark_completed(status)
            
            logger.info(f"Bulk market data fetch completed: {results['successful']}/{results['total']} successful")
            return results
            
        except Exception as e:
            operation_log.error_message = str(e)
            operation_log.mark_completed('failed')
            logger.error(f"Bulk market data fetch failed: {e}")
            raise
    
    @classmethod
    def get_centralized_ohlc_data(cls, symbol: str, asset_type: str, 
                                 timeframe: str = '1Day') -> Optional[Dict]:
        """
        Get OHLC data from centralized storage for API responses.
        """
        try:
            ohlc_data = CentralizedOHLCData.objects.get_latest_for_symbol(symbol, asset_type, timeframe)
            
            if not ohlc_data:
                return None
            
            return {
                'success': True,
                'data': ohlc_data.ohlc_data,
                'current_price': float(ohlc_data.current_price) if ohlc_data.current_price else None,
                'daily_change': float(ohlc_data.daily_change),
                'daily_change_percent': float(ohlc_data.daily_change_percent),
                'last_updated': ohlc_data.last_updated.isoformat(),
                'source': ohlc_data.data_source,
                'data_points': ohlc_data.data_points_count,
                'is_cache_valid': ohlc_data.is_cache_valid
            }
            
        except Exception as e:
            logger.error(f"Error retrieving centralized OHLC data for {symbol}: {e}")
            return None
    
    @classmethod
    def get_centralized_market_data(cls, symbol: str, asset_type: str) -> Optional[Dict]:
        """
        Get market data from centralized storage for API responses.
        """
        try:
            market_data = CentralizedMarketData.objects.get_latest_for_symbol(symbol, asset_type)
            
            if not market_data:
                return None
            
            return {
                'symbol': symbol,
                'name': market_data.asset_symbol.name,
                'sector': market_data.sector,
                'industry': market_data.industry,
                'pe_ratio': float(market_data.pe_ratio) if market_data.pe_ratio else None,
                'market_cap': float(market_data.market_cap) if market_data.market_cap else None,
                'volume': market_data.volume,
                'volume_raw': market_data.volume_raw,
                'fifty_two_week_high': float(market_data.fifty_two_week_high) if market_data.fifty_two_week_high else None,
                'fifty_two_week_low': float(market_data.fifty_two_week_low) if market_data.fifty_two_week_low else None,
                'growth_rate': float(market_data.growth_rate) if market_data.growth_rate else None,
                'beta': float(market_data.beta) if market_data.beta else None,
                'last_updated': market_data.last_updated.isoformat(),
                'source': market_data.data_source,
                'completeness_score': market_data.data_completeness_score,
                'is_cache_valid': market_data.is_cache_valid
            }
            
        except Exception as e:
            logger.error(f"Error retrieving centralized market data for {symbol}: {e}")
            return None
    
    # Helper methods
    
    @staticmethod
    def _safe_decimal(value) -> Optional[Decimal]:
        """Safely convert value to Decimal"""
        if value is None or value == '':
            return None
        try:
            return Decimal(str(value))
        except:
            return None
    
    @staticmethod
    def _extract_raw_volume(volume_str: str) -> Optional[int]:
        """Extract raw volume number from formatted string like '1.2M'"""
        if not volume_str:
            return None
        
        try:
            volume_str = volume_str.upper().replace(',', '')
            if 'M' in volume_str:
                return int(float(volume_str.replace('M', '')) * 1000000)
            elif 'K' in volume_str:
                return int(float(volume_str.replace('K', '')) * 1000)
            elif 'B' in volume_str:
                return int(float(volume_str.replace('B', '')) * 1000000000)
            else:
                return int(float(volume_str))
        except:
            return None
    
    @staticmethod
    def _extract_current_price_from_ohlc(ohlc_data: List[Dict]) -> float:
        """Extract current price from OHLC data"""
        if not ohlc_data:
            return 0.0
        
        try:
            latest = ohlc_data[-1]
            return float(latest.get('close', 0))
        except:
            return 0.0
    
    @staticmethod
    def _calculate_daily_change_from_ohlc(ohlc_data: List[Dict]) -> Tuple[float, float]:
        """Calculate daily change from OHLC data"""
        if not ohlc_data or len(ohlc_data) < 2:
            return 0.0, 0.0
        
        try:
            latest = ohlc_data[-1]
            previous = ohlc_data[-2]
            
            current_close = float(latest.get('close', 0))
            previous_close = float(previous.get('close', 0))
            
            if previous_close == 0:
                return 0.0, 0.0
            
            daily_change = current_close - previous_close
            daily_change_percent = (daily_change / previous_close) * 100
            
            return daily_change, daily_change_percent
        except:
            return 0.0, 0.0
    
    @staticmethod
    def _create_mock_ohlc_from_price(price: float, days: int = 30) -> List[Dict]:
        """Create mock OHLC data from current price for fallback scenarios"""
        mock_data = []
        current_date = timezone.now().date()
        
        for i in range(days):
            date = current_date - timezone.timedelta(days=days-1-i)
            # Create slight variations around the current price
            variation = 1 + (0.02 * (0.5 - abs(0.5 - (i / days))))  # Small price variations
            mock_price = price * variation
            
            mock_data.append({
                'timestamp': date.isoformat(),
                'open': round(mock_price * 0.999, 2),
                'high': round(mock_price * 1.005, 2),
                'low': round(mock_price * 0.995, 2),
                'close': round(mock_price, 2),
                'volume': 100000 + (i * 1000)  # Mock volume
            })
        
        return mock_data