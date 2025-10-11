import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Question, UserResponse
from .serializers import SubmissionSerializer

logger = logging.getLogger(__name__)

# Create your views here.

class SubmitQuestionnaireView(generics.GenericAPIView):
    """
    An endpoint for users to submit their questionnaire responses.
    """
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        logger.info(f"Questionnaire submission started for user: {user.username}")

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            logger.error(f"Validation failed for user {user.username}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = serializer.save(request=request)

            # Check if there were any errors during save
            if result.get('errors'):
                logger.warning(f"Partial save for user {user.username}: {result['errors']}")

            # Set onboarding_complete to True for the user
            user.onboarding_complete = True
            user.save(update_fields=['onboarding_complete'])

            logger.info(f"Onboarding completed successfully for user: {user.username}")

            response_data = {
                "detail": "Responses submitted successfully.",
                "responses_saved": len(result.get('responses', [])),
                "onboarding_complete": True
            }

            if result.get('errors'):
                response_data['warnings'] = result['errors']

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error saving questionnaire for user {user.username}: {str(e)}")
            return Response(
                {"detail": "An error occurred while saving your responses. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserResponsesView(generics.ListAPIView):
    """
    An endpoint to fetch user questionnaire responses for profile generation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            responses = UserResponse.objects.filter(user=request.user).select_related('question')
            
            if not responses.exists():
                return Response({
                    'message': 'No questionnaire responses found. Please complete your profile.',
                    'responses': []
                })
            
            # Format responses for profile generation
            formatted_responses = []
            for response in responses:
                formatted_responses.append({
                    'question_id': response.question.id,
                    'question_text': response.question.text,
                    'question_group': response.question.group,
                    'selected_choices': response.selected_choices_text,
                    'custom_input': response.custom_input,
                    'expense_data': response.expense_data,
                })
            
            return Response({
                'responses': formatted_responses,
                'user_id': request.user.id,
                'username': request.user.username
            })
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch questionnaire responses.',
                'responses': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
