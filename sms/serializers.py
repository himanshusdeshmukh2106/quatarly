from rest_framework import serializers
import datetime

from .models import SmsMessage


class SmsMessageSerializer(serializers.Serializer):
    """Serializer used by the mobile client to push SMS contents."""

    sender = serializers.CharField(max_length=100, allow_null=True, allow_blank=True)
    body = serializers.CharField()
    time = serializers.CharField(
        help_text="Timestamp of the SMS as sent by the client. Accepts 'YYYY-MM-DD HH:MM:SS' or a unix timestamp (seconds)."
    )

    def _parse_time(self, value: str) -> datetime.datetime:
        """Convert the incoming `time` value into a `datetime` instance."""
        if not value:
            return datetime.datetime.utcnow()

        # First attempt to parse standard string format.
        try:
            return datetime.datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass

        # Next try unix timestamp (seconds)
        try:
            return datetime.datetime.fromtimestamp(int(value))
        except (ValueError, OSError, TypeError):
            raise serializers.ValidationError({"time": "Invalid timestamp supplied."})

    def create(self, validated_data):
        user = self.context["request"].user
        received_at = self._parse_time(validated_data["time"])
        return SmsMessage.objects.create(
            user=user,
            sender=validated_data.get("sender"),
            body=validated_data["body"],
            received_at=received_at,
        )

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "status": "SMS stored successfully",
        } 