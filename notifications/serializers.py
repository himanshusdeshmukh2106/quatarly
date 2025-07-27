from rest_framework import serializers
from .models import Notification
import datetime

class NotificationSerializer(serializers.Serializer):
    notification_type = serializers.CharField(max_length=100)
    app = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=255)
    text = serializers.CharField()
    bigText = serializers.CharField(required=False, allow_blank=True, help_text="Note the camelCase 'bigText' from the frontend.")
    time = serializers.CharField(help_text="The timestamp from the notification, e.g., '2023-10-27 10:00:00'")

    def create(self, validated_data):
        user = self.context['request'].user
        
        # The frontend sends 'time' as a string; convert it to a datetime object.
        # Assuming the format is 'YYYY-MM-DD HH:mm:ss' as is common with the listener library.
        try:
            posted_time = datetime.datetime.strptime(validated_data['time'], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            # As a fallback, handle Unix timestamps (in seconds)
            try:
                posted_time = datetime.datetime.fromtimestamp(int(validated_data['time']))
            except (ValueError, TypeError):
                raise serializers.ValidationError({"time": "Invalid timestamp format. Expected 'YYYY-MM-DD HH:mm:ss' or a Unix timestamp."})

        notification = Notification.objects.create(
            user=user,
            notification_type=validated_data['notification_type'],
            app=validated_data['app'],
            title=validated_data['title'],
            text=validated_data['text'],
            big_text=validated_data.get('bigText', None), # Use .get() for the optional 'bigText' field
            posted_time=posted_time
        )
        return notification

    def to_representation(self, instance):
        # controls the output when data is returned
        return {
            'id': instance.id,
            'status': 'Notification received successfully.'
        } 