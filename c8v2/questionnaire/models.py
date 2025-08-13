from django.db import models
from django.conf import settings

# Create your models here.

class Question(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = 'SC', 'Single Choice'
        MULTIPLE_CHOICE = 'MC', 'Multiple Choice'
        TEXT = 'TX', 'Text Input'
        NUMBER = 'NU', 'Number Input'

    text = models.TextField()
    question_type = models.CharField(
        max_length=2,
        choices=QuestionType.choices,
        default=QuestionType.SINGLE_CHOICE,
    )
    custom_input_prompt = models.CharField(max_length=255, blank=True, null=True, help_text="Prompt for the custom input field, e.g., 'Enter amount'.")
    group = models.CharField(max_length=100, blank=True, help_text="A way to group related questions, e.g., 'Financial Goals'")
    order = models.PositiveIntegerField(default=0, help_text="The order in which the question should be displayed.")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0, help_text="The order in which the choice should be displayed.")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.question.text[:30]}... -> {self.text[:30]}..."

class UserResponse(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choices_text = models.JSONField(default=list, help_text="Stores the text of the selected choices as a list of strings.")
    custom_input = models.CharField(max_length=255, blank=True, null=True, help_text="For answers that require a custom text input.")
    expense_data = models.JSONField(null=True, blank=True, help_text="Stores structured expense data for the expenses question.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"Response by {self.user.email} for {self.question.text[:30]}..."
