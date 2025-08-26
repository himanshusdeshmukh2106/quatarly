"""
Google Sheets Finance Service
Integrates with Google Sheets API to fetch financial data using Google Finance functions.
This service serves as the primary data source for OHLC and market data.
"""

import logging
import json
import time
import threading
import asyncio
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from decimal import Decimal
import re

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone



logger = logging.getLogger(__name__)


class CircularBufferManager:
    """Manages circular buffer allocation for conflict-free data processing"""
    
    def __init__(self, block_size: int = 30, total_blocks: int = 25, buffer_name: str = "default"):
        self.block_size = block_size
        self.total_blocks = total_blocks
        self.buffer_name = buffer_name
        self.current_block = 0
        self.block_status = {}  # Track block usage
        self.block_lock = threading.Lock()  # Thread safety
        
        logger.info(f"Initialized {buffer_name} circular buffer: {total_blocks} blocks of {block_size} rows each (starting from row 2)")
    
    def allocate_block(self) -> Tuple[int, int, int]:
        """Allocate the next available block with automatic cleanup
        
        Returns:
            Tuple[block_number, start_row, end_row] - Row numbers start from 2 (row 1 reserved for headers)
        """
        with self.block_lock:
            # Cleanup stale blocks (older than 10 minutes)
            self._cleanup_stale_blocks()
            
            # Find the next available block
            attempts = 0
            while attempts < self.total_blocks:
                block_number = self.current_block
                
                # Check if this block is available
                if block_number not in self.block_status:
                    # Calculate row range for this block (starting from row 2, row 1 reserved for headers)
                    start_row = 2 + (block_number * (self.block_size + 1))  # +1 for buffer row between blocks
                    end_row = start_row + self.block_size - 1
                    
                    # Mark block as in use
                    self.block_status[block_number] = {
                        'start_row': start_row,
                        'end_row': end_row,
                        'allocated_at': timezone.now(),
                        'status': 'allocated'
                    }
                    
                    # Move to next block for future allocations
                    self.current_block = (self.current_block + 1) % self.total_blocks
                    
                    logger.info(f"{self.buffer_name}: Allocated block {block_number} (rows {start_row}-{end_row})")
                    return block_number, start_row, end_row
                
                # Block in use, try next one
                self.current_block = (self.current_block + 1) % self.total_blocks
                attempts += 1
            
            # All blocks are in use - force reclaim oldest
            logger.warning(f"{self.buffer_name}: All blocks in use, reclaiming oldest block")
            return self._reclaim_oldest_block()
    
    def _cleanup_stale_blocks(self):
        """Clean up blocks that have been allocated for too long (> 10 minutes)"""
        current_time = timezone.now()
        stale_threshold = timedelta(minutes=10)
        
        stale_blocks = []
        for block_number, block_info in self.block_status.items():
            if current_time - block_info['allocated_at'] > stale_threshold:
                stale_blocks.append(block_number)
        
        for block_number in stale_blocks:
            logger.warning(f"{self.buffer_name}: Cleaning up stale block {block_number}")
            self.block_status.pop(block_number, None)
    
    def _reclaim_oldest_block(self) -> Tuple[int, int, int]:
        """Reclaim the oldest block when all are in use"""
        if not self.block_status:
            # Fallback to block 0 if no status tracked
            start_row = 2  # Start from row 2
            end_row = start_row + self.block_size - 1
            logger.warning(f"{self.buffer_name}: No block status tracked, using fallback block 0 (rows {start_row}-{end_row})")
            return 0, start_row, end_row
        
        # Find oldest allocated block
        oldest_block = min(self.block_status.keys(), 
                          key=lambda x: self.block_status[x]['allocated_at'])
        
        # Force release it
        block_info = self.block_status[oldest_block]
        self.release_block(oldest_block)
        
        # Reallocate it
        start_row = block_info['start_row']
        end_row = block_info['end_row']
        
        self.block_status[oldest_block] = {
            'start_row': start_row,
            'end_row': end_row,
            'allocated_at': timezone.now(),
            'status': 'reclaimed'
        }
        
        logger.warning(f"{self.buffer_name}: Reclaimed oldest block {oldest_block} (rows {start_row}-{end_row})")
        return oldest_block, start_row, end_row
    
    def release_block(self, block_number: int):
        """Release a block back to the pool"""
        with self.block_lock:
            if block_number in self.block_status:
                block_info = self.block_status.pop(block_number)
                logger.info(f"{self.buffer_name}: Released block {block_number} (rows {block_info['start_row']}-{block_info['end_row']})")
    
    def get_block_status(self) -> Dict:
        """Get current status of all blocks"""
        with self.block_lock:
            return {
                'buffer_name': self.buffer_name,
                'total_blocks': self.total_blocks,
                'blocks_in_use': len(self.block_status),
                'available_blocks': self.total_blocks - len(self.block_status),
                'current_pointer': self.current_block,
                'active_blocks': dict(self.block_status)
            }


class CircularBufferService:
    """Service to manage multiple circular buffers for different data types"""
    
    def __init__(self):
        # Separate buffers for different data types
        self.buffers = {
            'ohlc': CircularBufferManager(block_size=35, total_blocks=20, buffer_name="OHLC"),
            'market': CircularBufferManager(block_size=25, total_blocks=25, buffer_name="Market")
        }
        
        logger.info("Initialized CircularBufferService with OHLC and Market buffers")
    
    def allocate_ohlc_block(self) -> Tuple[int, int, int]:
        """Allocate a block for OHLC data processing"""
        return self.buffers['ohlc'].allocate_block()
    
    def allocate_market_block(self) -> Tuple[int, int, int]:
        """Allocate a block for market data processing"""
        return self.buffers['market'].allocate_block()
    
    def release_ohlc_block(self, block_number: int):
        """Release an OHLC block"""
        self.buffers['ohlc'].release_block(block_number)
    
    def release_market_block(self, block_number: int):
        """Release a market data block"""
        self.buffers['market'].release_block(block_number)
    
    def get_all_status(self) -> Dict:
        """Get status of all buffers"""
        return {
            'ohlc_buffer': self.buffers['ohlc'].get_block_status(),
            'market_buffer': self.buffers['market'].get_block_status(),
            'total_capacity': {
                'ohlc_concurrent_requests': self.buffers['ohlc'].total_blocks,
                'market_concurrent_requests': self.buffers['market'].total_blocks
            }
        }


