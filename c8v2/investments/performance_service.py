"""
Performance optimization service for investments app
"""

from django.db import connection
from django.core.cache import cache
from django.db.models import Prefetch, Q, Count, Sum, Avg
from .models import Investment, ChartData, PriceAlert
import logging

logger = logging.getLogger(__name__)


class PerformanceService:
    """Service for performance optimizations"""
    
    CACHE_TIMEOUTS = {
        'portfolio_summary': 300,      # 5 minutes
        'asset_type_stats': 600,       # 10 minutes
        'user_investments': 180,       # 3 minutes
        'market_data': 60,             # 1 minute
    }
    
    @classmethod
    def get_optimized_user_investments(cls, user, asset_type=None):
        """Get user investments with optimized queries"""
        cache_key = f"user_investments_{user.id}_{asset_type or 'all'}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        # Base queryset with optimizations
        queryset = Investment.objects.filter(user=user).select_related('user')
        
        # Add asset type filter if provided
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        
        # Prefetch related data efficiently
        queryset = queryset.prefetch_related(
            Prefetch(
                'historical_data',
                queryset=ChartData.objects.order_by('-date')[:30],
                to_attr='recent_chart_data'
            ),
            Prefetch(
                'alerts',
                queryset=PriceAlert.objects.filter(is_active=True),
                to_attr='active_alerts'
            )
        )
        
        # Order by most recent first
        queryset = queryset.order_by('-created_at')
        
        # Convert to list to cache
        investments = list(queryset)
        
        # Cache for 3 minutes
        cache.set(cache_key, investments, cls.CACHE_TIMEOUTS['user_investments'])
        
        return investments
    
    @classmethod
    def get_portfolio_stats_optimized(cls, user):
        """Get portfolio statistics with optimized database queries"""
        cache_key = f"portfolio_stats_{user.id}"
        cached_stats = cache.get(cache_key)
        
        if cached_stats:
            return cached_stats
        
        # Use aggregation for better performance
        stats = Investment.objects.filter(user=user).aggregate(
            total_investments=Count('id'),
            total_value=Sum('total_value'),
            total_gain_loss=Sum('total_gain_loss'),
            avg_gain_loss_percent=Avg('total_gain_loss_percent'),
            tradeable_count=Count('id', filter=Q(asset_type__in=['stock', 'etf', 'crypto', 'bond'])),
            physical_count=Count('id', filter=Q(asset_type__in=['gold', 'silver', 'commodity']))
        )
        
        # Asset type breakdown
        asset_type_stats = Investment.objects.filter(user=user).values('asset_type').annotate(
            count=Count('id'),
            total_value=Sum('total_value'),
            total_gain_loss=Sum('total_gain_loss')
        ).order_by('-total_value')
        
        stats['asset_breakdown'] = list(asset_type_stats)
        
        # Cache for 10 minutes
        cache.set(cache_key, stats, cls.CACHE_TIMEOUTS['asset_type_stats'])
        
        return stats
    
    @classmethod
    def get_investments_for_enrichment(cls, limit=50):
        """Get investments that need data enrichment with optimized query"""
        # Get investments that haven't been enriched or failed enrichment
        return Investment.objects.filter(
            Q(data_enriched=False) | Q(enrichment_attempted=False),
            asset_type__in=['stock', 'etf', 'crypto', 'bond']
        ).select_related('user').only(
            'id', 'symbol', 'asset_type', 'user_id', 'data_enriched', 
            'enrichment_attempted', 'enrichment_error'
        )[:limit]
    
    @classmethod
    def bulk_update_prices(cls, price_updates):
        """Bulk update prices for better performance"""
        from django.db import transaction
        
        investments_to_update = []
        
        for update in price_updates:
            investment_id = update['id']
            new_price = update['current_price']
            
            try:
                investment = Investment.objects.get(id=investment_id)
                investment.current_price = new_price
                # Recalculate derived fields
                investment.total_value = investment.quantity * new_price
                total_cost = investment.quantity * investment.average_purchase_price
                investment.total_gain_loss = investment.total_value - total_cost
                
                if total_cost > 0:
                    investment.total_gain_loss_percent = (investment.total_gain_loss / total_cost) * 100
                
                investments_to_update.append(investment)
            except Investment.DoesNotExist:
                continue
        
        # Bulk update in a single transaction
        with transaction.atomic():
            Investment.objects.bulk_update(
                investments_to_update,
                ['current_price', 'total_value', 'total_gain_loss', 'total_gain_loss_percent'],
                batch_size=100
            )
        
        # Clear related caches
        user_ids = {inv.user_id for inv in investments_to_update}
        for user_id in user_ids:
            cls.invalidate_user_cache(user_id)
        
        return len(investments_to_update)
    
    @classmethod
    def invalidate_user_cache(cls, user_id):
        """Invalidate all cache entries for a user"""
        cache_patterns = [
            f"portfolio_summary_{user_id}",
            f"portfolio_stats_{user_id}",
            f"user_investments_{user_id}_all",
            f"user_investments_{user_id}_stock",
            f"user_investments_{user_id}_crypto",
            f"user_investments_{user_id}_gold",
            f"user_investments_{user_id}_silver",
        ]
        
        cache.delete_many(cache_patterns)
    
    @classmethod
    def get_database_stats(cls):
        """Get database performance statistics"""
        with connection.cursor() as cursor:
            # Get table sizes
            cursor.execute("""
                SELECT 
                    table_name,
                    table_rows,
                    data_length,
                    index_length
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
                AND table_name LIKE 'investments_%'
            """)
            
            table_stats = cursor.fetchall()
            
            # Get index usage (MySQL specific)
            cursor.execute("""
                SELECT 
                    table_name,
                    index_name,
                    cardinality
                FROM information_schema.statistics 
                WHERE table_schema = DATABASE()
                AND table_name LIKE 'investments_%'
                ORDER BY table_name, cardinality DESC
            """)
            
            index_stats = cursor.fetchall()
            
            return {
                'tables': table_stats,
                'indexes': index_stats
            }
    
    @classmethod
    def optimize_queries_for_large_portfolios(cls, user, page_size=20):
        """Optimize queries for users with large portfolios"""
        # Use cursor-based pagination for better performance
        investments = Investment.objects.filter(user=user).select_related('user').only(
            'id', 'symbol', 'name', 'asset_type', 'current_price', 'total_value',
            'total_gain_loss', 'total_gain_loss_percent', 'created_at'
        ).order_by('-created_at')[:page_size]
        
        return investments
    
    @classmethod
    def get_trending_assets(cls, limit=10):
        """Get trending assets based on recent activity"""
        cache_key = "trending_assets"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        # Get assets with highest activity (most users holding them)
        trending = Investment.objects.values('symbol', 'name', 'asset_type').annotate(
            holder_count=Count('user', distinct=True),
            avg_gain_loss=Avg('total_gain_loss_percent')
        ).filter(
            symbol__isnull=False,
            asset_type__in=['stock', 'etf', 'crypto']
        ).order_by('-holder_count')[:limit]
        
        trending_list = list(trending)
        
        # Cache for 1 hour
        cache.set(cache_key, trending_list, 3600)
        
        return trending_list
    
    @classmethod
    def cleanup_old_chart_data(cls, days_to_keep=90):
        """Clean up old chart data to maintain performance"""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now().date() - timedelta(days=days_to_keep)
        
        deleted_count = ChartData.objects.filter(date__lt=cutoff_date).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old chart data records")
        
        return deleted_count
    
    @classmethod
    def get_cache_statistics(cls):
        """Get cache usage statistics"""
        try:
            from django.core.cache import cache
            from django.core.cache.backends.redis import RedisCache
            
            if isinstance(cache, RedisCache):
                # Get Redis statistics
                redis_client = cache._cache.get_client()
                info = redis_client.info()
                
                return {
                    'used_memory': info.get('used_memory_human'),
                    'connected_clients': info.get('connected_clients'),
                    'total_commands_processed': info.get('total_commands_processed'),
                    'keyspace_hits': info.get('keyspace_hits'),
                    'keyspace_misses': info.get('keyspace_misses'),
                    'hit_rate': info.get('keyspace_hits', 0) / max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1)
                }
        except Exception as e:
            logger.error(f"Error getting cache statistics: {e}")
        
        return {}


