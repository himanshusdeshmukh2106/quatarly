from django.urls import path

from .views import receive_sms

urlpatterns = [
    path('receive/', receive_sms, name='sms-receive'),
] 