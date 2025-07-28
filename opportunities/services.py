import os
import json
import requests
import logging
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.utils import timezone
from questionnaire.models import UserResponse
from .models import Opportunity, UserProfile

User = get_user_model()
logger = logging.getLogger(__name__)


class ProfileService:
    """Service for managing persistent user profiles"""
    
    def __init__(self):
        self.gemini_service = GeminiProfileService()
    
    def get_or_create_profile(self, user_id: int) -> Dict[str, Any]:
        """Get existing profile or create new one if stale/missing"""
        try:
            user = User.objects.get(id=user_id)
            
            # Try to get existing profile
            try:
                profile = UserProfile.objects.get(user=user)
                if not profile.is_stale():
                    logger.info(f"Using cached profile for user {user_id}")
                    return profile.profile_data
                else:
                    logger.info(f"Profile is stale for user {user_id}, regenerating")
            except UserProfile.DoesNotExist:
                logger.info(f"No profile found for user {user_id}, creating new one")
                profile = None
            
            # Generate new profile
            user_responses = self._fetch_user_responses(user_id)
            if not user_responses:
                logger.warning(f"No questionnaire responses found for user {user_id}")
                return self._create_basic_profile([])
            
            # Generate profile using Gemini
            profile_data = self._generate_profile_data(user_responses)
            
            # Save or update profile
            if profile:
                profile.profile_data = profile_data
                profile.save()
            else:
                profile = UserProfile.objects.create(
                    user=user,
                    profile_data=profile_data
                )
            
            logger.info(f"Profile {'updated' if profile else 'created'} for user {user_id}")
            return profile_data
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return self._create_basic_profile([])
        except Exception as e:
            logger.error(f"Error managing profile for user {user_id}: {e}")
            return self._create_basic_profile([])
    
    def update_profile(self, user_id: int) -> Dict[str, Any]:
        """Force update profile (called when questionnaire changes)"""
        try:
            user = User.objects.get(id=user_id)
            user_responses = self._fetch_user_responses(user_id)
            
            if not user_responses:
                logger.warning(f"No questionnaire responses found for user {user_id}")
                return self._create_basic_profile([])
            
            profile_data = self._generate_profile_data(user_responses)
            
            # Update or create profile
            profile, created = UserProfile.objects.update_or_create(
                user=user,
                defaults={'profile_data': profile_data}
            )
            
            logger.info(f"Profile {'created' if created else 'updated'} for user {user_id}")
            return profile_data
            
        except Exception as e:
            logger.error(f"Error updating profile for user {user_id}: {e}")
            return self._create_basic_profile([])
    
    def _generate_profile_data(self, user_responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate profile data using Gemini API"""
        try:
            profile_prompt = self.gemini_service.create_profile_prompt(user_responses)
            if not profile_prompt:
                return self._create_basic_profile(user_responses)
            
            user_profile = self.gemini_service.generate_profile(profile_prompt)
            if not user_profile:
                logger.warning("Failed to generate user profile using Gemini, using basic profile")
                return self._create_basic_profile(user_responses)
            
            return user_profile
        except Exception as e:
            logger.error(f"Error generating profile data: {e}")
            return self._create_basic_profile(user_responses)
    
    def _fetch_user_responses(self, user_id: int) -> List[Dict[str, Any]]:
        """Fetch user questionnaire responses"""
        try:
            user = User.objects.get(id=user_id)
            responses = UserResponse.objects.filter(user=user).select_related('question')
            
            formatted_responses = []
            for response in responses:
                formatted_responses.append({
                    'question_id': response.question.id,
                    'question_text': response.question.text,
                    'question_group': response.question.group,
                    'selected_choices': response.selected_choices_text,
                    'custom_input': response.custom_input,
                    'expense_data': response.expense_data,
                })
            
            return formatted_responses
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return []
        except Exception as e:
            logger.error(f"Error fetching user responses: {e}")
            return []
    
    def _create_basic_profile(self, user_responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a basic profile when Gemini API fails"""
        profile = {
            'demographics': {'age': 30, 'maritalStatus': 'Unknown', 'hasKids': False},
            'financial': {'monthlyIncome': 50000, 'jobStability': 'Unknown', 'debtSituation': 'Unknown', 'emergencyFund': 'Unknown'},
            'goals': {'shortTerm': 'Financial stability', 'longTerm': 'Financial independence'},
            'personality': {'spendingStyle': 'Balanced', 'investmentComfort': 'Moderate'},
            'riskFactors': ['Incomplete profile'],
            'opportunities': ['Complete financial assessment']
        }
        
        # Try to extract some basic info from responses
        for response in user_responses:
            question_text = response.get('question_text', '').lower()
            selected_choices = response.get('selected_choices', [])
            custom_input = response.get('custom_input', '')
            
            if 'income' in question_text and custom_input:
                try:
                    profile['financial']['monthlyIncome'] = float(custom_input)
                except ValueError:
                    pass
            elif 'job' in question_text and 'stable' in question_text and selected_choices:
                profile['financial']['jobStability'] = selected_choices[0]
            elif 'debt' in question_text and selected_choices:
                profile['financial']['debtSituation'] = selected_choices[0]
        
        return profile


class GeminiProfileService:
    """Service for generating user profiles using Gemini 2.5 Flash API"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
        
    def validate_api_key(self) -> bool:
        """Validate that the API key is configured"""
        return bool(self.api_key and self.api_key != 'your_gemini_api_key_here')
    
    def create_profile_prompt(self, user_responses: List[Dict[str, Any]]) -> str:
        """Convert questionnaire responses to structured profile prompt"""
        try:
            # Organize responses by group
            responses_by_group = {}
            for response in user_responses:
                group = response.get('question_group', 'Other')
                if group not in responses_by_group:
                    responses_by_group[group] = []
                responses_by_group[group].append(response)
            
            prompt = """
            Based on the following user questionnaire responses, create a comprehensive financial profile summary. 
            Focus on key financial indicators, risk factors, and opportunities for improvement.
            
            User Questionnaire Responses:
            """
            
            # Add responses by group
            for group, responses in responses_by_group.items():
                prompt += f"\n{group}:\n"
                for response in responses:
                    question_text = response.get('question_text', '')
                    selected_choices = response.get('selected_choices', [])
                    custom_input = response.get('custom_input', '')
                    expense_data = response.get('expense_data', {})
                    
                    prompt += f"- {question_text}\n"
                    if selected_choices:
                        prompt += f"  Answer: {', '.join(selected_choices)}\n"
                    if custom_input:
                        prompt += f"  Details: {custom_input}\n"
                    if expense_data:
                        prompt += f"  Expense Data: {json.dumps(expense_data)}\n"
            
            prompt += """
            
            Please analyze this information and provide a structured financial profile including:
            1. Demographics summary
            2. Financial situation analysis (income, expenses, debt, savings)
            3. Financial goals and priorities
            4. Risk factors and areas of concern
            5. Financial personality and preferences
            
            Format the response as a JSON object with the following structure:
            {
                "demographics": {
                    "age": number,
                    "maritalStatus": "string",
                    "hasKids": boolean,
                    "dependents": ["list of dependents"]
                },
                "financial": {
                    "monthlyIncome": number,
                    "jobStability": "string",
                    "debtSituation": "string",
                    "emergencyFund": "string",
                    "monthlyExpenses": number,
                    "expenseBreakdown": {},
                    "savingsRate": number
                },
                "goals": {
                    "shortTerm": "string",
                    "longTerm": "string",
                    "priorities": ["list"]
                },
                "personality": {
                    "spendingStyle": "string",
                    "investmentComfort": "string",
                    "riskTolerance": "string"
                },
                "riskFactors": ["list of financial risks"],
                "opportunities": ["list of potential improvement areas"]
            }
            """
            
            return prompt
            
        except Exception as e:
            logger.error(f"Error creating profile prompt: {e}")
            return ""
    
    def generate_profile(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate user profile using Gemini 2.5 Flash API"""
        if not self.validate_api_key():
            logger.warning("Gemini API key not configured, cannot generate profile")
            return None
            
        try:
            headers = {
                'Content-Type': 'application/json',
            }
            
            data = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,  # Reduced from 2048 for faster response
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            response = requests.post(
                url,
                headers=headers,
                json=data,
                timeout=10  # Reduced from 30 to 10 seconds
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Try to parse JSON from the response
                    try:
                        # Extract JSON from the response (it might be wrapped in markdown)
                        json_start = content.find('{')
                        json_end = content.rfind('}') + 1
                        if json_start != -1 and json_end != -1:
                            json_content = content[json_start:json_end]
                            profile = json.loads(json_content)
                            logger.info("Successfully generated user profile using Gemini")
                            return profile
                        else:
                            logger.warning("No JSON found in Gemini response")
                            return None
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse JSON from Gemini response: {e}")
                        return None
                else:
                    logger.warning("No candidates in Gemini API response")
                    return None
            else:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error calling Gemini API: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in Gemini API call: {e}")
            return None


class PerplexityOpportunityService:
    """Service for finding opportunities using Perplexity API"""
    
    def __init__(self):
        self.api_key = os.getenv('PERPLEXITY_API_KEY')
        self.base_url = "https://api.perplexity.ai/chat/completions"
    
    def validate_api_key(self) -> bool:
        """Validate that the API key is configured"""
        return bool(self.api_key and self.api_key != 'your_perplexity_api_key_here')
    
    def find_opportunities(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find opportunities based on user profile using Perplexity API"""
        if not self.validate_api_key():
            logger.warning("Perplexity API key not configured, using fallback opportunities")
            return self._get_enhanced_fallback_opportunities(profile, [])
        
        try:
            prompt = self._create_opportunity_prompt(profile)
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'sonar-pro',  # Use sonar-pro for opportunities
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 1500,  # Reduced from 2000 for faster response
                'temperature': 0.3
            }
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=15  # Reduced from 30 seconds to 15 seconds
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    content = result['choices'][0]['message']['content']
                    opportunities = self._parse_opportunities_response(content)
                    
                    # Validate and enhance image URLs
                    enhanced_opportunities = []
                    for opportunity in opportunities:
                        enhanced_opportunity = opportunity.copy()
                        
                        # Validate image URL or use fallback
                        image_url = enhanced_opportunity.get('image_url', '').strip()
                        if not image_url or not self._is_valid_image_url(image_url):
                            enhanced_opportunity['image_url'] = self._get_varied_image_url(enhanced_opportunity.get('category', 'general'))
                            logger.info(f"Using fallback image for opportunity: {enhanced_opportunity.get('title', 'Unknown')}")
                        
                        enhanced_opportunities.append(enhanced_opportunity)
                    
                    logger.info(f"Generated {len(enhanced_opportunities)} opportunities using Perplexity")
                    return enhanced_opportunities
                else:
                    logger.warning("No choices in Perplexity API response")
                    return self._get_enhanced_fallback_opportunities(profile, [])
            else:
                logger.error(f"Perplexity API error: {response.status_code} - {response.text}")
                return self._get_enhanced_fallback_opportunities(profile, [])
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error calling Perplexity API: {e}")
            return self._get_enhanced_fallback_opportunities(profile, [])
        except Exception as e:
            logger.error(f"Unexpected error in Perplexity API call: {e}")
            return self._get_enhanced_fallback_opportunities(profile, [])
    
    def _is_valid_image_url(self, url: str) -> bool:
        """Basic validation for image URLs"""
        if not url:
            return False
        
        # Check if it's a valid URL format
        import re
        url_pattern = r'^https?://[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?$'
        if not re.match(url_pattern, url, re.IGNORECASE):
            # Also accept URLs that might not have explicit extensions but are from known image services
            image_services = ['images.unsplash.com', 'pplx-res.cloudinary.com', 'logo.clearbit.com']
            if not any(service in url for service in image_services):
                return False
        
        return True
    
    def _create_opportunity_prompt(self, profile: Dict[str, Any]) -> str:
        """Create prompt for finding opportunities based on user profile"""
        financial = profile.get('financial', {})
        goals = profile.get('goals', {})
        risk_factors = profile.get('riskFactors', [])
        demographics = profile.get('demographics', {})
        
        prompt = f"""
        Based on this user's financial profile, suggest specific, real-world financial opportunities available in India RIGHT NOW:
        
        Financial Situation:
        - Monthly Income: ₹{financial.get('monthlyIncome', 0)}
        - Job Stability: {financial.get('jobStability', 'Unknown')}
        - Debt Situation: {financial.get('debtSituation', 'Unknown')}
        - Emergency Fund: {financial.get('emergencyFund', 'Unknown')}
        - Savings Rate: {financial.get('savingsRate', 0)}%
        
        Goals:
        - Short-term: {goals.get('shortTerm', 'Not specified')}
        - Long-term: {goals.get('longTerm', 'Not specified')}
        
        Risk Factors: {', '.join(risk_factors) if risk_factors else 'None identified'}
        
        Age: {demographics.get('age', 'Unknown')}
        Marital Status: {demographics.get('maritalStatus', 'Unknown')}
        
        Please provide 4-6 SPECIFIC, REAL-WORLD opportunities with the following format for each:
        
        TITLE: [Specific opportunity like "HDFC Bank Personal Loan at 10.5% APR" or "Coursera Data Science Certificate 50% Off" or "Maruti Suzuki Year-End Car Discount" or "Thailand Travel Package 30% Off"]
        CATEGORY: [investment/loan_offers/skill_development/travel_deals/car_deals/insurance_offers/job_opportunities]
        PRIORITY: [high/medium/low]
        DESCRIPTION: [Specific details about the offer, discount, rate, validity period]
        AI_INSIGHTS: [Why this specific opportunity is perfect for the user's situation and goals]
        ACTION_STEPS: [Specific steps to avail this opportunity]
        RELEVANCE_SCORE: [0.0-1.0 score]
        IMAGE_URL: [REQUIRED - Find and provide a specific, high-quality image URL that directly relates to this opportunity. Search for relevant images from news sources, company websites, or stock photos. For bank offers use bank building/financial images, for courses use education images, for travel use destination images, for cars use specific car model images. Must be a working, accessible URL. Examples: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=240 for banking, https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240 for education]
        LOGO_URL: [Company/provider logo URL like https://logo.clearbit.com/hdfcbank.com]
        OFFER_DETAILS: [JSON format like {{"discount": "50%", "validity": "31st Jan 2025", "originalPrice": "₹10,000", "discountedPrice": "₹5,000"}}]
        
        Focus on:
        1. REAL opportunities that exist in the market (investment products, loan offers, course discounts, travel deals, car offers)
        2. Time-sensitive offers with validity periods
        3. Specific companies and their current offers
        4. Opportunities that match the user's income level and goals
        5. Current market conditions (repo rate changes, seasonal offers, etc.)
        6. CRITICAL: Each opportunity MUST include a relevant, working IMAGE_URL
        
        Make each opportunity unique and specific - no generic advice!
        
        IMAGE URL REQUIREMENTS:
        - Must be a working, accessible image URL
        - Must directly relate to the specific opportunity
        - Use high-quality images from reliable sources
        - Examples by category:
          * Banking/Loans: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=240&fit=crop&q=80
          * Education/Courses: https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80
          * Travel: https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=240&fit=crop&q=80
          * Cars: https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=240&fit=crop&q=80
          * Investment: https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=240&fit=crop&q=80
        """
        
        return prompt
    
    def _parse_opportunities_response(self, content: str) -> List[Dict[str, Any]]:
        """Parse opportunities from Perplexity API response"""
        opportunities = []
        
        try:
            # Split content by TITLE: to get individual opportunities
            sections = content.split('TITLE:')[1:]  # Skip first empty section
            
            for section in sections:
                try:
                    opportunity = {}
                    lines = section.strip().split('\n')
                    
                    # Parse title (first line)
                    opportunity['title'] = lines[0].strip()
                    
                    # Parse other fields
                    current_field = None
                    current_content = []
                    
                    for line in lines[1:]:
                        line = line.strip()
                        if line.startswith('CATEGORY:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'category'
                            current_content = [line.replace('CATEGORY:', '').strip()]
                        elif line.startswith('PRIORITY:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'priority'
                            current_content = [line.replace('PRIORITY:', '').strip()]
                        elif line.startswith('DESCRIPTION:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'description'
                            current_content = [line.replace('DESCRIPTION:', '').strip()]
                        elif line.startswith('AI_INSIGHTS:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'ai_insights'
                            current_content = [line.replace('AI_INSIGHTS:', '').strip()]
                        elif line.startswith('ACTION_STEPS:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'action_steps'
                            current_content = [line.replace('ACTION_STEPS:', '').strip()]
                        elif line.startswith('RELEVANCE_SCORE:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            try:
                                score_text = line.replace('RELEVANCE_SCORE:', '').strip()
                                opportunity['relevance_score'] = float(score_text)
                            except ValueError:
                                opportunity['relevance_score'] = 0.5
                        elif line.startswith('IMAGE_URL:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'image_url'
                            current_content = [line.replace('IMAGE_URL:', '').strip()]
                        elif line.startswith('LOGO_URL:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'logo_url'
                            current_content = [line.replace('LOGO_URL:', '').strip()]
                        elif line.startswith('OFFER_DETAILS:'):
                            if current_field:
                                opportunity[current_field] = '\n'.join(current_content).strip()
                            current_field = 'offer_details'
                            current_content = [line.replace('OFFER_DETAILS:', '').strip()]
                        elif line and current_field:
                            current_content.append(line)
                    
                    # Add the last field
                    if current_field and current_content:
                        opportunity[current_field] = '\n'.join(current_content).strip()
                    
                    # Parse action steps into list
                    if 'action_steps' in opportunity:
                        steps_text = opportunity['action_steps']
                        # Split by numbers or bullet points
                        import re
                        steps = re.split(r'\d+\.|\-|\•', steps_text)
                        opportunity['action_steps'] = [step.strip() for step in steps if step.strip()]
                    
                    # Parse offer details JSON
                    if 'offer_details' in opportunity:
                        try:
                            offer_details_text = opportunity['offer_details']
                            # Try to parse JSON
                            opportunity['offer_details'] = json.loads(offer_details_text)
                        except (json.JSONDecodeError, TypeError):
                            # If parsing fails, create a basic structure
                            opportunity['offer_details'] = {'details': opportunity.get('offer_details', '')}
                    
                    # Set defaults for missing fields
                    opportunity.setdefault('category', 'general')
                    opportunity.setdefault('priority', 'medium')
                    opportunity.setdefault('description', 'Financial opportunity')
                    opportunity.setdefault('ai_insights', 'This opportunity could benefit your financial situation.')
                    opportunity.setdefault('action_steps', ['Research this opportunity', 'Take action'])
                    opportunity.setdefault('relevance_score', 0.5)
                    
                    # Only use fallback image if no image_url was provided by API
                    if not opportunity.get('image_url') or opportunity.get('image_url').strip() == '':
                        fallback_image = self._get_varied_image_url(opportunity.get('category', 'general'))
                        opportunity['image_url'] = fallback_image
                        logger.info(f"Using fallback image for opportunity '{opportunity.get('title', 'Unknown')}': {fallback_image}")
                    else:
                        logger.info(f"Using API-provided image for opportunity '{opportunity.get('title', 'Unknown')}': {opportunity.get('image_url')}")
                    
                    opportunity.setdefault('logo_url', 'https://logo.clearbit.com/example.com')
                    opportunity.setdefault('offer_details', {})
                    
                    if opportunity.get('title'):
                        opportunities.append(opportunity)
                        
                except Exception as e:
                    logger.error(f"Error parsing individual opportunity: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error parsing opportunities response: {e}")
            
        return opportunities
    
    def _get_enhanced_fallback_opportunities(self, profile: Dict[str, Any], api_opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Provide fallback opportunities when API is unavailable"""
        financial = profile.get('financial', {})
        risk_factors = profile.get('riskFactors', [])
        
        fallback_opportunities = []
        
        # Emergency fund opportunity
        if 'emergency fund' in str(financial.get('emergencyFund', '')).lower() or 'month' in str(financial.get('emergencyFund', '')).lower():
            fallback_opportunities.append({
                'title': 'HDFC Bank Savings Account - 7% Interest Rate',
                'category': 'emergency_fund',
                'priority': 'high',
                'description': 'High-yield savings account perfect for building your emergency fund with competitive interest rates.',
                'ai_insights': 'Based on your current savings situation, building an emergency fund should be your top priority. This HDFC account offers better returns than regular savings accounts.',
                'action_steps': [
                    'Visit HDFC Bank branch or apply online',
                    'Complete KYC documentation',
                    'Set up automatic monthly transfers',
                    'Start with ₹5,000 minimum balance'
                ],
                'relevance_score': 0.9,
                'image_url': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=240&fit=crop&q=80',
                'logo_url': 'https://logo.clearbit.com/hdfcbank.com',
                'offer_details': {
                    'interest_rate': '7% p.a.',
                    'minimum_balance': '₹10,000',
                    'validity': 'Ongoing offer',
                    'benefits': 'Free debit card, online banking'
                }
            })
        
        # Debt management opportunity
        if 'debt' in str(financial.get('debtSituation', '')).lower() and 'no debt' not in str(financial.get('debtSituation', '')).lower():
            fallback_opportunities.append({
                'title': 'Debt Consolidation Strategy',
                'category': 'debt_management',
                'priority': 'high',
                'description': 'Optimize your debt repayment strategy to save money and become debt-free faster.',
                'ai_insights': 'Your current debt situation indicates potential for optimization. A structured approach to debt repayment can save significant money in interest.',
                'action_steps': [
                    'List all debts with interest rates',
                    'Consider debt consolidation options',
                    'Implement debt avalanche or snowball method',
                    'Negotiate with creditors for better terms'
                ],
                'relevance_score': 0.8
            })
        
        # Investment opportunity
        if financial.get('savingsRate', 0) > 10:
            fallback_opportunities.append({
                'title': 'Start SIP Investment',
                'category': 'investment',
                'priority': 'medium',
                'description': 'Begin systematic investment planning to build long-term wealth.',
                'ai_insights': 'Your savings rate indicates capacity for investment. Starting early with SIPs can help achieve your long-term financial goals.',
                'action_steps': [
                    'Complete KYC with mutual fund platform',
                    'Choose diversified equity and debt funds',
                    'Start with small monthly SIP amount',
                    'Review and increase SIP annually'
                ],
                'relevance_score': 0.7
            })
        
        # Job stability opportunity
        if 'contract' in str(financial.get('jobStability', '')).lower() or 'freelance' in str(financial.get('jobStability', '')).lower():
            fallback_opportunities.append({
                'title': 'Skill Development for Career Growth',
                'category': 'skill_development',
                'priority': 'medium',
                'description': 'Enhance your skills to improve job security and income potential.',
                'ai_insights': 'Your job situation suggests potential for improvement through skill development. This can lead to better opportunities and income stability.',
                'action_steps': [
                    'Identify in-demand skills in your field',
                    'Enroll in online courses or certifications',
                    'Build a portfolio of your work',
                    'Network with professionals in your industry'
                ],
                'relevance_score': 0.6
            })
        
        return fallback_opportunities[:6]  # Return max 6 opportunities
    
    def _get_varied_image_url(self, category: str) -> str:
        """Generate varied image URLs based on category"""
        import random
        
        # Multiple images per category for variety
        image_pools = {
            'investment': [
                'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=240&fit=crop&q=80',
            ],
            'car_purchase': [
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=240&fit=crop&q=80',
            ],
            'travel': [
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=240&fit=crop&q=80',
            ],
            'education': [
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80',
            ],
            'certification': [
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=240&fit=crop&q=80',
            ],
            'loan_offers': [
                'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=240&fit=crop&q=80',
            ],
            'insurance': [
                'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=240&fit=crop&q=80',
            ],
            'insurance_offers': [
                'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=240&fit=crop&q=80',
            ],
            'skill_development': [
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=240&fit=crop&q=80',
            ],
            'real_estate': [
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&h=240&fit=crop&q=80',
            ],
        }
        
        # Get images for category or use default
        category_images = image_pools.get(category, image_pools.get('investment', []))
        
        # Return a random image from the category pool
        return random.choice(category_images)


class OpportunityService:
    """Main service to orchestrate opportunity generation"""
    
    def __init__(self):
        self.profile_service = ProfileService()
        self.perplexity_service = PerplexityOpportunityService()

    def get_opportunities(self, user_id: int) -> List[Opportunity]:
        """Get opportunities for user with simple caching (1 hour freshness)"""
        try:
            # Check for fresh opportunities first
            existing_opportunities = self._get_fresh_opportunities(user_id)
            if existing_opportunities:
                logger.info(f"Returning existing fresh opportunities for user {user_id}")
                return existing_opportunities
            
            # Generate new opportunities
            return self._generate_new_opportunities(user_id)
            
        except Exception as e:
            logger.error(f"Error getting opportunities for user {user_id}: {e}")
            return []
    
    def refresh_opportunities(self, user_id: int) -> List[Opportunity]:
        """Synchronously refresh opportunities for user"""
        try:
            # Delete existing opportunities
            Opportunity.objects.filter(user_id=user_id).delete()
            logger.info(f"Deleted existing opportunities for user {user_id}")
            
            # Generate new opportunities
            return self._generate_new_opportunities(user_id)
            
        except Exception as e:
            logger.error(f"Error refreshing opportunities for user {user_id}: {e}")
            return []
    
    def _get_fresh_opportunities(self, user_id: int, hours=5) -> List[Opportunity]:
        """Get opportunities that are less than specified hours old"""
        try:
            from datetime import timedelta
            cutoff_time = timezone.now() - timedelta(hours=hours)
            
            opportunities = list(Opportunity.objects.filter(
                user_id=user_id,
                created_at__gte=cutoff_time
            ).order_by('-created_at'))
            
            if opportunities:
                logger.info(f"Found {len(opportunities)} fresh opportunities for user {user_id}")
                return opportunities
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting fresh opportunities for user {user_id}: {e}")
            return []
    
    def _generate_new_opportunities(self, user_id: int) -> List[Opportunity]:
        """Generate new opportunities synchronously"""
        try:
            # Get or create user profile
            user_profile = self.profile_service.get_or_create_profile(user_id)
            if not user_profile:
                logger.warning(f"Could not get profile for user {user_id}")
                return []
            
            # Generate opportunities using Perplexity
            opportunity_data = self.perplexity_service.find_opportunities(user_profile)
            if not opportunity_data:
                logger.warning(f"No opportunities generated for user {user_id}")
                return []
            
            # Create and save Opportunity objects
            opportunities = self._create_opportunity_objects(user_id, opportunity_data, user_profile)
            
            logger.info(f"Generated {len(opportunities)} new opportunities for user {user_id}")
            return opportunities
            
        except Exception as e:
            logger.error(f"Error generating new opportunities for user {user_id}: {e}")
            return []
    
    def _create_opportunity_objects(self, user_id: int, opportunity_data: List[Dict[str, Any]], user_profile: Dict[str, Any]) -> List[Opportunity]:
        """Create Opportunity model objects from opportunity data"""
        try:
            user = User.objects.get(id=user_id)
            
            # Get or create user profile record
            try:
                profile_record = UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                profile_record = UserProfile.objects.create(
                    user=user,
                    profile_data=user_profile
                )
            
            opportunities = []
            
            for data in opportunity_data:
                try:
                    # Set defaults for missing fields
                    data.setdefault('category', 'general')
                    data.setdefault('priority', 'medium')
                    data.setdefault('description', 'Financial opportunity')
                    data.setdefault('ai_insights', 'This opportunity could benefit your financial situation.')
                    data.setdefault('action_steps', ['Research this opportunity', 'Take action'])
                    data.setdefault('relevance_score', 0.5)
                    
                    # Ensure image URL or use fallback
                    if not data.get('image_url') or data.get('image_url').strip() == '':
                        fallback_image = self._get_varied_image_url(data.get('category', 'general'))
                        data['image_url'] = fallback_image
                        logger.info(f"Using fallback image for opportunity '{data.get('title', 'Unknown')}': {fallback_image}")
                    else:
                        logger.info(f"Using API-provided image for opportunity '{data.get('title', 'Unknown')}': {data.get('image_url')}")
                    
                    data.setdefault('logo_url', 'https://logo.clearbit.com/example.com')
                    data.setdefault('offer_details', {})
                    
                    # Create unique hash for this opportunity
                    opportunity_hash = self._create_opportunity_hash(data)
                    
                    # Create the opportunity
                    opportunity = Opportunity.objects.create(
                        user=user,
                        profile=profile_record,
                        title=data.get('title', 'Financial Opportunity'),
                        description=data.get('description', 'A financial opportunity for you'),
                        category=data.get('category', 'general'),
                        priority=data.get('priority', 'medium'),
                        ai_insights=data.get('ai_insights', 'This opportunity could benefit your financial situation.'),
                        action_steps=data.get('action_steps', []),
                        relevance_score=float(data.get('relevance_score', 0.5)),
                        image_url=data.get('image_url'),
                        logo_url=data.get('logo_url', 'https://logo.clearbit.com/example.com'),
                        offer_details=data.get('offer_details', {}),
                        opportunity_hash=opportunity_hash
                    )
                    
                    opportunities.append(opportunity)
                    logger.info(f"Created opportunity: {opportunity.title}")
                    
                except Exception as e:
                    logger.error(f"Error creating opportunity: {e}")
                    continue
            
            return opportunities
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return []
        except Exception as e:
            logger.error(f"Error creating opportunity objects: {e}")
            return []
    
    def _get_varied_image_url(self, category: str) -> str:
        """Generate varied image URLs based on category"""
        import random
        
        # Multiple images per category for variety
        image_pools = {
            'investment': [
                'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=240&fit=crop&q=80',
            ],
            'car_purchase': [
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=240&fit=crop&q=80',
            ],
            'travel': [
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=240&fit=crop&q=80',
            ],
            'education': [
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80',
            ],
            'certification': [
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=240&fit=crop&q=80',
            ],
            'loan_offers': [
                'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=240&fit=crop&q=80',
            ],
            'insurance': [
                'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=240&fit=crop&q=80',
            ],
            'insurance_offers': [
                'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=240&fit=crop&q=80',
            ],
            'skill_development': [
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=240&fit=crop&q=80',
            ],
            'real_estate': [
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=240&fit=crop&q=80',
                'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&h=240&fit=crop&q=80',
            ],
        }
        
        # Get images for category or use default
        category_images = image_pools.get(category, image_pools.get('investment', []))
        
        # Return a random image from the category pool
        return random.choice(category_images)
    
    def _create_opportunity_hash(self, opportunity_data: Dict[str, Any]) -> str:
        """Create a hash for the opportunity to prevent duplicates"""
        # Use title and category to create a unique hash
        hash_string = f"{opportunity_data.get('title', '')}-{opportunity_data.get('category', '')}"
        return hashlib.md5(hash_string.encode()).hexdigest()[:16]
