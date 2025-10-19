"""
Background tasks for refreshing opportunity cache
Can be run with Celery or as scheduled Django management command
"""

import logging
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model

from .enhanced_models import (
    OpportunityCache,
    UserProfileVector,
    ClusterStatistics,
    OpportunityFetchLog
)
from .serper_opportunity_fetcher import serper_opportunity_fetcher
import time

User = get_user_model()
logger = logging.getLogger(__name__)


def refresh_opportunity_cache():
    """
    Main task to refresh opportunity cache for active clusters
    
    Should be run every 6 hours via:
    - Celery beat schedule
    - Django management command (cron)
    - Manual trigger
    
    Process:
    1. Get active clusters (users active in last 7 days)
    2. For each cluster with <20 valid opportunities:
        - Fetch new opportunities from Serper
        - Cache them with deduplication
    3. Clean up expired opportunities (>30 days old)
    4. Update cluster statistics
    """
    
    logger.info("Starting opportunity cache refresh...")
    start_time = time.time()
    
    total_fetched = 0
    total_cached = 0
    total_duplicates = 0
    clusters_processed = 0
    
    try:
        # 1. Get active clusters
        active_clusters = ClusterStatistics.objects.filter(
            active_user_count__gt=0
        ).order_by('-active_user_count')[:10]  # Top 10 active clusters
        
        logger.info(f"Found {active_clusters.count()} active clusters")
        
        # 2. Process each cluster
        for cluster_stat in active_clusters:
            cluster_key = cluster_stat.cluster_key
            
            # Check if needs refresh
            valid_opps = OpportunityCache.objects.filter(
                cluster_key=cluster_key,
                is_active=True,
                expires_at__gt=timezone.now()
            ).count()
            
            if valid_opps >= 20:
                logger.info(f"Cluster {cluster_key} has {valid_opps} valid opportunities, skipping")
                continue
            
            logger.info(f"Refreshing cluster {cluster_key} (has {valid_opps} opportunities)")
            
            try:
                # Get a sample user from this cluster to get characteristics
                profile_vector = UserProfileVector.objects.filter(
                    cluster_key=cluster_key
                ).first()
                
                if not profile_vector:
                    logger.warning(f"No profile vector found for cluster {cluster_key}")
                    continue
                
                characteristics = profile_vector.characteristics
                
                # Fetch opportunities
                fetch_start = time.time()
                opportunities_data = serper_opportunity_fetcher.fetch_opportunities_for_cluster(
                    characteristics,
                    categories=['travel', 'job', 'investment']
                )
                fetch_duration = int((time.time() - fetch_start) * 1000)
                
                # Cache opportunities
                cached_count = 0
                duplicate_count = 0
                
                for opp_data in opportunities_data:
                    # Generate hash
                    content_hash = OpportunityCache.generate_content_hash(
                        opp_data['title'],
                        opp_data['description'],
                        opp_data['source_url']
                    )
                    
                    # Check if exists
                    if not OpportunityCache.objects.filter(content_hash=content_hash).exists():
                        # Calculate expiry
                        if opp_data['category'] == 'investment':
                            expires_at = timezone.now() + timedelta(days=7)
                        else:
                            expires_at = timezone.now() + timedelta(hours=24)
                        
                        # Create opportunity
                        OpportunityCache.objects.create(
                            title=opp_data['title'],
                            description=opp_data['description'],
                            category=opp_data['category'],
                            sub_category=opp_data.get('sub_category', ''),
                            source_url=opp_data['source_url'],
                            image_url=opp_data.get('image_url', ''),
                            logo_url=opp_data.get('logo_url', ''),
                            offer_details=opp_data.get('offer_details', {}),
                            target_profile=opp_data.get('target_profile', {}),
                            cluster_key=cluster_key,
                            content_hash=content_hash,
                            expires_at=expires_at,
                            priority=opp_data.get('priority', 'medium'),
                            relevance_base_score=opp_data.get('relevance_base_score', 0.5)
                        )
                        cached_count += 1
                    else:
                        duplicate_count += 1
                
                # Log fetch operation
                OpportunityFetchLog.objects.create(
                    fetch_type='scheduled',
                    cluster_key=cluster_key,
                    status='success' if cached_count > 0 else 'partial',
                    opportunities_fetched=len(opportunities_data),
                    opportunities_cached=cached_count,
                    duplicates_filtered=duplicate_count,
                    duration_ms=fetch_duration,
                    api_calls=9  # Approximate
                )
                
                # Update totals
                total_fetched += len(opportunities_data)
                total_cached += cached_count
                total_duplicates += duplicate_count
                clusters_processed += 1
                
                # Update cluster statistics
                cluster_stat.last_fetch_at = timezone.now()
                cluster_stat.next_fetch_at = timezone.now() + timedelta(hours=6)
                cluster_stat.cached_opportunities = OpportunityCache.objects.filter(
                    cluster_key=cluster_key,
                    is_active=True,
                    expires_at__gt=timezone.now()
                ).count()
                cluster_stat.save()
                
                logger.info(f"Cluster {cluster_key}: {cached_count} cached, {duplicate_count} duplicates")
                
            except Exception as e:
                logger.error(f"Error refreshing cluster {cluster_key}: {e}")
                
                # Log failed operation
                OpportunityFetchLog.objects.create(
                    fetch_type='scheduled',
                    cluster_key=cluster_key,
                    status='failed',
                    opportunities_fetched=0,
                    opportunities_cached=0,
                    duplicates_filtered=0,
                    duration_ms=0,
                    api_calls=0,
                    error_message=str(e)
                )
                continue
        
        # 3. Clean up expired opportunities (>30 days old)
        deleted_count = OpportunityCache.objects.filter(
            expires_at__lt=timezone.now() - timedelta(days=30)
        ).delete()[0]
        
        logger.info(f"Deleted {deleted_count} expired opportunities")
        
        # 4. Update all cluster statistics
        update_all_cluster_stats()
        
        # Summary
        total_duration = int((time.time() - start_time))
        
        logger.info(f"""
Opportunity cache refresh complete:
- Clusters processed: {clusters_processed}
- Opportunities fetched: {total_fetched}
- Opportunities cached: {total_cached}
- Duplicates filtered: {total_duplicates}
- Expired opportunities deleted: {deleted_count}
- Duration: {total_duration}s
""")
        
        return {
            'status': 'success',
            'clusters_processed': clusters_processed,
            'total_fetched': total_fetched,
            'total_cached': total_cached,
            'total_duplicates': total_duplicates,
            'deleted_count': deleted_count,
            'duration_seconds': total_duration
        }
        
    except Exception as e:
        logger.error(f"Error in refresh_opportunity_cache: {e}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def update_all_cluster_stats():
    """Update statistics for all clusters"""
    
    logger.info("Updating cluster statistics...")
    
    # Get all cluster keys
    cluster_keys = UserProfileVector.objects.values_list('cluster_key', flat=True).distinct()
    
    for cluster_key in cluster_keys:
        try:
            # Get or create cluster stats
            cluster_stats, created = ClusterStatistics.objects.get_or_create(
                cluster_key=cluster_key
            )
            
            # Update user counts
            cluster_stats.user_count = UserProfileVector.objects.filter(
                cluster_key=cluster_key
            ).count()
            
            cluster_stats.active_user_count = UserProfileVector.objects.filter(
                cluster_key=cluster_key,
                user__last_login__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            # Update opportunity counts
            cluster_stats.cached_opportunities = OpportunityCache.objects.filter(
                cluster_key=cluster_key,
                is_active=True,
                expires_at__gt=timezone.now()
            ).count()
            
            cluster_stats.expired_opportunities = OpportunityCache.objects.filter(
                cluster_key=cluster_key,
                expires_at__lte=timezone.now()
            ).count()
            
            # Calculate click rates
            opportunities = OpportunityCache.objects.filter(cluster_key=cluster_key)
            total_shown = sum(opp.shown_count for opp in opportunities)
            total_clicked = sum(opp.click_count for opp in opportunities)
            
            cluster_stats.total_opportunities_shown = total_shown
            cluster_stats.total_opportunities_clicked = total_clicked
            
            if total_shown > 0:
                cluster_stats.avg_click_rate = total_clicked / total_shown
            
            cluster_stats.save()
            
        except Exception as e:
            logger.error(f"Error updating stats for cluster {cluster_key}: {e}")
            continue
    
    logger.info(f"Updated statistics for {len(cluster_keys)} clusters")


def cleanup_old_shown_opportunities():
    """
    Clean up old UserShownOpportunity records (>30 days)
    Keeps database size manageable
    """
    
    logger.info("Cleaning up old shown opportunity records...")
    
    deleted_count = UserShownOpportunity.objects.filter(
        shown_at__lt=timezone.now() - timedelta(days=30)
    ).delete()[0]
    
    logger.info(f"Deleted {deleted_count} old shown opportunity records")
    
    return deleted_count


# Celery task wrapper (if Celery is available)
try:
    from celery import shared_task
    
    @shared_task
    def refresh_opportunity_cache_task():
        """Celery task wrapper"""
        return refresh_opportunity_cache()
    
    @shared_task
    def cleanup_old_shown_opportunities_task():
        """Celery task wrapper"""
        return cleanup_old_shown_opportunities()
    
except ImportError:
    logger.info("Celery not available, tasks can be run manually or via management command")
