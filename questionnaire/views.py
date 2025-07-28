from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Question, UserResponse
from .serializers import SubmissionSerializer

# Create your views here.

class SubmitQuestionnaireView(generics.GenericAPIView):
    """
    An endpoint for users to submit their questionnaire responses.
    """
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(request=request)
            
            # Set onboarding_complete to True for the user
            user = request.user
            user.onboarding_complete = True
            user.save(update_fields=['onboarding_complete'])

            return Response({"detail": "Responses submitted successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
