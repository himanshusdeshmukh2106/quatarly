import os
import requests
import logging
import json
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiGoalService:
    """AI-powered goal image selection service using Gemini 2.5 Pro API for Indian scenarios"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
        
        # Comprehensive Indian scenario goal images - Expanded for all possible goals
        self.goal_images = {
            # Vehicles - Cars
            'car': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
            'sedan': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
            'hatchback': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
            'suv': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'crossover': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'compact': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
            'luxury_car': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
            'sports_car': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80',
            'electric_car': 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?auto=format&fit=crop&w=600&q=80',
            
            # Vehicles - Two Wheelers
            'bike': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'motorcycle': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'scooter': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
            'scooty': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
            'electric_bike': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
            'royal_enfield': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'harley': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'ktm': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'yamaha': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'honda': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'bajaj': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'tvs': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            
            # Electronics & Gadgets
            'mobile': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
            'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
            'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
            'iphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
            'android': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
            'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
            'computer': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
            'macbook': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
            'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
            'ipad': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
            'tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
            'television': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
            'camera': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80',
            'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            'gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=600&q=80',
            'ps5': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=600&q=80',
            'xbox': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=600&q=80',
            
            # Real Estate
            'house': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
            'home': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
            'apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
            'flat': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
            'villa': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
            'plot': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
            'land': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
            'property': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
            
            # Education
            'education': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
            'study': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
            'college': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
            'university': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
            'course': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
            'degree': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
            'mba': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
            'engineering': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
            'medical': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80',
            'books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
            
            # Travel & Vacation
            'vacation': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'travel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'trip': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'holiday': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
            'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
            'himachal': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'kashmir': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
            'rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
            'international': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
            'europe': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
            'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
            'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
            
            # Personal Events
            'wedding': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'marriage': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'engagement': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'birthday': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
            'anniversary': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
            
            # Financial Goals
            'emergency': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',
            'savings': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',
            'investment': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
            'retirement': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
            'pension': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
            'mutual_fund': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
            'sip': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
            'fd': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',
            'ppf': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
            
            # Health & Fitness
            'health': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
            'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
            'gym': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
            'medical': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80',
            'insurance': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80',
            
            # Business & Career
            'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
            'startup': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
            'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
            'career': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
            
            # Lifestyle & Hobbies
            'furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
            'sofa': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
            'bed': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
            'dining': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=80',
            'kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
            'appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
            'refrigerator': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80',
            'washing_machine': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'ac': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
            'air_conditioner': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
            
            # Fashion & Accessories
            'clothes': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
            'fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
            'jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
            'gold': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
            'watch': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80',
            
            # Default fallback
            'default': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80'
        }
    
    def get_intelligent_image(self, goal_title: str, goal_description: str, goal_category: str) -> str:
        """Intelligently select image based on goal details with priority matching"""
        title_lower = goal_title.lower()
        description_lower = goal_description.lower()
        category_lower = goal_category.lower()
        
        # Combined text for analysis
        combined_text = f"{title_lower} {description_lower} {category_lower}"
        
        # Priority matching - more specific matches first
        priority_matches = []
        
        # Check for exact keyword matches in title (highest priority)
        for keyword, image_url in self.goal_images.items():
            if keyword in title_lower:
                priority_matches.append((keyword, image_url, 3))  # High priority
        
        # Check for keyword matches in description
        for keyword, image_url in self.goal_images.items():
            if keyword in description_lower and (keyword, image_url, 3) not in [(k, u, p) for k, u, p in priority_matches]:
                priority_matches.append((keyword, image_url, 2))  # Medium priority
        
        # Check for category matches
        for keyword, image_url in self.goal_images.items():
            if keyword in category_lower and (keyword, image_url) not in [(k, u) for k, u, p in priority_matches]:
                priority_matches.append((keyword, image_url, 1))  # Low priority
        
        # Sort by priority and keyword length (longer keywords are more specific)
        if priority_matches:
            priority_matches.sort(key=lambda x: (x[2], len(x[0])), reverse=True)
            selected_keyword, selected_image, priority = priority_matches[0]
            logger.info(f"Intelligent selection: '{selected_keyword}' (priority {priority}) for goal '{goal_title}'")
            return selected_image
        
        # If no matches found, return default
        logger.info(f"No specific match found for goal '{goal_title}', using default")
        return self.goal_images['default']
    
    def generate_goal_image(self, goal_data: dict) -> str:
        """
        Use Gemini AI to intelligently select the best image from our comprehensive collection
        Based on goal title, description, and category analysis
        """
        if not self.api_key or self.api_key == 'your_gemini_api_key_here':
            logger.warning("Gemini API key not configured, using fallback image selection")
            return self.get_fallback_image(goal_data.get('title', ''))
        
        try:
            goal_title = goal_data.get('title', '')
            goal_description = goal_data.get('description', '')
            goal_category = goal_data.get('category', '')
            
            # Create list of available image categories for Gemini to choose from
            available_categories = list(self.goal_images.keys())
            
            prompt = f"""You are an AI assistant helping to select the most appropriate image for a financial goal in an Indian context.

