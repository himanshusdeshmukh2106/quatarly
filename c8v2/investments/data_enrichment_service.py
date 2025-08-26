import logging
from typing import Dict, Optional
from decimal import Decimal
from .models import Investment
from .perplexity_service import PerplexityAPIService, perplexity_rate_limiter
from .bharatsm_service import FinalOptimizedBharatSMService, final_bharatsm_service, get_bharatsm_frontend_data, get_bharatsm_basic_info
from .google_sheets_service import google_sheets_service
from .market_data_models import CentralizedOHLCData, CentralizedMarketData, AssetSymbol
from django.utils import timezone
import time

logger = logging.getLogger(__name__)


class DataEnrichmentService:
    """Service for enriching investment data using database-first approach with external API fallbacks"""
    
    @classmethod
    def get_cached_market_data(cls, symbol: str, asset_type: str) -> Optional[Dict]:
        """Get market data from database cache if available and not stale (24-hour cache)"""
        try:
            market_data = CentralizedMarketData.objects.filter(
                symbol=symbol,
                asset_type=asset_type
            ).first()
            
            if market_data:
                # Check if data is still fresh (24 hours)
                hours_since_update = (timezone.now() - market_data.last_updated).total_seconds() / 3600
                
                if hours_since_update < 24.0:  # 24-hour cache
                    logger.info(f"Returning cached market data for {symbol} (age: {hours_since_update:.1f}h)")
                    return {
                        'current_price': float(market_data.pe_ratio) if market_data.pe_ratio else None,  # Note: This may need adjustment based on your model
                        'volume': market_data.volume,
                        'volume_raw': int(market_data.volume_raw) if market_data.volume_raw else None,
                        'market_cap': float(market_data.market_cap) if market_data.market_cap else None,
                        'pe_ratio': float(market_data.pe_ratio) if market_data.pe_ratio else None,
                        'company_name': market_data.description,
                        'sector': market_data.sector,
                        'high_52': float(market_data.fifty_two_week_high) if market_data.fifty_two_week_high else None,
                        'low_52': float(market_data.fifty_two_week_low) if market_data.fifty_two_week_low else None,
                        'beta': float(market_data.beta) if market_data.beta else None,
                        'source': f'database_cache_{market_data.data_source}',
                        'last_updated': market_data.last_updated.isoformat()
                    }
                else:
                    logger.info(f"Cached market data for {symbol} is stale ({hours_since_update:.1f}h old)")
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching cached market data for {symbol}: {e}")
            return None
    
    @classmethod
    def get_cached_ohlc_data(cls, symbol: str, asset_type: str) -> Optional[Dict]:
        """Get OHLC data from database cache if available and not stale (24-hour cache)"""
        try:
            ohlc_data = CentralizedOHLCData.objects.filter(
                symbol=symbol,
                asset_type=asset_type,
                timeframe='1Day'
            ).first()
            
            if ohlc_data:
                # Check if data is still fresh (24 hours)
                hours_since_update = (timezone.now() - ohlc_data.last_updated).total_seconds() / 3600
                
                if hours_since_update < 24.0:  # 24-hour cache
                    logger.info(f"Returning cached OHLC data for {symbol} (age: {hours_since_update:.1f}h)")
                    return {
                        'data': ohlc_data.ohlc_data,
                        'current_price': float(ohlc_data.current_price) if ohlc_data.current_price else None,
                        'daily_change': float(ohlc_data.daily_change) if ohlc_data.daily_change else 0.0,
                        'daily_change_percent': float(ohlc_data.daily_change_percent) if ohlc_data.daily_change_percent else 0.0,
                        'source': f'database_cache_{ohlc_data.data_source}',
                        'last_updated': ohlc_data.last_updated.isoformat(),
                        'data_points': ohlc_data.data_points_count
                    }
                else:
                    logger.info(f"Cached OHLC data for {symbol} is stale ({hours_since_update:.1f}h old)")
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching cached OHLC data for {symbol}: {e}")
            return None
    
    @classmethod
    def get_basic_market_data(cls, symbol: str, asset_type: str) -> Dict:
        """Get basic market data for immediate use during asset creation
        Priority: Database Cache (24h) -> Google Sheets -> BharatSM -> Perplexity
        """
        # Step 1: Try database cache first (24-hour cache)
        cached_data = cls.get_cached_market_data(symbol, asset_type)
        if cached_data:
            return cached_data
        
        # Step 2: Try Google Sheets as primary data source
        if google_sheets_service.is_available():
            try:
                logger.info(f"Fetching basic market data for {symbol} using Google Sheets")
                sheets_data = google_sheets_service.fetch_market_data_batch([symbol], force_refresh=False)
                if sheets_data and symbol in sheets_data:
                    data = sheets_data[symbol]
                    # Convert to expected format
                    return {
                        'current_price': data.get('current_price'),
                        'volume': data.get('volume'),
                        'market_cap': data.get('market_cap'),
                        'pe_ratio': data.get('pe_ratio'),
                        'company_name': data.get('company_name'),
                        'exchange': data.get('exchange'),
                        'currency': data.get('currency', 'INR'),
                        'source': 'google_sheets'
                    }
            except Exception as e:
                logger.warning(f"Google Sheets service failed for {symbol}: {e}")
        
        # Step 3: Fallback to BharatSM for Indian stocks
        if asset_type in ['stock', 'etf'] and final_bharatsm_service:
            try:
                logger.info(f"Fetching basic market data for {symbol} using Final Optimized BharatSM (fallback)")
                bharatsm_data = get_bharatsm_basic_info(symbol)
                if bharatsm_data:
                    bharatsm_data['source'] = 'bharatsm'
                    return bharatsm_data
            except Exception as e:
                logger.warning(f"BharatSM service failed for {symbol}: {e}")
        
        # Step 4: Final fallback to Perplexity API
        if not perplexity_rate_limiter.can_make_call():
            wait_time = perplexity_rate_limiter.wait_time()
            logger.warning(f"Rate limit reached, waiting {wait_time:.2f} seconds")
            time.sleep(wait_time)
        
        try:
            logger.info(f"Fetching basic market data for {symbol} using Perplexity API (final fallback)")
            perplexity_rate_limiter.record_call()
            perplexity_data = PerplexityAPIService.get_basic_market_data(symbol, asset_type)
            if perplexity_data:
                perplexity_data['source'] = 'perplexity'
            return perplexity_data
        except Exception as e:
            logger.error(f"Failed to get basic market data for {symbol}: {e}")
            return {}
    
    @classmethod
    def enrich_investment_data(cls, investment_id: int) -> bool:
        """Enrich investment data based on asset type"""
        try:
            investment = Investment.objects.get(id=investment_id)
            
            # Check if we can make API calls
            if not perplexity_rate_limiter.can_make_call():
                wait_time = perplexity_rate_limiter.wait_time()
                logger.warning(f"Rate limit reached for investment {investment_id}, waiting {wait_time:.2f} seconds")
                time.sleep(wait_time)
            
            success = False
            
            if investment.asset_type in ['stock', 'etf']:
                success = cls.enrich_stock_data(investment)
            elif investment.asset_type == 'crypto':
                success = cls.enrich_crypto_data(investment)
            elif investment.asset_type == 'bond':
                success = cls.enrich_bond_data(investment)
            elif investment.asset_type in ['gold', 'silver']:
                success = cls.enrich_precious_metal_data(investment)
            
            # Update enrichment status
            investment.data_enriched = success
            investment.enrichment_attempted = True
            if success:
                investment.enrichment_error = None
            investment.save()
            
            return success
            
        except Investment.DoesNotExist:
            logger.error(f"Investment {investment_id} not found")
            return False
        except Exception as e:
            logger.error(f"Data enrichment failed for investment {investment_id}: {e}")
            try:
                investment = Investment.objects.get(id=investment_id)
                investment.enrichment_attempted = True
                investment.enrichment_error = str(e)
                investment.save()
            except:
                pass
            return False
    
    @classmethod
    def enrich_stock_data(cls, investment: Investment) -> bool:
        """Enrich stock/ETF data using BharatSM with Perplexity fallback"""
        if not investment.symbol:
            logger.warning(f"No symbol provided for investment {investment.id}")
            return False
        
        return cls.enrich_stock_data_with_bharatsm(investment)
    
    @classmethod
    def enrich_stock_data_with_bharatsm(cls, investment: Investment) -> bool:
        """Enrich stock/ETF data using Database Cache -> Google Sheets -> BharatSM -> Perplexity fallback"""
        if not investment.symbol:
            logger.warning(f"No symbol provided for investment {investment.id}")
            return False
        
        database_success = False
        google_sheets_success = False
        bharatsm_success = False
        fallback_success = False
        
        try:
            # Step 1: Try database cache first (24-hour cache)
            cached_data = cls.get_cached_market_data(investment.symbol, investment.asset_type)
            if cached_data:
                logger.info(f"Using cached market data for {investment.symbol}")
                
                # Update with cached data
                if cached_data.get('volume'):
                    investment.volume = cached_data['volume']
                
                if cached_data.get('market_cap'):
                    investment.market_cap = Decimal(str(cached_data['market_cap']))
                
                if cached_data.get('pe_ratio'):
                    investment.pe_ratio = Decimal(str(cached_data['pe_ratio']))
                
                if cached_data.get('current_price'):
                    investment.current_price = Decimal(str(cached_data['current_price']))
                
                if cached_data.get('sector'):
                    investment.sector = cached_data['sector']
                
                # Update investment name if available
                if cached_data.get('company_name') and (not investment.name or investment.name == investment.symbol):
                    investment.name = cached_data['company_name']
                
                # Update total value and gains
                investment.total_value = investment.current_price * investment.quantity
                investment.total_gain_loss = investment.total_value - (investment.average_purchase_price * investment.quantity)
                if investment.average_purchase_price > 0:
                    investment.total_gain_loss_percent = (investment.total_gain_loss / (investment.average_purchase_price * investment.quantity)) * 100
                
                database_success = True
                logger.info(f"Successfully used cached data for {investment.symbol}")
                return True
            
            # Step 2: Try Google Sheets if no cache available
            if google_sheets_service.is_available():
                logger.info(f"Fetching data for {investment.symbol} using Google Sheets (primary)")
                sheets_data = google_sheets_service.fetch_market_data_batch([investment.symbol], force_refresh=False)
                
                if sheets_data and investment.symbol in sheets_data:
                    data = sheets_data[investment.symbol]
                    
                    # Update with Google Sheets data
                    if data.get('volume'):
                        investment.volume = data['volume']
                    
                    if data.get('market_cap'):
                        investment.market_cap = Decimal(str(data['market_cap']))
                    
                    if data.get('pe_ratio'):
                        investment.pe_ratio = Decimal(str(data['pe_ratio']))
                    
                    if data.get('current_price'):
                        investment.current_price = Decimal(str(data['current_price']))
                    
                    if data.get('daily_change'):
                        investment.daily_change = Decimal(str(data['daily_change']))
                    
                    if data.get('daily_change_percent'):
                        investment.daily_change_percent = Decimal(str(data['daily_change_percent']))
                    
                    # Update investment name if available
                    if data.get('company_name') and (not investment.name or investment.name == investment.symbol):
                        investment.name = data['company_name']
                    
                    # Update total value and gains
                    investment.total_value = investment.current_price * investment.quantity
                    investment.total_gain_loss = investment.total_value - (investment.average_purchase_price * investment.quantity)
                    if investment.average_purchase_price > 0:
                        investment.total_gain_loss_percent = (investment.total_gain_loss / (investment.average_purchase_price * investment.quantity)) * 100
                    
                    google_sheets_success = True
                    logger.info(f"Successfully fetched Google Sheets data for {investment.symbol}")
            
            # Step 3: Try Final Optimized BharatSM as fallback for additional data
            if not database_success and not google_sheets_success and final_bharatsm_service:
                logger.info(f"Fetching frontend display data for {investment.symbol} using Final Optimized BharatSM (fallback)")
                bharatsm_data = get_bharatsm_frontend_data(investment.symbol)
                
                if bharatsm_data:
                    # Update the exact fields displayed on frontend
                    if 'volume' in bharatsm_data and bharatsm_data['volume']:
                        investment.volume = bharatsm_data['volume']  # String format like "1.2M"
                    
                    if 'market_cap' in bharatsm_data and bharatsm_data['market_cap']:
                        investment.market_cap = Decimal(str(bharatsm_data['market_cap']))
                    
                    if 'pe_ratio' in bharatsm_data and bharatsm_data['pe_ratio']:
                        investment.pe_ratio = Decimal(str(bharatsm_data['pe_ratio']))
                    
                    if 'growth_rate' in bharatsm_data and bharatsm_data['growth_rate']:
                        investment.growth_rate = Decimal(str(bharatsm_data['growth_rate']))
                    
                    # Update other fields
                    if 'sector' in bharatsm_data and bharatsm_data['sector']:
                        investment.sector = bharatsm_data['sector']
                    
                    # Update investment name if not provided or is just the symbol
                    if 'company_name' in bharatsm_data and bharatsm_data['company_name']:
                        if not investment.name or investment.name == investment.symbol:
                            investment.name = bharatsm_data['company_name']
                    
                    bharatsm_success = True
                    logger.info(f"Successfully fetched BharatSM data for {investment.symbol}")
            
            # Step 3: Final fallback to Perplexity if both Google Sheets and BharatSM failed
            if not google_sheets_success and not bharatsm_success and perplexity_rate_limiter.can_make_call():
                logger.warning(f"Both Google Sheets and BharatSM failed for {investment.symbol}, using Perplexity final fallback")
                perplexity_rate_limiter.record_call()
                fallback_data = PerplexityAPIService.get_fallback_data(investment.symbol)
                
                if fallback_data:
                    # Update with fallback data
                    if 'volume' in fallback_data and fallback_data['volume']:
                        investment.volume = fallback_data['volume']
                    
                    if 'market_cap' in fallback_data and fallback_data['market_cap']:
                        investment.market_cap = Decimal(str(fallback_data['market_cap']))
                    
                    if 'pe_ratio' in fallback_data and fallback_data['pe_ratio']:
                        investment.pe_ratio = Decimal(str(fallback_data['pe_ratio']))
                    
                    if 'growth_rate' in fallback_data and fallback_data['growth_rate']:
                        investment.growth_rate = Decimal(str(fallback_data['growth_rate']))
                    
                    if 'current_price' in fallback_data and fallback_data['current_price']:
                        investment.current_price = Decimal(str(fallback_data['current_price']))
                    
                    fallback_success = True
                    logger.info(f"Successfully fetched Perplexity fallback data for {investment.symbol}")
            
            # Save the investment if we got any data
            if database_success or google_sheets_success or bharatsm_success or fallback_success:
                if not database_success:  # Only save if data wasn't from cache
                    investment.save()
                logger.info(f"Successfully enriched stock data for {investment.symbol} (Database Cache: {database_success}, Google Sheets: {google_sheets_success}, BharatSM: {bharatsm_success}, Fallback: {fallback_success})")
                return True
            else:
                logger.warning(f"No data could be fetched for {investment.symbol}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to enrich stock data for {investment.symbol}: {e}")
            return False
    
    @classmethod
    def enrich_crypto_data(cls, investment: Investment) -> bool:
        """Enrich cryptocurrency data using Perplexity (BharatSM doesn't support crypto)"""
        if not investment.symbol:
            logger.warning(f"No symbol provided for crypto investment {investment.id}")
            return False
        
        try:
            perplexity_rate_limiter.record_call()
            data = PerplexityAPIService.get_fallback_data(investment.symbol)
            
            if not data:
                logger.warning(f"No data returned for crypto {investment.symbol}")
                return False
            
            # Update investment with fetched data
            if 'current_price' in data and data['current_price']:
                investment.current_price = Decimal(str(data['current_price']))
            
            if 'volume' in data and data['volume']:
                investment.volume = data['volume']
            
            if 'market_cap' in data and data['market_cap']:
                investment.market_cap = Decimal(str(data['market_cap']))
            
            if 'growth_rate' in data and data['growth_rate']:
                investment.growth_rate = Decimal(str(data['growth_rate']))
            
            if 'daily_change_percent' in data and data['daily_change_percent']:
                investment.daily_change_percent = Decimal(str(data['daily_change_percent']))
            
            if 'all_time_high' in data and data['all_time_high']:
                investment.fifty_two_week_high = Decimal(str(data['all_time_high']))
            
            if 'all_time_low' in data and data['all_time_low']:
                investment.fifty_two_week_low = Decimal(str(data['all_time_low']))
            
            investment.save()
            logger.info(f"Successfully enriched crypto data for {investment.symbol}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enrich crypto data for {investment.symbol}: {e}")
            return False
    
    @classmethod
    def enrich_bond_data(cls, investment: Investment) -> bool:
        """Enrich bond data"""
        if not investment.symbol:
            logger.warning(f"No symbol provided for bond investment {investment.id}")
            return False
        
        try:
            perplexity_rate_limiter.record_call()
            data = PerplexityAPIService.get_bond_data(investment.symbol)
            
            if not data:
                logger.warning(f"No data returned for bond {investment.symbol}")
                return False
            
            # Update investment with fetched data
            if 'current_price' in data and data['current_price']:
                investment.current_price = Decimal(data['current_price'])
            
            if 'current_yield' in data and data['current_yield']:
                investment.growth_rate = Decimal(data['current_yield'])  # Store yield in growth_rate field
            
            investment.save()
            logger.info(f"Successfully enriched bond data for {investment.symbol}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enrich bond data for {investment.symbol}: {e}")
            return False
    
    @classmethod
    def enrich_precious_metal_data(cls, investment: Investment) -> bool:
        """Enrich precious metal data using Perplexity (BharatSM doesn't support commodities)"""
        try:
            perplexity_rate_limiter.record_call()
            data = PerplexityAPIService.get_fallback_data(investment.symbol or investment.asset_type)
            
            if not data:
                logger.warning(f"No data returned for {investment.asset_type}")
                return False
            
            # Update current price based on unit
            if investment.unit == 'ounces' and 'price_per_ounce' in data:
                investment.current_price = Decimal(str(data['price_per_ounce']))
            elif investment.unit == 'grams' and 'price_per_gram' in data:
                investment.current_price = Decimal(str(data['price_per_gram']))
            elif 'price_per_gram' in data:  # Default to grams if unit not specified
                investment.current_price = Decimal(str(data['price_per_gram']))
                if not investment.unit:
                    investment.unit = 'grams'
            elif 'current_price' in data:
                investment.current_price = Decimal(str(data['current_price']))
            
            # Physical assets use mock data for volume/market cap in frontend
            investment.volume = 'N/A'
            investment.market_cap = None
            investment.pe_ratio = None
            
            if 'growth_rate' in data and data['growth_rate']:
                investment.growth_rate = Decimal(str(data['growth_rate']))
            
            if 'daily_change_percent' in data and data['daily_change_percent']:
                investment.daily_change_percent = Decimal(str(data['daily_change_percent']))
            
            investment.save()
            logger.info(f"Successfully enriched {investment.asset_type} data")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enrich {investment.asset_type} data: {e}")
            return False
    
    @classmethod
    def get_asset_suggestions(cls, query: str, asset_type: str = '') -> list:
        """Get asset suggestions for autocomplete"""
        if len(query) < 2:
            return []
        
        try:
            # First try local asset database for fast response
            from .asset_suggestions import AssetSuggestionService
            local_suggestions = AssetSuggestionService.get_suggestions(query, asset_type, limit=5)
            
            # If we have good local matches, return them
            if local_suggestions and any(s.get('score', 0) > 50 for s in local_suggestions):
                return local_suggestions
            
            # Otherwise, try Perplexity API for more comprehensive search
            if perplexity_rate_limiter.can_make_call():
                perplexity_rate_limiter.record_call()
                api_suggestions = PerplexityAPIService.get_asset_suggestions(query, asset_type)
                
                # Combine local and API suggestions
                all_suggestions = local_suggestions + api_suggestions
                
                # Remove duplicates and sort by relevance
                seen = set()
                unique_suggestions = []
                for suggestion in all_suggestions:
                    key = (suggestion.get('symbol', ''), suggestion.get('name', ''))
                    if key not in seen:
                        seen.add(key)
                        unique_suggestions.append(suggestion)
                
                return unique_suggestions[:10]
            else:
                # Rate limited, return local suggestions only
                return local_suggestions
            
        except Exception as e:
            logger.error(f"Failed to get asset suggestions for '{query}': {e}")
            # Fallback to local suggestions
            try:
                from .asset_suggestions import AssetSuggestionService
                return AssetSuggestionService.get_suggestions(query, asset_type, limit=5)
            except:
                return []
    
    @classmethod
    def _get_physical_asset_suggestions(cls, query: str, asset_type: str) -> list:
        """Get suggestions for physical assets"""
        suggestions = []
        
        if asset_type == 'gold' and 'gold' in query.lower():
            suggestions.extend([
                {'name': 'Gold Bars', 'symbol': '', 'type': 'gold'},
                {'name': 'Gold Coins', 'symbol': '', 'type': 'gold'},
                {'name': 'Gold Jewelry', 'symbol': '', 'type': 'gold'},
            ])
        elif asset_type == 'silver' and 'silver' in query.lower():
            suggestions.extend([
                {'name': 'Silver Bars', 'symbol': '', 'type': 'silver'},
                {'name': 'Silver Coins', 'symbol': '', 'type': 'silver'},
                {'name': 'Silver Jewelry', 'symbol': '', 'type': 'silver'},
            ])
        elif asset_type == 'commodity':
            commodity_suggestions = [
                {'name': 'Crude Oil', 'symbol': 'CL', 'type': 'commodity'},
                {'name': 'Natural Gas', 'symbol': 'NG', 'type': 'commodity'},
                {'name': 'Wheat', 'symbol': 'W', 'type': 'commodity'},
                {'name': 'Corn', 'symbol': 'C', 'type': 'commodity'},
                {'name': 'Copper', 'symbol': 'HG', 'type': 'commodity'},
            ]
            suggestions.extend([s for s in commodity_suggestions if query.lower() in s['name'].lower()])
        
        return suggestions
    
    @classmethod
    def refresh_investment_prices(cls, user=None, asset_types=None) -> list:
        """Refresh prices for multiple investments"""
        queryset = Investment.objects.all()
        
        if user:
            queryset = queryset.filter(user=user)
        
        if asset_types:
            queryset = queryset.filter(asset_type__in=asset_types)
        
        # Only refresh tradeable assets
        queryset = queryset.filter(asset_type__in=['stock', 'etf', 'crypto', 'bond'])
        
        updated_investments = []
        
        for investment in queryset:
            try:
                if cls.enrich_investment_data(investment.id):
                    updated_investments.append(investment)
                    
                # Add small delay to respect rate limits
                time.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Failed to refresh price for investment {investment.id}: {e}")
        
        logger.info(f"Refreshed prices for {len(updated_investments)} investments")
        return updated_investments
    
    @classmethod
    def bulk_enrich_investments(cls, investment_ids: list) -> Dict[str, int]:
        """Bulk enrich multiple investments"""
        results = {'success': 0, 'failed': 0}
        
        for investment_id in investment_ids:
            try:
                if cls.enrich_investment_data(investment_id):
                    results['success'] += 1
                else:
                    results['failed'] += 1
                
                # Add delay to respect rate limits
                time.sleep(0.2)
                
            except Exception as e:
                logger.error(f"Failed to enrich investment {investment_id}: {e}")
                results['failed'] += 1
        
        logger.info(f"Bulk enrichment completed: {results['success']} success, {results['failed']} failed")
        return results