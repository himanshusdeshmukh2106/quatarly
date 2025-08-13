import React, { useContext, memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Investment, ChartTouchData } from '../types';
import CandlestickChart from './CandlestickChart';

interface InvestmentCardProps {
  investment: Investment;
  onInsightsPress: (investment: Investment) => void;
  onChartInteraction?: (touchData: ChartTouchData) => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onInsightsPress,
  onChartInteraction,
}) => {
  const { theme } = useContext(ThemeContext);
  const [_chartLoading, _setChartLoading] = useState(false);
  const [_chartError, _setChartError] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.success;
    if (change < 0) return theme.error;
    return theme.textMuted;
  };

  const getAssetTypeIcon = (assetType: string) => {
    const iconMap: Record<string, string> = {
      'stock': 'chart-line',
      'etf': 'chart-box',
      'mutual_fund': 'chart-pie',
      'crypto': 'currency-btc',
      'bond': 'certificate',
    };
    return iconMap[assetType] || 'chart-line';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      'low': theme.success,
      'medium': theme.warning,
      'high': theme.error,
    };
    return colorMap[riskLevel] || theme.textMuted;
  };

  return (
    <View style={styles.cardContainer}>
      {/* Main Investment Card */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        activeOpacity={0.95}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Investment card for ${investment.symbol}, ${investment.name}`}
        accessibilityHint="Double tap to view detailed investment information"
      >
        {/* Candlestick Chart */}
        <View style={[styles.chartContainer, { backgroundColor: theme.background }]}>
          {investment.chartData && investment.chartData.length > 0 ? (
            <CandlestickChart
              data={investment.chartData}
              width={screenWidth - 32} // Account for card padding
              height={150}
              onTouch={onChartInteraction}
              interactive={true}
              timeframe="daily"
            />
          ) : (
            <View style={styles.chartPlaceholder}>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={32} 
                color={theme.textMuted} 
              />
              <Text style={[styles.chartPlaceholderText, { color: theme.textMuted }]}>
                {chartLoading ? 'Loading chart...' : 'No chart data available'}
              </Text>
            </View>
          )}
        </View>

        {/* Asset Type Badge */}
        <View style={[styles.assetTypeBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialCommunityIcons 
            name={getAssetTypeIcon(investment.assetType)} 
            size={16} 
            color={theme.primary} 
          />
        </View>

        {/* Risk Level Badge */}
        <View style={[styles.riskBadge, { backgroundColor: getRiskLevelColor(investment.riskLevel) + '20' }]}>
          <Text style={[styles.riskText, { color: getRiskLevelColor(investment.riskLevel) }]}>
            {investment.riskLevel.toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.symbolContainer}>
              <Text style={[styles.symbol, { color: theme.text }]}>
                {investment.symbol}
              </Text>
              <Text style={[styles.exchange, { color: theme.textMuted }]}>
                {investment.exchange}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.currentPrice, { color: theme.text }]}>
                {formatCurrency(investment.currentPrice, investment.currency)}
              </Text>
              <Text style={[styles.dailyChange, { color: getChangeColor(investment.dailyChange) }]}>
                {formatPercentage(investment.dailyChangePercent)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {investment.name}
          </Text>

          {/* Holdings Information */}
          <View style={styles.holdingsRow}>
            <View style={styles.holdingItem}>
              <Text style={[styles.holdingLabel, { color: theme.textMuted }]}>Quantity</Text>
              <Text style={[styles.holdingValue, { color: theme.text }]}>
                {investment.quantity.toLocaleString()}
              </Text>
            </View>
            <View style={styles.holdingItem}>
              <Text style={[styles.holdingLabel, { color: theme.textMuted }]}>Total Value</Text>
              <Text style={[styles.holdingValue, { color: theme.text }]}>
                {formatCurrency(investment.totalValue, investment.currency)}
              </Text>
            </View>
          </View>

          {/* Performance Metrics */}
          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <Text style={[styles.performanceLabel, { color: theme.textMuted }]}>Total P&L</Text>
              <Text style={[styles.performanceValue, { color: getChangeColor(investment.totalGainLoss) }]}>
                {formatCurrency(investment.totalGainLoss, investment.currency)} ({formatPercentage(investment.totalGainLossPercent)})
              </Text>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdatedContainer}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={theme.textMuted} />
            <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
              Updated {new Date(investment.lastUpdated).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* AI Insights Section */}
      <TouchableOpacity
        style={[
          styles.insightsCard,
          {
            backgroundColor: theme.accentMuted,
            borderColor: theme.accent + '33',
          },
        ]}
        onPress={() => onInsightsPress(investment)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="AI Investment Insights"
        accessibilityHint={`View AI analysis and recommendations for ${investment.symbol}`}
      >
        <View style={styles.insightsContent}>
          <MaterialCommunityIcons 
            name="sparkles" 
            size={18} 
            color={theme.accent} 
            style={styles.insightsIcon} 
          />
          <View style={styles.insightsText}>
            <Text style={[styles.insightsTitle, { color: theme.accent }]}>
              AI Investment Insights
            </Text>
            <Text style={[styles.insightsPreview, { color: theme.text }]} numberOfLines={3}>
              {investment.aiAnalysis}
            </Text>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={theme.accent} 
            style={styles.expandButton}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: 8,
  },
  chartContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: 12,
    marginTop: 8,
  },
  assetTypeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    borderWidth: 1,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  exchange: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  dailyChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  holdingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  holdingItem: {
    flex: 1,
  },
  holdingLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  holdingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  performanceRow: {
    marginBottom: 12,
  },
  performanceItem: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 10,
    marginLeft: 4,
  },
  insightsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  insightsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightsIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  insightsText: {
    flex: 1,
  },
  insightsTitle: {
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 15,
  },
  insightsPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandButton: {
    marginLeft: 8,
  },
});

export default memo(InvestmentCard);