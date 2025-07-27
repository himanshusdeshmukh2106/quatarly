from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import NotificationSerializer
import datetime


# Create your views here.

class CreateNotificationView(generics.GenericAPIView):
    """
    An endpoint for the mobile app to send notification data.
    The user must be authenticated to associate the notification correctly.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Notification received successfully."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def receive_notification(request):
    """Endpoint used by the mobile application to push either UPI or SMS notifications.

    Expected payload format::
        {
            "type": "upi_notification" | "sms_messages",
            "data": {...} | [{...}, {...}]
        }
    For UPI we expect a single object, for SMS we accept a single object or list of objects.
    Each object should contain at minimum the fields required by ``NotificationSerializer``.
    """
    notification_type = request.data.get("type")
    data = request.data.get("data")

    if not notification_type or data is None:
        return Response(
            {"detail": "Both 'type' and 'data' are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if notification_type == "upi_notification":
        process_upi_notification(request, data)
    elif notification_type == "sms_messages":
        process_sms_messages(request, data)
    else:
        return Response(
            {"detail": f"Unknown notification type '{notification_type}'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"status": "success"}, status=status.HTTP_201_CREATED)


def _parse_posted_time(raw_time: str | int | float | None) -> datetime.datetime:
    """Utility to convert the incoming ``time`` value into a ``datetime`` instance.

    The mobile layer may send timestamps in two formats:
    1. A formatted string ``YYYY-MM-DD HH:MM:SS`` (default given by the listener lib)
    2. A Unix timestamp in **seconds**.
    """
    if raw_time is None:
        return datetime.datetime.utcnow()

    # Try the preferred string format first.
    if isinstance(raw_time, str):
        try:
            return datetime.datetime.strptime(raw_time, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            # Fall through to try unix ts parsing below.
            pass

    # Handle numeric or numeric-string unix timestamps.
    try:
        return datetime.datetime.fromtimestamp(int(raw_time))
    except (ValueError, OSError, TypeError):
        # As last resort fall back to now.
        return datetime.datetime.utcnow()


def process_upi_notification(request, payload: dict):
    """Create a Notification entry for a single UPI payment notification."""
    notification_data = {
        "notification_type": "upi_payment",
        "app": payload.get("app", "upi"),
        "title": payload.get("title", "UPI Payment"),
        "text": payload.get("text", ""),
        "bigText": payload.get("bigText", ""),
        "time": payload.get("time"),
    }

    serializer = NotificationSerializer(
        data=notification_data, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()


def process_sms_messages(request, messages):
    """Accept a single SMS dict or a list of them and store each as Notification."""
    if isinstance(messages, dict):
        messages = [messages]

    if not isinstance(messages, list):
        raise ValueError("'messages' must be a dict or list of dicts")

    for msg in messages:
        notification_data = {
            "notification_type": "sms_message",
            "app": msg.get("app", "sms"),
            "title": msg.get(
                "title",
                f"SMS from {msg.get('sender', 'unknown')}" if msg.get("sender") else "SMS Message",
            ),
            "text": msg.get("text", msg.get("body", "")),
            "bigText": msg.get("bigText", msg.get("full_text", "")),
            "time": msg.get("time"),
        }

        serializer = NotificationSerializer(
            data=notification_data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
