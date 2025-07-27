from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import SmsMessageSerializer


def _save_single_sms(request, payload: dict):
    serializer = SmsMessageSerializer(data=payload, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def receive_sms(request):
    """Endpoint used by the mobile application to push one or more SMS messages.

    The payload can either be a single object:

    ```json
    {
      "sender": "AXISBK",
      "body": "Your a/c ....",
      "time": "2025-07-08 09:10:11"
    }
    ```

    or an array of such objects.
    """
    data = request.data

    if isinstance(data, list):
        for item in data:
            _save_single_sms(request, item)
    elif isinstance(data, dict):
        _save_single_sms(request, data)
    else:
        return Response(
            {"detail": "Payload must be an object or list of objects."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"status": "success"}, status=status.HTTP_201_CREATED) 