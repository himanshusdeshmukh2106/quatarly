from django.urls import path
from .views import SubmitQuestionnaireView

urlpatterns = [
    path('submit/', SubmitQuestionnaireView.as_view(), name='questionnaire-submit'),
] 