class GoogleSheetsFinanceService:
    """
    Service for fetching financial data using Google Sheets with Google Finance functions.
    Implements caching strategy as per financial data management requirements:
    - 4 hours for daily OHLC data
    - 24 hours for enhanced market data
    """
    
    # Google Finance function attributes for different data types
    FINANCE_ATTRIBUTES = {
        # Price and basic data
        'price': 'price',
        'priceopen': 'priceopen',
        'high52': 'high52',
        'low52': 'low52',
        'volume': 'volume',
        'marketcap': 'marketcap',
        'pe': 'pe',
        'eps': 'eps',
        'beta': 'beta',
        'dividend': 'dividend',
        'dividendyield': 'dividendyield',
        'shares': 'shares',
        'currency': 'currency',
        'name': 'name',
        'exchange': 'exchange',
        
        # Additional calculated fields
        'changepct': 'changepct',
        'change': 'change',
        'closeyest': 'closeyest',
        'high': 'high',
        'low': 'low',
        'volumeavg': 'volumeavg',
    }
    
    # Cache TTL in seconds - 24 hour cycle for all data
    OHLC_DATA_TTL = 24 * 60 * 60  # 24 hours
    MARKET_DATA_TTL = 24 * 60 * 60  # 24 hours
    
    # Spreadsheet management settings
    MAX_ROWS_PER_SHEET = 900  # Reserve 100 rows for safety
    CLEANUP_THRESHOLD = 800  # Start cleanup when reaching this many rows
    ARCHIVE_OLDER_THAN_DAYS = 30  # Archive data older than 30 days
    MAX_ARCHIVE_SHEETS = 5  # Keep maximum 5 archive sheets
    
    def __init__(self):
        self.service = None
        self.spreadsheet_id = None
        # Multiple worksheet configuration
        self.worksheets = {
            'market_data': 'FinanceData',      # PE ratio, market cap, volume, etc.
            'ohlc_data': 'OHLCData',           # Historical OHLC data
            'symbol_directory': 'SymbolDirectory'  # Symbol registry and metadata
        }
        self.worksheet_name = self.worksheets['market_data']  # Default for backward compatibility
        self.auto_created = False
        
        # Initialize circular buffer service for conflict-free processing
        self.buffer_service = CircularBufferService()
        
        # Enhanced caching and resource management
        self.sheet_id_cache = {}
        self.sheet_id_lock = threading.Lock()
        self._connection_pool_size = 5  # Connection pool for better performance
        self._last_api_call = 0
        self._min_api_interval = 0.1  # Minimum 100ms between API calls
        
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Sheets API service with credentials"""
        try:
            # Get credentials from environment
            credentials_json = getattr(settings, 'GOOGLE_SHEETS_CREDENTIALS_JSON', None)
            self.spreadsheet_id = getattr(settings, 'GOOGLE_SHEETS_SPREADSHEET_ID', None)
            
            if not credentials_json:
                logger.error("Google Sheets credentials not configured")
                return
            
            # Parse credentials
            if isinstance(credentials_json, str):
                credentials_dict = json.loads(credentials_json)
            else:
                credentials_dict = credentials_json
            
            # Create credentials object
            credentials = Credentials.from_service_account_info(
                credentials_dict,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            
            # Build the service
            self.service = build('sheets', 'v4', credentials=credentials)
            logger.info("Google Sheets service initialized successfully")
            
            # Auto-create spreadsheet if not provided or doesn't exist
            if not self.spreadsheet_id:
                logger.info("No spreadsheet ID provided, creating new spreadsheet")
                self.spreadsheet_id = self._create_spreadsheet()
                if self.spreadsheet_id:
                    logger.info(f"✅ Auto-created spreadsheet: {self.spreadsheet_id}")
                    print(f"\n🎉 IMPORTANT: Add this to your .env file:")
                    print(f"GOOGLE_SHEETS_SPREADSHEET_ID={self.spreadsheet_id}\n")
            else:
                # Test if existing spreadsheet is accessible and create FinanceData worksheet
                if self._test_spreadsheet_access():
                    self._ensure_finance_data_worksheet()
                else:
                    logger.warning("Configured spreadsheet not accessible, creating new one")
                    self.spreadsheet_id = self._create_spreadsheet()
                    if self.spreadsheet_id:
                        logger.info(f"✅ Created new spreadsheet: {self.spreadsheet_id}")
                        print(f"\n🎉 IMPORTANT: Update your .env file:")
                        print(f"GOOGLE_SHEETS_SPREADSHEET_ID={self.spreadsheet_id}\n")
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets service: {e}")
            self.service = None
    
    def _rate_limit_api_call(self):
        """Enforce minimum interval between API calls to prevent quota exhaustion"""
        current_time = time.time()
        time_since_last_call = current_time - self._last_api_call
        
        if time_since_last_call < self._min_api_interval:
            sleep_time = self._min_api_interval - time_since_last_call
            time.sleep(sleep_time)
        
        self._last_api_call = time.time()
    
    def is_available(self) -> bool:
        """Check if Google Sheets service is available"""
        return self.service is not None and self.spreadsheet_id is not None
    

    

    
    def _create_spreadsheet(self) -> Optional[str]:
        """Create a new Google Spreadsheet for financial data"""
        if not self.service:
            logger.error("Google Sheets service not available for spreadsheet creation")
            return None
        
        try:
            # Create spreadsheet
            spreadsheet_body = {
                'properties': {
                    'title': f'Quatarly Finance Data - {datetime.now().strftime("%Y-%m-%d")}',
                    'locale': 'en_US',
                    'timeZone': 'UTC'
                },
                'sheets': [{
                    'properties': {
                        'title': self.worksheet_name,
                        'gridProperties': {
                            'rowCount': 1000,
                            'columnCount': 20
                        }
                    }
                }]
            }
            
            response = self.service.spreadsheets().create(
                body=spreadsheet_body
            ).execute()
            
            spreadsheet_id = response['spreadsheetId']
            self.auto_created = True
            
            # Configure the spreadsheet with headers and formatting
            self._setup_spreadsheet_structure(spreadsheet_id)
            
            logger.info(f"Successfully created new spreadsheet: {spreadsheet_id}")
            return spreadsheet_id
            
        except Exception as e:
            logger.error(f"Failed to create spreadsheet: {e}")
            return None
    
    def _test_spreadsheet_access(self) -> bool:
        """Test if the configured spreadsheet is accessible"""
        if not self.service or not self.spreadsheet_id:
            return False
        
        try:
            # Try to read basic spreadsheet info
            self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            return True
        except Exception as e:
            logger.warning(f"Cannot access spreadsheet {self.spreadsheet_id}: {e}")
            return False
    
    def _ensure_finance_data_worksheet(self):
        """Ensure all required worksheets exist, create if not"""
        try:
            # Get current spreadsheet info
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            existing_sheets = {sheet['properties']['title']: sheet['properties']['sheetId'] 
                             for sheet in spreadsheet['sheets']}
            
            requests = []
            
            # Check and create each required worksheet
            for sheet_type, sheet_name in self.worksheets.items():
                if sheet_name not in existing_sheets:
                    logger.info(f"Creating '{sheet_name}' worksheet for {sheet_type}")
                    
                    # Different column counts for different sheet types
                    column_count = 20  # Default
                    if sheet_type == 'ohlc_data':
                        column_count = 300  # More columns for OHLC historical data
                    elif sheet_type == 'symbol_directory':
                        column_count = 10   # Fewer columns for metadata
                    
                    request = {
                        'addSheet': {
                            'properties': {
                                'title': sheet_name,
                                'gridProperties': {
                                    'rowCount': 1000,
                                    'columnCount': column_count
                                }
                            }
                        }
                    }
                    requests.append(request)
                else:
                    logger.info(f"'{sheet_name}' worksheet already exists for {sheet_type}")
            
            # Execute batch creation if needed
            if requests:
                self.service.spreadsheets().batchUpdate(
                    spreadsheetId=self.spreadsheet_id,
                    body={'requests': requests}
                ).execute()
                
                # Set up structure for each new worksheet
                for sheet_type, sheet_name in self.worksheets.items():
                    if sheet_name not in existing_sheets:
                        self._setup_worksheet_structure(sheet_name, sheet_type)
                        
        except Exception as e:
            logger.error(f"Error ensuring worksheets exist: {e}")
    
    def _setup_worksheet_structure(self, sheet_name: str, sheet_type: str):
        """Set up the structure and formatting for specific worksheet types"""
        try:
            # Get spreadsheet info to find the sheet ID
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            # Find the target sheet ID
            target_sheet_id = 0
            for sheet in spreadsheet['sheets']:
                if sheet['properties']['title'] == sheet_name:
                    target_sheet_id = sheet['properties']['sheetId']
                    break
            
            if sheet_type == 'market_data':
                self._setup_market_data_sheet(target_sheet_id, sheet_name)
            elif sheet_type == 'ohlc_data':
                self._setup_ohlc_data_sheet(target_sheet_id, sheet_name)
            elif sheet_type == 'symbol_directory':
                self._setup_symbol_directory_sheet(target_sheet_id, sheet_name)
                
            logger.info(f"Successfully set up {sheet_type} worksheet: {sheet_name}")
            
        except Exception as e:
            logger.error(f"Failed to setup {sheet_type} worksheet {sheet_name}: {e}")
    
    def _setup_market_data_sheet(self, sheet_id: int, sheet_name: str):
        """Set up the market data sheet structure"""
        headers = [
            'Symbol', 'Price', 'Open', 'High', 'Low', 'Volume', 
            'MarketCap', 'PE', 'Name', 'Exchange', 'Currency', 
            'ChangePct', 'Change', 'LastUpdated'
        ]
        
        self._apply_sheet_formatting(sheet_id, sheet_name, headers)
        
        # Add sample data for market data
        sample_row = [
            'RELIANCE',
            '=GOOGLEFINANCE(A2, "price")',
            '=GOOGLEFINANCE(A2, "priceopen")',
            '=GOOGLEFINANCE(A2, "high")',
            '=GOOGLEFINANCE(A2, "low")',
            '=GOOGLEFINANCE(A2, "volume")',
            '=GOOGLEFINANCE(A2, "marketcap")',
            '=GOOGLEFINANCE(A2, "pe")',
            '=GOOGLEFINANCE(A2, "name")',
            '=GOOGLEFINANCE(A2, "exchange")',
            '=GOOGLEFINANCE(A2, "currency")',
            '=GOOGLEFINANCE(A2, "changepct")',
            '=GOOGLEFINANCE(A2, "change")',
            '=NOW()'
        ]
        
        self.service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f'{sheet_name}!A2:N2',
            valueInputOption='USER_ENTERED',
            body={'values': [sample_row]}
        ).execute()
    
    def _setup_ohlc_data_sheet(self, sheet_id: int, sheet_name: str):
        """Set up the OHLC data sheet structure"""
        headers = [
            'Symbol', 'TimeFrame', 'Days', 'StartCol', 'EndCol', 
            'DataRange', 'LastUpdated', 'Status'
        ]
        
        self._apply_sheet_formatting(sheet_id, sheet_name, headers)
        
        # Add instruction row
        instruction_row = [
            'SYMBOL_NAME', '1Day', '30', 'I2', 'N32', 
            'Historical OHLC data area', '=NOW()', 'Active'
        ]
        
        self.service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f'{sheet_name}!A2:H2',
            valueInputOption='USER_ENTERED',
            body={'values': [instruction_row]}
        ).execute()
    
    def _setup_symbol_directory_sheet(self, sheet_id: int, sheet_name: str):
        """Set up the symbol directory sheet structure"""
        headers = [
            'Symbol', 'Name', 'AssetType', 'Exchange', 'Currency',
            'Frequency', 'LastFetched', 'Status', 'Notes'
        ]
        
        self._apply_sheet_formatting(sheet_id, sheet_name, headers)
        
        # Add sample entry
        sample_row = [
            'LT', 'Larsen & Toubro', 'stock', 'NSE', 'INR',
            '0', '=NOW()', 'Active', 'Sample entry'
        ]
        
        self.service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f'{sheet_name}!A2:I2',
            valueInputOption='USER_ENTERED',
            body={'values': [sample_row]}
        ).execute()
    
    def _apply_sheet_formatting(self, sheet_id: int, sheet_name: str, headers: list):
        """Apply common formatting to a sheet"""
        requests = [
            # Add headers
            {
                'updateCells': {
                    'range': {
                        'sheetId': sheet_id,
                        'startRowIndex': 0,
                        'endRowIndex': 1,
                        'startColumnIndex': 0,
                        'endColumnIndex': len(headers)
                    },
                    'rows': [{
                        'values': [
                            {
                                'userEnteredValue': {'stringValue': header},
                                'userEnteredFormat': {
                                    'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9},
                                    'textFormat': {'bold': True},
                                    'horizontalAlignment': 'CENTER'
                                }
                            } for header in headers
                        ]
                    }],
                    'fields': 'userEnteredValue,userEnteredFormat'
                }
            },
            # Freeze header row
            {
                'updateSheetProperties': {
                    'properties': {
                        'sheetId': sheet_id,
                        'gridProperties': {
                            'frozenRowCount': 1
                        }
                    },
                    'fields': 'gridProperties.frozenRowCount'
                }
            },
            # Auto-resize columns
            {
                'autoResizeDimensions': {
                    'dimensions': {
                        'sheetId': sheet_id,
                        'dimension': 'COLUMNS',
                        'startIndex': 0,
                        'endIndex': len(headers)
                    }
                }
            }
        ]
        
        # Execute formatting requests
        self.service.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id,
            body={'requests': requests}
        ).execute()
    
    def _get_cache_key(self, symbol: str, data_type: str) -> str:
        """Generate cache key for symbol and data type"""
        return f"google_sheets:{data_type}:{symbol.upper()}"
    
    def _format_volume_indian(self, volume: float) -> str:
        """Format volume in Indian conventions (Cr, L, K)"""
        if volume is None or volume == 0:
            return "0"
        
        volume = float(volume)
        
        if volume >= 10_000_000:  # 1 Crore = 10 million
            return f"{volume / 10_000_000:.1f}Cr"
        elif volume >= 100_000:  # 1 Lakh = 100 thousand
            return f"{volume / 100_000:.1f}L"
        elif volume >= 1_000:
            return f"{volume / 1_000:.1f}K"
        else:
            return str(int(volume))
    
    def _create_finance_formula(self, symbol: str, attribute: str) -> str:
        """Create Google Finance formula for given symbol and attribute"""
        # Clean symbol for Google Finance
        clean_symbol = symbol.upper().strip()
        
        # Handle different symbol formats with better Indian stock detection
        if ':' not in clean_symbol:
            # Check if it's likely an Indian stock
            indian_stock_patterns = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'LT', 'BHARTIARTL', 'ITC', 'KOTAKBANK']
            
            if (clean_symbol in indian_stock_patterns or 
                (len(clean_symbol) <= 10 and 
                 not clean_symbol.endswith('USD') and 
                 not clean_symbol.startswith('BTC') and 
                 not clean_symbol.startswith('ETH'))):
                # Likely Indian stock, add NSE prefix
                clean_symbol = f"NSE:{clean_symbol}"
            elif clean_symbol.endswith('USD') or clean_symbol in ['BTC', 'ETH', 'LTC', 'DOGE', 'ADA']:
                # Cryptocurrency, use as is
                pass
            else:
                # US stock, add NASDAQ prefix (can be overridden)
                clean_symbol = f"NASDAQ:{clean_symbol}"
        
        return f'=GOOGLEFINANCE("{clean_symbol}", "{attribute}")'
    
    def _create_historical_formula(self, symbol: str, days: int = 30) -> str:
        """Create Google Finance formula for historical OHLC data - fetches all days together"""
        clean_symbol = symbol.upper().strip()
        
        # Apply same logic as _create_finance_formula for consistency
        if ':' not in clean_symbol:
            indian_stock_patterns = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'LT', 'BHARTIARTL', 'ITC', 'KOTAKBANK']
            
            if (clean_symbol in indian_stock_patterns or 
                (len(clean_symbol) <= 10 and 
                 not clean_symbol.endswith('USD') and 
                 not clean_symbol.startswith('BTC') and 
                 not clean_symbol.startswith('ETH'))):
                clean_symbol = f"NSE:{clean_symbol}"
            elif not (clean_symbol.endswith('USD') or clean_symbol in ['BTC', 'ETH', 'LTC', 'DOGE', 'ADA']):
                clean_symbol = f"NASDAQ:{clean_symbol}"
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        start_str = start_date.strftime("%Y-%m-%d")
        end_str = end_date.strftime("%Y-%m-%d")
        
        # Enhanced historical formula - fetches all OHLC data for the date range in one call
        # This returns: Date, Close, High, Low, Open, Volume columns automatically
        # Much more efficient than fetching day by day
        return f'=GOOGLEFINANCE("{clean_symbol}", "all", DATE({start_str.replace("-", ",")}), DATE({end_str.replace("-", ",")}), "DAILY")'
    
    def _prepare_batch_request(self, symbols: List[str], sheet_name: str = None) -> Dict[str, Any]:
        """Prepare batch request for multiple symbols"""
        if sheet_name is None:
            sheet_name = self.worksheet_name
            
        # Get the correct sheet ID for the specified worksheet
        try:
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            target_sheet_id = 0  # Default fallback
            for sheet in spreadsheet['sheets']:
                if sheet['properties']['title'] == sheet_name:
                    target_sheet_id = sheet['properties']['sheetId']
                    break
        except Exception as e:
            logger.warning(f"Could not get sheet ID for {sheet_name}, using default: {e}")
            target_sheet_id = 0
        
        requests = []
        row_offset = 1  # Start from row 2 (row 1 for headers)
        
        # Headers
        headers = ['Symbol', 'Price', 'Open', 'High', 'Low', 'Volume', 'MarketCap', 'PE', 'Name', 'Exchange', 'Currency', 'ChangePct', 'Change']
        
        # Add header row
        requests.append({
            'updateCells': {
                'range': {
                    'sheetId': target_sheet_id,
                    'startRowIndex': 0,
                    'endRowIndex': 1,
                    'startColumnIndex': 0,
                    'endColumnIndex': len(headers)
                },
                'rows': [{
                    'values': [{'userEnteredValue': {'stringValue': header}} for header in headers]
                }],
                'fields': 'userEnteredValue'
            }
        })
        
        # Add data rows for each symbol
        for i, symbol in enumerate(symbols):
            row_index = row_offset + i
            
            # Create formulas for each attribute
            formulas = [
                symbol,  # Symbol (literal)
                self._create_finance_formula(symbol, 'price'),
                self._create_finance_formula(symbol, 'priceopen'),
                self._create_finance_formula(symbol, 'high'),
                self._create_finance_formula(symbol, 'low'),
                self._create_finance_formula(symbol, 'volume'),
                self._create_finance_formula(symbol, 'marketcap'),
                self._create_finance_formula(symbol, 'pe'),
                self._create_finance_formula(symbol, 'name'),
                self._create_finance_formula(symbol, 'exchange'),
                self._create_finance_formula(symbol, 'currency'),
                self._create_finance_formula(symbol, 'changepct'),
                self._create_finance_formula(symbol, 'change'),
            ]
            
            # Create row values
            row_values = []
            for j, formula in enumerate(formulas):
                if j == 0:  # Symbol column
                    row_values.append({'userEnteredValue': {'stringValue': formula}})
                else:  # Formula columns
                    row_values.append({'userEnteredValue': {'formulaValue': formula}})
            
            requests.append({
                'updateCells': {
                    'range': {
                        'sheetId': target_sheet_id,
                        'startRowIndex': row_index,
                        'endRowIndex': row_index + 1,
                        'startColumnIndex': 0,
                        'endColumnIndex': len(headers)
                    },
                    'rows': [{'values': row_values}],
                    'fields': 'userEnteredValue'
                }
            })
        
        return {
            'requests': requests
        }
    
    def fetch_market_data_batch(self, symbols: List[str], force_refresh: bool = False) -> Dict[str, Dict]:
        """
        Fetch market data for multiple symbols using circular buffer system and multi-sheet load balancing
        for conflict-free processing with improved rate limits
        """
        if not self.is_available():
            logger.error("Google Sheets service not available")
            return {}
        
        logger.info(f"Starting market data fetch for {len(symbols)} symbols, force_refresh={force_refresh}")
        
        # Use standard execution
        return self._fetch_market_data_internal(symbols, force_refresh) or {}
    
    def _fetch_market_data_internal(self, symbols: List[str], force_refresh: bool = False) -> Dict[str, Dict]:
        """
        Internal method to fetch market data using current spreadsheet_id
        """
        # Use dedicated market data sheet
        market_data_sheet = self.worksheets['market_data']
        
        # Check cache first (unless force refresh)
        cached_data = {}
        missing_symbols = symbols
        
        if not force_refresh:
            logger.debug("Checking cache for existing data")
            missing_symbols = []
            
            for symbol in symbols:
                cache_key = self._get_cache_key(symbol, 'market_data')
                cached = cache.get(cache_key)
                if cached:
                    cached_data[symbol] = cached
                    logger.debug(f"Found cached data for {symbol}")
                else:
                    missing_symbols.append(symbol)
            
            # If all data is cached, return it
            if not missing_symbols:
                logger.info(f"Returning cached market data for all {len(symbols)} symbols")
                return cached_data
            
            logger.info(f"Found cached data for {len(cached_data)} symbols, fetching {len(missing_symbols)} from sheets")
        
        try:
            # Allocate a block from the market data circular buffer
            block_number, start_row, end_row = self.buffer_service.allocate_market_block()
            
            logger.info(f"Market data: Allocated block {block_number} (rows {start_row}-{end_row}) for {len(missing_symbols)} symbols on sheet {self.spreadsheet_id[:20]}...")
            
            try:
                # Prepare batch request for the allocated block
                logger.debug("Preparing batch request for market data")
                batch_request = self._prepare_market_batch_request(missing_symbols, market_data_sheet, start_row)
                
                # Execute batch update in the allocated block
                logger.info(f"Executing batch update with {len(batch_request['requests'])} requests")
                
                # Optimized retry logic with jittered exponential backoff
                max_retries = 3  # Reduced retries for efficiency
                base_delay = 1
                for attempt in range(max_retries):
                    try:
                        # Add jittered exponential backoff to prevent thundering herd
                        if attempt > 0:
                            import random
                            jitter = random.uniform(0.1, 0.3)
                            delay = min((base_delay * (2 ** attempt)) + jitter, 8)  # Cap at 8 seconds
                            logger.info(f"Retrying batch update after {delay:.1f}s delay (attempt {attempt + 1})")
                            time.sleep(delay)
                        
                        self.service.spreadsheets().batchUpdate(
                            spreadsheetId=self.spreadsheet_id,
                            body=batch_request
                        ).execute()
                        logger.debug(f"Batch update successful on attempt {attempt + 1}")
                        break
                    except Exception as batch_error:
                        error_msg = str(batch_error)
                        if 'SSL' in error_msg or 'ssl' in error_msg.lower():
                            logger.warning(f"SSL error on batch update attempt {attempt + 1}: {batch_error}")
                        elif 'timeout' in error_msg.lower():
                            logger.warning(f"Timeout on batch update attempt {attempt + 1}: {batch_error}")
                        else:
                            logger.warning(f"Batch update attempt {attempt + 1} failed: {batch_error}")
                        
                        if attempt == max_retries - 1:
                            logger.error(f"All {max_retries} batch update attempts failed")
                            raise
                
                # Wait longer for formulas to calculate (Google Finance needs more time)
                logger.debug("Waiting for formulas to calculate...")
                time.sleep(8)  # Increased from 3 to 8 seconds for reliable Google Finance calculation
                
                # Read the results from the allocated block
                result_range = f"{market_data_sheet}!A{start_row}:M{start_row + len(missing_symbols)}"
                logger.info(f"Reading results from range: {result_range}")
                
                # Add retry logic for reading results with better SSL handling
                result = None
                for attempt in range(max_retries):
                    try:
                        # Add small delay for read operations too
                        if attempt > 0:
                            delay = min(2 ** attempt, 8)  # Shorter delay for reads
                            logger.info(f"Retrying read results after {delay}s delay (attempt {attempt + 1})")
                            time.sleep(delay)
                        
                        result = self.service.spreadsheets().values().get(
                            spreadsheetId=self.spreadsheet_id,
                            range=result_range,
                            valueRenderOption='FORMATTED_VALUE'
                        ).execute()
                        logger.debug(f"Read results successful on attempt {attempt + 1}")
                        break
                    except Exception as read_error:
                        error_msg = str(read_error)
                        if 'SSL' in error_msg or 'ssl' in error_msg.lower():
                            logger.warning(f"SSL error on read attempt {attempt + 1}: {read_error}")
                        elif 'timeout' in error_msg.lower():
                            logger.warning(f"Timeout on read attempt {attempt + 1}: {read_error}")
                        else:
                            logger.warning(f"Read results attempt {attempt + 1} failed: {read_error}")
                        
                        if attempt == max_retries - 1:
                            logger.error(f"All {max_retries} read attempts failed")
                            raise
                
                values = result.get('values', [])
                logger.info(f"Retrieved {len(values)} rows of data from sheets")
                
                if len(values) < 2:  # No data rows (need at least header + 1 data row)
                    logger.warning("No data returned from Google Sheets market data")
                    return cached_data if not force_refresh else {}
                
                # Parse results
                headers = values[0] if values else []
                market_data = {}
                
                logger.debug(f"Processing {len(values) - 1} data rows with headers: {headers}")
                
                for i, row in enumerate(values[1:]):  # Skip header row
                    if len(row) < len(headers) or i >= len(missing_symbols):
                        logger.debug(f"Skipping incomplete row {i}: {len(row)} columns vs {len(headers)} headers")
                        continue
                    
                    symbol = missing_symbols[i]  # Use original symbol order
                    logger.debug(f"Processing row {i} for symbol {symbol}")
                    
                    try:
                        # Parse numeric values safely
                        def safe_float(value, default=None):
                            if value in ['', '#N/A', '#ERROR!', '#VALUE!']:
                                return default
                            try:
                                clean_value = str(value).replace(',', '').replace('$', '').replace('%', '')
                                return float(clean_value) if clean_value else default
                            except (ValueError, TypeError):
                                return default
                        
                        # Extract data (adjust indices based on your header structure)
                        price = safe_float(row[1] if len(row) > 1 else None)
                        open_price = safe_float(row[2] if len(row) > 2 else None)
                        high = safe_float(row[3] if len(row) > 3 else None)
                        low = safe_float(row[4] if len(row) > 4 else None)
                        volume = safe_float(row[5] if len(row) > 5 else None)
                        market_cap = safe_float(row[6] if len(row) > 6 else None)
                        pe_ratio = safe_float(row[7] if len(row) > 7 else None)
                        name = row[8] if len(row) > 8 else symbol
                        exchange = row[9] if len(row) > 9 else 'Unknown'
                        currency = row[10] if len(row) > 10 else 'INR'
                        change_pct = safe_float(row[11] if len(row) > 11 else None)
                        change = safe_float(row[12] if len(row) > 12 else None)
                        
                        # Only include data if we have meaningful price data
                        if price is not None and price > 0:
                            # Format volume
                            formatted_volume = self._format_volume_indian(volume) if volume else "0"
                            
                            # Convert market cap from raw rupees to crores
                            market_cap_crores = None
                            if market_cap is not None and market_cap > 0:
                                market_cap_crores = market_cap / 10000000  # Convert from rupees to crores
                            
                            data = {
                                'current_price': price,
                                'open_price': open_price,
                                'high': high,
                                'low': low,
                                'volume': formatted_volume,
                                'raw_volume': volume,
                                'market_cap': market_cap_crores,
                                'pe_ratio': pe_ratio,
                                'company_name': name,
                                'exchange': exchange,
                                'currency': currency,
                                'daily_change_percent': change_pct,
                                'daily_change': change,
                                'last_updated': timezone.now().isoformat(),
                            }
                            
                            market_data[symbol] = data
                            logger.debug(f"Successfully parsed data for {symbol}: ₹{price}")
                            
                            # Cache the data with symbol-specific key
                            cache_key = self._get_cache_key(symbol, 'market_data')
                            cache.set(cache_key, data, self.MARKET_DATA_TTL)
                            
                        else:
                            logger.warning(f"No valid price data for {symbol}: price={price}")
                            
                    except Exception as e:
                        logger.error(f"Error parsing market data for symbol {symbol}: {e}")
                        continue
                
                # Clear the used block for reuse
                logger.debug("Clearing used block for reuse")
                self._clear_market_block(market_data_sheet, start_row, end_row)
                
                logger.info(f"Successfully fetched market data for {len(market_data)}/{len(missing_symbols)} symbols using load-balanced circular buffer")
                return {**cached_data, **market_data} if not force_refresh else market_data
                
            finally:
                # Always release the block
                logger.debug(f"Releasing market buffer block {block_number}")
                self.buffer_service.release_market_block(block_number)
                
        except HttpError as e:
            error_code = e.resp.status if hasattr(e, 'resp') else 'unknown'
            logger.error(f"Google Sheets API HTTP error {error_code}: {e}")
            
            # Handle specific error codes
            if error_code == 429:  # Rate limit exceeded
                logger.warning("Rate limit exceeded, backing off...")
                time.sleep(60)  # Wait 1 minute before retry
            elif error_code in [500, 502, 503, 504]:  # Server errors
                logger.warning(f"Server error {error_code}, retrying...")
                time.sleep(5)
            
            return cached_data if not force_refresh else {}
        except Exception as e:
            logger.error(f"Unexpected error in _fetch_market_data_internal: {e}")
            return cached_data if not force_refresh else {}
    
    def _prepare_market_batch_request(self, symbols: List[str], sheet_name: str, start_row: int) -> Dict:
        """Prepare batch request for market data in allocated block with headers"""
        logger.info(f"Preparing market batch request for {len(symbols)} symbols starting at row {start_row}")
        
        headers = ['Symbol', 'Price', 'Open', 'High', 'Low', 'Volume', 'Market Cap', 'PE Ratio', 'Name', 'Exchange', 'Currency', 'Change %', 'Change']
        
        requests = []
        sheet_id = self._get_sheet_id(sheet_name)
        
        # Always set headers in row 1 for this sheet (if not already set)
        logger.debug(f"Setting headers in row 1: {headers}")
        requests.append({
            'updateCells': {
                'range': {
                    'sheetId': sheet_id,
                    'startRowIndex': 0,  # Row 1 (0-indexed)
                    'endRowIndex': 1,
                    'startColumnIndex': 0,
                    'endColumnIndex': len(headers)
                },
                'rows': [{
                    'values': [{
                        'userEnteredValue': {'stringValue': header},
                        'userEnteredFormat': {
                            'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9},
                            'textFormat': {'bold': True}
                        }
                    } for header in headers]
                }],
                'fields': 'userEnteredValue,userEnteredFormat'
            }
        })
        
        # Add symbol data rows starting from start_row (which should be >= 2)
        for i, symbol in enumerate(symbols):
            row_index = start_row - 1 + i  # Convert to 0-indexed
            logger.debug(f"Adding formula row for {symbol} at row {start_row + i} (0-indexed: {row_index})")
            
            formulas = [
                symbol,  # Symbol column (string, not formula)
                self._create_finance_formula(symbol, 'price'),
                self._create_finance_formula(symbol, 'priceopen'),
                self._create_finance_formula(symbol, 'high'),
                self._create_finance_formula(symbol, 'low'),
                self._create_finance_formula(symbol, 'volume'),
                self._create_finance_formula(symbol, 'marketcap'),
                self._create_finance_formula(symbol, 'pe'),
                self._create_finance_formula(symbol, 'name'),
                self._create_finance_formula(symbol, 'exchange'),
                self._create_finance_formula(symbol, 'currency'),
                self._create_finance_formula(symbol, 'changepct'),
                self._create_finance_formula(symbol, 'change'),
            ]
            
            # Create row values
            row_values = []
            for j, formula in enumerate(formulas):
                if j == 0:  # Symbol column
                    row_values.append({'userEnteredValue': {'stringValue': formula}})
                else:  # Formula columns
                    row_values.append({'userEnteredValue': {'formulaValue': formula}})
            
            requests.append({
                'updateCells': {
                    'range': {
                        'sheetId': sheet_id,
                        'startRowIndex': row_index,
                        'endRowIndex': row_index + 1,
                        'startColumnIndex': 0,
                        'endColumnIndex': len(headers)
                    },
                    'rows': [{'values': row_values}],
                    'fields': 'userEnteredValue'
                }
            })
        
        logger.info(f"Prepared {len(requests)} batch requests (1 header + {len(symbols)} data rows)")
        return {'requests': requests}
    
    def _clear_market_block(self, sheet_name: str, start_row: int, end_row: int):
        """Clear market data block for reuse (preserving headers in row 1)"""
        try:
            # Clear only data rows, not headers (start from row 2 minimum)
            clear_start = max(start_row, 2)
            clear_range = f"{sheet_name}!A{clear_start}:M{end_row}"
            
            logger.info(f"Clearing market data block: {clear_range} (preserving headers in row 1)")
            
            self.service.spreadsheets().values().clear(
                spreadsheetId=self.spreadsheet_id,
                range=clear_range
            ).execute()
            
            logger.debug(f"Successfully cleared market data block: {clear_range}")
            
        except Exception as e:
            logger.error(f"Error clearing market data block {clear_range}: {e}")
    
    def _prepare_ohlc_batch_request(self, symbol: str, sheet_name: str, start_row: int, days: int) -> Dict:
        """Prepare batch request for OHLC historical data - fetches all days together in columns H-M"""
        logger.info(f"Preparing OHLC batch request for {symbol} starting at row {start_row}, {days} days (historical fetch)")
        
        formula = self._create_historical_formula(symbol, days)
        sheet_id = self._get_sheet_id(sheet_name)
        
        requests = []
        
        # Set OHLC headers in row 1 (columns H-M) matching Google Finance historical output
        # Google Finance "all" returns: Date, Close, High, Low, Open, Volume
        # We'll rearrange to: Date/Time, Open, High, Low, Close, Volume (H-M)
        ohlc_headers = ['Date/Time', 'Open', 'High', 'Low', 'Close', 'Volume']
        logger.debug(f"Setting OHLC headers in row 1, columns H-M: {ohlc_headers}")
        
        requests.append({
            'updateCells': {
                'range': {
                    'sheetId': sheet_id,
                    'startRowIndex': 0,  # Row 1 (0-indexed)
                    'endRowIndex': 1,
                    'startColumnIndex': 7,  # Column H (0-indexed)
                    'endColumnIndex': 13   # Through column M
                },
                'rows': [{
                    'values': [{
                        'userEnteredValue': {'stringValue': header},
                        'userEnteredFormat': {
                            'backgroundColor': {'red': 0.8, 'green': 0.9, 'blue': 1.0},
                            'textFormat': {'bold': True}
                        }
                    } for header in ohlc_headers]
                }],
                'fields': 'userEnteredValue,userEnteredFormat'
            }
        })
        
        # Write the GOOGLEFINANCE historical formula to column H at start_row
        # This single formula will populate all the historical data automatically
        logger.debug(f"Writing OHLC historical formula for {symbol} to H{start_row}: {formula[:80]}...")
        
        requests.append({
            'updateCells': {
                'range': {
                    'sheetId': sheet_id,
                    'startRowIndex': start_row - 1,  # Convert to 0-indexed
                    'endRowIndex': start_row,
                    'startColumnIndex': 7,  # Column H (0-indexed) - where historical data starts
                    'endColumnIndex': 8
                },
                'rows': [{'values': [{'userEnteredValue': {'formulaValue': formula}}]}],
                'fields': 'userEnteredValue'
            }
        })
        
        logger.info(f"Prepared OHLC historical batch request with {len(requests)} operations (headers + historical formula)")
        return {'requests': requests}
    
    def _clear_ohlc_block(self, sheet_name: str, start_row: int, end_row: int):
        """Clear OHLC data block for reuse (preserving headers in row 1)"""
        try:
            # Clear only data rows in columns H-M, not headers (start from row 2 minimum)
            clear_start = max(start_row, 2)
            clear_range = f"{sheet_name}!H{clear_start}:M{end_row}"
            
            logger.info(f"Clearing OHLC data block: {clear_range} (preserving headers in row 1)")
            
            self.service.spreadsheets().values().clear(
                spreadsheetId=self.spreadsheet_id,
                range=clear_range
            ).execute()
            
            logger.debug(f"Successfully cleared OHLC data block: {clear_range}")
            
        except Exception as e:
            logger.error(f"Error clearing OHLC data block {clear_range}: {e}")
    
    def fetch_ohlc_data_batch(self, symbols: List[str], start_date: str = None, end_date: str = None, force_refresh: bool = False) -> Dict[str, List[Dict]]:
        """
        Fetch OHLC data for multiple symbols using historical data function (efficient batch processing)
        
        Args:
            symbols: List of stock symbols
            start_date: Start date (format: YYYY-MM-DD) - calculated as days difference
            end_date: End date (format: YYYY-MM-DD) - used as reference
            force_refresh: Whether to force refresh cached data
            
        Returns:
            Dict mapping symbol to list of OHLC data points
        """
        if not symbols:
            return {}
            
        # Calculate days from date range if provided
        days = 30  # default
        if start_date and end_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                days = (end_dt - start_dt).days
                days = max(1, min(days, 365))  # Clamp to reasonable range
            except ValueError:
                logger.warning(f"Invalid date format, using default {days} days")
        
        logger.info(f"Fetching OHLC historical data for {len(symbols)} symbols, {days} days (batch mode)")
        
        # Use concurrent processing for better performance
        results = {}
        failed_symbols = []
        
        # Process symbols in smaller batches to avoid overwhelming the API
        batch_size = 5  # Process 5 symbols concurrently
        for i in range(0, len(symbols), batch_size):
            batch_symbols = symbols[i:i + batch_size]
            batch_start_time = time.time()
            
            logger.info(f"Processing OHLC batch {i//batch_size + 1}: {batch_symbols}")
            
            # Process each symbol in the batch
            for symbol in batch_symbols:
                try:
                    ohlc_data = self.fetch_ohlc_data(symbol, days=days, force_refresh=force_refresh)
                    if ohlc_data:
                        results[symbol] = ohlc_data
                        logger.debug(f"OHLC data for {symbol}: {len(ohlc_data)} data points")
                    else:
                        logger.warning(f"No OHLC historical data returned for {symbol}")
                        failed_symbols.append(symbol)
                except Exception as e:
                    logger.error(f"Failed to fetch OHLC historical data for {symbol}: {e}")
                    failed_symbols.append(symbol)
            
            batch_time = time.time() - batch_start_time
            logger.info(f"Batch {i//batch_size + 1} completed in {batch_time:.2f}s: {len([s for s in batch_symbols if s in results])}/{len(batch_symbols)} successful")
            
            # Small delay between batches to respect rate limits
            if i + batch_size < len(symbols):
                time.sleep(0.5)
                
        logger.info(f"OHLC historical batch completed: {len(results)}/{len(symbols)} symbols successful")
        if failed_symbols:
            logger.warning(f"Failed symbols: {failed_symbols}")
            
        return results

    def fetch_ohlc_data(self, symbol: str, days: int = 30, force_refresh: bool = False) -> List[Dict]:
        """
        Fetch OHLC historical data for a symbol using circular buffer system for conflict-free processing
        """
        if not self.is_available():
            logger.error("Google Sheets service not available")
            return []
        
        logger.info(f"Starting OHLC data fetch for {symbol}, {days} days, force_refresh={force_refresh}")
        
        # Check cache first
        cache_key = self._get_cache_key(symbol, f'ohlc_{days}d')
        if not force_refresh:
            cached = cache.get(cache_key)
            if cached:
                logger.info(f"Returning cached OHLC data for {symbol} ({len(cached)} data points)")
                return cached
        
        try:
            # Allocate a block from the OHLC circular buffer
            block_number, start_row, end_row = self.buffer_service.allocate_ohlc_block()
            
            logger.info(f"OHLC data: Allocated block {block_number} (rows {start_row}-{end_row}) for symbol {symbol}")
            
            try:
                # Use dedicated OHLC sheet
                ohlc_sheet = self.worksheets['ohlc_data']
                
                # Prepare batch request for the allocated block
                logger.debug("Preparing OHLC batch request")
                batch_request = self._prepare_ohlc_batch_request(symbol, ohlc_sheet, start_row, days)
                
                # Execute batch update in the allocated block with retry logic
                logger.info(f"Executing OHLC batch update with {len(batch_request['requests'])} requests")
                
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        self.service.spreadsheets().batchUpdate(
                            spreadsheetId=self.spreadsheet_id,
                            body=batch_request
                        ).execute()
                        logger.debug(f"OHLC batch update successful on attempt {attempt + 1}")
                        break
                    except Exception as batch_error:
                        logger.warning(f"OHLC batch update attempt {attempt + 1} failed: {batch_error}")
                        if attempt == max_retries - 1:
                            raise
                        time.sleep(1)  # Wait before retry
                
                logger.info(f"Written OHLC formula for {symbol} to block {block_number}")
                
                # Wait for calculation (increased for OHLC data reliability)
                logger.debug("Waiting for OHLC formulas to calculate...")
                time.sleep(8)  # Increased from 6 to 8 seconds for better reliability
                
                # Read the results from columns H-M in the allocated block
                result_range = f"{ohlc_sheet}!H{start_row}:M{start_row + days + 5}"
                logger.info(f"Reading OHLC results for {symbol} from range {result_range}")
                
                # Add retry logic for reading results
                result = None
                for attempt in range(max_retries):
                    try:
                        result = self.service.spreadsheets().values().get(
                            spreadsheetId=self.spreadsheet_id,
                            range=result_range,
                            valueRenderOption='FORMATTED_VALUE'
                        ).execute()
                        logger.debug(f"OHLC read results successful on attempt {attempt + 1}")
                        break
                    except Exception as read_error:
                        logger.warning(f"OHLC read results attempt {attempt + 1} failed: {read_error}")
                        if attempt == max_retries - 1:
                            raise
                        time.sleep(1)  # Wait before retry
                
                values = result.get('values', [])
                logger.info(f"Retrieved {len(values)} rows of OHLC data for {symbol}")
                
                if len(values) < 1:
                    logger.warning(f"No OHLC data returned for {symbol} in circular buffer")
                    return []
                
                ohlc_data = []
                valid_rows = 0
                skipped_rows = 0
                
                # Memory optimization: Process data in chunks for large datasets
                chunk_size = 100  # Process 100 rows at a time
                total_rows = len(values)
                
                logger.debug(f"Processing {total_rows} OHLC rows for {symbol} in chunks of {chunk_size}")
                
                # Process historical OHLC data from Google Finance "all" function
                # Google Finance historical format: Date, Close, High, Low, Open, Volume
                # But we arrange it in columns H-M as: Date/Time, Open, High, Low, Close, Volume
                for row_idx, row in enumerate(values):
                    logger.debug(f"Processing OHLC row {row_idx}: {row}")
                    
                    # Memory optimization: Skip processing if we have enough data points
                    if len(ohlc_data) >= days * 2:  # Allow 2x requested days for completeness
                        logger.debug(f"Sufficient OHLC data collected ({len(ohlc_data)} points), stopping processing")
                        break
                        
                    if len(row) >= 6 and str(row[0]).strip():  # Make sure we have all OHLC columns
                        try:
                            date_str = str(row[0]).strip()
                            logger.debug(f"Row {row_idx}: date_str='{date_str}', row_length={len(row)}")
                            
                            # Enhanced validation: Skip only actual invalid patterns, not valid dates
                            invalid_patterns = ['date/time', 'date', '', '=GOOGLEFINANCE', '#N/A', '#ERROR!', '#VALUE!']
                            is_invalid = (
                                date_str.lower().strip() in [p.lower() for p in invalid_patterns] or
                                date_str.startswith('=') or
                                date_str.startswith('#') or
                                len(date_str.strip()) == 0
                            )
                            logger.debug(f"Row {row_idx}: invalid_patterns_check={is_invalid}")
                            
                            if is_invalid:
                                logger.debug(f"Skipping invalid row {row_idx}: {date_str}")
                                skipped_rows += 1
                                continue
                                
                            # Parse Google Finance historical data format
                            # Expected columns: Date(H), Close(I), High(J), Low(K), Open(L), Volume(M)
                            # But Google Finance "all" returns: Date, Close, High, Low, Open, Volume
                            # So we need to map: Date(0), Open(4), High(2), Low(3), Close(1), Volume(5)
                            try:
                                # Handle both direct format and Google Finance format
                                if len(row) >= 6:
                                    # Google Finance "all" format: Date, Close, High, Low, Open, Volume
                                    date_val = str(row[0]).strip()
                                    close = float(str(row[1]).replace(',', '')) if row[1] and str(row[1]) not in ['', '#N/A', '#ERROR!'] else None
                                    high = float(str(row[2]).replace(',', '')) if row[2] and str(row[2]) not in ['', '#N/A', '#ERROR!'] else None
                                    low = float(str(row[3]).replace(',', '')) if row[3] and str(row[3]) not in ['', '#N/A', '#ERROR!'] else None
                                    open_price = float(str(row[4]).replace(',', '')) if row[4] and str(row[4]) not in ['', '#N/A', '#ERROR!'] else None
                                    volume = float(str(row[5]).replace(',', '')) if row[5] and str(row[5]) not in ['', '#N/A', '#ERROR!'] else None
                                    logger.debug(f"Row {row_idx}: Parsed prices O={open_price}, H={high}, L={low}, C={close}, V={volume}")
                                else:
                                    # Fallback to original H-M format: Date/Time, Open, High, Low, Close, Volume
                                    date_val = str(row[0]).strip()
                                    open_price = float(str(row[1]).replace(',', '')) if row[1] and str(row[1]) not in ['', '#N/A', '#ERROR!'] else None
                                    high = float(str(row[2]).replace(',', '')) if row[2] and str(row[2]) not in ['', '#N/A', '#ERROR!'] else None
                                    low = float(str(row[3]).replace(',', '')) if row[3] and str(row[3]) not in ['', '#N/A', '#ERROR!'] else None
                                    close = float(str(row[4]).replace(',', '')) if row[4] and str(row[4]) not in ['', '#N/A', '#ERROR!'] else None
                                    volume = float(str(row[5]).replace(',', '')) if row[5] and str(row[5]) not in ['', '#N/A', '#ERROR!'] else None
                                    logger.debug(f"Row {row_idx}: Parsed prices (fallback) O={open_price}, H={high}, L={low}, C={close}, V={volume}")
                                
                            except (ValueError, TypeError, IndexError) as e:
                                logger.debug(f"Error parsing numeric values in row {row_idx}: {e}")
                                skipped_rows += 1
                                continue
                            
                            # Enhanced date parsing - try multiple formats with better error handling
                            date_obj = None
                            for date_format in ["%m/%d/%Y %H:%M:%S", "%m/%d/%Y", "%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"]:
                                try:
                                    date_obj = datetime.strptime(date_val, date_format)
                                    logger.debug(f"Row {row_idx}: Date parsed with format '{date_format}': {date_obj.strftime('%Y-%m-%d')}")
                                    break
                                except ValueError:
                                    continue
                            
                            if not date_obj:
                                logger.debug(f"Row {row_idx}: Could not parse date '{date_val}'")
                            
                            # Relaxed validation: Allow data if we have valid date and at least close price
                            is_valid = date_obj and close is not None and close > 0
                            logger.debug(f"Row {row_idx}: Validation check - date_obj={date_obj is not None}, close={close}, is_valid={is_valid}")
                            
                            if is_valid:
                                # Use close price as fallback for missing OHLC values
                                open_price = open_price if open_price is not None and open_price > 0 else close
                                high = high if high is not None and high > 0 else max(open_price, close)
                                low = low if low is not None and low > 0 else min(open_price, close)
                                volume = volume if volume is not None and volume >= 0 else 0
                                ohlc_data.append({
                                    'date': date_obj.strftime("%Y-%m-%d"),
                                    'timestamp': date_obj.isoformat(),
                                    'open': open_price,
                                    'high': high,
                                    'low': low,
                                    'close': close,
                                    'volume': volume
                                })
                                valid_rows += 1
                                logger.debug(f"Valid OHLC row {row_idx} for {symbol}: {date_obj.strftime('%Y-%m-%d')} close=₹{close}")
                            else:
                                logger.debug(f"Invalid OHLC data in row {row_idx} for {symbol}: date={date_val}, close={close}")
                                skipped_rows += 1
                                
                        except (ValueError, TypeError) as e:
                            logger.debug(f"Skipping invalid OHLC row {row_idx} for {symbol}: {row} - {e}")
                            skipped_rows += 1
                            continue
                    else:
                        logger.debug(f"Skipping incomplete row {row_idx} for {symbol}: {len(row)} columns")
                        skipped_rows += 1
                
                logger.info(f"OHLC processing for {symbol}: {valid_rows} valid rows, {skipped_rows} skipped rows")
                
                # Sort by date
                ohlc_data.sort(key=lambda x: x['date'])
                
                # Cache the data
                if ohlc_data:
                    cache.set(cache_key, ohlc_data, self.OHLC_DATA_TTL)
                    logger.info(f"Successfully fetched {len(ohlc_data)} OHLC data points for {symbol} using circular buffer")
                else:
                    logger.warning(f"No valid OHLC data points found for {symbol} in circular buffer")
                
                # Clear the used block for reuse
                logger.debug("Clearing used OHLC block for reuse")
                self._clear_ohlc_block(ohlc_sheet, start_row, end_row)
                
                return ohlc_data
                
            finally:
                # Always release the block
                logger.debug(f"Releasing OHLC buffer block {block_number}")
                self.buffer_service.release_ohlc_block(block_number)
                
        except HttpError as e:
            logger.error(f"Google Sheets API error for OHLC data: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in fetch_ohlc_data for {symbol}: {e}")
            return []
    
    def test_connection(self) -> bool:
        """Test the Google Sheets connection"""
        if not self.is_available():
            return False
        
        try:
            # Try to read a simple range
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range='A1:A1'
            ).execute()
            
            logger.info("Google Sheets connection test successful")
            
            # Print helpful information if auto-created
            if self.auto_created:
                print(f"\n📈 Spreadsheet URL: {self.get_spreadsheet_url()}")
                print(f"🔑 Make sure to share this spreadsheet with your service account email")
            
            return True
        except Exception as e:
            logger.error(f"Google Sheets connection test failed: {e}")
            return False
    
    def _get_sheet_id(self, sheet_name: str) -> int:
        """Get the sheet ID for a given sheet name with caching and retry logic"""
        # Check cache first
        with self.sheet_id_lock:
            if sheet_name in self.sheet_id_cache:
                logger.debug(f"Using cached sheet ID for '{sheet_name}': {self.sheet_id_cache[sheet_name]}")
                return self.sheet_id_cache[sheet_name]
        
        # Not in cache, fetch from API with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.debug(f"Fetching sheet ID for '{sheet_name}' (attempt {attempt + 1})")
                
                spreadsheet = self.service.spreadsheets().get(
                    spreadsheetId=self.spreadsheet_id
                ).execute()
                
                for sheet in spreadsheet['sheets']:
                    sheet_title = sheet['properties']['title']
                    sheet_id = sheet['properties']['sheetId']
                    
                    # Cache all sheet IDs while we have them
                    with self.sheet_id_lock:
                        self.sheet_id_cache[sheet_title] = sheet_id
                    
                    if sheet_title == sheet_name:
                        logger.debug(f"Found sheet ID for '{sheet_name}': {sheet_id}")
                        return sheet_id
                
                # Sheet not found, use default
                logger.warning(f"Sheet '{sheet_name}' not found, using first sheet")
                if spreadsheet['sheets']:
                    default_sheet_id = spreadsheet['sheets'][0]['properties']['sheetId']
                    with self.sheet_id_lock:
                        self.sheet_id_cache[sheet_name] = default_sheet_id  # Cache the fallback
                    return default_sheet_id
                else:
                    logger.error(f"No sheets found in spreadsheet")
                    return 0
                    
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} to get sheet ID for '{sheet_name}' failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed to get sheet ID for '{sheet_name}', using fallback")
                    # Cache fallback to prevent repeated failures
                    with self.sheet_id_lock:
                        self.sheet_id_cache[sheet_name] = 0
                    return 0
                
                # Wait before retry (exponential backoff)
                time.sleep(2 ** attempt)
        
        return 0  # Final fallback
    
    def clear_sheet_id_cache(self):
        """Clear the sheet ID cache to force refresh"""
        with self.sheet_id_lock:
            self.sheet_id_cache.clear()
            logger.info("Cleared sheet ID cache")
    
    def get_spreadsheet_url(self) -> Optional[str]:
        """Get the URL of the current spreadsheet"""
        if not self.spreadsheet_id:
            return None
        return f"https://docs.google.com/spreadsheets/d/{self.spreadsheet_id}/edit"
    
    def get_spreadsheet_info(self) -> Dict[str, Any]:
        """Get detailed information about the spreadsheet"""
        if not self.is_available():
            return {}
        
        try:
            response = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            return {
                'id': self.spreadsheet_id,
                'title': response['properties']['title'],
                'url': self.get_spreadsheet_url(),
                'auto_created': self.auto_created,
                'worksheet_name': self.worksheet_name,
                'sheets': [sheet['properties']['title'] for sheet in response['sheets']]
            }
        except Exception as e:
            logger.error(f"Failed to get spreadsheet info: {e}")
            return {}
    
    def _get_ohlc_column_range(self, symbol: str) -> str:
        """Get dedicated column range for OHLC data in the OHLCData sheet"""
        # Use a more reliable approach - assign symbols to specific columns
        # Create a mapping based on symbol to ensure consistency
        
        # List of common symbols for better distribution
        common_symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'LT', 'BHARTIARTL', 'ITC', 'KOTAKBANK']
        
        if symbol in common_symbols:
            # Assign known symbols to specific columns
            symbol_index = common_symbols.index(symbol)
            base_col_index = symbol_index * 8  # 8 columns per symbol (more spacing)
        else:
            # For other symbols, use a simple hash but with better distribution
            import hashlib
            symbol_hash = int(hashlib.md5(symbol.encode()).hexdigest()[:6], 16)
            # Start after reserved columns for common symbols
            base_col_index = (len(common_symbols) * 8) + ((symbol_hash % 20) * 8)
        
        # Convert to Excel column notation
        if base_col_index < 26:
            return chr(ord('A') + base_col_index)
        elif base_col_index < 702:  # Up to ZZ
            first_letter = chr(ord('A') + (base_col_index // 26) - 1)
            second_letter = chr(ord('A') + (base_col_index % 26))
            return first_letter + second_letter
        else:
            # Fallback for very high indices
            return chr(ord('A') + (base_col_index % 26))
    
    def _get_symbol_row_for_ohlc(self, symbol: str) -> int:
        """Get the appropriate row for OHLC data for a specific symbol.
        
        OHLC data is in columns H-M (H=Date/Time, I=Open, J=High, K=Low, L=Close, M=Volume)
        Each symbol gets its own row range to avoid conflicts.
        """
        # List of common symbols with dedicated rows
        common_symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'LT', 'BHARTIARTL', 'ITC', 'KOTAKBANK']
        
        if symbol in common_symbols:
            # Assign known symbols to specific row ranges (50 rows per symbol for historical data)
            symbol_index = common_symbols.index(symbol)
            base_row = 10 + (symbol_index * 50)  # Start from row 10, 50 rows per symbol
        else:
            # For other symbols, use a hash-based approach
            import hashlib
            symbol_hash = int(hashlib.md5(symbol.encode()).hexdigest()[:6], 16)
            # Start after reserved rows for common symbols
            base_row = 10 + (len(common_symbols) * 50) + ((symbol_hash % 50) * 50)
        
        return base_row
    
    def clear_ohlc_data_area(self) -> bool:
        """Clear the OHLC data storage area (rows 200-300) to fix malformed data"""
        if not self.is_available():
            logger.error("Google Sheets service not available")
            return False
        
        try:
            # Clear rows 200-300 where OHLC data is stored
            clear_range = f"{self.worksheet_name}!A200:F300"
            
            self.service.spreadsheets().values().clear(
                spreadsheetId=self.spreadsheet_id,
                range=clear_range
            ).execute()
            
            logger.info("Successfully cleared OHLC data storage area (rows 200-300)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to clear OHLC data area: {e}")
            return False
    
    def clear_cache(self, symbol: str = None):
        """Clear cache for specific symbol or all cached data"""
        if symbol:
            cache_keys = [
                self._get_cache_key(symbol, 'market_data'),
                self._get_cache_key(symbol, 'ohlc_30d'),
                self._get_cache_key(symbol, 'ohlc_90d'),
            ]
            for key in cache_keys:
                cache.delete(key)
            logger.info(f"Cleared cache for symbol {symbol}")
        else:
            # Clear all Google Sheets cache
            cache.delete_many([key for key in cache._cache.keys() if key.startswith('google_sheets:')])
            logger.info("Cleared all Google Sheets cache")
    
    def check_spreadsheet_space(self) -> Dict[str, Any]:
        """Check the current space usage of the spreadsheet"""
        if not self.is_available():
            return {}
        
        try:
            # Get current data range
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=f"{self.worksheet_name}!A:A"
            ).execute()
            
            values = result.get('values', [])
            current_rows = len(values)
            
            # Get spreadsheet properties
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            # Find the main worksheet
            main_sheet = None
            for sheet in spreadsheet['sheets']:
                if sheet['properties']['title'] == self.worksheet_name:
                    main_sheet = sheet
                    break
            
            if main_sheet:
                total_rows = main_sheet['properties']['gridProperties']['rowCount']
                usage_percent = (current_rows / total_rows) * 100
                
                return {
                    'current_rows': current_rows,
                    'total_rows': total_rows,
                    'usage_percent': usage_percent,
                    'needs_cleanup': current_rows >= self.CLEANUP_THRESHOLD,
                    'space_critical': current_rows >= self.MAX_ROWS_PER_SHEET,
                    'available_rows': total_rows - current_rows
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Error checking spreadsheet space: {e}")
            return {}
    
    def cleanup_old_data(self, days_threshold: int = None) -> Dict[str, Any]:
        """Clean up old data from the spreadsheet"""
        if not self.is_available():
            return {'status': 'error', 'message': 'Service not available'}
        
        days_threshold = days_threshold or self.ARCHIVE_OLDER_THAN_DAYS
        cutoff_date = datetime.now() - timedelta(days=days_threshold)
        
        try:
            # Get all data with timestamps
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=f"{self.worksheet_name}!A:N",
                valueRenderOption='FORMATTED_VALUE'
            ).execute()
            
            values = result.get('values', [])
            if len(values) <= 1:  # Only headers or empty
                return {'status': 'success', 'message': 'No data to clean'}
            
            headers = values[0]
            data_rows = values[1:]
            
            # Find timestamp column (LastUpdated)
            timestamp_col = -1
            for i, header in enumerate(headers):
                if 'lastupdate' in header.lower() or 'timestamp' in header.lower():
                    timestamp_col = i
                    break
            
            if timestamp_col == -1:
                logger.warning("No timestamp column found for cleanup")
                return {'status': 'warning', 'message': 'No timestamp column found'}
            
            # Separate recent and old data
            recent_data = []
            old_data = []
            
            for row in data_rows:
                if len(row) <= timestamp_col:
                    continue
                
                try:
                    # Parse timestamp
                    timestamp_str = row[timestamp_col]
                    if timestamp_str:
                        # Simple date parsing
                        try:
                            timestamp = datetime.strptime(timestamp_str.split('T')[0], '%Y-%m-%d')
                        except ValueError:
                            recent_data.append(row)
                            continue
                        
                        if timestamp.date() >= cutoff_date.date():
                            recent_data.append(row)
                        else:
                            old_data.append(row)
                    else:
                        recent_data.append(row)  # Keep data without timestamps
                        
                except Exception as e:
                    logger.debug(f"Error parsing timestamp in row: {e}")
                    recent_data.append(row)  # Keep on error
            
            # Archive old data if any
            archived_count = 0
            if old_data:
                archived_count = len(old_data)
                self._archive_old_data(old_data, headers, cutoff_date)
            
            # Update main sheet with recent data only
            if old_data:  # Only update if we removed something
                new_values = [headers] + recent_data
                
                # Clear the sheet first
                self.service.spreadsheets().values().clear(
                    spreadsheetId=self.spreadsheet_id,
                    range=f"{self.worksheet_name}!A:Z"
                ).execute()
                
                # Write back the recent data
                if new_values:
                    self.service.spreadsheets().values().update(
                        spreadsheetId=self.spreadsheet_id,
                        range=f"{self.worksheet_name}!A1",
                        valueInputOption='USER_ENTERED',
                        body={'values': new_values}
                    ).execute()
            
            return {
                'status': 'success',
                'archived_rows': archived_count,
                'remaining_rows': len(recent_data),
                'cutoff_date': cutoff_date.strftime('%Y-%m-%d'),
                'message': f'Archived {archived_count} old rows, {len(recent_data)} recent rows remain'
            }
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            return {'status': 'error', 'message': f'Cleanup failed: {e}'}
    
    def _archive_old_data(self, old_data: List[List], headers: List[str], cutoff_date: datetime):
        """Archive old data to a separate sheet"""
        try:
            archive_sheet_name = f"Archive_{cutoff_date.strftime('%Y_%m')}"
            
            # Check if archive sheet exists
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            archive_sheet_id = None
            for sheet in spreadsheet['sheets']:
                if sheet['properties']['title'] == archive_sheet_name:
                    archive_sheet_id = sheet['properties']['sheetId']
                    break
            
            # Create archive sheet if it doesn't exist
            if archive_sheet_id is None:
                request = {
                    'addSheet': {
                        'properties': {
                            'title': archive_sheet_name,
                            'gridProperties': {
                                'rowCount': 1000,
                                'columnCount': 20
                            }
                        }
                    }
                }
                
                response = self.service.spreadsheets().batchUpdate(
                    spreadsheetId=self.spreadsheet_id,
                    body={'requests': [request]}
                ).execute()
                
                # Add headers to new archive sheet
                self.service.spreadsheets().values().update(
                    spreadsheetId=self.spreadsheet_id,
                    range=f"{archive_sheet_name}!A1",
                    valueInputOption='USER_ENTERED',
                    body={'values': [headers]}
                ).execute()
            
            # Append old data to archive sheet
            if old_data:
                self.service.spreadsheets().values().append(
                    spreadsheetId=self.spreadsheet_id,
                    range=f"{archive_sheet_name}!A:A",
                    valueInputOption='USER_ENTERED',
                    body={'values': old_data}
                ).execute()
            
            # Clean up old archive sheets if too many
            self._cleanup_old_archive_sheets()
            
            logger.info(f"Archived {len(old_data)} rows to {archive_sheet_name}")
            
        except Exception as e:
            logger.error(f"Error archiving old data: {e}")
    
    def _cleanup_old_archive_sheets(self):
        """Remove old archive sheets if there are too many"""
        try:
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            
            # Find all archive sheets
            archive_sheets = []
            for sheet in spreadsheet['sheets']:
                title = sheet['properties']['title']
                if title.startswith('Archive_'):
                    archive_sheets.append({
                        'id': sheet['properties']['sheetId'],
                        'title': title,
                        'date': title.replace('Archive_', '')
                    })
            
            # Sort by date (newest first)
            archive_sheets.sort(key=lambda x: x['date'], reverse=True)
            
            # Delete old archive sheets if we have too many
            if len(archive_sheets) > self.MAX_ARCHIVE_SHEETS:
                sheets_to_delete = archive_sheets[self.MAX_ARCHIVE_SHEETS:]
                
                requests = []
                for sheet in sheets_to_delete:
                    requests.append({
                        'deleteSheet': {
                            'sheetId': sheet['id']
                        }
                    })
                
                if requests:
                    self.service.spreadsheets().batchUpdate(
                        spreadsheetId=self.spreadsheet_id,
                        body={'requests': requests}
                    ).execute()
                    
                    logger.info(f"Deleted {len(requests)} old archive sheets")
            
        except Exception as e:
            logger.error(f"Error cleaning up archive sheets: {e}")
    
    def auto_cleanup_if_needed(self) -> Dict[str, Any]:
        """Automatically clean up the spreadsheet if it's getting full"""
        space_info = self.check_spreadsheet_space()
        
        if not space_info:
            return {'status': 'error', 'message': 'Could not check space'}
        
        if space_info.get('needs_cleanup', False):
            logger.info(f"Spreadsheet cleanup needed: {space_info['usage_percent']:.1f}% full")
            cleanup_result = self.cleanup_old_data()
            
            # Update space info after cleanup
            new_space_info = self.check_spreadsheet_space()
            
            return {
                'status': 'cleanup_performed',
                'before': space_info,
                'after': new_space_info,
                'cleanup_result': cleanup_result
            }
        else:
            return {
                'status': 'no_cleanup_needed',
                'space_info': space_info
            }
    
    def get_cleanup_status(self) -> Dict[str, Any]:
        """Get current cleanup status and recommendations"""
        space_info = self.check_spreadsheet_space()
        
        if not space_info:
            return {'status': 'error', 'message': 'Could not check spreadsheet status'}
        
        # Calculate recommendations
        recommendations = []
        if space_info.get('usage_percent', 0) > 90:
            recommendations.append("🔴 Critical: Immediate cleanup required")
        elif space_info.get('usage_percent', 0) > 80:
            recommendations.append("🟡 Warning: Consider cleanup soon")
        elif space_info.get('usage_percent', 0) > 60:
            recommendations.append("🟢 Good: Monitor space usage")
        else:
            recommendations.append("✅ Excellent: Plenty of space available")
        
        if space_info.get('needs_cleanup', False):
            recommendations.append(f"📋 Auto-cleanup will trigger at {self.CLEANUP_THRESHOLD} rows")
        
        return {
            'space_info': space_info,
            'recommendations': recommendations,
            'auto_cleanup_threshold': self.CLEANUP_THRESHOLD,
            'archive_retention_days': self.ARCHIVE_OLDER_THAN_DAYS,
            'max_archive_sheets': self.MAX_ARCHIVE_SHEETS
        }
    
# Create global instance
google_sheets_service = GoogleSheetsFinanceService()