"""
Custom exceptions for the investments app
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
import logging

logger = logging.getLogger(__name__)


class InvestmentException(Exception):
    """Base exception for investment-related errors"""
    pass


class AssetAPIException(InvestmentException):
    """Exception for asset API operations"""
    def __init__(self, message="Asset operation failed", status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DataEnrichmentException(InvestmentException):
    """Exception for data enrichment service errors"""
    def __init__(self, message="Data enrichment service unavailable", status_code=503):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class PerplexityAPIException(InvestmentException):
    """Exception for Perplexity API errors"""
    def __init__(self, message="External data service unavailable", status_code=503):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class BharatSMAPIException(InvestmentException):
    """Exception for BharatSM API errors"""
    def __init__(self, message="BharatSM data service unavailable", status_code=503):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AssetValidationException(InvestmentException):
    """Exception for asset validation errors"""
    def __init__(self, message="Asset validation failed", field=None):
        self.message = message
        self.field = field
        super().__init__(self.message)


class RateLimitException(InvestmentException):
    """Exception for rate limiting errors"""
    def __init__(self, message="Rate limit exceeded", retry_after=60):
        self.message = message
        self.retry_after = retry_after
        super().__init__(self.message)


def custom_exception_handler(exc, context):
    """Custom exception handler for investment app"""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle custom exceptions
    if isinstance(exc, AssetAPIException):
        return Response(
            {
                'error': 'Asset operation failed',
                'message': exc.message,
                'code': 'asset_error'
            },
            status=exc.status_code
        )
    
    elif isinstance(exc, DataEnrichmentException):
        return Response(
            {
                'error': 'Data enrichment failed',
                'message': exc.message,
                'code': 'enrichment_error'
            },
            status=exc.status_code
        )
    
    elif isinstance(exc, PerplexityAPIException):
        return Response(
            {
                'error': 'External data service error',
                'message': exc.message,
                'code': 'api_error'
            },
            status=exc.status_code
        )
    
    elif isinstance(exc, BharatSMAPIException):
        return Response(
            {
                'error': 'BharatSM data service error',
                'message': exc.message,
                'code': 'bharatsm_error'
            },
            status=exc.status_code
        )
    
    elif isinstance(exc, AssetValidationException):
        return Response(
            {
                'error': 'Validation failed',
                'message': exc.message,
                'field': exc.field,
                'code': 'validation_error'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    elif isinstance(exc, RateLimitException):
        response = Response(
            {
                'error': 'Rate limit exceeded',
                'message': exc.message,
                'code': 'rate_limit_error'
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
        response['Retry-After'] = str(exc.retry_after)
        return response
    
    elif isinstance(exc, DjangoValidationError):
        return Response(
            {
                'error': 'Validation failed',
                'message': str(exc),
                'code': 'validation_error'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Log unexpected errors
    if response is None:
        logger.error(f"Unexpected error in investments app: {exc}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error',
                'message': 'An unexpected error occurred',
                'code': 'internal_error'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Enhance default error responses
    if response is not None:
        custom_response_data = {
            'error': 'Request failed',
            'message': response.data.get('detail', 'An error occurred'),
            'code': 'request_error'
        }
        
        # Add field-specific errors for validation
        if hasattr(response.data, 'items'):
            field_errors = {}
            for field, errors in response.data.items():
                if field != 'detail':
                    field_errors[field] = errors
            
            if field_errors:
                custom_response_data['field_errors'] = field_errors
        
        response.data = custom_response_data
    
    return response


class AssetValidator:
    """Validator for asset data"""
    
    @staticmethod
    def validate_tradeable_asset(data):
        """Validate tradeable asset data"""
        errors = {}
        
        if not data.get('symbol'):
            errors['symbol'] = "Symbol is required for tradeable assets"
        
        if data.get('quantity', 0) <= 0:
            errors['quantity'] = "Quantity must be greater than 0"
        
        if data.get('average_purchase_price', 0) <= 0:
            errors['average_purchase_price'] = "Average purchase price must be greater than 0"
        
        # Validate symbol format
        symbol = data.get('symbol', '')
        if symbol and not symbol.replace('.', '').replace('-', '').isalnum():
            errors['symbol'] = "Symbol contains invalid characters"
        
        if errors:
            raise AssetValidationException(f"Validation failed: {errors}")
        
        return True
    
    @staticmethod
    def validate_physical_asset(data):
        """Validate physical asset data"""
        errors = {}
        
        if not data.get('name'):
            errors['name'] = "Name is required for physical assets"
        
        if data.get('quantity', 0) <= 0:
            errors['quantity'] = "Quantity must be greater than 0"
        
        if data.get('average_purchase_price', 0) <= 0:
            errors['average_purchase_price'] = "Average purchase price must be greater than 0"
        
        # Validate unit for precious metals
        asset_type = data.get('asset_type')
        if asset_type in ['gold', 'silver']:
            unit = data.get('unit', '')
            valid_units = ['grams', 'ounces', 'kilograms', 'pounds']
            if unit and unit not in valid_units:
                errors['unit'] = f"Unit must be one of: {', '.join(valid_units)}"
        
        if errors:
            raise AssetValidationException(f"Validation failed: {errors}")
        
        return True
    
    @staticmethod
    def validate_asset_type(asset_type):
        """Validate asset type"""
        valid_types = ['stock', 'etf', 'mutual_fund', 'crypto', 'bond', 'gold', 'silver', 'commodity']
        
        if asset_type not in valid_types:
            raise AssetValidationException(
                f"Invalid asset type. Must be one of: {', '.join(valid_types)}",
                field='asset_type'
            )
        
        return True
    
    @staticmethod
    def validate_currency(currency):
        """Validate currency code"""
        valid_currencies = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
        
        if currency and currency not in valid_currencies:
            raise AssetValidationException(
                f"Invalid currency. Must be one of: {', '.join(valid_currencies)}",
                field='currency'
            )
        
        return True
    
    @staticmethod
    def validate_bharatsm_data(data):
        """Validate data returned from BharatSM API"""
        errors = {}
        
        # Validate volume format
        volume = data.get('volume')
        if volume and volume != 'N/A':
            if not isinstance(volume, str):
                errors['volume'] = "Volume must be a string"
            elif not any(volume.endswith(suffix) for suffix in ['K', 'M', 'B']) and not volume.isdigit():
                errors['volume'] = "Volume must be in format like '1.2M', '500K', or a number"
        
        # Validate market cap
        market_cap = data.get('market_cap')
        if market_cap is not None:
            try:
                float(market_cap)
            except (ValueError, TypeError):
                errors['market_cap'] = "Market cap must be a number"
        
        # Validate P/E ratio
        pe_ratio = data.get('pe_ratio')
        if pe_ratio is not None:
            try:
                pe_value = float(pe_ratio)
                if pe_value < 0:
                    errors['pe_ratio'] = "P/E ratio cannot be negative"
            except (ValueError, TypeError):
                errors['pe_ratio'] = "P/E ratio must be a number"
        
        # Validate growth rate
        growth_rate = data.get('growth_rate')
        if growth_rate is not None:
            try:
                growth_value = float(growth_rate)
                if growth_value < -100 or growth_value > 1000:
                    errors['growth_rate'] = "Growth rate must be between -100% and 1000%"
            except (ValueError, TypeError):
                errors['growth_rate'] = "Growth rate must be a number"
        
        if errors:
            raise AssetValidationException(f"BharatSM data validation failed: {errors}")
        
        return True
    
    @staticmethod
    def validate_symbol_format(symbol, asset_type):
        """Validate symbol format based on asset type"""
        if not symbol:
            return True  # Optional for some asset types
        
        errors = {}
        
        if asset_type in ['stock', 'etf']:
            # Indian stock symbols are typically 1-20 characters, alphanumeric
            if len(symbol) > 20:
                errors['symbol'] = "Stock symbol cannot be longer than 20 characters"
            elif not symbol.replace('.', '').replace('-', '').isalnum():
                errors['symbol'] = "Stock symbol can only contain letters, numbers, dots, and hyphens"
        
        elif asset_type == 'crypto':
            # Crypto symbols are typically 3-10 characters, uppercase
            if len(symbol) > 10:
                errors['symbol'] = "Crypto symbol cannot be longer than 10 characters"
            elif not symbol.replace('-', '').isalnum():
                errors['symbol'] = "Crypto symbol can only contain letters, numbers, and hyphens"
        
        if errors:
            raise AssetValidationException(f"Symbol validation failed: {errors}")
        
        return True
    
    @staticmethod
    def validate_quantity_and_price(quantity, price, asset_type):
        """Validate quantity and price based on asset type"""
        errors = {}
        
        # Validate quantity
        try:
            qty = float(quantity)
            if qty <= 0:
                errors['quantity'] = "Quantity must be greater than 0"
            elif asset_type in ['stock', 'etf'] and qty != int(qty):
                # Stocks typically have whole number quantities
                pass  # Allow fractional shares
            elif asset_type in ['gold', 'silver'] and qty < 0.001:
                errors['quantity'] = "Precious metal quantity must be at least 0.001"
        except (ValueError, TypeError):
            errors['quantity'] = "Quantity must be a valid number"
        
        # Validate price
        try:
            prc = float(price)
            if prc <= 0:
                errors['price'] = "Price must be greater than 0"
            elif prc > 1000000:  # Reasonable upper limit
                errors['price'] = "Price seems unreasonably high"
        except (ValueError, TypeError):
            errors['price'] = "Price must be a valid number"
        
        if errors:
            raise AssetValidationException(f"Quantity/Price validation failed: {errors}")
        
        return True


def handle_api_errors(func):
    """Decorator for handling API errors in views"""
    from functools import wraps
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except AssetValidationException as e:
            logger.warning(f"Validation error in {func.__name__}: {e}")
            return Response(
                {
                    'error': 'Validation failed',
                    'message': e.message,
                    'field': e.field,
                    'code': 'validation_error'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except PerplexityAPIException as e:
            logger.error(f"Perplexity API error in {func.__name__}: {e}")
            return Response(
                {
                    'error': 'External data service unavailable',
                    'message': e.message,
                    'code': 'api_error'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except BharatSMAPIException as e:
            logger.error(f"BharatSM API error in {func.__name__}: {e}")
            return Response(
                {
                    'error': 'BharatSM data service unavailable',
                    'message': e.message,
                    'code': 'bharatsm_error'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except DataEnrichmentException as e:
            logger.error(f"Data enrichment error in {func.__name__}: {e}")
            return Response(
                {
                    'error': 'Data enrichment failed',
                    'message': e.message,
                    'code': 'enrichment_error'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except RateLimitException as e:
            logger.warning(f"Rate limit exceeded in {func.__name__}: {e}")
            response = Response(
                {
                    'error': 'Rate limit exceeded',
                    'message': e.message,
                    'code': 'rate_limit_error'
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
            response['Retry-After'] = str(e.retry_after)
            return response
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {e}", exc_info=True)
            return Response(
                {
                    'error': 'Internal server error',
                    'message': 'An unexpected error occurred',
                    'code': 'internal_error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return wrapper