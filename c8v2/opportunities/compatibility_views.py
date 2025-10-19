"""
Backward Compatibility Views
Wraps the new EnhancedOpportunityViewSet to work with existing frontend
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import logging

from .enhanced_views import EnhancedOpportunityViewSet
from .enhanced_models import OpportunityCache, UserShownOpportunity

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_opportunities(request):
    """
    Backward compatible endpoint for listing opportunities
    Maps new OpportunityCache format to old Opportunity format
    """
    try:
        logger.info(f"[COMPAT] Fetching opportunities for user {request.user.id}")
        
        # Use the enhanced viewset
        viewset = EnhancedOpportunityViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get opportunities from new system
        response = viewset.list(request)
        
        logger.info(f"[COMPAT] Enhanced viewset returned status {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"[COMPAT] Error response: {response.data}")
            return response
        
        # Map to old format for backward compatibility
        opportunities = response.data.get('opportunities', [])
        
        logger.info(f"[COMPAT] Got {len(opportunities)} opportunities from new system")
        
        # Transform to old format
        old_format = []
        for opp in opportunities:
            old_format.append({
                'id': opp['id'],
                'title': opp['title'],
                'description': opp['description'],
                'category': opp['category'],
                'priority': opp['priority'],
                'ai_insights': opp.get('description', ''),  # Use description as insights
                'action_steps': [],  # Not available in OpportunityCache serializer
                'relevanceScore': opp['relevance_base_score'],  # Note: camelCase for frontend
                'image_url': opp.get('image_url', ''),
                'logo_url': opp.get('logo_url', ''),
                'offer_details': opp.get('offer_details', {}),
                'created_at': opp.get('fetched_at', timezone.now().isoformat()),
                'isActive': True,
                'viewed': False,  # Track separately in UserShownOpportunity
                'status': 'active'
            })
        
        logger.info(f"[COMPAT] Returning {len(old_format)} opportunities in old format")
        
        return Response(old_format)
        
    except Exception as e:
        logger.error(f"[COMPAT] Error in list_opportunities: {e}", exc_info=True)
        # Return empty array, not error object
        return Response([], status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_opportunities(request):
    """
    Backward compatible endpoint for refreshing opportunities
    """
    try:
        # Use the enhanced viewset
        viewset = EnhancedOpportunityViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Call refresh action
        response = viewset.refresh(request)
        
        if response.status_code != 200:
            return Response({
                'success': False,
                'count': 0,
                'message': response.data.get('error', 'Refresh failed'),
                'opportunities': []
            }, status=response.status_code)
        
        # Map response to old format
        data = response.data
        
        return Response({
            'success': True,
            'count': data.get('opportunities_cached', 0),
            'message': data.get('message', 'Opportunities refreshed'),
            'opportunities': []  # Don't return opportunities, let frontend fetch them
        })
        
    except Exception as e:
        logger.error(f"Error in compatibility refresh_opportunities: {e}")
        return Response({
            'success': False,
            'count': 0,
            'message': str(e),
            'opportunities': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def opportunity_detail(request, pk):
    """
    Backward compatible endpoint for opportunity details
    Handles viewed/dismissed status updates
    """
    try:
        # Get the opportunity
        opportunity = OpportunityCache.objects.get(pk=pk)
        
        if request.method == 'GET':
            # Return in old format
            return Response({
                'id': opportunity.id,
                'title': opportunity.title,
                'description': opportunity.description,
                'category': opportunity.category,
                'priority': opportunity.priority,
                'ai_insights': opportunity.description,
                'action_steps': [],
                'relevance_score': opportunity.relevance_base_score,
                'image_url': opportunity.image_url,
                'logo_url': opportunity.logo_url,
                'offer_details': opportunity.offer_details,
                'created_at': opportunity.fetched_at.isoformat(),
                'isActive': opportunity.is_active,
                'viewed': UserShownOpportunity.objects.filter(
                    user=request.user,
                    opportunity_hash=opportunity.content_hash
                ).exists(),
                'status': 'active'
            })
        
        elif request.method == 'PATCH':
            # Handle status updates
            status_field = request.data.get('status')
            viewed = request.data.get('viewed')
            
            if viewed:
                # Mark as viewed
                UserShownOpportunity.objects.get_or_create(
                    user=request.user,
                    opportunity_hash=opportunity.content_hash,
                    defaults={'opportunity_title': opportunity.title}
                )
            
            if status_field == 'dismissed':
                # Mark as dismissed
                shown_opp = UserShownOpportunity.objects.filter(
                    user=request.user,
                    opportunity_hash=opportunity.content_hash
                ).first()
                
                if shown_opp:
                    shown_opp.dismissed = True
                    shown_opp.dismissed_at = timezone.now()
                    shown_opp.save()
            
            if status_field == 'acted_upon':
                # Mark as clicked
                shown_opp = UserShownOpportunity.objects.filter(
                    user=request.user,
                    opportunity_hash=opportunity.content_hash
                ).first()
                
                if shown_opp:
                    shown_opp.clicked = True
                    shown_opp.clicked_at = timezone.now()
                    shown_opp.save()
                
                opportunity.increment_click()
            
            # Return updated opportunity
            return Response({
                'id': opportunity.id,
                'title': opportunity.title,
                'description': opportunity.description,
                'category': opportunity.category,
                'priority': opportunity.priority,
                'status': status_field or 'active'
            })
        
    except OpportunityCache.DoesNotExist:
        return Response({
            'error': 'Opportunity not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in opportunity_detail: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
