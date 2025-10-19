"""
Gemini 2.5 Flash Service for NLP Processing
- Profile embedding generation
- Opportunity-profile matching
- Similarity scoring
- Semantic deduplication
- Fast and cost-effective
"""

import os
import requests
import logging
import json
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class GeminiFlashService:
    """
    Service for using Gemini 2.5 Flash for fast NLP operations.
    Flash is 100x faster and cheaper than Pro, perfect for:
    - Embedding generation
    - Quick text analysis
    - Batch processing
    """
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-2.0-flash-exp"  # Latest flash model
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured")
    
    def validate_api_key(self) -> bool:
        """Validate that API key is configured"""
        return bool(self.api_key and self.api_key != 'your_gemini_api_key_here')
    
    # ==================== Profile Embedding ====================
    
    def generate_profile_embedding(self, profile_data: Dict[str, Any]) -> Optional[List[float]]:
        """
        Generate semantic embedding vector from user profile.
        Used for similarity matching and clustering.
        
        Args:
            profile_data: User profile dictionary from UserProfile model
            
        Returns:
            768-dimensional embedding vector or None if failed
        """
        if not self.validate_api_key():
            logger.error("Cannot generate embedding - API key not configured")
            return None
        
        try:
            # Create structured text representation of profile
            profile_text = self._profile_to_text(profile_data)
            
            # Generate embedding using Gemini embedding endpoint
            url = f"{self.base_url}/models/text-embedding-004:embedContent"
            
            headers = {'Content-Type': 'application/json'}
            
            data = {
                "model": "models/text-embedding-004",
                "content": {
                    "parts": [{
                        "text": profile_text
                    }]
                }
            }
            
            response = requests.post(
                f"{url}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                embedding = result.get('embedding', {}).get('values', [])
                
                if embedding:
                    logger.info(f"Generated profile embedding ({len(embedding)} dimensions)")
                    return embedding
                else:
                    logger.warning("No embedding in response")
                    return None
            else:
                logger.error(f"Embedding API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating profile embedding: {e}")
            return None
    
    def _profile_to_text(self, profile_data: Dict[str, Any]) -> str:
        """Convert profile JSON to structured text for embedding"""
        demographics = profile_data.get('demographics', {})
        financial = profile_data.get('financial', {})
        goals = profile_data.get('goals', {})
        personality = profile_data.get('personality', {})
        
        text_parts = []
        
        # Demographics
        if demographics:
            text_parts.append(f"Age: {demographics.get('age', 'unknown')}")
            text_parts.append(f"Marital Status: {demographics.get('maritalStatus', 'unknown')}")
            text_parts.append(f"Has Children: {demographics.get('hasKids', False)}")
        
        # Financial
        if financial:
            text_parts.append(f"Monthly Income: {financial.get('monthlyIncome', 0)}")
            text_parts.append(f"Job Stability: {financial.get('jobStability', 'unknown')}")
            text_parts.append(f"Debt Situation: {financial.get('debtSituation', 'unknown')}")
            text_parts.append(f"Emergency Fund: {financial.get('emergencyFund', 'unknown')}")
            text_parts.append(f"Savings Rate: {financial.get('savingsRate', 0)}%")
        
        # Goals
        if goals:
            text_parts.append(f"Short-term Goal: {goals.get('shortTerm', 'Not specified')}")
            text_parts.append(f"Long-term Goal: {goals.get('longTerm', 'Not specified')}")
            priorities = goals.get('priorities', [])
            if priorities:
                text_parts.append(f"Priorities: {', '.join(priorities)}")
        
        # Personality
        if personality:
            text_parts.append(f"Spending Style: {personality.get('spendingStyle', 'unknown')}")
            text_parts.append(f"Investment Comfort: {personality.get('investmentComfort', 'unknown')}")
            text_parts.append(f"Risk Tolerance: {personality.get('riskTolerance', 'medium')}")
        
        return " | ".join(text_parts)
    
    # ==================== Similarity Calculation ====================
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Returns:
            Similarity score between 0.0 and 1.0
        """
        try:
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            
            # Normalize to 0-1 range
            similarity = (similarity + 1) / 2
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    def find_similar_users(
        self,
        target_embedding: List[float],
        all_embeddings: Dict[int, List[float]],
        top_k: int = 10,
        threshold: float = 0.7
    ) -> List[Tuple[int, float]]:
        """
        Find most similar users based on embedding similarity.
        
        Args:
            target_embedding: Embedding of target user
            all_embeddings: Dict of user_id -> embedding
            top_k: Number of similar users to return
            threshold: Minimum similarity threshold
            
        Returns:
            List of (user_id, similarity_score) tuples
        """
        similarities = []
        
        for user_id, embedding in all_embeddings.items():
            similarity = self.calculate_similarity(target_embedding, embedding)
            if similarity >= threshold:
                similarities.append((user_id, similarity))
        
        # Sort by similarity (descending) and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
    
    # ==================== Opportunity Matching ====================
    
    def score_opportunity(
        self,
        opportunity: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> float:
        """
        Score how well an opportunity matches a user profile.
        Uses Gemini Flash for quick analysis.
        
        Returns:
            Relevance score between 0.0 and 1.0
        """
        if not self.validate_api_key():
            logger.error("Cannot score opportunity - API key not configured")
            return 0.5  # Default neutral score
        
        try:
            prompt = self._create_scoring_prompt(opportunity, user_profile)
            
            url = f"{self.base_url}/models/{self.model}:generateContent"
            
            headers = {'Content-Type': 'application/json'}
            
            data = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.1,  # Low temperature for consistent scoring
                    "maxOutputTokens": 50,
                }
            }
            
            response = requests.post(
                f"{url}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=5  # Fast timeout for Flash
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Extract score from response
                    score = self._extract_score(content)
                    return score
                else:
                    logger.warning("No candidates in scoring response")
                    return 0.5
            else:
                logger.error(f"Scoring API error: {response.status_code}")
                return 0.5
                
        except Exception as e:
            logger.error(f"Error scoring opportunity: {e}")
            return 0.5
    
    def batch_score_opportunities(
        self,
        opportunities: List[Dict[str, Any]],
        user_profile: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Score multiple opportunities in a batch for efficiency.
        
        Returns:
            Dict mapping opportunity content_hash to score
        """
        scores = {}
        
        # Process in batches of 5 for efficiency
        batch_size = 5
        for i in range(0, len(opportunities), batch_size):
            batch = opportunities[i:i+batch_size]
            
            for opp in batch:
                content_hash = opp.get('content_hash', '')
                score = self.score_opportunity(opp, user_profile)
                scores[content_hash] = score
        
        return scores
    
    def _create_scoring_prompt(self, opportunity: Dict[str, Any], user_profile: Dict[str, Any]) -> str:
        """Create prompt for scoring opportunity relevance"""
        financial = user_profile.get('financial', {})
        goals = user_profile.get('goals', {})
        
        return f"""
Score how relevant this opportunity is for the user (0.0 to 1.0):

Opportunity:
- Title: {opportunity.get('title', '')}
- Category: {opportunity.get('category', '')}
- Description: {opportunity.get('description', '')[:200]}

User Profile:
- Income: ₹{financial.get('monthlyIncome', 0)}/month
- Goals: {goals.get('shortTerm', '')}, {goals.get('longTerm', '')}
- Risk Tolerance: {user_profile.get('personality', {}).get('riskTolerance', 'medium')}

Respond with only a number between 0.0 and 1.0.
High score (0.8-1.0): Perfect match for user's situation and goals
Medium score (0.5-0.7): Somewhat relevant
Low score (0.0-0.4): Not relevant

Score:"""
    
    def _extract_score(self, response_text: str) -> float:
        """Extract numerical score from response text"""
        try:
            # Try to find a float number in the response
            import re
            numbers = re.findall(r'0?\.\d+|1\.0|0|1', response_text)
            if numbers:
                score = float(numbers[0])
                return max(0.0, min(1.0, score))  # Clamp to 0-1
            return 0.5
        except:
            return 0.5
    
    # ==================== Semantic Deduplication ====================
    
    def are_opportunities_similar(
        self,
        opp1: Dict[str, Any],
        opp2: Dict[str, Any],
        threshold: float = 0.85
    ) -> bool:
        """
        Check if two opportunities are semantically similar.
        Prevents showing "same deal, different wording".
        
        Args:
            opp1, opp2: Opportunity dictionaries
            threshold: Similarity threshold (0.85 = 85% similar)
            
        Returns:
            True if opportunities are too similar
        """
        if not self.validate_api_key():
            # Fallback to simple text comparison
            return self._simple_similarity_check(opp1, opp2)
        
        try:
            text1 = f"{opp1.get('title', '')} {opp1.get('description', '')}"
            text2 = f"{opp2.get('title', '')} {opp2.get('description', '')}"
            
            # Generate embeddings for both
            embedding1 = self._generate_text_embedding(text1)
            embedding2 = self._generate_text_embedding(text2)
            
            if embedding1 and embedding2:
                similarity = self.calculate_similarity(embedding1, embedding2)
                return similarity >= threshold
            else:
                return self._simple_similarity_check(opp1, opp2)
                
        except Exception as e:
            logger.error(f"Error checking opportunity similarity: {e}")
            return False
    
    def _generate_text_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for arbitrary text"""
        try:
            url = f"{self.base_url}/models/text-embedding-004:embedContent"
            
            headers = {'Content-Type': 'application/json'}
            
            data = {
                "model": "models/text-embedding-004",
                "content": {
                    "parts": [{
                        "text": text[:500]  # Limit text length
                    }]
                }
            }
            
            response = requests.post(
                f"{url}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('embedding', {}).get('values', [])
            return None
                
        except Exception as e:
            logger.error(f"Error generating text embedding: {e}")
            return None
    
    def _simple_similarity_check(self, opp1: Dict[str, Any], opp2: Dict[str, Any]) -> bool:
        """Simple fallback similarity check using string matching"""
        title1 = opp1.get('title', '').lower()
        title2 = opp2.get('title', '').lower()
        
        # Check if titles are very similar
        common_words = set(title1.split()) & set(title2.split())
        if len(common_words) >= 3:
            return True
        
        return False
    
    # ==================== Characteristic Extraction ====================
    
    def extract_characteristics(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract key characteristics from profile for clustering.
        Fast extraction without API call.
        
        Returns:
            {
                'income_bracket': '50k-100k',
                'age_group': '25-35',
                'location': 'mumbai',
                'goals': ['investment', 'savings'],
                'risk_tolerance': 'medium',
                'interests': ['stocks', 'travel']
            }
        """
        characteristics = {}
        
        # Income bracket
        income = profile_data.get('financial', {}).get('monthlyIncome', 0)
        characteristics['income_bracket'] = self._get_income_bracket(income)
        
        # Age group
        age = profile_data.get('demographics', {}).get('age', 30)
        characteristics['age_group'] = self._get_age_group(age)
        
        # Location (extract from profile or default to India)
        location = profile_data.get('demographics', {}).get('location', 'india')
        characteristics['location'] = location.lower().replace(' ', '_')
        
        # Goals
        goals = profile_data.get('goals', {})
        goal_list = []
        if goals.get('shortTerm'):
            goal_list.extend(self._extract_goal_keywords(goals['shortTerm']))
        if goals.get('longTerm'):
            goal_list.extend(self._extract_goal_keywords(goals['longTerm']))
        if goals.get('priorities'):
            goal_list.extend(goals['priorities'])
        
        characteristics['goals'] = list(set(goal_list))[:3]  # Top 3 unique goals
        
        # Risk tolerance
        risk = profile_data.get('personality', {}).get('riskTolerance', 'medium')
        characteristics['risk_tolerance'] = risk.lower()
        
        # Interests (extract from opportunities list or risk factors)
        interests = []
        risk_factors = profile_data.get('riskFactors', [])
        for factor in risk_factors:
            interests.extend(self._extract_interest_keywords(factor))
        
        opportunities = profile_data.get('opportunities', [])
        for opp in opportunities:
            interests.extend(self._extract_interest_keywords(opp))
        
        characteristics['interests'] = list(set(interests))[:5]  # Top 5 unique interests
        
        return characteristics
    
    def _get_income_bracket(self, income: float) -> str:
        """Categorize income into brackets"""
        if income < 25000:
            return 'below_25k'
        elif income < 50000:
            return '25k-50k'
        elif income < 100000:
            return '50k-100k'
        elif income < 200000:
            return '100k-200k'
        else:
            return 'above_200k'
    
    def _get_age_group(self, age: int) -> str:
        """Categorize age into groups"""
        if age < 25:
            return 'below_25'
        elif age < 35:
            return '25-35'
        elif age < 45:
            return '35-45'
        elif age < 55:
            return '45-55'
        else:
            return 'above_55'
    
    def _extract_goal_keywords(self, goal_text: str) -> List[str]:
        """Extract keywords from goal text"""
        keywords_map = {
            'invest': 'investment',
            'save': 'savings',
            'debt': 'debt_management',
            'house': 'real_estate',
            'car': 'vehicle',
            'travel': 'travel',
            'education': 'education',
            'retire': 'retirement',
            'emergen': 'emergency_fund',
        }
        
        goal_lower = goal_text.lower()
        keywords = []
        
        for key, value in keywords_map.items():
            if key in goal_lower:
                keywords.append(value)
        
        return keywords
    
    def _extract_interest_keywords(self, text: str) -> List[str]:
        """Extract interest keywords from text"""
        interest_map = {
            'stock': 'stocks',
            'equity': 'stocks',
            'mutual fund': 'mutual_funds',
            'crypto': 'crypto',
            'gold': 'gold',
            'property': 'real_estate',
            'travel': 'travel',
            'job': 'job_search',
            'skill': 'skill_development',
        }
        
        text_lower = text.lower()
        interests = []
        
        for key, value in interest_map.items():
            if key in text_lower:
                interests.append(value)
        
        return interests


# Global instance
gemini_flash_service = GeminiFlashService()
