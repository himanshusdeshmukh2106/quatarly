from django.urls import path
from . import views

urlpatterns = [
    path('auth/gmail/initiate/', views.initiate_gmail_oauth, name='initiate_gmail_oauth'),
    path('auth/google/callback/', views.gmail_oauth_callback, name='gmail_oauth_callback'),
    path('emails/fetch/', views.fetch_payment_emails, name='fetch_payment_emails'),
] 