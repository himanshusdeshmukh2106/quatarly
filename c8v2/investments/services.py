import requests
import yfinance as yf
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from .models import Investment, ChartData
import logging

logger = logging.getLogger(__name__)


class MarketDataService:
    """Service for fetching real-time market data"""
    
    @staticmethod
    def get_current_price(symbol):
        """Fetch current price for a symbol"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            
            if current_price:
                return Decimal(str(current_price))
            
            # Fallback to history if current price not available
            hist = ticker.history(period="1d")
            if not hist.empty:
                return Decimal(str(hist['Close'].iloc[-1]))
                
        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {e}")
            
        return None

    @staticmethod
    def get_company_info(symbol):
        """Fetch company information"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            return {
                'name': info.get('longName', f"{symbol} Company"),
                'sector': info.get('sector'),
                'market_cap': info.get('marketCap'),
                'dividend_yield': info.get('dividendYield'),
                'exchange': info.get('exchange', 'NASDAQ'),
                'currency': info.get('currency', 'USD'),
            }
        except Exception as e:
            logger.error(f"Error fetching company info for {symbol}: {e}")
            return {
                'name': f"{symbol} Company",
                'exchange': 'NASDAQ',
                'currency': 'USD',
            }

    @staticmethod
    def get_historical_data(symbol, period="30d"):
        """Fetch historical chart data"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            chart_data = []
            for date, row in hist.iterrows():
                chart_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']),
                    'timestamp': int(date.timestamp())
                })
            
            return chart_data
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []

    @staticmethod
    def calculate_daily_change(current_price, previous_close):
        """Calculate daily change and percentage"""
        if not previous_close or previous_close == 0:
            return Decimal('0'), Decimal('0')
        
        daily_change = current_price - previous_close
        daily_change_percent = (daily_change / previous_close) * 100
        
        return daily_change, daily_change_percent


class InvestmentService:
    """Service for investment-related operations"""
    
    @staticmethod
    def refresh_investment_prices(user=None):
        """Refresh prices for all investments"""
        investments = Investment.objects.all()
        if user:
            investments = investments.filter(user=user)
        
        updated_investments = []
        
        for investment in investments:
            try:
                # Get current price
                current_price = MarketDataService.get_current_price(investment.symbol)
                if current_price:
                    # Calculate daily change (simplified - using previous current_price as previous close)
                    previous_price = investment.current_price
                    daily_change, daily_change_percent = MarketDataService.calculate_daily_change(
                        current_price, previous_price
                    )
                    
                    # Update investment
                    investment.current_price = current_price
                    investment.daily_change = daily_change
                    investment.daily_change_percent = daily_change_percent
                    investment.save()  # This will trigger the save method to recalculate totals
                    
                    updated_investments.append(investment)
                    
            except Exception as e:
                logger.error(f"Error updating price for {investment.symbol}: {e}")
        
        return updated_investments

    @staticmethod
    def update_chart_data(investment):
        """Update chart data for an investment"""
        try:
            chart_data = MarketDataService.get_historical_data(investment.symbol)
            
            # Clear existing chart data
            investment.historical_data.all().delete()
            
            # Add new chart data
            for data_point in chart_data:
                ChartData.objects.create(
                    investment=investment,
                    date=datetime.strptime(data_point['date'], '%Y-%m-%d').date(),
                    open_price=Decimal(str(data_point['open'])),
                    high_price=Decimal(str(data_point['high'])),
                    low_price=Decimal(str(data_point['low'])),
                    close_price=Decimal(str(data_point['close'])),
                    volume=data_point['volume'],
                    timestamp=data_point['timestamp']
                )
            
            # Also update the JSON field for backward compatibility
            investment.chart_data = chart_data
            investment.save()
            
        except Exception as e:
            logger.error(f"Error updating chart data for {investment.symbol}: {e}")

    @staticmethod
    def generate_ai_analysis(investment):
        """Generate AI analysis for an investment"""
        try:
            # Simplified AI analysis - in production, this would use actual AI/ML models
            performance = investment.total_gain_loss_percent
            risk_level = investment.risk_level
            
            if performance > 10:
                analysis = f"Strong performance with {performance:.2f}% gains. "
                recommendation = "hold"
            elif performance > 0:
                analysis = f"Positive performance with {performance:.2f}% gains. "
                recommendation = "hold"
            elif performance > -10:
                analysis = f"Minor losses of {abs(performance):.2f}%. "
                recommendation = "hold"
            else:
                analysis = f"Significant losses of {abs(performance):.2f}%. "
                recommendation = "sell"
            
            analysis += f"Risk level is {risk_level}. "
            
            if investment.sector:
                analysis += f"Sector: {investment.sector}. "
            
            analysis += "Monitor market trends and consider your risk tolerance when making decisions."
            
            investment.ai_analysis = analysis
            investment.recommendation = recommendation
            investment.save()
            
        except Exception as e:
            logger.error(f"Error generating AI analysis for {investment.symbol}: {e}")

    @staticmethod
    def get_portfolio_summary(user):
        """Get comprehensive portfolio summary for all asset types"""
        from django.core.cache import cache
        
        # Try to get from cache first
        cache_key = f"portfolio_summary_{user.id}"
        cached_summary = cache.get(cache_key)
        
        if cached_summary:
            return cached_summary
        
        # Optimized query with select_related and only needed fields
        investments = Investment.objects.filter(user=user).select_related('user')
        
        if not investments.exists():
            return {
                'total_value': Decimal('0'),
                'total_gain_loss': Decimal('0'),
                'total_gain_loss_percent': Decimal('0'),
                'daily_change': Decimal('0'),
                'daily_change_percent': Decimal('0'),
                'investment_count': 0,
                'top_performer': 'N/A',
                'worst_performer': 'N/A',
                'asset_allocation': {},
                'diversification_score': 0,
                'risk_assessment': 'medium'
            }
        
        # Calculate totals
        total_value = sum(inv.total_value for inv in investments)
        total_gain_loss = sum(inv.total_gain_loss for inv in investments)
        daily_change = sum(inv.daily_change * inv.quantity for inv in investments)
        
        # Calculate percentages
        total_cost = total_value - total_gain_loss
        total_gain_loss_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else Decimal('0')
        
        previous_total = total_value - daily_change
        daily_change_percent = (daily_change / previous_total * 100) if previous_total > 0 else Decimal('0')
        
        # Find top and worst performers
        top_performer = max(investments, key=lambda x: x.total_gain_loss_percent)
        worst_performer = min(investments, key=lambda x: x.total_gain_loss_percent)
        
        # Asset allocation breakdown
        asset_allocation = {}
        for investment in investments:
            asset_type = investment.asset_type
            if asset_type not in asset_allocation:
                asset_allocation[asset_type] = {
                    'count': 0,
                    'total_value': Decimal('0'),
                    'percentage': Decimal('0')
                }
            
            asset_allocation[asset_type]['count'] += 1
            asset_allocation[asset_type]['total_value'] += investment.total_value
        
        # Calculate percentages for asset allocation
        for asset_type in asset_allocation:
            if total_value > 0:
                asset_allocation[asset_type]['percentage'] = (
                    asset_allocation[asset_type]['total_value'] / total_value * 100
                )
        
        # Calculate diversification score (0-100)
        diversification_score = InvestmentService._calculate_diversification_score(investments)
        
        # Risk assessment
        risk_assessment = InvestmentService._assess_portfolio_risk(investments)
        
        summary = {
            'total_value': total_value,
            'total_gain_loss': total_gain_loss,
            'total_gain_loss_percent': total_gain_loss_percent,
            'daily_change': daily_change,
            'daily_change_percent': daily_change_percent,
            'investment_count': investments.count(),
            'top_performer': top_performer.symbol or top_performer.name,
            'worst_performer': worst_performer.symbol or worst_performer.name,
            'asset_allocation': asset_allocation,
            'diversification_score': diversification_score,
            'risk_assessment': risk_assessment
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, summary, 300)
        return summary
    
    @staticmethod
    def _calculate_diversification_score(investments):
        """Calculate portfolio diversification score (0-100)"""
        if not investments:
            return 0
        
        score = 0
        total_value = sum(inv.total_value for inv in investments)
        
        # Asset type diversity (40 points max)
        asset_types = set(inv.asset_type for inv in investments)
        asset_type_score = min(len(asset_types) * 8, 40)  # 8 points per asset type, max 40
        score += asset_type_score
        
        # Sector diversity for stocks (30 points max)
        sectors = set(inv.sector for inv in investments if inv.sector and inv.is_tradeable)
        sector_score = min(len(sectors) * 6, 30)  # 6 points per sector, max 30
        score += sector_score
        
        # Position size diversity (30 points max)
        if total_value > 0:
            position_sizes = [float(inv.total_value / total_value) for inv in investments]
            # Penalize large positions (over 20% of portfolio)
            large_positions = sum(1 for size in position_sizes if size > 0.2)
            position_score = max(30 - (large_positions * 10), 0)
            score += position_score
        
        return min(score, 100)
    
    @staticmethod
    def _assess_portfolio_risk(investments):
        """Assess overall portfolio risk level"""
        if not investments:
            return 'medium'
        
        risk_scores = {'low': 1, 'medium': 2, 'high': 3}
        total_value = sum(inv.total_value for inv in investments)
        
        if total_value == 0:
            return 'medium'
        
        # Calculate weighted average risk
        weighted_risk = sum(
            risk_scores.get(inv.risk_level, 2) * float(inv.total_value / total_value)
            for inv in investments
        )
        
        # Adjust for asset type mix
        crypto_percentage = sum(
            float(inv.total_value / total_value) 
            for inv in investments if inv.asset_type == 'crypto'
        )
        
        physical_percentage = sum(
            float(inv.total_value / total_value) 
            for inv in investments if inv.is_physical
        )
        
        # Crypto increases risk
        if crypto_percentage > 0.3:
            weighted_risk += 0.5
        
        # Physical assets reduce risk
        if physical_percentage > 0.2:
            weighted_risk -= 0.3
        
        if weighted_risk <= 1.5:
            return 'low'
        elif weighted_risk <= 2.5:
            return 'medium'
        else:
            return 'high'
    
    @staticmethod
    def get_asset_type_performance(user):
        """Get performance breakdown by asset type"""
        # Optimized query with only needed fields
        investments = Investment.objects.filter(user=user).only(
            'asset_type', 'total_value', 'total_gain_loss', 'total_gain_loss_percent',
            'symbol', 'name'
        )
        
        performance_by_type = {}
        
        for investment in investments:
            asset_type = investment.asset_type
            if asset_type not in performance_by_type:
                performance_by_type[asset_type] = {
                    'count': 0,
                    'total_value': Decimal('0'),
                    'total_gain_loss': Decimal('0'),
                    'total_gain_loss_percent': Decimal('0'),
                    'best_performer': None,
                    'worst_performer': None
                }
            
            type_data = performance_by_type[asset_type]
            type_data['count'] += 1
            type_data['total_value'] += investment.total_value
            type_data['total_gain_loss'] += investment.total_gain_loss
            
            # Track best and worst performers
            if (type_data['best_performer'] is None or 
                investment.total_gain_loss_percent > type_data['best_performer'].total_gain_loss_percent):
                type_data['best_performer'] = investment
            
            if (type_data['worst_performer'] is None or 
                investment.total_gain_loss_percent < type_data['worst_performer'].total_gain_loss_percent):
                type_data['worst_performer'] = investment
        
        # Calculate percentages
        for asset_type in performance_by_type:
            type_data = performance_by_type[asset_type]
            total_cost = type_data['total_value'] - type_data['total_gain_loss']
            
            if total_cost > 0:
                type_data['total_gain_loss_percent'] = (
                    type_data['total_gain_loss'] / total_cost * 100
                )
        
        return performance_by_type
    
    @staticmethod
    def get_portfolio_insights(user):
        """Get detailed portfolio insights and recommendations"""
        investments = Investment.objects.filter(user=user)
        summary = InvestmentService.get_portfolio_summary(user)
        
        insights = {
            'performance_insights': [],
            'diversification_insights': [],
            'risk_insights': [],
            'recommendations': []
        }
        
        if not investments:
            return insights
        
        # Performance insights
        total_gain_loss_percent = summary['total_gain_loss_percent']
        if total_gain_loss_percent > 15:
            insights['performance_insights'].append(
                "Excellent portfolio performance! Your investments are significantly outperforming the market."
            )
        elif total_gain_loss_percent > 5:
            insights['performance_insights'].append(
                "Good portfolio performance with solid gains across your holdings."
            )
        elif total_gain_loss_percent > -5:
            insights['performance_insights'].append(
                "Your portfolio is performing relatively stable with minor fluctuations."
            )
        else:
            insights['performance_insights'].append(
                "Your portfolio is experiencing losses. Consider reviewing your investment strategy."
            )
        
        # Diversification insights
        diversification_score = summary['diversification_score']
        if diversification_score >= 80:
            insights['diversification_insights'].append(
                "Excellent diversification! Your portfolio is well-balanced across asset types and sectors."
            )
        elif diversification_score >= 60:
            insights['diversification_insights'].append(
                "Good diversification, but there's room for improvement in spreading risk."
            )
        else:
            insights['diversification_insights'].append(
                "Your portfolio lacks diversification. Consider adding different asset types and sectors."
            )
        
        # Asset allocation insights
        asset_allocation = summary['asset_allocation']
        for asset_type, data in asset_allocation.items():
            percentage = float(data['percentage'])
            if percentage > 50:
                insights['diversification_insights'].append(
                    f"High concentration in {asset_type} ({percentage:.1f}%). Consider rebalancing."
                )
        
        # Risk insights
        risk_assessment = summary['risk_assessment']
        if risk_assessment == 'high':
            insights['risk_insights'].append(
                "Your portfolio has high risk exposure. Ensure this aligns with your risk tolerance."
            )
        elif risk_assessment == 'low':
            insights['risk_insights'].append(
                "Your portfolio is conservative with low risk. Consider adding growth assets if appropriate."
            )
        
        # Generate recommendations
        insights['recommendations'] = InvestmentService._generate_recommendations(
            investments, summary, asset_allocation
        )
        
        return insights
    
    @staticmethod
    def _generate_recommendations(investments, summary, asset_allocation):
        """Generate specific investment recommendations"""
        recommendations = []
        
        # Diversification recommendations
        if len(asset_allocation) < 3:
            missing_types = []
            if 'stock' not in asset_allocation:
                missing_types.append('stocks')
            if 'bond' not in asset_allocation:
                missing_types.append('bonds')
            if not any(t in asset_allocation for t in ['gold', 'silver']):
                missing_types.append('precious metals')
            
            if missing_types:
                recommendations.append(
                    f"Consider adding {', '.join(missing_types)} to improve diversification."
                )
        
        # Rebalancing recommendations
        for asset_type, data in asset_allocation.items():
            percentage = float(data['percentage'])
            if percentage > 40:
                recommendations.append(
                    f"Consider reducing {asset_type} allocation from {percentage:.1f}% to improve balance."
                )
        
        # Performance-based recommendations
        worst_performers = sorted(
            investments, 
            key=lambda x: x.total_gain_loss_percent
        )[:3]
        
        for investment in worst_performers:
            if investment.total_gain_loss_percent < -20:
                recommendations.append(
                    f"Review {investment.symbol or investment.name} - significant losses may warrant attention."
                )
        
        return recommendations


class AIInsightsService:
    """Service for generating AI insights"""
    
    @staticmethod
    def generate_portfolio_insights(user):
        """Generate comprehensive AI insights for entire portfolio"""
        insights_data = InvestmentService.get_portfolio_insights(user)
        
        # Combine all insights into a single list for backward compatibility
        all_insights = []
        all_insights.extend(insights_data['performance_insights'])
        all_insights.extend(insights_data['diversification_insights'])
        all_insights.extend(insights_data['risk_insights'])
        all_insights.extend(insights_data['recommendations'])
        
        return all_insights
    
    @staticmethod
    def generate_asset_type_insights(user):
        """Generate insights specific to asset types"""
        performance_by_type = InvestmentService.get_asset_type_performance(user)
        insights = {}
        
        for asset_type, data in performance_by_type.items():
            type_insights = []
            
            # Performance insight
            gain_loss_percent = float(data['total_gain_loss_percent'])
            if gain_loss_percent > 10:
                type_insights.append(f"Your {asset_type} investments are performing excellently with {gain_loss_percent:.1f}% gains.")
            elif gain_loss_percent > 0:
                type_insights.append(f"Your {asset_type} investments show positive performance with {gain_loss_percent:.1f}% gains.")
            else:
                type_insights.append(f"Your {asset_type} investments are down {abs(gain_loss_percent):.1f}%. Consider reviewing your strategy.")
            
            # Best/worst performer insight
            if data['best_performer'] and data['worst_performer']:
                best = data['best_performer']
                worst = data['worst_performer']
                type_insights.append(
                    f"Best performer: {best.symbol or best.name} ({best.total_gain_loss_percent:.1f}%), "
                    f"Worst: {worst.symbol or worst.name} ({worst.total_gain_loss_percent:.1f}%)"
                )
            
            insights[asset_type] = type_insights
        
        return insights
    
    @staticmethod
    def generate_market_sentiment_insights(user):
        """Generate insights based on market sentiment and trends"""
        investments = Investment.objects.filter(user=user)
        insights = []
        
        # Analyze daily changes
        positive_movers = [inv for inv in investments if inv.daily_change_percent > 2]
        negative_movers = [inv for inv in investments if inv.daily_change_percent < -2]
        
        if len(positive_movers) > len(negative_movers):
            insights.append("Market sentiment is positive for your portfolio today with more assets gaining than losing.")
        elif len(negative_movers) > len(positive_movers):
            insights.append("Market sentiment is negative for your portfolio today. Consider this as a potential buying opportunity.")
        
        # Crypto-specific insights
        crypto_investments = [inv for inv in investments if inv.asset_type == 'crypto']
        if crypto_investments:
            avg_crypto_change = sum(inv.daily_change_percent for inv in crypto_investments) / len(crypto_investments)
            if avg_crypto_change > 5:
                insights.append("Cryptocurrency holdings are showing strong momentum today.")
            elif avg_crypto_change < -5:
                insights.append("Cryptocurrency holdings are experiencing volatility. This is normal for crypto markets.")
        
        # Physical assets insights
        physical_investments = [inv for inv in investments if inv.is_physical]
        if physical_investments:
            insights.append("Your physical asset holdings provide portfolio stability during market volatility.")
        
        return insights


class BulkOperationService:
    """Service for bulk operations on investments"""
    
    @staticmethod
    def bulk_update_prices(investments_data):
        """Bulk update prices for multiple investments"""
        from django.db import transaction
        
        investments_to_update = []
        
        for investment_data in investments_data:
            investment_id = investment_data['id']
            new_price = investment_data['current_price']
            
            try:
                investment = Investment.objects.get(id=investment_id)
                investment.current_price = Decimal(str(new_price))
                investments_to_update.append(investment)
            except Investment.DoesNotExist:
                continue
        
        # Bulk update in a single transaction
        with transaction.atomic():
            Investment.objects.bulk_update(
                investments_to_update, 
                ['current_price', 'total_value', 'total_gain_loss', 'total_gain_loss_percent'],
                batch_size=100
            )
        
        return len(investments_to_update)
    
    @staticmethod
    def bulk_create_investments(user, investments_data):
        """Bulk create multiple investments"""
        from django.db import transaction
        
        investments_to_create = []
        
        for data in investments_data:
            investment = Investment(
                user=user,
                symbol=data.get('symbol', ''),
                name=data['name'],
                asset_type=data['asset_type'],
                quantity=Decimal(str(data['quantity'])),
                average_purchase_price=Decimal(str(data['average_purchase_price'])),
                current_price=Decimal(str(data.get('current_price', data['average_purchase_price']))),
                unit=data.get('unit', ''),
                exchange=data.get('exchange', ''),
                currency=data.get('currency', 'USD')
            )
            investments_to_create.append(investment)
        
        # Bulk create in a single transaction
        with transaction.atomic():
            created_investments = Investment.objects.bulk_create(
                investments_to_create,
                batch_size=100
            )
        
        return created_investments
    
    @staticmethod
    def optimize_portfolio_queries(user):
        """Optimize common portfolio queries with prefetching"""
        return Investment.objects.filter(user=user).select_related('user').prefetch_related(
            'historical_data',
            'alerts'
        )


class CacheService:
    """Service for managing cache operations"""
    
    CACHE_TIMEOUTS = {
        'portfolio_summary': 300,      # 5 minutes
        'portfolio_insights': 600,     # 10 minutes
        'asset_suggestions': 3600,     # 1 hour
        'market_data': 60,             # 1 minute
    }
    
    @staticmethod
    def get_or_set_cache(key, callable_func, timeout=None, *args, **kwargs):
        """Generic cache get or set method"""
        from django.core.cache import cache
        
        cached_data = cache.get(key)
        if cached_data is not None:
            return cached_data
        
        # Generate data
        data = callable_func(*args, **kwargs)
        
        # Set cache with appropriate timeout
        cache_timeout = timeout or CacheService.CACHE_TIMEOUTS.get('default', 300)
        cache.set(key, data, cache_timeout)
        
        return data
    
    @staticmethod
    def invalidate_user_cache(user_id):
        """Invalidate all cache entries for a user"""
        from django.core.cache import cache
        
        cache_patterns = [
            f"portfolio_summary_{user_id}",
            f"portfolio_insights_{user_id}",
            f"asset_type_performance_{user_id}",
            f"diversification_analysis_{user_id}",
        ]
        
        cache.delete_many(cache_patterns)
    
    @staticmethod
    def warm_cache_for_user(user):
        """Pre-warm cache with commonly accessed data"""
        # Pre-generate portfolio summary
        InvestmentService.get_portfolio_summary(user)
        
        # Pre-generate portfolio insights
        InvestmentService.get_portfolio_insights(user)
        
        # Pre-generate asset type performance
        InvestmentService.get_asset_type_performance(user)