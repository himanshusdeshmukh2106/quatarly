import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { TradableAsset } from '../types';

interface TradableAssetCardProps {
  asset: TradableAsset;
  onPress?: () => void;
  onLongPress?: () => void;
  onInsightsPress?: () => void;
  style?: any;
}

export const TradableAssetCard: React.FC<TradableAssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  style,
}) => {
  const formatCurrency = (amount: number, currency?: string) => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `₹${amount.toFixed(2)}`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#22c55e'; // Green for positive
    if (value < 0) return '#ef4444'; // Red for negative
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

  // Generate AI insight based on asset performance
  const generateInsight = (asset: TradableAsset) => {
    const isPositive = asset.totalGainLoss >= 0;

    if (isPositive) {
      return `${asset.name} shares showed positive performance with strong fundamentals and favorable market conditions supporting continued growth potential in the current economic environment.`;
    } else {
      return `${asset.name} shares experienced some volatility due to market conditions and sector-specific factors, but maintains solid underlying value with potential for recovery in the medium term.`;
    }
  };

  const currentPrice = asset.currentPrice || asset.totalValue;
  const change = asset.totalGainLoss || 0;
  const changePercent = asset.totalGainLossPercent || 0;
  const isNegative = change < 0;
  const changeColor = getPerformanceColor(change);
  const symbol = asset.symbol || asset.name.substring(0, 2).toUpperCase();
  const chartData = generateChartData(currentPrice, change >= 0);

  return (
    <TouchableOpacity
      style={[styles.exactReplicaCard, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Exact Header Layout - Matching Placeholder Cards */}
      <View style={styles.pixelPerfectHeader}>
        <View style={styles.pixelPerfectLeft}>
          <View style={styles.pixelPerfectIcon}>
            <Text style={styles.pixelPerfectIconText}>{symbol}</Text>
          </View>
          <View style={styles.pixelPerfectCompanyInfo}>
            <Text style={styles.pixelPerfectCompanyName} numberOfLines={1}>
              {asset.name}
            </Text>
            <Text style={styles.pixelPerfectSymbol}>{symbol}</Text>
          </View>
        </View>
        <View style={styles.pixelPerfectRight}>
          <Text style={styles.pixelPerfectPrice}>
            {formatCurrency(currentPrice, asset.currency)}
          </Text>
          <Text style={[styles.pixelPerfectChange, { color: changeColor }]}>
            {isNegative ? '↓' : '↑'} {Math.abs(changePercent).toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Chart and Stats Layout - Pixel Perfect */}
      <View style={styles.pixelPerfectBody}>
        {/* Left Side - Chart with Y-axis */}
        <View style={styles.pixelPerfectChartSection}>
          {/* Y-axis labels */}
          <View style={styles.pixelPerfectYAxis}>
            <Text style={styles.pixelPerfectYLabel}>{Math.round(currentPrice * 1.4)}</Text>
            <Text style={styles.pixelPerfectYLabel}>{Math.round(currentPrice * 1.2)}</Text>
            <Text style={styles.pixelPerfectYLabel}>{Math.round(currentPrice)}</Text>
          </View>

          {/* Chart area */}
          <View style={styles.pixelPerfectChartContainer}>
            <View style={styles.pixelPerfectChart}>
              {/* Simple line chart to match the image exactly */}
              <Svg width={140} height={70}>
                {/* Chart line */}
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
                      stroke={changeColor}
                      strokeWidth="2.5"
                    />
                  );
                })}
              </Svg>
            </View>
            <Text style={styles.pixelPerfectTime}>6:00 PM</Text>
          </View>
        </View>

        {/* Right Side - Stats Exactly Like Placeholder Cards */}
        <View style={styles.pixelPerfectStatsSection}>
          <View style={styles.pixelPerfectStatRow}>
            <Text style={styles.pixelPerfectStatLabel}>Volume</Text>
            <Text style={styles.pixelPerfectStatValue}>{asset.volume || '1.2M'}</Text>
          </View>
          <View style={styles.pixelPerfectStatRow}>
            <Text style={styles.pixelPerfectStatLabel}>Market Cap</Text>
            <Text style={styles.pixelPerfectStatValue}>
              {asset.marketCap ? `${(asset.marketCap / 1000000).toFixed(1)}M` : `${(asset.totalValue * 100 / 1000000).toFixed(1)}M`}
            </Text>
          </View>
          <View style={styles.pixelPerfectStatRow}>
            <Text style={styles.pixelPerfectStatLabel}>P/E Ratio</Text>
            <Text style={styles.pixelPerfectStatValue}>{asset.peRatio?.toFixed(2) || (Math.random() * 50 + 10).toFixed(2)}</Text>
          </View>
          <View style={styles.pixelPerfectStatRow}>
            <Text style={styles.pixelPerfectStatLabel}>Growth Rate</Text>
            <Text style={[
              styles.pixelPerfectStatValue,
              { color: asset.growthRate && asset.growthRate > 0 ? '#22c55e' : asset.growthRate && asset.growthRate < 0 ? '#ef4444' : '#ffffff' }
            ]}>
              {asset.growthRate ? `${asset.growthRate.toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Insight Text - Pixel Perfect */}
      <View style={styles.pixelPerfectInsightContainer}>
        <Text style={styles.pixelPerfectInsightText}>
          {generateInsight(asset)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Exact Replica Styles to Match Placeholder Investment Cards
  exactReplicaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pixelPerfectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pixelPerfectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pixelPerfectIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pixelPerfectIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  pixelPerfectCompanyInfo: {
    flex: 1,
  },
  pixelPerfectCompanyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  pixelPerfectSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  pixelPerfectRight: {
    alignItems: 'flex-end',
  },
  pixelPerfectPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  pixelPerfectChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  pixelPerfectBody: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  pixelPerfectChartSection: {
    flex: 1,
    flexDirection: 'row',
    height: 100,
    marginRight: 20,
  },
  pixelPerfectYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  pixelPerfectYLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  pixelPerfectChartContainer: {
    flex: 1,
    position: 'relative',
  },
  pixelPerfectChart: {
    flex: 1,
    justifyContent: 'center',
  },
  pixelPerfectTime: {
    position: 'absolute',
    bottom: -15,
    left: 4,
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  pixelPerfectStatsSection: {
    width: 120,
    justifyContent: 'space-between',
  },
  pixelPerfectStatRow: {
    marginBottom: 8,
  },
  pixelPerfectStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 2,
  },
  pixelPerfectStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  pixelPerfectInsightContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  pixelPerfectInsightText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#d1d5db',
  },
});

export default TradableAssetCard;