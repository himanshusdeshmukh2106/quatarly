import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Asset, TradableAsset, PhysicalAsset } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, Shadows, BorderRadius, Spacing } from '../styles/designSystem';

interface AssetCardProps {
  asset: Asset;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  style,
}) => {
  const { theme } = useContext(ThemeContext);
  const scaleAnim = new Animated.Value(1);

  // Premium animation handlers
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const isPhysicalAsset = (asset: Asset): asset is PhysicalAsset => {
    return ['gold', 'silver', 'commodity'].includes(asset.assetType);
  };

  const isTradableAsset = (asset: Asset): asset is TradableAsset => {
    return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
  };

  const formatCurrency = (amount: number, currency?: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `₹${amount.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#22d3ee'; // Cyan/turquoise for positive (Perplexity style)
    if (value < 0) return '#ef4444'; // Red for negative
    return '#6B7280'; // Gray for neutral
  };

  const getPercentageColor = (value: number) => {
    if (value > 0) return '#10b981'; // Green for positive percentage
    if (value < 0) return '#ef4444'; // Red for negative percentage
    return '#6B7280'; // Gray for neutral
  };

  // Generate mock chart data for visual consistency
  const generateChartData = (basePrice: number, isPositive: boolean) => {
    const data = [];
    let currentPrice = basePrice * 1.2; // Start higher for downward trend
    
    for (let i = 0; i < 12; i++) {
      data.push(currentPrice);
      // Create a general downward trend with some variation
      const change = isPositive ? 
        (Math.random() - 0.3) * (basePrice * 0.02) : // Slight upward bias for positive
        (Math.random() - 0.7) * (basePrice * 0.02);   // Downward bias for negative
      currentPrice += change;
    }
    
    // Ensure the last point matches the current price
    data[data.length - 1] = basePrice;
    return data;
  };

  // Get symbol from asset name or use asset type
  const getSymbol = (asset: Asset) => {
    if (isTradableAsset(asset) && asset.symbol) {
      return asset.symbol;
    }
    // Generate symbol from name
    const words = asset.name.split(' ');
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    }
    return asset.name.substring(0, 2).toUpperCase();
  };

  // Get current price from asset
  const getCurrentPrice = (asset: Asset) => {
    if (isTradableAsset(asset)) {
      return asset.currentPrice || asset.totalValue;
    }
    if (isPhysicalAsset(asset)) {
      return asset.currentMarketPrice || asset.purchasePrice;
    }
    return asset.totalValue;
  };

  // Get change values
  const getChangeValues = (asset: Asset) => {
    const change = asset.totalGainLoss || 0;
    const changePercent = asset.totalGainLossPercent || 0;
    return { change, changePercent };
  };

  // Get volume (mock for non-tradable assets)
  const getVolume = (asset: Asset) => {
    if (isTradableAsset(asset) && asset.volume) {
      return asset.volume;
    }
    // Generate mock volume based on asset value
    const baseVolume = Math.floor(asset.totalValue / 1000);
    return `${(baseVolume / 1000).toFixed(1)}K`;
  };

  // Get market cap (mock for non-tradable assets)
  const getMarketCap = (asset: Asset) => {
    if (isTradableAsset(asset) && asset.marketCap) {
      return asset.marketCap;
    }
    // Generate mock market cap
    const baseCap = asset.totalValue * 100;
    if (baseCap > 1000000000) {
      return `${(baseCap / 1000000000).toFixed(1)}B`;
    }
    return `${(baseCap / 1000000).toFixed(1)}M`;
  };

  // Get P/E ratio (mock for non-tradable assets)
  const getPERatio = (asset: Asset) => {
    if (isTradableAsset(asset) && asset.peRatio) {
      return asset.peRatio.toString();
    }
    // Generate mock P/E ratio
    return (Math.random() * 50 + 10).toFixed(2);
  };

  // Get growth rate (mock for non-tradable assets)
  const getGrowthRate = (asset: Asset) => {
    if (isTradableAsset(asset) && asset.growthRate !== undefined) {
      return asset.growthRate;
    }
    // Most physical assets don't have growth rates
    return null;
  };

  const currentPrice = getCurrentPrice(asset);
  const { change, changePercent } = getChangeValues(asset);
  const isNegative = change < 0;
  const chartColor = getPerformanceColor(change);
  const percentageColor = getPercentageColor(change);
  const symbol = getSymbol(asset);
  const chartData = generateChartData(currentPrice, change >= 0);

  // Get logo URL if available (for future enhancement)
  const getLogoUrl = (asset: Asset) => {
    if (isTradableAsset(asset) && asset.symbol) {
      // Use Clearbit logo API or similar
      return `https://logo.clearbit.com/${asset.symbol.toLowerCase()}.com`;
    }
    return null;
  };

  // Generate AI insight based on asset performance
  const generateInsight = (asset: Asset) => {
    const isPositive = asset.totalGainLoss >= 0;
    const assetTypeText = asset.assetType === 'stock' ? 'shares' : 
                        asset.assetType === 'crypto' ? 'cryptocurrency' :
                        asset.assetType === 'gold' ? 'gold holdings' :
                        asset.assetType === 'silver' ? 'silver holdings' :
                        `${asset.assetType} position`;
    
    if (isPositive) {
      return `${asset.name} ${assetTypeText} showed positive performance with strong fundamentals and favorable market conditions supporting continued growth potential in the current economic environment.`;
    } else {
      return `${asset.name} ${assetTypeText} experienced some volatility due to market conditions and sector-specific factors, but maintains solid underlying value with potential for recovery in the medium term.`;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.exactReplicaCard, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Perplexity-Style Header */}
      <View style={styles.perplexityHeader}>
        <View style={styles.perplexityLeft}>
          <View style={styles.perplexityIconFallback}>
            <Text style={styles.perplexityIconText}>{symbol}</Text>
          </View>
          <View style={styles.perplexityCompanyInfo}>
            <Text style={styles.perplexityCompanyName} numberOfLines={1}>
              {asset.name}
            </Text>
            <Text style={styles.perplexitySymbol}>
              {isTradableAsset(asset) ? asset.symbol : symbol} · {isTradableAsset(asset) ? asset.exchange || 'BSE' : asset.assetType.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.perplexityRight}>
          <View style={styles.perplexityPriceRow}>
            <Text style={styles.perplexityPrice}>
              {formatCurrency(currentPrice, isTradableAsset(asset) ? asset.currency : undefined)}
            </Text>
            <View style={[styles.perplexityChangePill, { backgroundColor: percentageColor + '20' }]}>
              <Text style={[styles.perplexityChangeIcon, { color: percentageColor }]}>
                {isNegative ? '↓' : '↑'}
              </Text>
              <Text style={[styles.perplexityChange, { color: percentageColor }]}>
                {Math.abs(changePercent).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Perplexity-Style Chart and Stats */}
      <View style={styles.perplexityBody}>
        {/* Left Side - Chart with Y-axis */}
        <View style={styles.perplexityChartSection}>
          {/* Y-axis labels */}
          <View style={styles.perplexityYAxis}>
            <Text style={styles.perplexityYLabel}>{Math.round(currentPrice * 1.02)}</Text>
            <Text style={styles.perplexityYLabel}>{Math.round(currentPrice * 1.01)}</Text>
            <Text style={styles.perplexityYLabel}>{Math.round(currentPrice)}</Text>
          </View>

          {/* Chart area */}
          <View style={styles.perplexityChartContainer}>
            <View style={styles.perplexityChart}>
              {/* Perplexity-style line chart with cyan color */}
              <Svg width={140} height={70}>
                {chartData.map((point: number, idx: number) => {
                  if (idx === chartData.length - 1) return null;
                  const x1 = (idx / (chartData.length - 1)) * 140;
                  const x2 = ((idx + 1) / (chartData.length - 1)) * 140;
                  const minPrice = Math.min(...chartData);
                  const maxPrice = Math.max(...chartData);
                  const priceRange = maxPrice - minPrice || 1;
                  const y1 = 70 - ((point - minPrice) / priceRange) * 70;
                  const y2 = 70 - ((chartData[idx + 1] - minPrice) / priceRange) * 70;

                  return (
                    <Line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={chartColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </Svg>
            </View>
            <Text style={styles.perplexityTime}>
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Text>
          </View>
        </View>

        {/* Right Side - Stats Grid */}
        <View style={styles.perplexityStatsSection}>
          <View style={styles.perplexityStatRow}>
            <Text style={styles.perplexityStatLabel}>Volume</Text>
            <Text style={styles.perplexityStatValue}>{getVolume(asset)}</Text>
          </View>
          <View style={styles.perplexityStatRow}>
            <Text style={styles.perplexityStatLabel}>Market Cap</Text>
            <Text style={styles.perplexityStatValue}>{getMarketCap(asset)}</Text>
          </View>
          <View style={styles.perplexityStatRow}>
            <Text style={styles.perplexityStatLabel}>P/E Ratio</Text>
            <Text style={styles.perplexityStatValue}>{getPERatio(asset)}</Text>
          </View>
          <View style={styles.perplexityStatRow}>
            <Text style={styles.perplexityStatLabel}>
              {isPhysicalAsset(asset) ? 'Quantity' : 'Dividend Yield'}
            </Text>
            <Text style={styles.perplexityStatValue}>
              {isPhysicalAsset(asset)
                ? `${asset.quantity} ${asset.unit}`
                : isTradableAsset(asset) && asset.dividendYield
                  ? `${asset.dividendYield.toFixed(2)}%`
                  : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Perplexity-Style AI Insight */}
      <View style={styles.perplexityInsightContainer}>
        <Text style={styles.perplexityInsightText}>
          {generateInsight(asset)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Perplexity-Style Card Design
  exactReplicaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },

  // Header Styles
  perplexityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  perplexityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  perplexityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  perplexityLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  perplexityIconFallback: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perplexityIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  perplexityCompanyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  perplexityCompanyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  perplexitySymbol: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 0.2,
  },
  perplexityRight: {
    alignItems: 'flex-end',
  },
  perplexityPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perplexityPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  perplexityChangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  perplexityChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perplexityChangeIcon: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
  perplexityChange: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Body Styles (Chart + Stats)
  perplexityBody: {
    flexDirection: 'row',
    marginBottom: 24,
    minHeight: 100,
  },
  perplexityChartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 24,
  },
  perplexityYAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingRight: 8,
  },
  perplexityYLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'right',
  },
  perplexityChartContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  perplexityChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perplexityTime: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  perplexityStatsSection: {
    width: 180,
    justifyContent: 'space-between',
  },
  perplexityStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  perplexityStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 0.1,
    flex: 1,
  },
  perplexityStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
    textAlign: 'right',
  },

  // Insight Styles
  perplexityInsightContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  perplexityInsightText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#9ca3af',
    letterSpacing: 0.1,
  },
});

// Memoize the component to prevent unnecessary re-renders
const MemoizedAssetCard = React.memo<AssetCardProps>(
  AssetCard,
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.asset.id === nextProps.asset.id &&
      prevProps.asset.totalValue === nextProps.asset.totalValue &&
      prevProps.asset.totalGainLoss === nextProps.asset.totalGainLoss &&
      prevProps.asset.currentPrice === nextProps.asset.currentPrice
    );
  }
);

export default MemoizedAssetCard;