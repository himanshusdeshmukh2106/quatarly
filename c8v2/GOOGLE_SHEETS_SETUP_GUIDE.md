# Google Sheets Finance Data Integration Environment Configuration

## Required Environment Variables

Add these variables to your .env file:

### Google Sheets API Credentials
# Google Sheets service account credentials (JSON format)
# Obtain from Google Cloud Console -> APIs & Services -> Credentials
GOOGLE_SHEETS_CREDENTIALS_JSON='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com"
}'

# Google Sheets Spreadsheet ID where financial data will be stored
# Extract from spreadsheet URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

## Setup Instructions

### 1. Create Google Cloud Project
1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API for your project

### 2. Create Service Account
1. Go to APIs & Services -> Credentials
2. Click "Create Credentials" -> "Service Account"
3. Provide a name and description
4. Download the JSON key file
5. Copy the JSON content to GOOGLE_SHEETS_CREDENTIALS_JSON

### 3. Create Google Spreadsheet (Optional - Auto-Creation Available)

**Option A: Automatic Creation (Recommended)**
1. Skip manual spreadsheet creation
2. The system will automatically create and configure a spreadsheet
3. Run the setup command: `python manage.py setup_google_sheets`
4. Copy the generated spreadsheet ID to your .env file
5. Share the auto-created spreadsheet with your service account

**Option B: Manual Creation**
1. Create a new Google Spreadsheet manually
2. Share it with your service account email (with Editor permissions)
3. Copy the spreadsheet ID from URL to GOOGLE_SHEETS_SPREADSHEET_ID

### 4. Install Required Python Packages
Add to your requirements.txt:
```
google-auth==2.23.4
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
google-api-python-client==2.108.0
```

### 5. Quick Setup with Auto-Creation

**Easiest Way:**
```bash
# Activate virtual environment
.\venv\Scripts\activate

# Run auto-setup
python manage.py setup_google_sheets

# Follow the prompts and copy the generated spreadsheet ID to .env
```

**Manual Testing:**
```bash
# Test connection only
python manage.py setup_google_sheets --test-only

# Show current spreadsheet info
python manage.py setup_google_sheets --show-info

# Force create new spreadsheet
python manage.py setup_google_sheets --force-create
```

### 6. Traditional Setup Method
Run the test command after setup:
```bash
python manage.py shell
>>> from investments.google_sheets_service import google_sheets_service
>>> google_sheets_service.test_connection()
```

## Google Finance Function Reference

The system uses these Google Finance functions:

### Basic Data Functions
- `=GOOGLEFINANCE("NSE:RELIANCE", "price")` - Current price
- `=GOOGLEFINANCE("NSE:RELIANCE", "volume")` - Trading volume
- `=GOOGLEFINANCE("NSE:RELIANCE", "marketcap")` - Market capitalization
- `=GOOGLEFINANCE("NSE:RELIANCE", "pe")` - P/E ratio

### Historical Data Functions
- `=GOOGLEFINANCE("NSE:RELIANCE", "price", DATE(2024,1,1), DATE(2024,12,31), "DAILY")` - OHLC data

### Supported Exchanges
- **NSE**: Indian stocks (NSE:RELIANCE)
- **NASDAQ**: US tech stocks (NASDAQ:AAPL)
- **NYSE**: US stocks (NYSE:JPM)
- **Crypto**: Cryptocurrencies (CURRENCY:BTCUSD)

## Data Update Schedule

### End-of-Day Updates (24-hour cycle)
- OHLC data refresh: 4-hour cache
- Market data refresh: 24-hour cache
- Comprehensive data sync: Daily at market close

### Celery Task Configuration
```python
# In your celery beat schedule
CELERY_BEAT_SCHEDULE = {
    'daily-google-sheets-sync': {
        'task': 'investments.tasks.sync_google_sheets_data',
        'schedule': crontab(hour=16, minute=0),  # 4 PM daily
    },
    'hourly-price-refresh': {
        'task': 'investments.tasks.refresh_google_sheets_prices',
        'schedule': crontab(minute=0),  # Every hour
    },
}
```

## Security Considerations

1. **Service Account Permissions**: Grant minimum required permissions
2. **Spreadsheet Access**: Share with service account only, not publicly
3. **Environment Variables**: Never commit credentials to version control
4. **API Quotas**: Monitor Google Sheets API usage limits
5. **Rate Limiting**: Implement proper request throttling

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check service account permissions on spreadsheet
2. **400 Bad Request**: Verify spreadsheet ID format
3. **Rate Limit**: Implement exponential backoff in requests
4. **Formula Errors**: Validate symbol formats for different exchanges

### Debug Commands
```bash
# Test Google Sheets connection
python manage.py shell -c "from investments.google_sheets_service import google_sheets_service; print(google_sheets_service.test_connection())"

# Clear cache
python manage.py shell -c "from investments.google_sheets_service import google_sheets_service; google_sheets_service.clear_cache()"

# Test data fetching
python manage.py shell -c "from investments.google_sheets_service import google_sheets_service; print(google_sheets_service.fetch_market_data_batch(['RELIANCE', 'TCS']))"
```