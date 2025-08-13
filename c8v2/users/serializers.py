from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
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