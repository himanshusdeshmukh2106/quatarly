from django.urls import path
from .views import SubmitQuestionnaireView, UserResponsesView

urlpatterns = [
    path('submit/', SubmitQuestionnaireView.as_view(), name='questionnaire-submit'),
    path('responses/', UserResponsesView.as_view(), name='questionnaire-responses'),
] 