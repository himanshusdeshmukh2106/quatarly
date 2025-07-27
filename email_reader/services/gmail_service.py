import os
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from django.conf import settings
import base64
import email
from email.mime.text import MIMEText
import re
from datetime import datetime, timedelta

class GmailService:
    def __init__(self):
        self.SCOPES = settings.GMAIL_SCOPES
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def get_authorization_url(self):
        """Generate OAuth authorization URL"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.SCOPES
        )
        flow.redirect_uri = self.redirect_uri
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return authorization_url, state

    def exchange_code_for_tokens(self, code):
        """Exchange authorization code for access tokens"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.SCOPES
        )
        flow.redirect_uri = self.redirect_uri
        flow.fetch_token(code=code)
        return flow.credentials

    def build_service(self, credentials):
        """Build Gmail service with credentials"""
        return build('gmail', 'v1', credentials=credentials)

    def search_payment_emails(self, service, days_back=30):
        """Search for payment-related emails"""
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Gmail search query
        query = f"(UPI OR payment OR transaction OR debited OR credited) after:{start_date.strftime('%Y/%m/%d')}"
        
        try:
            result = service.users().messages().list(
                userId='me',
                q=query,
                maxResults=100
            ).execute()
            
            messages = result.get('messages', [])
            return messages
        except Exception as error:
            print(f'An error occurred: {error}')
            return []

    def get_message_details(self, service, message_id):
        """Get detailed message content"""
        try:
            message = service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            return self.parse_message(message)
        except Exception as error:
            print(f'An error occurred: {error}')
            return None

    def parse_message(self, message):
        """Parse Gmail message to extract transaction details"""
        headers = message['payload'].get('headers', [])
        
        # Extract headers
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), '')
        date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
        
        # Extract body
        body = self.extract_body(message['payload'])
        
        # Parse transaction details
        transaction_data = self.extract_transaction_data(subject, body, sender)
        
        return {
            'subject': subject,
            'sender': sender,
            'date': date,
            'body': body,
            'transaction_data': transaction_data
        }

    def extract_body(self, payload):
        """Extract email body from payload"""
        body = ""
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                        break
        else:
            if payload['mimeType'] == 'text/plain':
                if 'data' in payload['body']:
                    body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        
        return body

    def extract_transaction_data(self, subject, body, sender):
        """Extract transaction details using regex patterns"""
        text = f"{subject} {body}"
        
        # Common patterns for Indian payment systems
        patterns = {
            'amount': [
                r'(?:₹|Rs\.?|INR)\s?([\d,]+\.?\d*)',
                r'(?:amount|paid|debited|credited).*?(?:₹|Rs\.?|INR)\s?([\d,]+\.?\d*)',
                r'([\d,]+\.?\d*)\s*(?:₹|Rs\.?|INR)'
            ],
            'merchant': [
                r'(?:to|at|from)\s+([A-Z][A-Za-z\s]+?)(?:\s+on|\s+via|\s+using)',
                r'Merchant:\s*([A-Za-z\s]+)',
                r'(?:paid to|received from)\s+([A-Z][A-Za-z\s]+)'
            ],
            'transaction_id': [
                r'(?:transaction|txn|ref)(?:\s+id)?:?\s*([A-Za-z0-9]+)',
                r'UTR:?\s*([A-Za-z0-9]+)',
                r'ID:?\s*([A-Za-z0-9]+)'
            ],
            'payment_method': [
                r'(UPI|Card|Net Banking|Wallet)',
                r'via\s+(UPI|Card|Net Banking|Wallet)',
                r'using\s+(UPI|Card|Net Banking|Wallet)'
            ]
        }
        
        extracted_data = {}
        
        for field, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    extracted_data[field] = match.group(1).strip()
                    break
        
        return extracted_data 