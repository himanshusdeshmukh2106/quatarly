import logging
import json
from rest_framework import serializers
from .models import Question, UserResponse

logger = logging.getLogger(__name__)

class UserResponseSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choices = serializers.ListField(
       child=serializers.CharField(max_length=500),
       required=False,
       allow_empty=True
    )
    custom_input = serializers.CharField(max_length=5000, required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        """Ensure at least one of selected_choices or custom_input is provided"""
        selected_choices = data.get('selected_choices', [])
        custom_input = data.get('custom_input')

        if not selected_choices and not custom_input:
            raise serializers.ValidationError(
                f"Question {data.get('question_id')} must have either selected_choices or custom_input"
            )

        return data

class SubmissionSerializer(serializers.Serializer):
    responses = UserResponseSerializer(many=True)

    def validate_responses(self, value):
        """Validate that responses list is not empty"""
        if not value:
            raise serializers.ValidationError("At least one response is required")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        responses_data = validated_data['responses']

        logger.info(f"Processing {len(responses_data)} responses for user {user.username}")

        user_responses = []
        errors = []

        for response_data in responses_data:
            question_id = response_data['question_id']

            try:
                question = Question.objects.get(id=question_id)
            except Question.DoesNotExist:
                error_msg = f"Question with id={question_id} does not exist"
                logger.error(error_msg)
                errors.append(error_msg)
                continue

            defaults = {
                'selected_choices_text': response_data.get('selected_choices', []),
                'custom_input': response_data.get('custom_input'),
                'expense_data': None  # Reset expense data by default
            }

            # Handle the special case for the expenses question (id: 8)
            if question.id == 8 and defaults['custom_input']:
                try:
                    # The custom_input is a JSON string, parse it
                    expenses = json.loads(defaults['custom_input'])

                    # Validate expense data structure
                    if not isinstance(expenses, dict):
                        raise ValueError("Expense data must be a dictionary")

                    defaults['expense_data'] = expenses
                    # Clear the other fields for question 8 as they are not used
                    defaults['selected_choices_text'] = []
                    defaults['custom_input'] = None

                    logger.info(f"Parsed {len(expenses)} expenses for user {user.username}")

                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Could not parse custom_input JSON for question_id={question_id}: {e}")
                    # Save as raw string if parsing fails
                    defaults['custom_input'] = response_data.get('custom_input')
                    defaults['expense_data'] = None

            # Update or create the response
            try:
                response, created = UserResponse.objects.update_or_create(
                    user=user,
                    question=question,
                    defaults=defaults
                )
                action = "Created" if created else "Updated"
                logger.info(f"{action} response for question {question_id} (user: {user.username})")
                user_responses.append(response)

            except Exception as e:
                error_msg = f"Failed to save response for question {question_id}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        if errors:
            logger.warning(f"Completed with {len(errors)} errors: {errors}")

        logger.info(f"Successfully saved {len(user_responses)} responses for user {user.username}")

        return {'responses': user_responses, 'errors': errors if errors else None}