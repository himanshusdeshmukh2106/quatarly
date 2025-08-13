import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TradableAsset, ChartTouchData, ChartTimeframe } from '../types';
import CandlestickChart from './CandlestickChart';
import PriceChart from './PriceChart';
import { ThemeContext } from '../context/ThemeContext';

interface TradableAssetCardProps {
  asset: TradableAsset;
  onPress?: () => void;
  onLongPress?: () => void;
  onInsightsPress?: () => void;
  showChart?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');
const CHART_HEIGHT = 120;
const CHART_WIDTH = screenWidth - 64; // Account for card padding

export const TradableAssetCard: React.FC<TradableAssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  onInsightsPress,
  showChart = true,
  style,
}) => {
  const { theme } = useContext(ThemeContext);
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>('daily');
  const [chartTouchData, setChartTouchData] = useState<ChartTouchData | null>(null);

  const formatCurrency = (amount: number, currency?: string) => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString()}`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#10B981'; // Green for positive
    if (value < 0) return '#EF4444'; // Red for negative
    return '#6B7280'; // Gray for neutral
  };

  const getAssetIcon = (assetType: string) => {
    const iconMap: Record<string, string> = {
      stock: 'trending-up',
      etf: 'account-balance',
      bond: 'security',
      crypto: 'currency-bitcoin',
    };
    return iconMap[assetType] || 'help';
  };

  const getRecommendationColor = (recommendation: string) => {
    const colorMap: Record<string, string> = {
      buy: '#10B981',
      hold: '#F59E0B',
      sell: '#EF4444',
      monitor: '#6B7280',
    };
    return colorMap[recommendation] || '#6B7280';
  };

  const getRecommendationIcon = (recommendation: string) => {
    const iconMap: Record<string, string> = {
      buy: 'trending-up',
      hold: 'pause',
      sell: 'trending-down',
      monitor: 'visibility',
    };
    return iconMap[recommendation] || 'help';
  };

  const getRiskColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
    };
    return colorMap[riskLevel] || '#6B7280';
  };

  const handleChartTouch = (touchData: ChartTouchData) => {
    setChartTouchData(touchData);
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      {(['daily', 'weekly', 'monthly'] as ChartTimeframe[]).map((timeframe) => (
        <TouchableOpacity
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && styles.selectedTimeframeButton,
          ]}
          onPress={() => setSelectedTimeframe(timeframe)}
        >
          <Text style={[
            styles.timeframeButtonText,
            selectedTimeframe === timeframe && styles.selectedTimeframeButtonText,
          ]}>
            {timeframe === 'daily' ? '1D' : timeframe === 'weekly' ? '1W' : '1M'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChart = () => {
    if (!showChart || !asset.chartData || asset.chartData.length === 0) {
      return (
        <View style={[styles.chartContainer, styles.noChartContainer]}>
          <Icon name="show-chart" size={32} color="#D1D5DB" />
          <Text style={styles.noChartText}>Chart data unavailable</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        {renderTimeframeSelector()}
        
        <View style={styles.chartWrapper}>
          {asset.assetType === 'bond' ? (
            <PriceChart
              data={asset.chartData}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              timeframe={selectedTimeframe}
              showYield={!!asset.yieldToMaturity}
            />
          ) : (
            <CandlestickChart
              data={asset.chartData}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              timeframe={selectedTimeframe}
              onTouch={handleChartTouch}
              interactive={true}
            />
          )}
          
          {/* Chart overlay with current price info */}
          <View style={styles.chartOverlay}>
            <View style={styles.priceInfo}>
              <Text style={styles.currentPrice}>
                {formatCurrency(asset.currentPrice, asset.currency)}
              </Text>
              <Text style={[
                styles.priceChange,
                { color: getPerformanceColor(asset.dailyChange) }
              ]}>
                {formatCurrency(asset.dailyChange, asset.currency)} 
                ({formatPercentage(asset.dailyChangePercent)})
              </Text>
            </View>
            
            {chartTouchData && (
              <View style={styles.touchInfo}>
                <Text style={styles.touchPrice}>
                  {formatCurrency(chartTouchData.price, asset.currency)}
                </Text>
                <Text style={styles.touchDate}>
                  {new Date(chartTouchData.date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderBondSpecificInfo = () => {
    if (asset.assetType !== 'bond') return null;

    return (
      <View style={styles.bondInfo}>
        {asset.yieldToMaturity && (
          <View style={styles.bondInfoItem}>
            <Text style={styles.bondInfoLabel}>Yield to Maturity</Text>
            <Text style={styles.bondInfoValue}>
              {asset.yieldToMaturity.toFixed(2)}%
            </Text>
          </View>
        )}
        
        {asset.maturityDate && (
          <View style={styles.bondInfoItem}>
            <Text style={styles.bondInfoLabel}>Maturity Date</Text>
            <Text style={styles.bondInfoValue}>
              {new Date(asset.maturityDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStockSpecificInfo = () => {
    if (asset.assetType !== 'stock') return null;

    return (
      <View style={styles.stockInfo}>
        {asset.dividendYield && (
          <View style={styles.stockInfoItem}>
            <Text style={styles.stockInfoLabel}>Dividend Yield</Text>
            <Text style={styles.stockInfoValue}>
              {asset.dividendYield.toFixed(2)}%
            </Text>
          </View>
        )}
        
        {asset.marketCap && (
          <View style={styles.stockInfoItem}>
            <Text style={styles.stockInfoLabel}>Market Cap</Text>
            <Text style={styles.stockInfoValue}>
              {formatCurrency(asset.marketCap, asset.currency)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Asset Header */}
      <View style={styles.assetHeader}>
        <View style={styles.assetInfo}>
          {asset.logoUrl ? (
            <Image source={{ uri: asset.logoUrl }} style={styles.assetLogo} />
          ) : (
            <View style={[styles.assetIconContainer, { backgroundColor: theme.cardElevated }]}>
              <Icon name={getAssetIcon(asset.assetType)} size={24} color={theme.textMuted} />
            </View>
          )}
          
          <View style={styles.assetDetails}>
            <Text style={[styles.assetSymbol, { color: theme.text }]}>{asset.symbol}</Text>
            <Text style={[styles.assetName, { color: theme.textMuted }]} numberOfLines={1}>
              {asset.name}
            </Text>
            {asset.sector && (
              <Text style={[styles.assetSector, { color: theme.textMuted }]}>{asset.sector}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.assetValue}>
          <Text style={[styles.totalValue, { color: theme.text }]}>
            {formatCurrency(asset.totalValue, asset.currency)}
          </Text>
          <Text style={[styles.quantity, { color: theme.textMuted }]}>
            {asset.quantity.toLocaleString()} {asset.assetType === 'stock' ? 'shares' : 'units'}
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      {renderChart()}

      {/* Performance Section */}
      <View style={styles.performanceSection}>
        <View style={styles.performanceItem}>
          <Text style={[styles.performanceLabel, { color: theme.textMuted }]}>Avg Purchase Price</Text>
          <Text style={[styles.performanceValue, { color: theme.text }]}>
            {formatCurrency(asset.averagePurchasePrice, asset.currency)}
          </Text>
        </View>
        
        <View style={styles.performanceItem}>
          <Text style={[styles.performanceLabel, { color: theme.textMuted }]}>Total P&L</Text>
          <Text style={[
            styles.performanceValue,
            { color: getPerformanceColor(asset.totalGainLoss) }
          ]}>
            {formatCurrency(asset.totalGainLoss, asset.currency)} 
            ({formatPercentage(asset.totalGainLossPercent)})
          </Text>
        </View>
      </View>

      {/* Asset-specific Information */}
      {renderBondSpecificInfo()}
      {renderStockSpecificInfo()}

      {/* Recommendation Section */}
      {asset.recommendation && (
        <View style={styles.recommendationSection}>
          <View style={[
            styles.recommendationBadge,
            { backgroundColor: getRecommendationColor(asset.recommendation) }
          ]}>
            <Icon 
              name={getRecommendationIcon(asset.recommendation)} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.recommendationText}>
              {asset.recommendation.toUpperCase()}
            </Text>
          </View>
          
          <View style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(asset.riskLevel) }
          ]}>
            <Text style={styles.riskText}>
              {asset.riskLevel.toUpperCase()} RISK
            </Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
          Updated {new Date(asset.lastUpdated).toLocaleDateString()}
        </Text>
        
        <TouchableOpacity 
          style={[styles.insightsButton, { backgroundColor: theme.cardElevated }]}
          onPress={onInsightsPress}
        >
          <Icon name="insights" size={16} color={theme.textMuted} />
          <Text style={[styles.insightsButtonText, { color: theme.textMuted }]}>AI Insights</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assetInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  assetLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  assetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetDetails: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 14,
    marginBottom: 2,
  },
  assetSector: {
    fontSize: 12,
  },
  assetValue: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
  },
  chartContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  noChartContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  noChartText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    gap: 4,
  },
  timeframeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  selectedTimeframeButton: {
    backgroundColor: '#10B981',
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTimeframeButtonText: {
    color: '#FFFFFF',
  },
  chartWrapper: {
    position: 'relative',
  },
  chartOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  touchInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  touchPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  touchDate: {
    fontSize: 10,
    color: '#D1D5DB',
  },
  performanceSection: {
    marginBottom: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 14,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bondInfo: {
    marginBottom: 16,
  },
  bondInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bondInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  bondInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  stockInfo: {
    marginBottom: 16,
  },
  stockInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stockInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  stockInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  recommendationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  riskBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  lastUpdated: {
    fontSize: 12,
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  insightsButtonText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default TradableAssetCard;