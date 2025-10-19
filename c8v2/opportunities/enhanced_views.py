"""
Enhanced views for new opportunities system
Integrates OpportunityCache, Gemini Flash, and Serper API
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import logging
import time

from .enhanced_models import (
    OpportunityCache,
    UserShownOpportunity,
    UserProfileVector,
    OpportunityFetchLog,
    ClusterStatistics
)
from .models import UserProfile
from .enhanced_serializers import (
    OpportunityCacheSerializer,
    UserShownOpportunitySerializer,
    UserProfileVectorSerializer,
    OpportunityFetchLogSerializer,
    ClusterStatisticsSerializer
)
from .gemini_flash_service import gemini_flash_service
from .serper_opportunity_fetcher import serper_opportunity_fetcher

logger = logging.getLogger(__name__)


class EnhancedOpportunityViewSet(viewsets.ViewSet):
    """
    Enhanced Opportunity ViewSet using centralized caching,
    profile similarity, and duplicate prevention
    """
    
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """
        Get opportunities for user from cache
        
        Flow:
        1. Get user's profile vector and cluster_key
        2. Query OpportunityCache for cluster
        3. Filter out already-shown opportunities
        4. Score and rank opportunities
        5. Return top 6 opportunities
        6. Track as shown
        
        Response Time: <500ms from cache
        """
        try:
            user = request.user
            
            # 1. Get user's profile vector
            try:
                profile_vector = UserProfileVector.objects.select_related('profile').get(user=user)
                cluster_key = profile_vector.cluster_key
                user_profile_data = profile_vector.profile.profile_data
            except UserProfileVector.DoesNotExist:
                # Generate profile vector if not exists
                logger.info(f"Profile vector not found for user {user.id}, generating...")
                profile_vector = self._generate_profile_vector(user)
                if not profile_vector:
                    return Response({
                        'message': 'Please complete your profile questionnaire first',
                        'opportunities': []
                    })
                cluster_key = profile_vector.cluster_key
                user_profile_data = profile_vector.profile.profile_data
            
            # 2. Get opportunities from cache
            opportunities = OpportunityCache.objects.filter(
                cluster_key=cluster_key,
                is_active=True,
                expires_at__gt=timezone.now()
            )
            
            logger.info(f"Found {opportunities.count()} cached opportunities for cluster {cluster_key}")
            
            # If too few opportunities, trigger background refresh
            if opportunities.count() < 10:
                logger.info(f"Low opportunity count ({opportunities.count()}), triggering refresh")
                # Trigger async refresh (don't wait)
                self._trigger_async_refresh(user, cluster_key)
            
            # 3. Filter out shown opportunities (last 7 days)
            shown_hashes = UserShownOpportunity.objects.filter(
                user=user,
                shown_at__gte=timezone.now() - timedelta(days=7)
            ).values_list('opportunity_hash', flat=True)
            
            opportunities = opportunities.exclude(content_hash__in=shown_hashes)
            
            logger.info(f"{opportunities.count()} opportunities after filtering shown")
            
            # 4. Score and rank if we have more than 6
            if opportunities.count() > 6:
                opportunities_list = list(opportunities[:20])  # Top 20 for efficiency
                
                # Score with Gemini Flash (batch processing)
                scored_opportunities = []
                for opp in opportunities_list:
                    score = gemini_flash_service.score_opportunity(
                        {
                            'title': opp.title,
                            'description': opp.description,
                            'category': opp.category
                        },
                        user_profile_data
                    )
                    # Combine with base score
                    final_score = (score * 0.7) + (opp.relevance_base_score * 0.3)
                    scored_opportunities.append((opp, final_score))
                
                # Sort by score
                scored_opportunities.sort(key=lambda x: x[1], reverse=True)
                final_opportunities = [opp for opp, score in scored_opportunities[:6]]
            else:
                final_opportunities = list(opportunities[:6])
            
            # 5. Mark as shown and increment counts
            for opp in final_opportunities:
                UserShownOpportunity.objects.get_or_create(
                    user=user,
                    opportunity_hash=opp.content_hash,
                    defaults={'opportunity_title': opp.title}
                )
                opp.increment_shown()
            
            # 6. Serialize and return
            serializer = OpportunityCacheSerializer(final_opportunities, many=True)
            
            return Response({
                'count': len(final_opportunities),
                'cluster_key': cluster_key,
                'opportunities': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error in list opportunities: {e}")
            return Response(
                {'error': 'Failed to fetch opportunities'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """
        Force refresh opportunities for user
        Fetches new opportunities from Serper API
        
        Response Time: 8-10 seconds
        """
        try:
            user = request.user
            start_time = time.time()
            
            # Get profile vector
            try:
                profile_vector = UserProfileVector.objects.select_related('profile').get(user=user)
            except UserProfileVector.DoesNotExist:
                return Response({
                    'error': 'Profile not found. Please complete questionnaire first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cluster_key = profile_vector.cluster_key
            characteristics = profile_vector.characteristics
            
            logger.info(f"Refreshing opportunities for user {user.id}, cluster {cluster_key}")
            
            # Fetch new opportunities from Serper
            opportunities_data = serper_opportunity_fetcher.fetch_opportunities_for_cluster(
                characteristics,
                categories=['travel', 'job', 'investment']
            )
            
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
                    # Calculate expiry based on category
                    if opp_data['category'] == 'investment':
                        expires_at = timezone.now() + timedelta(days=7)
                    else:
                        expires_at = timezone.now() + timedelta(hours=24)
                    
                    # Create new opportunity
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
            
            # Log the fetch operation
            duration_ms = int((time.time() - start_time) * 1000)
            OpportunityFetchLog.objects.create(
                fetch_type='manual',
                cluster_key=cluster_key,
                status='success' if cached_count > 0 else 'partial',
                opportunities_fetched=len(opportunities_data),
                opportunities_cached=cached_count,
                duplicates_filtered=duplicate_count,
                duration_ms=duration_ms,
                api_calls=9  # Approximate
            )
            
            # Update cluster statistics
            self._update_cluster_stats(cluster_key)
            
            logger.info(f"Refresh complete: {cached_count} cached, {duplicate_count} duplicates")
            
            return Response({
                'status': 'success',
                'opportunities_fetched': len(opportunities_data),
                'opportunities_cached': cached_count,
                'duplicates_filtered': duplicate_count,
                'duration_ms': duration_ms,
                'message': f'Refreshed with {cached_count} new opportunities'
            })
            
        except Exception as e:
            logger.error(f"Error refreshing opportunities: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def click(self, request, pk=None):
        """Mark opportunity as clicked"""
        try:
            opportunity = OpportunityCache.objects.get(pk=pk)
            
            # Mark as clicked in UserShownOpportunity
            shown_opp = UserShownOpportunity.objects.filter(
                user=request.user,
                opportunity_hash=opportunity.content_hash
            ).first()
            
            if shown_opp:
                shown_opp.clicked = True
                shown_opp.clicked_at = timezone.now()
                shown_opp.save()
            
            # Increment click count
            opportunity.increment_click()
            
            return Response({'status': 'clicked'})
            
        except OpportunityCache.DoesNotExist:
            return Response(
                {'error': 'Opportunity not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Mark opportunity as dismissed"""
        try:
            opportunity = OpportunityCache.objects.get(pk=pk)
            
            # Mark as dismissed in UserShownOpportunity
            shown_opp = UserShownOpportunity.objects.filter(
                user=request.user,
                opportunity_hash=opportunity.content_hash
            ).first()
            
            if shown_opp:
                shown_opp.dismissed = True
                shown_opp.dismissed_at = timezone.now()
                shown_opp.save()
            
            return Response({'status': 'dismissed'})
            
        except OpportunityCache.DoesNotExist:
            return Response(
                {'error': 'Opportunity not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user's opportunity statistics"""
        try:
            user = request.user
            
            # Get profile vector
            profile_vector = UserProfileVector.objects.get(user=user)
            
            # Get cluster stats
            cluster_stats = ClusterStatistics.objects.filter(
                cluster_key=profile_vector.cluster_key
            ).first()
            
            # Get user-specific stats
            shown_count = UserShownOpportunity.objects.filter(user=user).count()
            clicked_count = UserShownOpportunity.objects.filter(user=user, clicked=True).count()
            
            user_click_rate = (clicked_count / shown_count * 100) if shown_count > 0 else 0
            
            return Response({
                'user_stats': {
                    'opportunities_shown': shown_count,
                    'opportunities_clicked': clicked_count,
                    'click_rate': round(user_click_rate, 2)
                },
                'cluster_stats': ClusterStatisticsSerializer(cluster_stats).data if cluster_stats else None
            })
            
        except UserProfileVector.DoesNotExist:
            return Response({
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get user's opportunity history"""
        try:
            shown_opportunities = UserShownOpportunity.objects.filter(
                user=request.user
            ).order_by('-shown_at')[:50]  # Last 50
            
            serializer = UserShownOpportunitySerializer(shown_opportunities, many=True)
            
            return Response({
                'count': shown_opportunities.count(),
                'history': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error fetching history: {e}")
            return Response(
                {'error': 'Failed to fetch history'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Helper methods
    
    def _generate_profile_vector(self, user):
        """Generate profile vector for user"""
        try:
            # Get user profile
            profile = UserProfile.objects.get(user=user)
            
            # Extract characteristics
            characteristics = gemini_flash_service.extract_characteristics(profile.profile_data)
            
            # Generate cluster key
            cluster_key = UserProfileVector.generate_cluster_key(characteristics)
            
            # Generate embedding
            embedding = gemini_flash_service.generate_profile_embedding(profile.profile_data)
            
            if not embedding:
                logger.error("Failed to generate embedding")
                return None
            
            # Create profile vector
            profile_vector = UserProfileVector.objects.create(
                user=user,
                profile=profile,
                embedding=embedding,
                cluster_key=cluster_key,
                characteristics=characteristics
            )
            
            logger.info(f"Generated profile vector for user {user.id}")
            
            # Update cluster statistics
            self._update_cluster_stats(cluster_key)
            
            return profile_vector
            
        except UserProfile.DoesNotExist:
            logger.error(f"User profile not found for user {user.id}")
            return None
        except Exception as e:
            logger.error(f"Error generating profile vector: {e}")
            return None
    
    def _trigger_async_refresh(self, user, cluster_key):
        """Trigger asynchronous refresh (placeholder for Celery task)"""
        # TODO: Implement Celery task
        logger.info(f"Async refresh triggered for cluster {cluster_key}")
        pass
    
    def _update_cluster_stats(self, cluster_key):
        """Update cluster statistics"""
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
            
            # Set next fetch time
            if cluster_stats.cached_opportunities < 20:
                cluster_stats.next_fetch_at = timezone.now()
            else:
                cluster_stats.next_fetch_at = timezone.now() + timedelta(hours=6)
            
            cluster_stats.save()
            
        except Exception as e:
            logger.error(f"Error updating cluster stats: {e}")


class ProfileVectorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserProfileVector (read-only)"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileVectorSerializer
    
    def get_queryset(self):
        return UserProfileVector.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def regenerate(self, request):
        """Regenerate profile vector"""
        try:
            user = request.user
            profile = UserProfile.objects.get(user=user)
            
            # Extract characteristics
            characteristics = gemini_flash_service.extract_characteristics(profile.profile_data)
            
            # Generate cluster key
            cluster_key = UserProfileVector.generate_cluster_key(characteristics)
            
            # Generate embedding
            embedding = gemini_flash_service.generate_profile_embedding(profile.profile_data)
            
            if not embedding:
                return Response(
                    {'error': 'Failed to generate embedding'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Update or create profile vector
            profile_vector, created = UserProfileVector.objects.update_or_create(
                user=user,
                defaults={
                    'profile': profile,
                    'embedding': embedding,
                    'cluster_key': cluster_key,
                    'characteristics': characteristics
                }
            )
            
            serializer = UserProfileVectorSerializer(profile_vector)
            
            return Response({
                'status': 'success',
                'created': created,
                'profile_vector': serializer.data
            })
            
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error regenerating profile vector: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
