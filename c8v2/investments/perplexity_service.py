import requests
import json
import logging
from django.conf import settings
from typing import Dict, Optional
import time

logger = logging.getLogger(__name__)


class PerplexityAPIService:
    """Service for interacting with Perplexity API to fetch financial data"""
    
    BASE_URL = "https://api.perplexity.ai"
    
    @classmethod
    def get_stock_data(cls, symbol: str) -> Dict:
        """Fetch complete stock data using Perplexity API (legacy method)"""
        prompt = f"""
        Get the current financial data for stock symbol {symbol}:
        - Current price in USD
        - Market capitalization
        - P/E ratio
        - 52-week high and low
        - Dividend yield (if applicable)
        - Trading volume (format as readable string like "1.2M", "500K")
        - Sector and industry
        - Company name
        
        Return the data in JSON format with these exact keys:
        {{
            "current_price": number,
            "market_cap": number,
            "pe_ratio": number,
            "fifty_two_week_high": number,
            "fifty_two_week_low": number,
            "dividend_yield": number,
            "volume": "string",
            "sector": "string",
            "company_name": "string",
            "exchange": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_fallback_data(cls, symbol: str) -> Dict:
        """Fetch basic data as fallback when BharatSM fails"""
        prompt = f"""
        Get basic financial data for stock symbol {symbol}:
        - Current price
        - Market capitalization (in millions)
        - P/E ratio
        - Revenue growth rate (quarterly YoY)
        - Trading volume (format as readable string like "1.2M", "500K")
        
        Return the data in JSON format with these exact keys:
        {{
            "current_price": number,
            "market_cap": number,
            "pe_ratio": number,
            "growth_rate": number,
            "volume": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_fundamental_data(cls, symbol: str) -> Dict:
        """Fetch fundamental data using Perplexity API (PE ratio, sector, etc.)"""
        prompt = f"""
        Get the fundamental financial data for stock symbol {symbol}:
        - P/E ratio
        - Market capitalization
        - Dividend yield (if applicable)
        - Sector and industry
        - Company full name
        - Brief business description
        
        Return the data in JSON format with these exact keys:
        {{
            "pe_ratio": number,
            "market_cap": number,
            "dividend_yield": number,
            "sector": "string",
            "company_name": "string",
            "business_description": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_crypto_data(cls, symbol: str) -> Dict:
        """Fetch cryptocurrency data using Perplexity API"""
        prompt = f"""
        Get the current data for cryptocurrency {symbol}:
        - Current price in USD
        - Market capitalization
        - 24-hour change percentage
        - All-time high and low
        - Brief description
        
        Return the data in JSON format with these exact keys:
        {{
            "current_price": number,
            "market_cap": number,
            "daily_change_percent": number,
            "all_time_high": number,
            "all_time_low": number,
            "description": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_fundamental_data(cls, symbol: str) -> Dict:
        """Fetch fundamental data for a stock"""
        prompt = f"""
        Get the fundamental data for stock symbol {symbol}:
        - P/E ratio
        - Dividend yield (if applicable)
        - Market capitalization
        - Sector and industry
        - Company name
        
        Return the data in JSON format with these exact keys:
        {{
            "pe_ratio": number,
            "dividend_yield": number,
            "market_cap": number,
            "sector": "string",
            "company_name": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_precious_metal_price(cls, metal: str) -> Dict:
        """Fetch precious metal spot prices"""
        prompt = f"""
        Get the current spot price for {metal}:
        - Price per ounce in USD
        - Price per gram in USD
        - 24-hour change percentage
        - Brief market analysis
        
        Return the data in JSON format with these exact keys:
        {{
            "price_per_ounce": number,
            "price_per_gram": number,
            "daily_change_percent": number,
            "market_analysis": "string"
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_bond_data(cls, symbol: str) -> Dict:
        """Fetch bond data using Perplexity API"""
        prompt = f"""
        Get the current data for bond {symbol}:
        - Current yield
        - Credit rating
        - Maturity date
        - Face value
        - Current price
        
        Return the data in JSON format with these exact keys:
        {{
            "current_yield": number,
            "credit_rating": "string",
            "maturity_date": "string",
            "face_value": number,
            "current_price": number
        }}
        """
        
        return cls._make_api_call(prompt)
    
    @classmethod
    def get_basic_market_data(cls, symbol: str, asset_type: str) -> Dict:
        """Get basic market data for immediate use during asset creation"""
        # For Indian stocks, try technical data service first
        if asset_type in ['stock', 'etf']:
            try:
                from .bharatsm_service import final_bharatsm_service
                if final_bharatsm_service and final_bharatsm_service.is_available():
                    technical_data = final_bharatsm_service.get_basic_stock_info(symbol)
                else:
                    technical_data = {}
                
                if technical_data and 'current_price' in technical_data:
                    return {
                        'name': symbol,  # Will be updated later with company name
                        'current_price': technical_data.get('current_price'),
                        'exchange': technical_data.get('exchange', 'NSE'),
                        'volume': technical_data.get('volume', '1.2M')
                    }
            except Exception as e:
                logger.warning(f"Technical data service failed for {symbol}, falling back to Perplexity: {e}")
            
            # Fallback to Perplexity for basic data
            prompt = f"""
            Get basic information for {asset_type} symbol {symbol}:
            - Company/fund name
            - Current price in USD or INR
            - Primary exchange
            - Sector (if applicable)
            
            Return only JSON format:
            {{
                "name": "string",
                "current_price": number,
                "exchange": "string",
                "sector": "string"
            }}
            """
        
        # Fallback to Perplexity for basic data
        prompt = f"""
        Get basic information for {asset_type} symbol {symbol}:
        - Company/fund name
        - Current price in USD or INR
        - Primary exchange
        - Sector (if applicable)
        
        Return only JSON format:
        {{
            "name": "string",
            "current_price": number,
            "exchange": "string",
            "sector": "string"
        }}
        """
        return cls._make_api_call(prompt, timeout=10)  # Shorter timeout for basic data
    
    @classmethod
    def get_asset_suggestions(cls, query: str, asset_type: str = '') -> list:
        """Get asset suggestions for autocomplete"""
        if asset_type == 'stock':
            prompt = f"""
            Find stock symbols that match "{query}". Return top 5 matches.
            Include both US and Indian stocks.
            
            Return JSON array:
            [
                {{
                    "symbol": "string",
                    "name": "string",
                    "exchange": "string",
                    "country": "string"
                }}
            ]
            """
        elif asset_type == 'crypto':
            prompt = f"""
            Find cryptocurrency symbols that match "{query}". Return top 5 matches.
            
            Return JSON array:
            [
                {{
                    "symbol": "string",
                    "name": "string"
                }}
            ]
            """
        else:
            prompt = f"""
            Find financial assets (stocks, ETFs, crypto) that match "{query}". Return top 5 matches.
            
            Return JSON array:
            [
                {{
                    "symbol": "string",
                    "name": "string",
                    "type": "string",
                    "exchange": "string"
                }}
            ]
            """
        
        result = cls._make_api_call(prompt, timeout=10)
        return result if isinstance(result, list) else []
    
    @classmethod
    def _make_api_call(cls, prompt: str, timeout: int = 30) -> Dict:
        """Make API call to Perplexity"""
        api_key = getattr(settings, 'PERPLEXITY_API_KEY', None)
        if not api_key:
            logger.error("PERPLEXITY_API_KEY not configured")
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
                timeout=timeout
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
                logger.debug(f"Invalid JSON content: {content}")
                return {}
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Perplexity API request error: {e}")
            return {}
        except KeyError as e:
            logger.error(f"Unexpected Perplexity API response format: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error in Perplexity API call: {e}")
            return {}
    
    @classmethod
    def test_api_connection(cls) -> bool:
        """Test if the API is working"""
        try:
            result = cls.get_basic_market_data("AAPL", "stock")
            return bool(result)
        except Exception as e:
            logger.error(f"API connection test failed: {e}")
            return False


class RateLimiter:
    """Simple rate limiter for API calls"""
    
    def __init__(self, max_calls: int = 60, time_window: int = 60):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
    
    def can_make_call(self) -> bool:
        """Check if we can make another API call"""
        now = time.time()
        # Remove calls outside the time window
        self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
        
        return len(self.calls) < self.max_calls
    
    def record_call(self):
        """Record that an API call was made"""
        self.calls.append(time.time())
    
    def wait_time(self) -> float:
        """Get the time to wait before making another call"""
        if self.can_make_call():
            return 0
        
        oldest_call = min(self.calls)
        return self.time_window - (time.time() - oldest_call)


# Global rate limiter instance
perplexity_rate_limiter = RateLimiter(max_calls=50, time_window=60)  # 50 calls per minute