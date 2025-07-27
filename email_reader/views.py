from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect
from django.conf import settings
from .services.gmail_service import GmailService
from .models import EmailAccount, Transaction
from google.oauth2.credentials import Credentials
from datetime import datetime
import json
from google.auth.transport.requests import Request

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_gmail_oauth(request):
    """Start Gmail OAuth flow"""
    gmail_service = GmailService()
    auth_url, state = gmail_service.get_authorization_url()
    
    # Store state in session for security
    request.session['oauth_state'] = state
    
    return Response({
        'authorization_url': auth_url,
        'state': state
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gmail_oauth_callback(request):
    """Handle OAuth callback"""
    code = request.GET.get('code')
    state = request.GET.get('state')

    session_state = request.session.get('oauth_state')
    if not session_state or state != session_state:
        return Response({'error': 'Invalid state parameter'},
                        status=status.HTTP_400_BAD_REQUEST)
    
    if not code:
        return Response({'error': 'No authorization code received'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        gmail_service = GmailService()
        credentials = gmail_service.exchange_code_for_tokens(code)
        
        # Get user email from credentials
        service = gmail_service.build_service(credentials)
        profile = service.users().getProfile(userId='me').execute()
        user_email = profile['emailAddress']
        
        # Create or update email account
        user = request.user
        email_account, created = EmailAccount.objects.update_or_create(
            user=user,
            email=user_email,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': credentials.expiry,
                'is_active': True,
            }
        )
        
        return Response({
            'success': True,
            'message': 'Gmail account connected successfully',
            'email': user_email
        })
        
    except Exception as e:
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_payment_emails(request):
    """Fetch and process payment emails"""
    try:
        user = request.user
        email_account = EmailAccount.objects.get(user=user, is_active=True)
        
        # Recreate credentials
        credentials = Credentials(
            token=email_account.access_token,
            refresh_token=email_account.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=settings.GMAIL_SCOPES
        )
        
        gmail_service = GmailService()

        # Check if token needs to be refreshed
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            email_account.access_token = credentials.token
            email_account.token_expiry = credentials.expiry
            email_account.save()

        service = gmail_service.build_service(credentials)
        
        # Search for payment emails
        messages = gmail_service.search_payment_emails(service)
        
        transactions = []
        for message in messages:
            message_details = gmail_service.get_message_details(service, message['id'])
            
            if message_details and message_details['transaction_data']:
                transaction_data = message_details['transaction_data']
                
                # Create transaction record
                transaction, created = Transaction.objects.get_or_create(
                    user=user,
                    transaction_id=transaction_data.get('transaction_id', f"missing-id-{message['id']}"),
                    defaults={
                        'email_account': email_account,
                        'amount': float(transaction_data.get('amount', '0').replace(',', '')),
                        'merchant': transaction_data.get('merchant', 'Unknown'),
                        'payment_method': transaction_data.get('payment_method', 'Unknown'),
                        'transaction_date': datetime.now(),  # Placeholder, should parse from email
                        'email_subject': message_details['subject'],
                        'email_body': message_details['body']
                    }
                )
                
                if created:
                    transactions.append({
                        'id': transaction.id,
                        'amount': transaction.amount,
                        'merchant': transaction.merchant,
                        'payment_method': transaction.payment_method,
                        'date': transaction.transaction_date.isoformat()
                    })
        
        return Response({
            'success': True,
            'transactions': transactions,
            'count': len(transactions)
        })
        
    except EmailAccount.DoesNotExist:
        return Response({'error': 'No Gmail account connected'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR) 