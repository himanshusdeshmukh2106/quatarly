"""
Asset suggestion system for frontend autocomplete
Provides intelligent search with scoring algorithm for various asset types
"""

import json
from typing import List, Dict
from django.core.cache import cache
from .bharatsm_service import final_bharatsm_service
import logging

logger = logging.getLogger(__name__)


class AssetSuggestionService:
    """Service for providing asset suggestions with intelligent search"""
    
    # Static asset database with popular assets
    POPULAR_STOCKS = [
        # US Stocks
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Technology'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Technology'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Technology'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Consumer Discretionary'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Automotive'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Technology'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'exchange': 'NASDAQ', 'country': 'US', 'sector': 'Technology'},
        {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'exchange': 'NYSE', 'country': 'US', 'sector': 'Financial Services'},
        {'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'exchange': 'NYSE', 'country': 'US', 'sector': 'Healthcare'},
        {'symbol': 'V', 'name': 'Visa Inc.', 'exchange': 'NYSE', 'country': 'US', 'sector': 'Financial Services'},
        
        # Indian Stocks
        {'symbol': 'RELIANCE.NS', 'name': 'Reliance Industries Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Energy'},
        {'symbol': 'TCS.NS', 'name': 'Tata Consultancy Services Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Technology'},
        {'symbol': 'HDFCBANK.NS', 'name': 'HDFC Bank Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Financial Services'},
        {'symbol': 'INFY.NS', 'name': 'Infosys Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Technology'},
        {'symbol': 'HINDUNILVR.NS', 'name': 'Hindustan Unilever Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Consumer Goods'},
        {'symbol': 'ICICIBANK.NS', 'name': 'ICICI Bank Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Financial Services'},
        {'symbol': 'KOTAKBANK.NS', 'name': 'Kotak Mahindra Bank Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Financial Services'},
        {'symbol': 'LT.NS', 'name': 'Larsen & Toubro Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Construction'},
        {'symbol': 'SBIN.NS', 'name': 'State Bank of India', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Financial Services'},
        {'symbol': 'BHARTIARTL.NS', 'name': 'Bharti Airtel Limited', 'exchange': 'NSE', 'country': 'IN', 'sector': 'Telecommunications'},
    ]
    
    POPULAR_ETFS = [
        {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'exchange': 'NYSE', 'country': 'US', 'type': 'ETF'},
        {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust', 'exchange': 'NASDAQ', 'country': 'US', 'type': 'ETF'},
        {'symbol': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'exchange': 'NYSE', 'country': 'US', 'type': 'ETF'},
        {'symbol': 'IWM', 'name': 'iShares Russell 2000 ETF', 'exchange': 'NYSE', 'country': 'US', 'type': 'ETF'},
        {'symbol': 'EFA', 'name': 'iShares MSCI EAFE ETF', 'exchange': 'NYSE', 'country': 'US', 'type': 'ETF'},
        {'symbol': 'NIFTYBEES.NS', 'name': 'Nippon India ETF Nifty BeES', 'exchange': 'NSE', 'country': 'IN', 'type': 'ETF'},
        {'symbol': 'JUNIORBEES.NS', 'name': 'Nippon India ETF Junior BeES', 'exchange': 'NSE', 'country': 'IN', 'type': 'ETF'},
    ]
    
    POPULAR_CRYPTO = [
        {'symbol': 'BTC', 'name': 'Bitcoin', 'type': 'crypto'},
        {'symbol': 'ETH', 'name': 'Ethereum', 'type': 'crypto'},
        {'symbol': 'BNB', 'name': 'Binance Coin', 'type': 'crypto'},
        {'symbol': 'ADA', 'name': 'Cardano', 'type': 'crypto'},
        {'symbol': 'XRP', 'name': 'Ripple', 'type': 'crypto'},
        {'symbol': 'SOL', 'name': 'Solana', 'type': 'crypto'},
        {'symbol': 'DOT', 'name': 'Polkadot', 'type': 'crypto'},
        {'symbol': 'DOGE', 'name': 'Dogecoin', 'type': 'crypto'},
        {'symbol': 'AVAX', 'name': 'Avalanche', 'type': 'crypto'},
        {'symbol': 'MATIC', 'name': 'Polygon', 'type': 'crypto'},
    ]
    
    POPULAR_BONDS = [
        {'symbol': 'TLT', 'name': '20+ Year Treasury Bond ETF', 'exchange': 'NASDAQ', 'country': 'US', 'type': 'bond'},
        {'symbol': 'IEF', 'name': '7-10 Year Treasury Bond ETF', 'exchange': 'NASDAQ', 'country': 'US', 'type': 'bond'},
        {'symbol': 'SHY', 'name': '1-3 Year Treasury Bond ETF', 'exchange': 'NASDAQ', 'country': 'US', 'type': 'bond'},
        {'symbol': 'LQD', 'name': 'Investment Grade Corporate Bond ETF', 'exchange': 'NYSE', 'country': 'US', 'type': 'bond'},
        {'symbol': 'HYG', 'name': 'High Yield Corporate Bond ETF', 'exchange': 'NYSE', 'country': 'US', 'type': 'bond'},
    ]
    
    COMMODITIES = [
        {'symbol': 'GLD', 'name': 'SPDR Gold Shares', 'exchange': 'NYSE', 'country': 'US', 'type': 'commodity'},
        {'symbol': 'SLV', 'name': 'iShares Silver Trust', 'exchange': 'NYSE', 'country': 'US', 'type': 'commodity'},
        {'symbol': 'USO', 'name': 'United States Oil Fund', 'exchange': 'NYSE', 'country': 'US', 'type': 'commodity'},
        {'symbol': 'UNG', 'name': 'United States Natural Gas Fund', 'exchange': 'NYSE', 'country': 'US', 'type': 'commodity'},
        {'symbol': 'DBA', 'name': 'Invesco DB Agriculture Fund', 'exchange': 'NYSE', 'country': 'US', 'type': 'commodity'},
    ]
    
    PHYSICAL_ASSETS = [
        {'name': 'Gold Bars', 'symbol': '', 'type': 'gold', 'unit': 'grams'},
        {'name': 'Gold Coins', 'symbol': '', 'type': 'gold', 'unit': 'grams'},
        {'name': 'Gold Jewelry', 'symbol': '', 'type': 'gold', 'unit': 'grams'},
        {'name': 'Silver Bars', 'symbol': '', 'type': 'silver', 'unit': 'grams'},
        {'name': 'Silver Coins', 'symbol': '', 'type': 'silver', 'unit': 'grams'},
        {'name': 'Silver Jewelry', 'symbol': '', 'type': 'silver', 'unit': 'grams'},
    ]
    
    @classmethod
    def get_suggestions(cls, query: str, asset_type: str = '', limit: int = 10) -> List[Dict]:
        """Get asset suggestions based on query and asset type"""
        if len(query) < 2:
            return []
        
        query = query.lower().strip()
        suggestions = []
        
        # Get suggestions based on asset type
        if asset_type == 'stock':
            # First search in our static database
            suggestions = cls._search_assets(query, cls.POPULAR_STOCKS, 'stock')
            
            # Then try to get additional suggestions from technical data service for Indian stocks
            if final_bharatsm_service and final_bharatsm_service.is_available():
                try:
                    indian_suggestions = final_bharatsm_service.search_stocks(query, limit=5)
                    for suggestion in indian_suggestions:
                        # Add to our suggestions if not already present
                        existing_symbols = [s.get('symbol', '') for s in suggestions]
                        if suggestion['symbol'] not in existing_symbols:
                            suggestions.append({
                                'name': suggestion['name'],
                                'symbol': suggestion['symbol'],
                                'type': 'stock',
                                'exchange': suggestion.get('exchange', 'NSE'),
                                'country': suggestion.get('country', 'India'),
                                'score': 0.8  # High score for real-time data
                            })
                except Exception as e:
                    logger.warning(f"Failed to get Indian stock suggestions: {e}")
        elif asset_type == 'etf':
            suggestions = cls._search_assets(query, cls.POPULAR_ETFS, 'etf')
        elif asset_type == 'crypto':
            suggestions = cls._search_assets(query, cls.POPULAR_CRYPTO, 'crypto')
        elif asset_type == 'bond':
            suggestions = cls._search_assets(query, cls.POPULAR_BONDS, 'bond')
        elif asset_type == 'commodity':
            suggestions = cls._search_assets(query, cls.COMMODITIES, 'commodity')
        elif asset_type in ['gold', 'silver']:
            suggestions = cls._search_physical_assets(query, asset_type)
        else:
            # Search all asset types
            all_assets = (
                [(asset, 'stock') for asset in cls.POPULAR_STOCKS] +
                [(asset, 'etf') for asset in cls.POPULAR_ETFS] +
                [(asset, 'crypto') for asset in cls.POPULAR_CRYPTO] +
                [(asset, 'bond') for asset in cls.POPULAR_BONDS] +
                [(asset, 'commodity') for asset in cls.COMMODITIES]
            )
            
            for asset, asset_type_name in all_assets:
                score = cls._calculate_score(query, asset)
                if score > 0:
                    suggestion = {
                        'name': asset['name'],
                        'symbol': asset.get('symbol', ''),
                        'type': asset_type_name,
                        'exchange': asset.get('exchange', ''),
                        'country': asset.get('country', ''),
                        'score': score
                    }
                    suggestions.append(suggestion)
        
        # Sort by score and return top results
        suggestions.sort(key=lambda x: x.get('score', 0), reverse=True)
        return suggestions[:limit]
    
    @classmethod
    def _search_assets(cls, query: str, assets: List[Dict], asset_type: str) -> List[Dict]:
        """Search within a specific asset list"""
        suggestions = []
        
        for asset in assets:
            score = cls._calculate_score(query, asset)
            if score > 0:
                suggestion = {
                    'name': asset['name'],
                    'symbol': asset.get('symbol', ''),
                    'type': asset_type,
                    'exchange': asset.get('exchange', ''),
                    'country': asset.get('country', ''),
                    'score': score
                }
                suggestions.append(suggestion)
        
        return suggestions
    
    @classmethod
    def _search_physical_assets(cls, query: str, asset_type: str) -> List[Dict]:
        """Search physical assets (gold, silver)"""
        suggestions = []
        
        for asset in cls.PHYSICAL_ASSETS:
            if asset['type'] == asset_type:
                score = cls._calculate_score(query, asset)
                if score > 0:
                    suggestion = {
                        'name': asset['name'],
                        'symbol': '',
                        'type': asset_type,
                        'unit': asset.get('unit', 'grams'),
                        'score': score
                    }
                    suggestions.append(suggestion)
        
        return suggestions
    
    @classmethod
    def _calculate_score(cls, query: str, asset: Dict) -> float:
        """Calculate relevance score for an asset"""
        score = 0.0
        query_words = query.split()
        
        # Check symbol match (highest priority)
        if 'symbol' in asset and asset['symbol']:
            symbol = asset['symbol'].lower()
            if symbol.startswith(query):
                score += 100
            elif query in symbol:
                score += 80
        
        # Check name match
        name = asset['name'].lower()
        name_words = name.split()
        
        # Exact name match
        if query == name:
            score += 90
        
        # Name starts with query
        if name.startswith(query):
            score += 70
        
        # Query words in name
        for query_word in query_words:
            if len(query_word) >= 2:  # Only consider words with 2+ characters
                for name_word in name_words:
                    if name_word.startswith(query_word):
                        score += 30
                    elif query_word in name_word:
                        score += 20
        
        # Partial matches
        if query in name:
            score += 40
        
        # Sector/category match (bonus)
        if 'sector' in asset and query in asset['sector'].lower():
            score += 10
        
        return score
    
    @classmethod
    def get_popular_assets_by_type(cls, asset_type: str, limit: int = 5) -> List[Dict]:
        """Get popular assets by type for quick selection"""
        cache_key = f"popular_assets_{asset_type}_{limit}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        result = []
        
        if asset_type == 'stock':
            result = cls.POPULAR_STOCKS[:limit]
        elif asset_type == 'etf':
            result = cls.POPULAR_ETFS[:limit]
        elif asset_type == 'crypto':
            result = cls.POPULAR_CRYPTO[:limit]
        elif asset_type == 'bond':
            result = cls.POPULAR_BONDS[:limit]
        elif asset_type == 'commodity':
            result = cls.COMMODITIES[:limit]
        elif asset_type in ['gold', 'silver']:
            result = [asset for asset in cls.PHYSICAL_ASSETS if asset['type'] == asset_type][:limit]
        
        # Format for frontend
        formatted_result = []
        for asset in result:
            formatted_asset = {
                'name': asset['name'],
                'symbol': asset.get('symbol', ''),
                'type': asset_type,
                'exchange': asset.get('exchange', ''),
                'country': asset.get('country', ''),
            }
            if 'unit' in asset:
                formatted_asset['unit'] = asset['unit']
            formatted_result.append(formatted_asset)
        
        # Cache for 1 hour
        cache.set(cache_key, formatted_result, 3600)
        return formatted_result
    
    @classmethod
    def get_trending_assets(cls) -> List[Dict]:
        """Get trending assets across all types"""
        # This would typically come from market data APIs
        # For now, return a curated list of trending assets
        trending = [
            {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'type': 'stock', 'reason': 'High volume'},
            {'symbol': 'BTC', 'name': 'Bitcoin', 'type': 'crypto', 'reason': 'Price surge'},
            {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF', 'type': 'etf', 'reason': 'Market leader'},
            {'symbol': 'RELIANCE.NS', 'name': 'Reliance Industries', 'type': 'stock', 'reason': 'Earnings beat'},
            {'name': 'Gold Bars', 'type': 'gold', 'reason': 'Safe haven demand'},
        ]
        
        return trending
    
    @classmethod
    def search_with_filters(cls, query: str, filters: Dict) -> List[Dict]:
        """Advanced search with filters"""
        suggestions = cls.get_suggestions(query, filters.get('asset_type', ''))
        
        # Apply additional filters
        if 'country' in filters:
            suggestions = [s for s in suggestions if s.get('country') == filters['country']]
        
        if 'exchange' in filters:
            suggestions = [s for s in suggestions if s.get('exchange') == filters['exchange']]
        
        if 'min_score' in filters:
            suggestions = [s for s in suggestions if s.get('score', 0) >= filters['min_score']]
        
        return suggestions