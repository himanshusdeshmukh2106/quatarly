from django.urls import path
from .views import CreateNotificationView, receive_notification

urlpatterns = [
    path('create/', CreateNotificationView.as_view(), name='notification-create'),
    path('receive/', receive_notification, name='notification-receive'),
] 