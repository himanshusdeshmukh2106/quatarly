import logging
import json
from rest_framework import serializers
from .models import Question, UserResponse

logger = logging.getLogger(__name__)

class UserResponseSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choices = serializers.ListField(
       child=serializers.CharField(max_length=500)
    )
    custom_input = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)

class SubmissionSerializer(serializers.Serializer):
    responses = UserResponseSerializer(many=True)

    def create(self, validated_data):
        user = self.context['request'].user
        responses_data = validated_data['responses']
        
        user_responses = []
        for response_data in responses_data:
            question_id = response_data['question_id']
            logger.info(f"Attempting to find Question with id={question_id}")
            try:
                question = Question.objects.get(id=question_id)
            except Question.DoesNotExist:
                logger.error(f"DATABASE ERROR: Question with id={question_id} was not found.")
                raise

            defaults = {
                'selected_choices_text': response_data['selected_choices'],
                'custom_input': response_data.get('custom_input'),
                'expense_data': None  # Reset expense data by default
            }

            # Handle the special case for the expenses question (id: 8)
            if question.id == 8 and defaults['custom_input']:
                try:
                    # The custom_input is a JSON string, parse it
                    expenses = json.loads(defaults['custom_input'])
                    defaults['expense_data'] = expenses
                    # Clear the other fields for question 8 as they are not used
                    defaults['selected_choices_text'] = []
                    defaults['custom_input'] = None
                except json.JSONDecodeError:
                    logger.error(f"Could not parse custom_input JSON for question_id={question_id}")
                    # Optionally, handle the error, e.g., by raising a validation error
                    # For now, we'll just log it and save it as a raw string
                    defaults['custom_input'] = response_data.get('custom_input')


            # Update or create the response
            response, created = UserResponse.objects.update_or_create(
                user=user,
                question=question,
                defaults=defaults
            )
            user_responses.append(response)
            
        return {'responses': user_responses} 