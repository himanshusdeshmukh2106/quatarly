import os
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class PerplexityImageService:
    """Service for generating goal-related images using Perplexity API"""
    
    def __init__(self):
        self.api_key = os.getenv('PERPLEXITY_API_KEY')
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.default_images = {
            'emergency': 'https://via.placeholder.com/600x240.png?text=Emergency+Fund',
            'vacation': 'https://via.placeholder.com/600x240.png?text=Vacation',
            'car': 'https://via.placeholder.com/600x240.png?text=Car',
            'house': 'https://via.placeholder.com/600x240.png?text=House',
            'education': 'https://via.placeholder.com/600x240.png?text=Education',
            'wedding': 'https://via.placeholder.com/600x240.png?text=Wedding',
            'retirement': 'https://via.placeholder.com/600x240.png?text=Retirement',
            'default': 'https://via.placeholder.com/600x240.png?text=Financial+Goal'
        }
    
    def get_default_image(self, goal_title: str = '') -> str:
        """Get a default placeholder image based on goal title keywords"""
        title_lower = goal_title.lower()
        
        for keyword, image_url in self.default_images.items():
            if keyword in title_lower:
                return image_url
        
        return self.default_images['default']
    
    def generate_goal_image(self, goal_title: str) -> str:
        """
        Generate placeholder image URL based on goal title using Perplexity API
        Returns default image URL on failure
        """
        if not self.api_key or self.api_key == 'your_perplexity_api_key_here':
            logger.warning("Perplexity API key not configured, using default image")
            return self.get_default_image(goal_title)
        
        try:
            # Create a prompt to get image suggestions from Perplexity
            prompt = f"""
            I need a placeholder image URL for a financial goal titled "{goal_title}". 
            Please suggest a relevant, professional image URL from a free image service like Unsplash, Pexels, or Pixabay 
            that would be appropriate for this financial goal. 
            The image should be 600x240 pixels if possible.
            Just return the direct image URL, nothing else.
            """
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'sonar',
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 200,
                'temperature': 0.2
            }
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    image_url = result['choices'][0]['message']['content'].strip()
                    
                    # Basic validation that we got a URL
                    if image_url.startswith(('http://', 'https://')):
                        logger.info(f"Generated image URL for goal '{goal_title}': {image_url}")
                        return image_url
                    else:
                        logger.warning(f"Invalid URL format from Perplexity: {image_url}")
                        return self.get_default_image(goal_title)
                else:
                    logger.warning("No choices in Perplexity API response")
                    return self.get_default_image(goal_title)
            else:
                logger.error(f"Perplexity API error: {response.status_code} - {response.text}")
                return self.get_default_image(goal_title)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error calling Perplexity API: {e}")
            return self.get_default_image(goal_title)
        except Exception as e:
            logger.error(f"Unexpected error in Perplexity API call: {e}")
            return self.get_default_image(goal_title)
    
    def validate_api_key(self) -> bool:
        """Validate that the API key is configured and potentially working"""
        if not self.api_key or self.api_key == 'your_perplexity_api_key_here':
            return False
        return True