GOAL DETAILS:
- Title: {goal_title}
- Description: {goal_description}
- Category: {goal_category}

AVAILABLE IMAGE CATEGORIES:
{', '.join(available_categories)}

TASK:
Analyze the goal details and select the SINGLE most appropriate image category from the available list that best represents this goal. Consider Indian context, cultural relevance, and the specific nature of the goal.

RULES:
1. Return ONLY the category name (exactly as listed above)
2. Choose the most specific match possible
3. Consider Indian scenarios and preferences
4. If multiple categories could work, choose the most relevant one
5. Do not explain your choice, just return the category name

RESPONSE FORMAT:
[category_name]"""
            
            selected_category = self._call_gemini_api(prompt, goal_title)
            
            if selected_category and selected_category in self.goal_images:
                logger.info(f"Gemini selected '{selected_category}' for goal '{goal_title}'")
                return self.goal_images[selected_category]
            else:
                logger.warning(f"Gemini returned invalid category '{selected_category}' for goal '{goal_title}', using fallback")
                return self.get_fallback_image(goal_title)
                
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            return self.get_fallback_image(goal_data.get('title', ''))
    
    def _call_gemini_api(self, prompt: str, goal_title: str) -> str:
        """Make API call to Gemini 2.5 Pro and return the selected category"""
        url = f"{self.base_url}?key={self.api_key}"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        data = {
            'contents': [
                {
                    'parts': [
                        {
                            'text': prompt
                        }
                    ]
                }
            ],
            'generationConfig': {
                'temperature': 0.1,
                'maxOutputTokens': 50
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']['parts'][0]['text'].strip()
                
                # Clean the response - remove brackets and extra whitespace
                content = content.replace('[', '').replace(']', '').strip()
                
                logger.info(f"Gemini API response for '{goal_title}': {content}")
                return content
            else:
                logger.warning("No candidates in Gemini API response")
                return None
        else:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return None
    
    def get_available_categories(self) -> list:
        """Return list of all available image categories"""
        return list(self.goal_images.keys())
    
    def get_image_by_category(self, category: str) -> str:
        """Get image URL by category name"""
        return self.goal_images.get(category, self.goal_images['default'])
    
    def generate_goal_insights(self, goal_data: dict) -> str:
        """
        AI insights generation is disabled - controlled elsewhere
        Keep infrastructure but return empty string
        """
        logger.info("AI insights generation is disabled")
        return ""
    
    def get_fallback_image(self, goal_title: str) -> str:
        """Fallback image selection when Gemini 2.5 Pro API is not available"""
        return self.get_intelligent_image(goal_title, '', '')
    
    def validate_api_key(self) -> bool:
        """Validate that the Gemini 2.5 Pro API key is configured"""
        if not self.api_key or self.api_key == 'your_gemini_api_key_here':
            return False
        return True


# Backward compatibility aliases
PerplexityImageService = GeminiGoalService
PerplexityGoalService = GeminiGoalService