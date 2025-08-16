"""
Enhanced BharatSM Service with Perplexity fallback and FMP API for non-Indian assets.
This implementation follows the u.md documentation and implements the most efficient
data fetching for Volume, P/E Ratio, Market Cap, and Growth Rate.
Includes fallback mechanisms: BharatSM -> Perplexity -> FMP API
"""

import logging
import pandas as pd
import re
import requests
import json
from typing import Dict, Optional, List, Tuple, Union
from datetime import datetime, timedelta
import time
from functools import lru_cache
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    from Fundamentals import MoneyControl
    BHARATSM_AVAILABLE = True
except ImportError:
    logger.warning("Fundamentals library not available. BharatSM service will be disabled.")
    BHARATSM_AVAILABLE = False

try:
    from Technical import NSE
    TECHNICAL_AVAILABLE = True
except ImportError:
    logger.warning("Technical library not available. Volume data will be limited.")
    TECHNICAL_AVAILABLE = False


class FMPAPIService:
    """
    Financial Modeling Prep API service for non-Indian assets (US, crypto, etc.)
    """
    
    BASE_URL = "https://financialmodelingprep.com/api/v3"
    
    @classmethod
    def get_api_key(cls) -> Optional[str]:
        """Get FMP API key from settings"""
        return getattr(settings, 'FMP_API_KEY', None)
    
    @classmethod
    def is_available(cls) -> bool:
        """Check if FMP API is available"""
        return cls.get_api_key() is not None
    
    @classmethod
    def get_stock_data(cls, symbol: str) -> Dict:
        """Get comprehensive stock data from FMP API"""
        api_key = cls.get_api_key()
        if not api_key:
            logger.error("FMP API key not configured")
            return {}
        
        try:
            # Get company profile
            profile_url = f"{cls.BASE_URL}/profile/{symbol}?apikey={api_key}"
            profile_response = requests.get(profile_url, timeout=10)
            profile_response.raise_for_status()
            profile_data = profile_response.json()
            
            if not profile_data:
                return {}
            
            company_data = profile_data[0]
            
            # Get quote data for real-time info
            quote_url = f"{cls.BASE_URL}/quote/{symbol}?apikey={api_key}"
            quote_response = requests.get(quote_url, timeout=10)
            quote_response.raise_for_status()
            quote_data = quote_response.json()
            
            if not quote_data:
                return {}
            
            quote_info = quote_data[0]
            
            # Format volume in readable format
            volume = quote_info.get('volume', 0)
            formatted_volume = cls._format_volume_indian(volume)
            
            return {
                'volume': formatted_volume,
                'market_cap': company_data.get('mktCap'),
                'pe_ratio': quote_info.get('pe'),
                'growth_rate': None,  # Would need financial statements for this
                'company_name': company_data.get('companyName'),
                'sector': company_data.get('sector'),
                'current_price': quote_info.get('price'),
                'exchange': company_data.get('exchangeShortName'),
                'currency': company_data.get('currency', 'USD')
            }
            
        except Exception as e:
            logger.error(f"FMP API error for {symbol}: {e}")
            return {}
    
    @classmethod
    def get_crypto_data(cls, symbol: str) -> Dict:
        """Get cryptocurrency data from FMP API"""
        api_key = cls.get_api_key()
        if not api_key:
            return {}
        
        try:
            # Clean symbol and ensure proper format for crypto
            clean_symbol = symbol.upper().replace('USD', '')
            
            # Try different crypto symbol formats
            crypto_symbols = [
                f"{clean_symbol}USD",  # BTCUSD
                f"{clean_symbol}-USD", # BTC-USD
                clean_symbol           # BTC
            ]
            
            for crypto_symbol in crypto_symbols:
                try:
                    crypto_url = f"{cls.BASE_URL}/quote/{crypto_symbol}?apikey={api_key}"
                    response = requests.get(crypto_url, timeout=10)
                    response.raise_for_status()
                    data = response.json()
                    
                    if data and len(data) > 0:
                        crypto_data = data[0]
                        
                        return {
                            'volume': cls._format_volume_indian(crypto_data.get('volume', 0)),
                            'market_cap': crypto_data.get('marketCap'),
                            'pe_ratio': None,  # Not applicable for crypto
                            'growth_rate': crypto_data.get('changesPercentage'),
                            'company_name': crypto_data.get('name', f"{clean_symbol} Cryptocurrency"),
                            'current_price': crypto_data.get('price'),
                            'exchange': 'CRYPTO',
                            'currency': 'USD'
                        }
                except Exception as e:
                    logger.debug(f"Failed to fetch {crypto_symbol}: {e}")
                    continue
            
            # If all formats fail, return empty
            logger.warning(f"No crypto data found for {symbol} in any format")
            return {}
            
        except Exception as e:
            logger.error(f"FMP crypto API error for {symbol}: {e}")
            return {}
    
    @classmethod
    def search_symbol(cls, query: str) -> List[Dict]:
        """Search for symbols using FMP API"""
        api_key = cls.get_api_key()
        if not api_key:
            return []
        
        try:
            search_url = f"{cls.BASE_URL}/search?query={query}&limit=10&apikey={api_key}"
            response = requests.get(search_url, timeout=10)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"FMP search error for {query}: {e}")
            return []
    
    @classmethod
    def _format_volume_indian(cls, volume: float) -> str:
        """Format volume in Indian conventions (Cr, L, K)"""
        if volume is None or volume == 0:
            return "0"
        
        volume = float(volume)
        
        if volume >= 10_000_000:  # 1 Crore = 10 million
            return f"{volume / 10_000_000:.1f}Cr"
        elif volume >= 100_000:  # 1 Lakh = 100 thousand
            return f"{volume / 100_000:.1f}L"
        elif volume >= 1_000:
            return f"{volume / 1_000:.1f}K"
        else:
            return str(int(volume))


