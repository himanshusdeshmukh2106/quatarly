from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Question
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
