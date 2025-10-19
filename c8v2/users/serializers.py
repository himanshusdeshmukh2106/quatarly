from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model to be nested in the login response.
    """
    class Meta:
        model = CustomUser
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'onboarding_complete')

class CustomLoginSerializer(LoginSerializer):
    """
    Custom serializer for the login view to add user details to the response.
    """
    user = CustomUserDetailsSerializer(read_only=True)

class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom registration serializer that includes user details in the response.
    """
    def get_cleaned_data(self):
        """
        Override to ensure all required fields are properly handled.
        """
        data = super().get_cleaned_data()
        return data

    def custom_signup(self, request, user):
        """
        Custom signup logic if needed.
        """
        pass