class PerplexityFallbackService:
    """
    Perplexity API service as fallback when BharatSM fails
    """
    
    BASE_URL = "https://api.perplexity.ai"
    
    @classmethod
    def get_api_key(cls) -> Optional[str]:
        """Get Perplexity API key from settings"""
        return getattr(settings, 'PERPLEXITY_API_KEY', None)
    
    @classmethod
    def is_available(cls) -> bool:
        """Check if Perplexity API is available"""
        return cls.get_api_key() is not None
    
    @classmethod
    def get_stock_data_fallback(cls, symbol: str) -> Dict:
        """Get stock data as fallback when BharatSM fails"""
        api_key = cls.get_api_key()
        if not api_key:
            logger.error("Perplexity API key not configured")
            return {}
        
        prompt = f"""
        Get the current financial data for Indian stock symbol {symbol}:
        - Current price in INR
        - Market capitalization in crores
        - P/E ratio
        - Trading volume (format as readable string like "1.2Cr", "5.5L", "750K")
        - Revenue growth rate (quarterly YoY percentage)
        - Company name
        - Sector
        
        Return the data in JSON format with these exact keys:
        {{
            "current_price": number,
            "market_cap": number,
            "pe_ratio": number,
            "volume": "string",
            "growth_rate": number,
            "company_name": "string",
            "sector": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def _make_api_call(cls, prompt: str) -> Dict:
        """Make API call to Perplexity"""
        api_key = cls.get_api_key()
        if not api_key:
            return {}
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'sonar',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a financial data assistant. Always return data in valid JSON format only. Do not include any explanatory text.'
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
            
            # Clean up the response to extract JSON
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            # Parse JSON from the response
            try:
                return json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Perplexity API response as JSON: {e}")
                return {}
            
        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return {}


class FinnhubAPIService:
    """
    Finnhub API service for US stock data using free tier endpoints
    """
    
    BASE_URL = "https://finnhub.io/api/v1"
    
    @classmethod
    def get_api_key(cls) -> Optional[str]:
        """Get Finnhub API key from settings"""
        return getattr(settings, 'FINNHUB_API_KEY', None)
    
    @classmethod
    def is_available(cls) -> bool:
        """Check if Finnhub API is available"""
        return cls.get_api_key() is not None
    
    @classmethod
    def get_stock_data(cls, symbol: str) -> Dict:
        """Get comprehensive stock data from Finnhub API using free tier endpoints"""
        api_key = cls.get_api_key()
        if not api_key:
            logger.error("Finnhub API key not configured")
            return {}
        
        try:
            # Import finnhub here to avoid import errors if not installed
            import finnhub
            
            # Initialize Finnhub client
            finnhub_client = finnhub.Client(api_key=api_key)
            
            # Get quote data (free tier)
            quote_data = cls.get_quote_data(finnhub_client, symbol)
            
            # Get company profile (free tier)
            profile_data = cls.get_company_profile(finnhub_client, symbol)
            
            # Get basic financials (free tier)
            financials_data = cls.get_basic_financials(finnhub_client, symbol)
            
            # Combine all data - use volume from financials, not quote
            volume_value = financials_data.get('volume', 0) or quote_data.get('volume', 0)
            
            result = {
                'volume': cls._format_volume_indian(volume_value),
                'market_cap': profile_data.get('marketCapitalization'),
                'pe_ratio': financials_data.get('pe_ratio'),
                'growth_rate': None,  # Not available in free tier
                'company_name': profile_data.get('name'),
                'sector': profile_data.get('finnhubIndustry'),
                'current_price': quote_data.get('current_price'),
                'exchange': profile_data.get('exchange'),
                'currency': profile_data.get('currency', 'USD')
            }
            
            return result
            
        except ImportError:
            logger.error("finnhub-python package not installed")
            return {}
        except Exception as e:
            logger.error(f"Finnhub API error for {symbol}: {e}")
            return {}
    
    @classmethod
    def get_quote_data(cls, finnhub_client, symbol: str) -> Dict:
        """Get quote data from Finnhub /quote endpoint (free tier)"""
        try:
            quote = finnhub_client.quote(symbol)
            
            if not quote or 'c' not in quote:
                return {}
            
            return {
                'current_price': quote.get('c'),  # Current price
                'volume': quote.get('v', 0),      # Volume (may not be available for all stocks)
                'change': quote.get('d'),         # Change
                'change_percent': quote.get('dp'), # Percent change
                'high': quote.get('h'),           # High
                'low': quote.get('l'),            # Low
                'open': quote.get('o'),           # Open
                'previous_close': quote.get('pc') # Previous close
            }
            
        except Exception as e:
            logger.error(f"Finnhub quote error for {symbol}: {e}")
            return {}
    
    @classmethod
    def get_company_profile(cls, finnhub_client, symbol: str) -> Dict:
        """Get company profile from Finnhub /stock/profile2 endpoint (free tier)"""
        try:
            profile = finnhub_client.company_profile2(symbol=symbol)
            
            if not profile:
                return {}
            
            return {
                'name': profile.get('name'),
                'country': profile.get('country'),
                'currency': profile.get('currency'),
                'exchange': profile.get('exchange'),
                'finnhubIndustry': profile.get('finnhubIndustry'),
                'ipo': profile.get('ipo'),
                'marketCapitalization': profile.get('marketCapitalization'),
                'shareOutstanding': profile.get('shareOutstanding'),
                'ticker': profile.get('ticker'),
                'weburl': profile.get('weburl'),
                'logo': profile.get('logo')
            }
            
        except Exception as e:
            logger.error(f"Finnhub profile error for {symbol}: {e}")
            return {}
    
    @classmethod
    def get_basic_financials(cls, finnhub_client, symbol: str) -> Dict:
        """Get basic financials from Finnhub /stock/metric endpoint (free tier)"""
        try:
            financials = finnhub_client.company_basic_financials(symbol, 'all')
            
            if not financials or 'metric' not in financials:
                return {}
            
            metrics = financials['metric']
            
            # Extract P/E ratio (try multiple possible keys)
            pe_ratio = None
            pe_keys = ['peBasicExclExtraTTM', 'peNormalizedAnnual', 'peTTM', 'pe']
            for key in pe_keys:
                if key in metrics and metrics[key] is not None:
                    pe_ratio = metrics[key]
                    break
            
            # Extract volume data (10-day average trading volume)
            volume = None
            volume_keys = ['10DayAverageTradingVolume', '3MonthAverageTradingVolume']
            for key in volume_keys:
                if key in metrics and metrics[key] is not None:
                    volume = metrics[key]
                    break
            
            return {
                'pe_ratio': pe_ratio,
                'volume': volume,
                '52_week_high': metrics.get('52WeekHigh'),
                '52_week_low': metrics.get('52WeekLow'),
                'beta': metrics.get('beta'),
                'market_cap': metrics.get('marketCapitalization')
            }
            
        except Exception as e:
            logger.error(f"Finnhub financials error for {symbol}: {e}")
            return {}
    
    @classmethod
    def search_symbol(cls, query: str) -> List[Dict]:
        """Search for symbols using Finnhub API (free tier)"""
        api_key = cls.get_api_key()
        if not api_key:
            return []
        
        try:
            import finnhub
            finnhub_client = finnhub.Client(api_key=api_key)
            
            search_result = finnhub_client.symbol_lookup(query)
            
            if not search_result or 'result' not in search_result:
                return []
            
            results = []
            for item in search_result['result'][:10]:  # Limit to 10 results
                results.append({
                    'symbol': item.get('symbol'),
                    'name': item.get('description'),
                    'type': item.get('type'),
                    'exchange': 'US',  # Finnhub primarily covers US stocks
                    'country': 'US'
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Finnhub search error for {query}: {e}")
            return []
    
    @classmethod
    def _format_volume_indian(cls, volume: float) -> str:
        """Format volume in Indian conventions (Cr, L, K)"""
        if volume is None or volume == 0:
            return "0"
        
        volume = float(volume)
        
        if volume >= 10_000_000:  # 1 Crore = 10 million
            return f"{volume / 10_000_000:.1f}Cr"
        elif volume >= 100_000:  # 1 Lakh = 100 thousand
            return f"{volume / 100_000:.1f}L"
        elif volume >= 1_000:
            return f"{volume / 1_000:.1f}K"
        else:
            return str(int(volume))


class FinalOptimizedBharatSMService:
    """
    Enhanced service with multiple fallback mechanisms:
    1. BharatSM (for Indian stocks)
    2. Perplexity API (fallback for Indian stocks)
    3. FMP API (for non-Indian assets: US stocks, crypto, etc.)
    
    Fetches: Volume, P/E Ratio, Market Cap, Growth Rate for UI display.
    """
    
    def __init__(self):
        # Initialize BharatSM if available
        self.bharatsm_available = BHARATSM_AVAILABLE
        if BHARATSM_AVAILABLE:
            self.mc = MoneyControl()
            self.nse = NSE() if TECHNICAL_AVAILABLE else None
        else:
            self.mc = None
            self.nse = None
        
        # Initialize fallback services
        self.perplexity_service = PerplexityFallbackService()
        self.fmp_service = FMPAPIService()
        self.finnhub_service = FinnhubAPIService()
        
        # Pre-compile regex patterns for maximum efficiency
        self.pe_patterns = [
            re.compile(r'P/E.*\(x\)', re.IGNORECASE),
            re.compile(r'P/E.*Ratio', re.IGNORECASE),
            re.compile(r'PE.*Ratio', re.IGNORECASE),
            re.compile(r'Price.*Earnings', re.IGNORECASE),
            re.compile(r'^P/E$', re.IGNORECASE)
        ]
        
        self.market_cap_patterns = [
            re.compile(r'MarketCap/Net Operating Revenue', re.IGNORECASE),
            re.compile(r'Enterprise Value', re.IGNORECASE),
            re.compile(r'Market.*Cap', re.IGNORECASE)
        ]
        
        self.revenue_patterns = [
            re.compile(r'Net Sales/Income from operations', re.IGNORECASE),
            re.compile(r'Revenue From Operations', re.IGNORECASE),
            re.compile(r'Total Income From Operations', re.IGNORECASE),
            re.compile(r'Net Sales', re.IGNORECASE),
            re.compile(r'Revenue', re.IGNORECASE),
            re.compile(r'Sales', re.IGNORECASE)
        ]
        
        # Cache for ticker lookups (5 minute expiry)
        self._ticker_cache = {}
        self._cache_expiry = {}
        self._cache_duration = 300  # 5 minutes
    
    @classmethod
    def is_available(cls) -> bool:
        """Check if any service is available"""
        return (BHARATSM_AVAILABLE or 
                PerplexityFallbackService.is_available() or 
                FMPAPIService.is_available())
    
    def _is_indian_symbol(self, symbol: str) -> bool:
        """
        Determine if a symbol is likely an Indian stock.
        Indian stocks typically have .NS, .BO suffixes or are in NSE/BSE format.
        """
        symbol_upper = symbol.upper()
        
        # Check for Indian exchange suffixes
        indian_suffixes = ['.NS', '.BO', '.NSE', '.BSE']
        if any(symbol_upper.endswith(suffix) for suffix in indian_suffixes):
            return True
        
        # Known US stock symbols (common ones)
        us_stock_patterns = [
            'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA',
            'NFLX', 'ADBE', 'CRM', 'ORCL', 'IBM', 'INTC', 'AMD', 'QCOM',
            'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'PYPL',
            'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'DHR', 'ABT',
            'KO', 'PEP', 'WMT', 'PG', 'HD', 'MCD', 'DIS', 'NKE'
        ]
        
        # If it's a known US stock, definitely not Indian
        if symbol_upper in us_stock_patterns:
            return False
        
        # Check for common Indian stock patterns
        # Most Indian stocks are 3-10 characters without dots
        if '.' not in symbol and 3 <= len(symbol) <= 10:
            # Common Indian stock symbols
            indian_patterns = [
                'TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK',
                'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT',
                'ASIANPAINT', 'MARUTI', 'BAJFINANCE', 'HCLTECH',
                'WIPRO', 'ULTRACEMCO', 'AXISBANK', 'TITAN', 'NESTLEIND',
                'HINDUNILVR', 'POWERGRID', 'NTPC', 'COALINDIA', 'ONGC',
                'TATAMOTORS', 'TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL',
                'ADANIPORTS', 'ADANIENT', 'GODREJCP', 'BRITANNIA', 'DABUR',
                'TATA', 'BAJAJ'  # Added common Indian company prefixes
            ]
            
            # If it matches known Indian stocks
            if symbol_upper in indian_patterns:
                return True
            
            # For other symbols, use heuristics
            # Indian stocks are typically shorter and don't have common US patterns
            if len(symbol) <= 6 and not symbol_upper.endswith('USD'):
                return True
        
        return False
    
    def _determine_asset_type(self, symbol: str) -> str:
        """Enhanced asset type detection with better US stock identification"""
        symbol_upper = symbol.upper()
        
        # Crypto patterns (most specific first)
        crypto_patterns = ['BTC', 'ETH', 'ADA', 'DOT', 'SOL', 'MATIC', 'DOGE', 'LTC', 'XRP', 'LINK']
        crypto_suffixes = ['USD', 'USDT', 'USDC', 'BUSD']
        
        if (any(symbol_upper.endswith(suffix) for suffix in crypto_suffixes) or
            any(symbol_upper.startswith(crypto) for crypto in crypto_patterns) or
            any(crypto in symbol_upper for crypto in crypto_patterns)):
            return 'crypto'
        
        # Enhanced US stock detection (check explicit US patterns first)
        if self._is_us_stock_symbol(symbol):
            return 'us_stock'
        
        # Indian stock detection (high confidence patterns)
        if self._is_indian_symbol(symbol):
            return 'indian_stock'
        
        # Default fallback logic
        # If symbol has dots (like BRK.A, BRK.B), likely US stock
        if '.' in symbol_upper and not any(symbol_upper.endswith(suffix) for suffix in ['.NS', '.BO', '.NSE', '.BSE']):
            return 'us_stock'
        
        # If symbol is very short (1-2 chars), likely US stock
        if len(symbol) <= 2:
            return 'us_stock'
        
        # If symbol is very long (>10 chars), likely US stock
        if len(symbol) > 10:
            return 'us_stock'
        
        # For 3-character symbols, check if they're common ETFs or US patterns
        if len(symbol) == 3:
            common_etfs = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'VEA', 'VWO', 'AGG', 'BND']
            if symbol_upper in common_etfs:
                return 'us_stock'
        
        # Default to US stock for ambiguous cases
        return 'us_stock'
    
    def _is_us_stock_symbol(self, symbol: str) -> bool:
        """Enhanced US stock symbol detection"""
        symbol_upper = symbol.upper()
        
        # Explicit US stock patterns
        us_exchanges = ['.NYSE', '.NASDAQ', '.AMEX']
        if any(symbol_upper.endswith(exchange) for exchange in us_exchanges):
            return True
        
        # Common US stock patterns
        us_patterns = [
            # Tech giants
            'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA',
            'NFLX', 'ADBE', 'CRM', 'ORCL', 'IBM', 'INTC', 'AMD', 'QCOM',
            
            # Financial
            'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'PYPL', 'BRK.A', 'BRK.B',
            
            # Healthcare & Pharma
            'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'DHR', 'ABT', 'LLY', 'BMY',
            
            # Consumer
            'KO', 'PEP', 'WMT', 'PG', 'HD', 'MCD', 'DIS', 'NKE', 'SBUX', 'TGT',
            
            # Energy & Industrial
            'XOM', 'CVX', 'GE', 'CAT', 'BA', 'MMM', 'HON', 'UPS', 'FDX',
            
            # Telecom & Media
            'VZ', 'T', 'CMCSA', 'CHTR', 'TMUS',
            
            # ETFs (common ones)
            'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'VEA', 'VWO', 'AGG', 'BND'
        ]
        
        if symbol_upper in us_patterns:
            return True
        
        # US-style patterns
        # Symbols with dots (like BRK.A, BRK.B) but not Indian exchange suffixes
        if '.' in symbol_upper and len(symbol_upper.split('.')[0]) <= 4:
            # Exclude Indian exchange suffixes
            indian_suffixes = ['.NS', '.BO', '.NSE', '.BSE']
            if not any(symbol_upper.endswith(suffix) for suffix in indian_suffixes):
                return True
        
        # Single letter symbols (common in US)
        if len(symbol) == 1:
            return True
        
        # 4+ character symbols ending with common US suffixes
        if len(symbol) >= 4:
            us_suffixes = ['INC', 'CORP', 'CO', 'LTD']
            if any(symbol_upper.endswith(suffix) for suffix in us_suffixes):
                return True
        
        return False
    
    def get_frontend_display_data(self, symbol: str) -> Dict:
        """
        Fetch the exact 4 data fields for UI display with fallback mechanisms:
        - Volume (formatted string like "1.2Cr", "5.5L", "750K")
        - Market Cap (number in actual value, not crores)
        - P/E Ratio (number, can be negative)
        - Growth Rate (percentage number)
        
        Fallback order:
        1. BharatSM (for Indian stocks)
        2. Perplexity API (fallback for Indian stocks)
        3. FMP API (for non-Indian assets)
        """
        try:
            if not symbol or not isinstance(symbol, str):
                logger.error(f"Invalid symbol provided: {symbol}")
                return {}
            
            symbol = symbol.strip().upper()
            logger.info(f"Fetching data for {symbol} with fallback mechanisms")
            
            # Determine asset type and routing
            asset_type = self._determine_asset_type(symbol)
            logger.info(f"Detected asset type for {symbol}: {asset_type}")
            
            # Route to appropriate service
            if asset_type == 'indian_stock':
                return self._get_indian_stock_data(symbol)
            elif asset_type == 'crypto':
                return self._get_crypto_data(symbol)
            else:  # us_stock or other
                return self._get_us_stock_data(symbol)
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return {}
    
    def _get_indian_stock_data(self, symbol: str) -> Dict:
        """Get Indian stock data with BharatSM -> Perplexity fallback"""
        # Try BharatSM first
        if self.bharatsm_available and self.mc:
            try:
                result = self._get_bharatsm_data(symbol)
                if self._is_valid_result(result):
                    logger.info(f"Successfully fetched {symbol} data from BharatSM")
                    return result
                else:
                    logger.warning(f"BharatSM returned incomplete data for {symbol}")
            except Exception as e:
                logger.warning(f"BharatSM failed for {symbol}: {e}")
        
        # Fallback to Perplexity
        if self.perplexity_service.is_available():
            try:
                logger.info(f"Falling back to Perplexity API for {symbol}")
                result = self.perplexity_service.get_stock_data_fallback(symbol)
                if self._is_valid_result(result):
                    logger.info(f"Successfully fetched {symbol} data from Perplexity")
                    return result
            except Exception as e:
                logger.warning(f"Perplexity fallback failed for {symbol}: {e}")
        
        # Final fallback to FMP (might work for some Indian ADRs)
        if self.fmp_service.is_available():
            try:
                logger.info(f"Final fallback to FMP API for {symbol}")
                result = self.fmp_service.get_stock_data(symbol)
                if self._is_valid_result(result):
                    logger.info(f"Successfully fetched {symbol} data from FMP")
                    return result
            except Exception as e:
                logger.warning(f"FMP fallback failed for {symbol}: {e}")
        
        logger.error(f"All fallback methods failed for Indian stock {symbol}")
        return {}
    
    def _get_crypto_data(self, symbol: str) -> Dict:
        """Get cryptocurrency data using FMP API"""
        if self.fmp_service.is_available():
            try:
                logger.info(f"Fetching crypto data for {symbol} from FMP API")
                result = self.fmp_service.get_crypto_data(symbol)
                if self._is_valid_result(result):
                    return result
            except Exception as e:
                logger.warning(f"FMP crypto API failed for {symbol}: {e}")
        
        # Fallback to Perplexity for crypto
        if self.perplexity_service.is_available():
            try:
                logger.info(f"Falling back to Perplexity for crypto {symbol}")
                # Use a crypto-specific prompt
                result = self._get_crypto_data_perplexity(symbol)
                if self._is_valid_result(result):
                    return result
            except Exception as e:
                logger.warning(f"Perplexity crypto fallback failed for {symbol}: {e}")
        
        return {}
    
    def _get_us_stock_data(self, symbol: str) -> Dict:
        """Enhanced US stock data with Finnhub primary, FMP fallback"""
        # Try Finnhub first (primary source for US stocks)
        if self.finnhub_service.is_available():
            try:
                logger.info(f"Fetching US stock data for {symbol} from Finnhub API")
                result = self.finnhub_service.get_stock_data(symbol)
                if self._is_valid_result(result):
                    logger.info(f"Successfully fetched {symbol} data from Finnhub")
                    return result
                else:
                    logger.warning(f"Finnhub returned incomplete data for {symbol}")
            except Exception as e:
                logger.warning(f"Finnhub API failed for {symbol}: {e}")
        
        # Fallback to FMP
        if self.fmp_service.is_available():
            try:
                logger.info(f"Falling back to FMP API for US stock {symbol}")
                result = self.fmp_service.get_stock_data(symbol)
                if self._is_valid_result(result):
                    logger.info(f"Successfully fetched {symbol} data from FMP")
                    return result
            except Exception as e:
                logger.warning(f"FMP API failed for {symbol}: {e}")
        
        # Final fallback to Perplexity
        if self.perplexity_service.is_available():
            try:
                logger.info(f"Final fallback to Perplexity for US stock {symbol}")
                result = self._get_us_stock_data_perplexity(symbol)
                if self._is_valid_result(result):
                    logger.info(f"Successfully fetched {symbol} data from Perplexity")
                    return result
            except Exception as e:
                logger.warning(f"Perplexity US stock fallback failed for {symbol}: {e}")
        
        logger.error(f"All fallback methods failed for US stock {symbol}")
        return {}
    
    def _get_bharatsm_data(self, symbol: str) -> Dict:
        """Get data using original BharatSM implementation"""
        # Step 1: Get ticker info with caching
        ticker_result, ticker_raw = self._get_cached_ticker(symbol)
        if not ticker_result or not ticker_raw:
            logger.warning(f"No ticker found for {symbol}")
            return {}
        
        ticker_id = ticker_result
        company_url = ticker_raw[0].get('link_src')
        
        if not company_url:
            logger.warning(f"No company URL found for {symbol}")
            return {}

        # Step 2: Fetch all required data efficiently
        ratios_df = self._get_ratios_data_safe(company_url)
        quarterly_df = self._get_quarterly_results_safe(company_url)
        mini_ratios_df = self._get_ratios_mini_statement(ticker_id)

        # Step 3: Extract data using optimized methods
        volume = self._get_volume_data_optimized(ticker_id, symbol)
        market_cap = self._extract_market_cap_final(ratios_df)
        pe_ratio = self._extract_pe_ratio_final(ratios_df)
        
        # Try mini ratios if main ratios don't have P/E
        if pe_ratio is None and mini_ratios_df is not None:
            pe_ratio = self._extract_pe_ratio_from_mini(mini_ratios_df)
        
        growth_rate = self._calculate_growth_rate_final(quarterly_df)
        
        result = {
            'volume': volume,
            'market_cap': market_cap,
            'pe_ratio': pe_ratio,
            'growth_rate': growth_rate,
            'company_name': ticker_raw[0].get('name'),
            'sector': ticker_raw[0].get('sc_sector')
        }
        
        # Validate and log results
        self._validate_and_log_results(symbol, result)
        
        return result
    
    def _get_crypto_data_perplexity(self, symbol: str) -> Dict:
        """Get crypto data using Perplexity with crypto-specific prompt"""
        prompt = f"""
        Get the current data for cryptocurrency {symbol}:
        - Current price in USD
        - Market capitalization
        - 24-hour trading volume (format as readable string like "1.2B", "500M", "750K")
        - 24-hour change percentage
        - Name
        
        Return the data in JSON format with these exact keys:
        {{
            "current_price": number,
            "market_cap": number,
            "volume": "string",
            "growth_rate": number,
            "company_name": "string",
            "pe_ratio": null
        }}
        """
        
        return self.perplexity_service._make_api_call(prompt)
    
    def _get_us_stock_data_perplexity(self, symbol: str) -> Dict:
        """Get US stock data using Perplexity"""
        prompt = f"""
        Get the current financial data for US stock symbol {symbol}:
        - Current price in USD
        - Market capitalization
        - P/E ratio
        - Trading volume (format as readable string like "1.2M", "500K")
        - Revenue growth rate (quarterly YoY percentage)
        - Company name
        - Sector
        
        Return the data in JSON format with these exact keys:
        {{
            "current_price": number,
            "market_cap": number,
            "pe_ratio": number,
            "volume": "string",
            "growth_rate": number,
            "company_name": "string",
            "sector": "string"
        }}
        """
        
        return self.perplexity_service._make_api_call(prompt)
    
    def _is_valid_result(self, result: Dict) -> bool:
        """Check if the result contains meaningful data"""
        if not result or not isinstance(result, dict):
            return False
        
        # Check if at least some key fields are present and not None/empty
        key_fields = ['volume', 'market_cap', 'pe_ratio', 'company_name']
        valid_fields = 0
        
        for field in key_fields:
            if field in result and result[field] is not None and result[field] != '':
                valid_fields += 1
        
        # Consider valid if at least 2 key fields are present
        return valid_fields >= 2
    
    def _calculate_growth_rate_final(self, quarterly_df: Optional[pd.DataFrame]) -> Optional[float]:
        """
        Calculate revenue growth rate from quarterly results.
        Returns YoY quarterly growth rate as percentage.
        """
        if quarterly_df is None or quarterly_df.empty:
            return None
        
        try:
            if len(quarterly_df.columns) < 3:  # Need at least 2 quarters for comparison
                return None
            
            # Look for revenue rows using multiple patterns
            revenue_found = False
            for pattern in self.revenue_patterns:
                matching_rows = quarterly_df[quarterly_df.iloc[:, 0].str.contains(pattern, na=False)]
                if not matching_rows.empty:
                    revenue_row = matching_rows.iloc[0]
                    
                    # Get current quarter (column 1) and same quarter last year (column 2 or 3)
                    try:
                        current_quarter = float(str(revenue_row.iloc[1]).replace(',', '').strip())
                        previous_year_quarter = float(str(revenue_row.iloc[2]).replace(',', '').strip())
                        
                        if current_quarter > 0 and previous_year_quarter > 0:
                            growth_rate = ((current_quarter - previous_year_quarter) / previous_year_quarter) * 100
                            
                            # Validate reasonable growth rate (-100% to 1000%)
                            if -100 <= growth_rate <= 1000:
                                logger.debug(f"Calculated growth rate: {growth_rate:.2f}%")
                                return round(growth_rate, 2)
                    except (ValueError, TypeError, IndexError) as e:
                        logger.debug(f"Error calculating growth rate: {e}")
                        continue
            
            return None
            
        except Exception as e:
            logger.error(f"Error calculating growth rate: {e}")
            return None
    
    def _get_cached_ticker(self, symbol: str) -> Tuple[Optional[str], Optional[List]]:
        """Get ticker info with intelligent caching."""
        cache_key = f"ticker_{symbol}"
        current_time = time.time()
        
        # Check cache
        if (cache_key in self._ticker_cache and 
            cache_key in self._cache_expiry and 
            current_time < self._cache_expiry[cache_key]):
            logger.debug(f"Using cached ticker data for {symbol}")
            return self._ticker_cache[cache_key]
        
        # Fetch fresh data
        try:
            ticker_result, ticker_raw = self.mc.get_ticker(symbol)
            self._ticker_cache[cache_key] = (ticker_result, ticker_raw)
            self._cache_expiry[cache_key] = current_time + self._cache_duration
            logger.debug(f"Cached fresh ticker data for {symbol}")
            return ticker_result, ticker_raw
        except Exception as e:
            logger.error(f"Error fetching ticker for {symbol}: {e}")
            return None, None
    
    def _get_ratios_data_safe(self, company_url: str) -> Optional[pd.DataFrame]:
        """Get ratios data following u.md documentation."""
        try:
            # Following u.md: get_complete_ratios_data with standalone statement
            df = self.mc.get_complete_ratios_data(
                company_url, 
                statement_type='standalone', 
                num_years=5
            )
            if df is not None and not df.empty:
                logger.debug(f"Ratios data fetched: shape {df.shape}")
                return df
            return None
        except Exception as e:
            logger.error(f"Error fetching ratios data: {e}")
            return None

    def _get_quarterly_results_safe(self, company_url: str) -> Optional[pd.DataFrame]:
        """Get quarterly results following u.md documentation."""
        try:
            # Following u.md: get_complete_quarterly_results with standalone statement
            df = self.mc.get_complete_quarterly_results(
                company_url, 
                statement_type='standalone', 
                num_quarters=5
            )
            if df is not None and not df.empty:
                logger.debug(f"Quarterly data fetched: shape {df.shape}")
                return df
            return None
        except Exception as e:
            logger.error(f"Error fetching quarterly results: {e}")
            return None
    
    def _get_ratios_mini_statement(self, ticker_id: str) -> Optional[pd.DataFrame]:
        """Get ratios from mini statement which might have P/E ratio."""
        try:
            # Following u.md: get_ratios_mini_statement
            df = self.mc.get_ratios_mini_statement(ticker_id, statement_type='standalone')
            if df is not None and not df.empty:
                logger.debug(f"Mini ratios data fetched: shape {df.shape}")
                return df
            return None
        except Exception as e:
            logger.debug(f"Error fetching mini ratios: {e}")
            return None

    def _extract_market_cap_final(self, ratios_df: Optional[pd.DataFrame]) -> Optional[float]:
        """
        Extract market cap using multiple methods from u.md documentation.
        Returns actual value (not in crores).
        """
        if ratios_df is None or ratios_df.empty:
            return None
        
        try:
            if len(ratios_df.columns) < 2:
                return None
            
            ratio_col = ratios_df.columns[0]
            
            # Method 1: MarketCap/Net Operating Revenue * Revenue per Share
            for pattern in self.market_cap_patterns:
                matching_rows = ratios_df[ratios_df[ratio_col].str.contains(pattern, na=False)]
                if not matching_rows.empty:
                    try:
                        value_str = str(matching_rows.iloc[0, 1]).replace(',', '').strip()
                        if value_str and value_str not in ['--', 'N/A', 'nan']:
                            value = float(value_str)
                            
                            # If it's Enterprise Value, convert from Cr to actual
                            if 'Enterprise Value' in matching_rows.iloc[0, 0]:
                                return value * 10_000_000  # Convert Cr to actual
                            
                            # If it's MarketCap/Revenue ratio, need to calculate
                            if 'MarketCap/Net Operating Revenue' in matching_rows.iloc[0, 0]:
                                # Find Revenue per Share
                                revenue_per_share_rows = ratios_df[
                                    ratios_df[ratio_col].str.contains(
                                        'Revenue from Operations/Share', case=False, na=False
                                    )
                                ]
                                if not revenue_per_share_rows.empty:
                                    revenue_per_share = float(
                                        str(revenue_per_share_rows.iloc[0, 1]).replace(',', '').strip()
                                    )
                                    # Estimate market cap
                                    estimated_market_cap = value * revenue_per_share * 1_000_000
                                    return estimated_market_cap
                            
                            return value
                    except (ValueError, TypeError) as e:
                        logger.debug(f"Error parsing market cap value: {e}")
                        continue
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting market cap: {e}")
            return None

    def _extract_pe_ratio_final(self, ratios_df: Optional[pd.DataFrame]) -> Optional[float]:
        """
        Extract P/E ratio using multiple patterns from u.md documentation.
        Handles negative P/E ratios and validates range.
        """
        if ratios_df is None or ratios_df.empty:
            return None
        
        try:
            if len(ratios_df.columns) < 2:
                return None
            
            ratio_col = ratios_df.columns[0]
            
            # Debug: Print all rows to find P/E ratio
            logger.debug(f"Looking for P/E ratio in {len(ratios_df)} rows")
            
            # Try multiple P/E patterns - look in all columns
            for i, row in ratios_df.iterrows():
                ratio_name = str(row.iloc[0]).strip()
                
                # Check if this row contains P/E ratio
                if any(pattern in ratio_name.upper() for pattern in ['P/E', 'PE RATIO', 'PRICE EARNINGS', 'PRICE/EARNINGS']):
                    pe_value = row.iloc[1]  # Get the latest value
                    logger.debug(f"Found P/E ratio in row {i}: {ratio_name} = {pe_value}")
                    
                    if pd.notna(pe_value) and str(pe_value).strip() not in ['--', 'N/A', '']:
                        try:
                            pe_str = str(pe_value).replace(',', '').strip()
                            pe_float = float(pe_str)
                            
                            # Validate reasonable P/E range (-100 to 1000)
                            if -100 <= pe_float <= 1000:
                                return pe_float
                            else:
                                logger.debug(f"P/E ratio {pe_float} outside reasonable range")
                        except (ValueError, TypeError) as e:
                            logger.debug(f"Error converting P/E ratio '{pe_value}': {e}")
                            continue
            
            # Alternative: Calculate P/E from EPS and current price if available
            eps_row = ratios_df[ratios_df[ratio_col].str.contains('Basic EPS', case=False, na=False)]
            if not eps_row.empty:
                try:
                    eps_value = float(str(eps_row.iloc[0, 1]).replace(',', '').strip())
                    # We would need current price to calculate P/E = Price/EPS
                    # For now, return None as we don't have price here
                    logger.debug(f"Found EPS: {eps_value}, but need current price for P/E calculation")
                except:
                    pass
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting P/E ratio: {e}")
            return None
    
    def _extract_pe_ratio_from_mini(self, mini_ratios_df: Optional[pd.DataFrame]) -> Optional[float]:
        """
        Extract P/E ratio from mini ratios statement.
        Based on u.md documentation showing P/E (x) in ratios mini statement.
        """
        if mini_ratios_df is None or mini_ratios_df.empty:
            return None
        
        try:
            # Look for exact P/E pattern from u.md documentation
            # Example: "P/E (x)	44.28	66.93	45.57	93.34	29.60"
            pe_patterns = [
                'P/E (x)',
                'P/E',
                'PE (x)',
                'Price/Earnings'
            ]
            
            for i, row in mini_ratios_df.iterrows():
                ratio_name = str(row.iloc[0]).strip()
                
                # Check for exact P/E patterns
                for pattern in pe_patterns:
                    if pattern in ratio_name:
                        pe_value = row.iloc[1]  # Get the latest value (first data column)
                        logger.debug(f"Found P/E in mini ratios: '{ratio_name}' = {pe_value}")
                        
                        if pd.notna(pe_value) and str(pe_value).strip() not in ['--', 'N/A', '']:
                            try:
                                pe_str = str(pe_value).replace(',', '').strip()
                                pe_float = float(pe_str)
                                
                                # Validate reasonable P/E range
                                if -100 <= pe_float <= 1000:
                                    logger.info(f"Successfully extracted P/E ratio: {pe_float}")
                                    return pe_float
                                else:
                                    logger.debug(f"P/E ratio {pe_float} outside reasonable range")
                            except (ValueError, TypeError) as e:
                                logger.debug(f"Error converting P/E value '{pe_value}': {e}")
                                continue
            
            return None
            
        except Exception as e:
            logger.debug(f"Error extracting P/E from mini ratios: {e}")
            return None
    
    def _get_volume_data_optimized(self, ticker_id: str, original_symbol: str) -> str:
        """
        Get volume data using multiple fallback methods following u.md documentation.
        IMPORTANT: Uses is_index=True for indices, futures, and options.
        """
        if not self.nse:
            logger.warning(f"Technical library not available for volume: {ticker_id}")
            return "N/A"
        
        # Determine if symbol is an index, future, or option
        is_index_symbol = self._is_index_future_or_option(original_symbol)
        
        # Try multiple methods in order of efficiency (UPDATED with new u.md methods)
        volume_methods = [
            lambda: self._get_volume_from_turnover_data(original_symbol),
            lambda: self._get_volume_from_equities_index_data(original_symbol),
            lambda: self._get_volume_from_trade_info(original_symbol),
            lambda: self._get_volume_from_equity_meta(ticker_id, original_symbol),
            lambda: self._get_volume_from_ohlc_daily(ticker_id, original_symbol, is_index_symbol),
            lambda: self._get_volume_from_ohlc_intraday(ticker_id, original_symbol, is_index_symbol)
        ]
        
        for i, method in enumerate(volume_methods):
            try:
                volume = method()
                if volume and volume != "N/A":
                    logger.debug(f"Volume method {i+1} succeeded for {ticker_id}: {volume}")
                    return volume
            except Exception as e:
                logger.debug(f"Volume method {i+1} failed for {ticker_id}: {e}")
                continue
        
        logger.warning(f"All volume methods failed for {ticker_id}")
        return "N/A"
    
    def _is_index_future_or_option(self, symbol: str) -> bool:
        """
        Determine if symbol is an index, future, or option contract.
        These require is_index=True parameter.
        """
        symbol_upper = symbol.upper()
        
        # Common index patterns
        index_patterns = [
            'NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY',
            'NIFTYNXT50', 'NIFTYIT', 'NIFTYPHARMA', 'NIFTYAUTO'
        ]
        
        # Future/Option patterns
        future_option_patterns = ['FUT', 'OPT', 'CE', 'PE']
        
        # Check if it's an index
        for pattern in index_patterns:
            if pattern in symbol_upper:
                return True
        
        # Check if it's a future or option
        for pattern in future_option_patterns:
            if pattern in symbol_upper:
                return True
        
        # Check for date patterns (futures/options often have dates)
        if re.search(r'\d{2}[A-Z]{3}\d{2,4}', symbol_upper):  # e.g., 25JAN24
            return True
        
        return False
    
    def _get_volume_from_turnover_data(self, symbol: str) -> Optional[str]:
        """Get volume from NSE turnover data (NEW METHOD from updated u.md)."""
        try:
            turnover_df = self.nse.get_nse_turnover()
            if turnover_df is not None and not turnover_df.empty:
                # Look for equity segment data
                equity_data = turnover_df[turnover_df['segment'] == 'CM']
                if not equity_data.empty:
                    # Get total volume for equity segment
                    total_volume = equity_data['volume'].iloc[0]  # Current day volume
                    if pd.notna(total_volume) and total_volume > 0:
                        logger.debug(f"Found volume from turnover data: {total_volume}")
                        return self._format_volume_indian(float(total_volume))
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from turnover data: {e}")
            return None
    
    def _get_volume_from_equities_index_data(self, symbol: str) -> Optional[str]:
        """Get volume from equities index data (NEW METHOD from updated u.md)."""
        try:
            # Try to get data from SECURITIES IN F&O index (default)
            equities_df = self.nse.get_equities_data_from_index()
            if equities_df is not None and not equities_df.empty:
                # Look for the specific symbol
                symbol_data = equities_df[equities_df['symbol'] == symbol]
                if not symbol_data.empty and 'totalTradedVolume' in symbol_data.columns:
                    volume = symbol_data['totalTradedVolume'].iloc[0]
                    if pd.notna(volume) and volume > 0:
                        logger.debug(f"Found volume from equities index data: {volume}")
                        return self._format_volume_indian(float(volume))
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from equities index data: {e}")
            return None
    
    def _get_volume_from_trade_info(self, symbol: str) -> Optional[str]:
        """Get volume from trade info data (NEW METHOD from updated u.md)."""
        try:
            trade_info = self.nse.get_trade_info(symbol)
            if trade_info is not None:
                # trade_info might be a DataFrame or dict
                if isinstance(trade_info, pd.DataFrame):
                    # Look for volume-related columns
                    volume_cols = [col for col in trade_info.columns if 'volume' in col.lower()]
                    if volume_cols:
                        volume = trade_info[volume_cols[0]].iloc[0]
                        if pd.notna(volume) and volume > 0:
                            logger.debug(f"Found volume from trade info: {volume}")
                            return self._format_volume_indian(float(volume))
                elif isinstance(trade_info, dict):
                    # Look for volume keys
                    volume_keys = [k for k in trade_info.keys() if 'volume' in k.lower()]
                    if volume_keys:
                        volume = trade_info[volume_keys[0]]
                        if volume and volume > 0:
                            logger.debug(f"Found volume from trade info dict: {volume}")
                            return self._format_volume_indian(float(volume))
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from trade info: {e}")
            return None

    def _get_volume_from_equity_meta(self, ticker_id: str, original_symbol: str) -> Optional[str]:
        """Get volume from equity metadata (Method 1 from u.md)."""
        try:
            for symbol in [original_symbol, ticker_id]:
                try:
                    meta_info = self.nse.get_nse_equity_meta_info(symbol)
                    if meta_info:
                        logger.debug(f"Meta info keys for {symbol}: {list(meta_info.keys())}")
                        # Look for volume-related keys
                        volume_keys = [k for k in meta_info.keys() if 'volume' in k.lower() or 'traded' in k.lower()]
                        if volume_keys:
                            logger.debug(f"Found volume keys: {volume_keys}")
                            for key in volume_keys:
                                try:
                                    volume = float(meta_info[key])
                                    if volume > 0:
                                        return self._format_volume_indian(volume)
                                except:
                                    continue
                except Exception as e:
                    logger.debug(f"Error with meta info for {symbol}: {e}")
                    continue
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from equity meta: {e}")
            return None
    
    def _get_volume_from_ohlc_daily(self, ticker_id: str, original_symbol: str, is_index: bool) -> Optional[str]:
        """Get volume from daily OHLC data (Method 2 from u.md)."""
        try:
            for symbol in [original_symbol, ticker_id]:
                try:
                    # CRITICAL: Use is_index=True for indices, futures, options
                    ohlc_data = self.nse.get_ohlc_data(symbol, is_index=is_index)
                    logger.debug(f"OHLC data type for {symbol}: {type(ohlc_data)}")
                    
                    # Handle both dict and DataFrame responses
                    if isinstance(ohlc_data, dict):
                        if 'volume' in ohlc_data:
                            volume = float(ohlc_data['volume'])
                            if volume > 0:
                                return self._format_volume_indian(volume)
                    elif hasattr(ohlc_data, 'empty') and not ohlc_data.empty:
                        # It's a DataFrame
                        if 'volume' in ohlc_data.columns:
                            volume = float(ohlc_data['volume'].iloc[-1])  # Get latest volume
                            if volume > 0:
                                return self._format_volume_indian(volume)
                except Exception as e:
                    logger.debug(f"Error with OHLC for {symbol}: {e}")
                    continue
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from daily OHLC: {e}")
            return None
    
    def _get_volume_from_ohlc_intraday(self, ticker_id: str, original_symbol: str, is_index: bool) -> Optional[str]:
        """Get volume from intraday OHLC data (Method 3 from u.md)."""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=1)
            
            for symbol in [original_symbol, ticker_id]:
                try:
                    # Use 1Day timeframe for efficiency, with proper is_index parameter
                    ohlc_df = self.nse.get_ohlc_from_charting(symbol, '1Day', start_date, end_date)
                    if ohlc_df is not None and not ohlc_df.empty and 'volume' in ohlc_df.columns:
                        total_volume = ohlc_df['volume'].sum()
                        if pd.notna(total_volume) and total_volume > 0:
                            return self._format_volume_indian(float(total_volume))
                except Exception:
                    continue
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from intraday OHLC: {e}")
            return None
    
    def _get_volume_from_quote_data(self, ticker_id: str, original_symbol: str) -> Optional[str]:
        """Get volume from NSE quote data (most direct method)."""
        try:
            for symbol in [original_symbol, ticker_id]:
                try:
                    # Try to get quote data directly
                    quote_data = self.nse.get_quote_data(symbol)
                    if quote_data:
                        logger.debug(f"Quote data keys for {symbol}: {list(quote_data.keys()) if isinstance(quote_data, dict) else type(quote_data)}")
                        
                        if isinstance(quote_data, dict):
                            # Look for volume-related keys
                            volume_keys = [k for k in quote_data.keys() if 'volume' in k.lower() or 'traded' in k.lower() or 'qty' in k.lower()]
                            if volume_keys:
                                logger.debug(f"Found volume keys in quote: {volume_keys}")
                                for key in volume_keys:
                                    try:
                                        volume = float(quote_data[key])
                                        if volume > 0:
                                            return self._format_volume_indian(volume)
                                    except:
                                        continue
                except Exception as e:
                    logger.debug(f"Error with quote data for {symbol}: {e}")
                    continue
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from quote data: {e}")
            return None
    
    def _get_volume_from_market_data(self, ticker_id: str, original_symbol: str) -> Optional[str]:
        """Get volume from NSE market data."""
        try:
            for symbol in [original_symbol, ticker_id]:
                try:
                    # Try to get market data
                    market_data = self.nse.get_market_data(symbol)
                    if market_data:
                        logger.debug(f"Market data type for {symbol}: {type(market_data)}")
                        
                        if isinstance(market_data, dict):
                            # Look for volume in market data
                            if 'volume' in market_data:
                                volume = float(market_data['volume'])
                                if volume > 0:
                                    return self._format_volume_indian(volume)
                        elif hasattr(market_data, 'empty') and not market_data.empty:
                            # It's a DataFrame
                            if 'volume' in market_data.columns:
                                volume = float(market_data['volume'].iloc[-1])
                                if volume > 0:
                                    return self._format_volume_indian(volume)
                except Exception as e:
                    logger.debug(f"Error with market data for {symbol}: {e}")
                    continue
            return None
        except Exception as e:
            logger.debug(f"Error getting volume from market data: {e}")
            return None
    
    def _calculate_growth_rate_final(self, quarterly_df: Optional[pd.DataFrame]) -> Optional[float]:
        """
        Calculate revenue growth rate from quarterly data following u.md documentation.
        Returns percentage growth rate.
        """
        if quarterly_df is None or quarterly_df.empty or len(quarterly_df.columns) < 3:
            return None
        
        try:
            # Find revenue row using multiple patterns
            revenue_row = None
            for pattern in self.revenue_patterns:
                rows = quarterly_df[quarterly_df.iloc[:, 0].str.contains(pattern, na=False)]
                if not rows.empty:
                    revenue_row = rows.iloc[0]
                    logger.debug(f"Found revenue row: {revenue_row.iloc[0]}")
                    break
            
            if revenue_row is None:
                logger.debug("No revenue row found in quarterly data")
                return None
            
            # Get latest and previous year values
            latest_revenue_str = str(revenue_row.iloc[1]).replace(',', '').strip()
            prev_year_revenue_str = str(revenue_row.iloc[-1]).replace(',', '').strip()
            
            logger.debug(f"Latest: {latest_revenue_str}, Previous: {prev_year_revenue_str}")
            
            if (latest_revenue_str and prev_year_revenue_str and 
                latest_revenue_str not in ['--', 'N/A', 'nan'] and 
                prev_year_revenue_str not in ['--', 'N/A', 'nan']):
                
                try:
                    latest_revenue = float(latest_revenue_str)
                    prev_year_revenue = float(prev_year_revenue_str)
                    
                    if prev_year_revenue > 0:
                        growth_rate = ((latest_revenue - prev_year_revenue) / prev_year_revenue) * 100
                        return round(growth_rate, 2)
                        
                except (ValueError, TypeError) as e:
                    logger.debug(f"Error converting revenue values: {e}")
            
            return None
            
        except Exception as e:
            logger.error(f"Error calculating growth rate: {e}")
            return None

    def _format_volume_indian_standard(self, volume: float) -> str:
        """
        Unified Indian volume formatting used across all services.
        Returns formatted string like "1.2Cr", "5.5L", "750K"
        """
        if volume is None or volume == 0:
            return "0"
        
        volume = float(volume)
        
        if volume >= 10_000_000:  # 1 Crore = 10 million
            return f"{volume / 10_000_000:.1f}Cr"
        elif volume >= 100_000:  # 1 Lakh = 100 thousand
            return f"{volume / 100_000:.1f}L"
        elif volume >= 1_000:
            return f"{volume / 1_000:.1f}K"
        else:
            return str(int(volume))
    
    def _format_volume_indian(self, volume: float) -> str:
        """
        Legacy method - delegates to unified formatting
        """
        return self._format_volume_indian_standard(volume)
    
    def _validate_and_log_results(self, symbol: str, result: Dict):
        """Validate and log extracted results for debugging."""
        logger.info(f"Final results for {symbol}:")
        logger.info(f"  Volume: {result.get('volume')}")
        logger.info(f"  Market Cap: {result.get('market_cap')}")
        logger.info(f"  P/E Ratio: {result.get('pe_ratio')}")
        logger.info(f"  Growth Rate: {result.get('growth_rate')}%")
        
        # Validation
        validations = []
        
        # Volume validation
        volume = result.get('volume')
        if volume and volume != 'N/A':
            if any(suffix in volume for suffix in ['Cr', 'L', 'K']):
                validations.append("✅ Volume format correct")
            else:
                validations.append("⚠️ Volume format unexpected")
        else:
            validations.append("⚠️ Volume not available")
        
        # Market cap validation
        market_cap = result.get('market_cap')
        if market_cap is not None:
            if 1_000_000 <= market_cap <= 50_000_000_000_000:
                validations.append("✅ Market cap in reasonable range")
            else:
                validations.append(f"⚠️ Market cap {market_cap} outside expected range")
        else:
            validations.append("⚠️ Market cap not available")
        
        # P/E ratio validation
        pe_ratio = result.get('pe_ratio')
        if pe_ratio is not None:
            if -100 <= pe_ratio <= 1000:
                validations.append("✅ P/E ratio in reasonable range")
            else:
                validations.append(f"⚠️ P/E ratio {pe_ratio} outside expected range")
        else:
            validations.append("⚠️ P/E ratio not available")
        
        # Growth rate validation
        growth_rate = result.get('growth_rate')
        if growth_rate is not None:
            if -100 <= growth_rate <= 1000:
                validations.append("✅ Growth rate in reasonable range")
            else:
                validations.append(f"⚠️ Growth rate {growth_rate} outside expected range")
        else:
            validations.append("⚠️ Growth rate not available")
        
        for validation in validations:
            logger.info(f"  {validation}")
    
    def get_basic_stock_info(self, symbol: str) -> Dict:
        """Get basic stock information for asset creation."""
        try:
            if not symbol or not isinstance(symbol, str):
                raise ValueError("Invalid symbol provided")
            
            symbol = symbol.strip().upper()
            
            ticker_result, ticker_raw = self._get_cached_ticker(symbol)
            if ticker_result and ticker_raw:
                return {
                    'name': ticker_raw[0].get('name'),
                    'sector': ticker_raw[0].get('sc_sector'),
                    'symbol': ticker_result,
                    'exchange': 'NSE'
                }
            return {}
        except Exception as e:
            logger.error(f"Error fetching basic info for {symbol}: {e}")
            return {}


# Global instance
final_bharatsm_service = FinalOptimizedBharatSMService() if BHARATSM_AVAILABLE else None

# Backward compatibility aliases
BharatSMService = FinalOptimizedBharatSMService
bharatsm_service = final_bharatsm_service


def get_bharatsm_frontend_data(symbol: str) -> Dict:
    """Convenience function to get optimized frontend display data."""
    if not final_bharatsm_service:
        logger.warning("BharatSM service not available")
        return {}
    
    try:
        return final_bharatsm_service.get_frontend_display_data(symbol)
    except Exception as e:
        logger.error(f"Error in BharatSM frontend data fetch: {e}")
        return {}


def get_bharatsm_basic_info(symbol: str) -> Dict:
    """Convenience function to get basic stock info."""
    if not final_bharatsm_service:
        logger.warning("BharatSM service not available")
        return {}
    
    try:
        return final_bharatsm_service.get_basic_stock_info(symbol)
    except Exception as e:
        logger.error(f"Error in BharatSM basic info fetch: {e}")
        return {}