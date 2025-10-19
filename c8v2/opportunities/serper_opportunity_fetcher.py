"""
Serper-based Opportunity Fetcher
Fetches real opportunities from the web using Serper API:
- Travel: Cheap flights, hotel deals, vacation packages
- Jobs: Job openings based on skills/location
- Investments: IPO announcements, undervalued stocks, mutual fund offers
"""

import os
import requests
import logging
import re
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from decimal import Decimal

logger = logging.getLogger(__name__)


class SerperOpportunityFetcher:
    """
    Fetches real opportunities using Serper API web search.
    Serper provides Google search results via API.
    """
    
    def __init__(self):
        self.api_key = os.getenv('SERPER_API_KEY')
        if not self.api_key:
            logger.warning("SERPER_API_KEY not configured")
        
        self.base_url = "https://google.serper.dev/search"
        self.headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def validate_api_key(self) -> bool:
        """Validate API key is configured"""
        return bool(self.api_key and len(self.api_key) > 10)
    
    # ==================== Main Fetch Methods ====================
    
    def fetch_opportunities_for_cluster(
        self,
        cluster_characteristics: Dict[str, Any],
        categories: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch opportunities for a user cluster.
        
        Args:
            cluster_characteristics: User cluster characteristics
            categories: List of categories to fetch ('travel', 'job', 'investment')
            
        Returns:
            List of opportunity dictionaries
        """
        if not self.validate_api_key():
            logger.error("Cannot fetch opportunities - Serper API key not configured")
            return []
        
        if categories is None:
            categories = ['travel', 'job', 'investment']
        
        all_opportunities = []
        
        # Fetch opportunities for each category
        for category in categories:
            try:
                if category == 'travel':
                    opportunities = self.fetch_travel_opportunities(cluster_characteristics)
                elif category == 'job':
                    opportunities = self.fetch_job_opportunities(cluster_characteristics)
                elif category == 'investment':
                    opportunities = self.fetch_investment_opportunities(cluster_characteristics)
                else:
                    logger.warning(f"Unknown category: {category}")
                    continue
                
                all_opportunities.extend(opportunities)
                logger.info(f"Fetched {len(opportunities)} {category} opportunities")
                
            except Exception as e:
                logger.error(f"Error fetching {category} opportunities: {e}")
                continue
        
        return all_opportunities
    
    # ==================== Travel Opportunities ====================
    
    def fetch_travel_opportunities(self, characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Fetch travel opportunities: cheap flights, hotel deals, vacation packages.
        """
        opportunities = []
        
        # Determine user's budget and location
        income_bracket = characteristics.get('income_bracket', '50k-100k')
        location = characteristics.get('location', 'india')
        
        # Search queries for different travel opportunities
        queries = [
            f"cheap flights from India {datetime.now().strftime('%B %Y')} site:makemytrip.com OR site:goibibo.com",
            f"hotel deals discounts India {datetime.now().strftime('%B')} site:booking.com OR site:agoda.com",
            f"vacation packages India discount offers site:yatra.com OR site:cleartrip.com",
            f"weekend getaway deals from Mumbai Delhi Bangalore discount",
        ]
        
        for query in queries:
            try:
                results = self._serper_search(query, num=3)
                if results:
                    parsed = self._parse_travel_results(results, characteristics)
                    opportunities.extend(parsed)
            except Exception as e:
                logger.error(f"Error searching travel: {e}")
                continue
        
        return opportunities[:10]  # Return top 10
    
    def _parse_travel_results(self, results: Dict[str, Any], characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Serper search results for travel opportunities"""
        opportunities = []
        
        organic_results = results.get('organic', [])
        
        for result in organic_results:
            try:
                title = result.get('title', '')
                snippet = result.get('snippet', '')
                link = result.get('link', '')
                
                # Skip if no useful info
                if not title or not snippet:
                    continue
                
                # Extract price if available
                price = self._extract_price(snippet + ' ' + title)
                discount = self._extract_discount(snippet + ' ' + title)
                
                # Determine sub-category
                sub_category = 'vacation_package'
                if 'flight' in title.lower() or 'flight' in snippet.lower():
                    sub_category = 'flight'
                elif 'hotel' in title.lower() or 'hotel' in snippet.lower():
                    sub_category = 'hotel'
                
                # Build opportunity
                opportunity = {
                    'title': title[:300],
                    'description': snippet[:500],
                    'category': 'travel',
                    'sub_category': sub_category,
                    'source_url': link,
                    'image_url': self._get_travel_image_url(sub_category),
                    'offer_details': {
                        'price': price if price else 'Check website',
                        'discount': discount if discount else 'Limited time offer',
                        'validity': self._get_validity_period(),
                        'source': self._extract_domain(link)
                    },
                    'priority': 'medium',
                    'target_profile': characteristics,
                    'relevance_base_score': 0.6
                }
                
                # Generate content hash
                opportunity['content_hash'] = self._generate_content_hash(
                    opportunity['title'],
                    opportunity['description'],
                    opportunity['source_url']
                )
                
                opportunities.append(opportunity)
                
            except Exception as e:
                logger.error(f"Error parsing travel result: {e}")
                continue
        
        return opportunities
    
    # ==================== Job Opportunities ====================
    
    def fetch_job_opportunities(self, characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Fetch job opportunities based on user skills and location.
        """
        opportunities = []
        
        # Extract relevant characteristics
        interests = characteristics.get('interests', [])
        location = characteristics.get('location', 'india')
        income_bracket = characteristics.get('income_bracket', '')
        
        # Determine job keywords from interests
        job_keywords = self._get_job_keywords(interests, income_bracket)
        
        # Search queries
        queries = [
            f"{job_keywords} jobs {location} site:naukri.com OR site:linkedin.com",
            f"hiring {job_keywords} {location} site:indeed.co.in",
            f"remote jobs {job_keywords} India site:linkedin.com",
        ]
        
        for query in queries[:2]:  # Limit to 2 queries to save API calls
            try:
                results = self._serper_search(query, num=3)
                if results:
                    parsed = self._parse_job_results(results, characteristics)
                    opportunities.extend(parsed)
            except Exception as e:
                logger.error(f"Error searching jobs: {e}")
                continue
        
        return opportunities[:5]  # Return top 5 jobs
    
    def _get_job_keywords(self, interests: List[str], income_bracket: str) -> str:
        """Generate job search keywords from user interests"""
        # Map interests to job titles
        interest_to_jobs = {
            'stocks': 'financial analyst equity research',
            'mutual_funds': 'financial advisor investment',
            'crypto': 'blockchain developer crypto',
            'skill_development': 'software engineer developer',
            'job_search': 'analyst manager',
        }
        
        keywords = []
        for interest in interests:
            if interest in interest_to_jobs:
                keywords.append(interest_to_jobs[interest])
        
        if keywords:
            return keywords[0]  # Return first matching keyword
        
        # Default based on income bracket
        if 'above_200k' in income_bracket:
            return 'senior manager director'
        elif '100k-200k' in income_bracket or '50k-100k' in income_bracket:
            return 'analyst engineer manager'
        else:
            return 'associate analyst'
    
    def _parse_job_results(self, results: Dict[str, Any], characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Serper search results for job opportunities"""
        opportunities = []
        
        organic_results = results.get('organic', [])
        
        for result in organic_results:
            try:
                title = result.get('title', '')
                snippet = result.get('snippet', '')
                link = result.get('link', '')
                
                if not title or not snippet:
                    continue
                
                # Extract job details
                company = self._extract_company(title, snippet)
                location = self._extract_location(snippet)
                salary = self._extract_salary(snippet)
                
                # Determine sub-category
                sub_category = 'full_time'
                if 'remote' in title.lower() or 'remote' in snippet.lower():
                    sub_category = 'remote'
                elif 'freelance' in title.lower() or 'contract' in title.lower():
                    sub_category = 'freelance'
                
                # Build opportunity
                opportunity = {
                    'title': title[:300],
                    'description': snippet[:500],
                    'category': 'job',
                    'sub_category': sub_category,
                    'source_url': link,
                    'image_url': self._get_job_image_url(sub_category),
                    'offer_details': {
                        'company': company,
                        'location': location if location else 'India',
                        'salary': salary if salary else 'Not disclosed',
                        'job_type': sub_category.replace('_', ' ').title(),
                        'source': self._extract_domain(link)
                    },
                    'priority': 'medium',
                    'target_profile': characteristics,
                    'relevance_base_score': 0.7
                }
                
                # Generate content hash
                opportunity['content_hash'] = self._generate_content_hash(
                    opportunity['title'],
                    opportunity['description'],
                    opportunity['source_url']
                )
                
                opportunities.append(opportunity)
                
            except Exception as e:
                logger.error(f"Error parsing job result: {e}")
                continue
        
        return opportunities
    
    # ==================== Investment Opportunities ====================
    
    def fetch_investment_opportunities(self, characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Fetch investment opportunities: IPOs, undervalued stocks, mutual funds.
        """
        opportunities = []
        
        # Extract relevant characteristics
        income_bracket = characteristics.get('income_bracket', '')
        risk_tolerance = characteristics.get('risk_tolerance', 'medium')
        interests = characteristics.get('interests', [])
        
        # Current month for IPO searches
        current_month = datetime.now().strftime('%B %Y')
        
        # Search queries based on user profile
        queries = []
        
        # IPO opportunities
        if risk_tolerance in ['medium', 'high']:
            queries.append(f"IPO opening {current_month} upcoming site:moneycontrol.com OR site:economictimes.com")
        
        # Stock recommendations
        if 'stocks' in interests or risk_tolerance == 'high':
            queries.append(f"undervalued stocks NSE {current_month} site:screener.in OR site:moneycontrol.com")
            queries.append(f"stock recommendations {current_month} buy site:economictimes.com")
        
        # Mutual fund SIP offers
        if risk_tolerance in ['low', 'medium']:
            queries.append(f"mutual fund SIP offers {current_month} site:valueresearchonline.com OR site:morningstar.in")
        
        # Dividend stocks for conservative investors
        if risk_tolerance == 'low':
            queries.append(f"high dividend yield stocks India {current_month} site:moneycontrol.com")
        
        # Limit to 3 queries to save API calls
        for query in queries[:3]:
            try:
                results = self._serper_search(query, num=3)
                if results:
                    parsed = self._parse_investment_results(results, characteristics)
                    opportunities.extend(parsed)
            except Exception as e:
                logger.error(f"Error searching investments: {e}")
                continue
        
        return opportunities[:10]  # Return top 10
    
    def _parse_investment_results(self, results: Dict[str, Any], characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Serper search results for investment opportunities"""
        opportunities = []
        
        organic_results = results.get('organic', [])
        
        for result in organic_results:
            try:
                title = result.get('title', '')
                snippet = result.get('snippet', '')
                link = result.get('link', '')
                
                if not title or not snippet:
                    continue
                
                # Determine sub-category
                sub_category = 'stock'
                if 'ipo' in title.lower() or 'ipo' in snippet.lower():
                    sub_category = 'ipo'
                elif 'mutual fund' in title.lower() or 'sip' in snippet.lower():
                    sub_category = 'mutual_fund'
                elif 'bond' in title.lower():
                    sub_category = 'bond'
                
                # Extract investment details
                stock_symbol = self._extract_stock_symbol(title, snippet)
                price = self._extract_price(snippet)
                target_price = self._extract_target_price(snippet)
                upside = self._extract_upside(snippet)
                
                # Build opportunity
                opportunity = {
                    'title': title[:300],
                    'description': snippet[:500],
                    'category': 'investment',
                    'sub_category': sub_category,
                    'source_url': link,
                    'image_url': self._get_investment_image_url(sub_category),
                    'offer_details': {
                        'symbol': stock_symbol if stock_symbol else 'N/A',
                        'current_price': price if price else 'Check website',
                        'target_price': target_price if target_price else 'N/A',
                        'upside': upside if upside else 'N/A',
                        'investment_type': sub_category.replace('_', ' ').title(),
                        'source': self._extract_domain(link)
                    },
                    'priority': 'high' if sub_category == 'ipo' else 'medium',
                    'target_profile': characteristics,
                    'relevance_base_score': 0.8
                }
                
                # Generate content hash
                opportunity['content_hash'] = self._generate_content_hash(
                    opportunity['title'],
                    opportunity['description'],
                    opportunity['source_url']
                )
                
                opportunities.append(opportunity)
                
            except Exception as e:
                logger.error(f"Error parsing investment result: {e}")
                continue
        
        return opportunities
    
    # ==================== Helper Methods ====================
    
    def _serper_search(self, query: str, num: int = 5) -> Optional[Dict[str, Any]]:
        """Execute Serper API search"""
        if not self.validate_api_key():
            return None
        
        payload = {
            "q": query,
            "gl": "in",  # India
            "hl": "en",
            "num": num,
            "autocorrect": True
        }
        
        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Serper API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Serper request failed: {e}")
            return None
    
    def _generate_content_hash(self, title: str, description: str, url: str) -> str:
        """Generate SHA-256 hash for deduplication"""
        content = f"{title.lower().strip()}|{description.lower().strip()}|{url.strip()}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    # Extraction methods
    
    def _extract_price(self, text: str) -> Optional[str]:
        """Extract price from text"""
        patterns = [
            r'[₹$]\s*([0-9,]+(?:\.[0-9]{2})?)',
            r'(?:Rs\.?|INR)\s*([0-9,]+)',
            r'(?:price|cost|fare):\s*[₹$]?\s*([0-9,]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return f"₹{match.group(1)}"
        
        return None
    
    def _extract_discount(self, text: str) -> Optional[str]:
        """Extract discount percentage from text"""
        pattern = r'(\d+)\s*%\s*(?:off|discount|save)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return f"{match.group(1)}% off"
        return None
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain
        except:
            return 'website'
    
    def _extract_company(self, title: str, snippet: str) -> str:
        """Extract company name from job posting"""
        # Look for company patterns
        patterns = [
            r'at\s+([A-Z][A-Za-z\s&]+?)(?:\s*-|\s*\||\s*in)',
            r'([A-Z][A-Za-z\s&]+?)\s+is\s+hiring',
            r'([A-Z][A-Za-z\s&]+?)\s+hiring',
        ]
        
        text = title + ' ' + snippet
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        
        return 'Company'
    
    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location from text"""
        indian_cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Gurgaon', 'Noida']
        
        for city in indian_cities:
            if city.lower() in text.lower():
                return city
        
        return None
    
    def _extract_salary(self, text: str) -> Optional[str]:
        """Extract salary from text"""
        patterns = [
            r'[₹$]\s*([0-9.]+)\s*(?:L|Lakh|LPA)',
            r'salary:\s*[₹$]?\s*([0-9,.]+)',
            r'([0-9]+)\s*-\s*([0-9]+)\s*LPA',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return None
    
    def _extract_stock_symbol(self, title: str, snippet: str) -> Optional[str]:
        """Extract stock symbol from text"""
        # Look for NSE/BSE stock symbols (usually all caps, 2-10 characters)
        pattern = r'\b([A-Z]{2,10})\b'
        text = title + ' ' + snippet
        
        matches = re.findall(pattern, text)
        # Filter out common words
        common_words = ['IPO', 'SIP', 'NSE', 'BSE', 'SEBI', 'AMC', 'NAV', 'ELSS']
        for match in matches:
            if match not in common_words and len(match) <= 10:
                return match
        
        return None
    
    def _extract_target_price(self, text: str) -> Optional[str]:
        """Extract target price from text"""
        patterns = [
            r'target[:\s]+[₹$]?\s*([0-9,]+)',
            r'price\s+target[:\s]+[₹$]?\s*([0-9,]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return f"₹{match.group(1)}"
        
        return None
    
    def _extract_upside(self, text: str) -> Optional[str]:
        """Extract upside percentage from text"""
        patterns = [
            r'upside[:\s]+(\d+)\s*%',
            r'potential[:\s]+(\d+)\s*%',
            r'gain[:\s]+(\d+)\s*%',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return f"{match.group(1)}% upside"
        
        return None
    
    def _get_validity_period(self) -> str:
        """Get validity period for travel offers"""
        end_date = datetime.now() + timedelta(days=30)
        return f"Valid till {end_date.strftime('%d %B %Y')}"
    
    # Image URL methods
    
    def _get_travel_image_url(self, sub_category: str) -> str:
        """Get image URL for travel opportunities"""
        images = {
            'flight': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=240&fit=crop&q=80',
            'hotel': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=240&fit=crop&q=80',
            'vacation_package': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=240&fit=crop&q=80',
        }
        return images.get(sub_category, images['vacation_package'])
    
    def _get_job_image_url(self, sub_category: str) -> str:
        """Get image URL for job opportunities"""
        images = {
            'full_time': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=240&fit=crop&q=80',
            'remote': 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&h=240&fit=crop&q=80',
            'freelance': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=240&fit=crop&q=80',
        }
        return images.get(sub_category, images['full_time'])
    
    def _get_investment_image_url(self, sub_category: str) -> str:
        """Get image URL for investment opportunities"""
        images = {
            'stock': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=240&fit=crop&q=80',
            'ipo': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=240&fit=crop&q=80',
            'mutual_fund': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=240&fit=crop&q=80',
            'bond': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=240&fit=crop&q=80',
        }
        return images.get(sub_category, images['stock'])


# Global instance
serper_opportunity_fetcher = SerperOpportunityFetcher()