class QueryOptimizer:
    """Helper class for query optimizations"""
    
    @staticmethod
    def optimize_investment_queryset(queryset):
        """Apply common optimizations to investment querysets"""
        return queryset.select_related('user').prefetch_related(
            Prefetch(
                'historical_data',
                queryset=ChartData.objects.order_by('-date')[:30]
            )
        )
    
    @staticmethod
    def get_fields_for_list_view():
        """Get minimal fields needed for list views"""
        return [
            'id', 'symbol', 'name', 'asset_type', 'current_price', 
            'total_value', 'total_gain_loss', 'total_gain_loss_percent',
            'daily_change', 'daily_change_percent', 'created_at'
        ]
    
    @staticmethod
    def get_fields_for_detail_view():
        """Get all fields needed for detail views"""
        return [
            'id', 'symbol', 'name', 'asset_type', 'exchange', 'currency',
            'quantity', 'average_purchase_price', 'current_price', 'total_value',
            'daily_change', 'daily_change_percent', 'total_gain_loss', 'total_gain_loss_percent',
            'volume', 'market_cap', 'pe_ratio', 'growth_rate',
            'fifty_two_week_high', 'fifty_two_week_low',
            'ai_analysis', 'risk_level', 'recommendation',
            'logo_url', 'sector', 'unit',
            'data_enriched', 'enrichment_attempted', 'enrichment_error',
            'created_at', 'updated_at', 'last_updated'
        ]