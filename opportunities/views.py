from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from .models import Opportunity
from .serializers import OpportunitySerializer
from .services import OpportunityService
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class OpportunitiesListView(generics.ListAPIView):
    """
    API endpoint to fetch user opportunities
    """
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Opportunity.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        try:
            opportunity_service = OpportunityService()
            
            # Get opportunities (will return fresh ones or generate new ones)
            opportunities = opportunity_service.get_opportunities(request.user.id)
            
            if not opportunities:
                return Response({
                    'message': 'No opportunities could be generated. Please complete your profile questionnaire.',
                    'opportunities': []
                })
            
            # Return opportunities
            serializer = self.get_serializer(opportunities, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching opportunities for user {request.user.id}: {e}")
            return Response({
                'error': 'Failed to fetch opportunities. Please try again later.',
                'opportunities': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_opportunities(request):
    """
    API endpoint to synchronously refresh/regenerate user opportunities
    """
    try:
        opportunity_service = OpportunityService()
        
        # Synchronously refresh opportunities
        opportunities = opportunity_service.refresh_opportunities(request.user.id)
        
        if not opportunities:
            return Response({
                'message': 'No opportunities could be generated. Please complete your profile questionnaire.',
                'opportunities': []
            })
        
        # Return newly generated opportunities
        serializer = OpportunitySerializer(opportunities, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error refreshing opportunities for user {request.user.id}: {e}")
        return Response({
            'error': 'Failed to refresh opportunities. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)