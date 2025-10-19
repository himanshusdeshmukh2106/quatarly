"""
Custom middleware for debugging and logging
"""
import json
import logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware to log all incoming requests for debugging purposes.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details for registration and login endpoints
        if '/api/auth/' in request.path:
            logger.info(f"Request: {request.method} {request.path}")
            logger.info(f"Headers: {dict(request.headers)}")
            
            if request.method == 'POST':
                try:
                    if hasattr(request, 'body') and request.body:
                        body = json.loads(request.body.decode('utf-8'))
                        # Don't log passwords
                        safe_body = {k: v if 'password' not in k.lower() else '***' for k, v in body.items()}
                        logger.info(f"Body: {json.dumps(safe_body, indent=2)}")
                except Exception as e:
                    logger.error(f"Could not parse request body: {e}")

        response = self.get_response(request)

        # Log response for registration and login endpoints
        if '/api/auth/' in request.path:
            logger.info(f"Response Status: {response.status_code}")
            if response.status_code >= 400:
                try:
                    if hasattr(response, 'content'):
                        content = json.loads(response.content.decode('utf-8'))
                        logger.error(f"Error Response: {json.dumps(content, indent=2)}")
                except Exception as e:
                    logger.error(f"Could not parse response content: {e}")

        return response

