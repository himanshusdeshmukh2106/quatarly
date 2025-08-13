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
        """Get portfolio summary for a user"""
        investments = Investment.objects.filter(user=user)
        
        if not investments.exists():
            return {
                'total_value': Decimal('0'),
                'total_gain_loss': Decimal('0'),
                'total_gain_loss_percent': Decimal('0'),
                'daily_change': Decimal('0'),
                'daily_change_percent': Decimal('0'),
                'investment_count': 0,
                'top_performer': 'N/A',
                'worst_performer': 'N/A'
            }
        
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
        
        return {
            'total_value': total_value,
            'total_gain_loss': total_gain_loss,
            'total_gain_loss_percent': total_gain_loss_percent,
            'daily_change': daily_change,
            'daily_change_percent': daily_change_percent,
            'investment_count': investments.count(),
            'top_performer': top_performer.symbol,
            'worst_performer': worst_performer.symbol
        }


class AIInsightsService:
    """Service for generating AI insights"""
    
    @staticmethod
    def generate_portfolio_insights(user):
        """Generate AI insights for entire portfolio"""
        investments = Investment.objects.filter(user=user)
        summary = InvestmentService.get_portfolio_summary(user)
        
        insights = []
        
        # Portfolio performance insight
        if summary['total_gain_loss_percent'] > 10:
            insights.append("Your portfolio is performing exceptionally well with strong gains across multiple positions.")
        elif summary['total_gain_loss_percent'] > 0:
            insights.append("Your portfolio shows positive performance. Consider rebalancing to maintain optimal allocation.")
        else:
            insights.append("Your portfolio is experiencing some losses. Review underperforming assets and consider your risk tolerance.")
        
        # Diversification insight
        sectors = set(inv.sector for inv in investments if inv.sector)
        if len(sectors) < 3:
            insights.append("Consider diversifying across more sectors to reduce risk.")
        
        # Risk assessment
        high_risk_count = investments.filter(risk_level='high').count()
        total_count = investments.count()
        
        if high_risk_count / total_count > 0.5:
            insights.append("Your portfolio has a high concentration of risky assets. Consider balancing with more stable investments.")
        
        return insights