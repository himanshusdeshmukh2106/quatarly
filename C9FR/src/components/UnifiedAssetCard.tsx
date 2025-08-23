import React, { useMemo, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Asset } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import AssetDataProcessor, { AssetDisplayData } from '../services/AssetDataProcessor';
import ChartErrorBoundary from './ChartErrorBoundary';

interface UnifiedAssetCardProps {
  asset: Asset;
  onPress?: () => void;
  onLongPress?: () => void;
  onInsightsPress?: () => void;
  onUpdateValue?: (assetId: string, newValue: number) => void;
  style?: any;
}

export const UnifiedAssetCard: React.FC<UnifiedAssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  style,
}) => {
  const { theme } = useContext(ThemeContext);

  // Memoize the processed display data with comprehensive error handling
  const displayData: AssetDisplayData = useMemo(() => {
    try {
      // Enhanced validation with more specific checks
      if (!asset) {
        throw new Error('Asset is null or undefined');
      }

      if (!asset.name || typeof asset.name !== 'string' || asset.name.trim().length === 0) {
        throw new Error('Asset name is invalid or empty');
      }

      if (typeof asset.totalValue !== 'number' || isNaN(asset.totalValue) || !isFinite(asset.totalValue)) {
        throw new Error('Asset totalValue is not a valid number');
      }

      if (!theme) {
        console.warn('Theme is not available, using fallback colors');
      }

      return AssetDataProcessor.processAssetForDisplay(asset, theme);
    } catch (error) {
      console.warn('Error processing asset data in UnifiedAssetCard:', error);
      
      // Enhanced fallback data that maintains visual consistency
      const safeName = (asset?.name && typeof asset.name === 'string' && asset.name.trim().length > 0) 
        ? asset.name.trim() 
        : 'Unknown Asset';
      
      const safeValue = (typeof asset?.totalValue === 'number' && isFinite(asset.totalValue) && !isNaN(asset.totalValue)) 
        ? asset.totalValue 
        : 0;
      
      const safeChange = (typeof asset?.totalGainLoss === 'number' && isFinite(asset.totalGainLoss) && !isNaN(asset.totalGainLoss)) 
        ? asset.totalGainLoss 
        : 0;
      
      const safeChangePercent = (typeof asset?.totalGainLossPercent === 'number' && isFinite(asset.totalGainLossPercent) && !isNaN(asset.totalGainLossPercent)) 
        ? asset.totalGainLossPercent 
        : 0;

      // Generate symbol from name
      const generateSymbol = (name: string): string => {
        const words = name.split(' ').filter(word => word.length > 0);
        if (words.length >= 2) {
          return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };
      
      return {
        symbol: generateSymbol(safeName),
        name: safeName,
        price: safeValue,
        currency: undefined,
        change: safeChange,
        changePercent: safeChangePercent,
        changeColor: '#6B7280', // Neutral gray for error state
        chartData: Array(12).fill(100), // Flat line for consistency
        yAxisLabels: ['100', '100', '100'],
        time: '12:00 PM',
        stats: [
          { label: 'Volume', value: 'N/A' },
          { label: 'Market Cap', value: 'N/A' },
          { label: 'P/E Ratio', value: 'N/A' },
          { label: 'Growth Rate', value: 'N/A' },
        ],
        aiAnalysis: 'Asset data is currently unavailable. Please check your connection and try again.',
      };
    }
  }, [asset, theme]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.();
  }, [onLongPress]);

  const formatCurrency = useCallback((amount: number, currency?: string) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        return 'N/A';
      }
      
      if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
      }
      return `₹${amount.toFixed(2)}`;
    } catch (error) {
      return 'N/A';
    }
  }, []);

  const formatPercentage = useCallback((percent: number) => {
    try {
      if (typeof percent !== 'number' || isNaN(percent) || !isFinite(percent)) {
        return 'N/A';
      }
      
      // Handle very large percentages
      if (Math.abs(percent) >= 1000) {
        return 'N/A'; // Too large to display meaningfully
      }
      
      const isNegative = percent < 0;
      const absPercent = Math.abs(percent);
      const arrow = isNegative ? '↓' : '↑';
      
      return `${arrow} ${absPercent.toFixed(2)}%`;
    } catch (error) {
      console.warn('Error formatting percentage:', error);
      return 'N/A';
    }
  }, []);

  const isNegative = displayData.change < 0;

  return (
    <TouchableOpacity
      style={[styles.exactReplicaCard, style]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      testID="unified-asset-card"
    >
      {/* Exact Header Layout - Matching Placeholder Cards */}
      <View style={styles.pixelPerfectHeader}>
        <View style={styles.pixelPerfectLeft}>
          <View style={styles.pixelPerfectIcon}>
            <Text style={styles.pixelPerfectIconText}>{displayData.symbol}</Text>
          </View>
          <View style={styles.pixelPerfectCompanyInfo}>
            <Text style={styles.pixelPerfectCompanyName} numberOfLines={2} ellipsizeMode="tail">
              {displayData.name}
            </Text>
            <Text style={styles.pixelPerfectSymbol}>{displayData.symbol}</Text>
          </View>
        </View>
        <View style={styles.pixelPerfectRight}>
          <View style={styles.priceChangeRow}>
            <Text style={styles.pixelPerfectPrice}>
              {formatCurrency(displayData.price, displayData.currency)}
            </Text>
            <View style={[
              styles.changeContainer,
              { backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)' }
            ]}>
              <Text style={[styles.pixelPerfectChange, { color: displayData.changeColor }]}>
                {formatPercentage(displayData.changePercent)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chart and Stats Layout - Pixel Perfect */}
      <View style={styles.pixelPerfectBody}>
        {/* Left Side - Chart with Y-axis */}
        <View style={styles.pixelPerfectChartSection}>
          {/* Y-axis labels with error handling */}
          <View style={styles.pixelPerfectYAxis}>
            {displayData.yAxisLabels && Array.isArray(displayData.yAxisLabels) ? (
              displayData.yAxisLabels.map((label, index) => {
                try {
                  const safeLabel = (typeof label === 'string' || typeof label === 'number') 
                    ? String(label) 
                    : 'N/A';
                  return (
                    <Text key={index} style={styles.pixelPerfectYLabel}>
                      {safeLabel}
                    </Text>
                  );
                } catch (error) {
                  console.warn('Error rendering Y-axis label:', error);
                  return (
                    <Text key={index} style={styles.pixelPerfectYLabel}>
                      N/A
                    </Text>
                  );
                }
              })
            ) : (
              // Fallback Y-axis labels
              ['100', '100', '100'].map((label, index) => (
                <Text key={index} style={styles.pixelPerfectYLabel}>
                  {label}
                </Text>
              ))
            )}
          </View>

          {/* Chart area */}
          <View style={styles.pixelPerfectChartContainer}>
            <View style={styles.pixelPerfectChart}>
              {/* Enhanced chart with error boundary and fixed dimensions matching placeholder */}
              <ChartErrorBoundary fallbackColor={displayData.changeColor} width={140} height={80}>
                <Svg width={140} height={80}>
                  {/* Chart line with comprehensive error handling */}
                  {displayData.chartData && displayData.chartData.length > 1 ? (
                    displayData.chartData.map((point: number, idx: number) => {
                      if (idx === displayData.chartData.length - 1) return null;
                      
                      try {
                        // Validate current point and next point
                        const currentPoint = typeof point === 'number' && isFinite(point) ? point : 0;
                        const nextPoint = typeof displayData.chartData[idx + 1] === 'number' && isFinite(displayData.chartData[idx + 1]) 
                          ? displayData.chartData[idx + 1] 
                          : currentPoint;
                        
                        const chartWidth = 140; // Fixed width for consistency
                        const x1 = (idx / (displayData.chartData.length - 1)) * chartWidth;
                        const x2 = ((idx + 1) / (displayData.chartData.length - 1)) * chartWidth;
                        
                        // Calculate price range with validation
                        const validPoints = displayData.chartData.filter(p => typeof p === 'number' && isFinite(p));
                        if (validPoints.length === 0) {
                          return null; // No valid points to render
                        }
                        
                        const minPrice = Math.min(...validPoints);
                        const maxPrice = Math.max(...validPoints);
                        const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
                        
                        const y1 = 80 - ((currentPoint - minPrice) / priceRange) * 80;
                        const y2 = 80 - ((nextPoint - minPrice) / priceRange) * 80;

                        // Validate coordinates before rendering
                        if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
                          return null;
                        }

                        // Clamp coordinates to chart bounds
                        const clampedX1 = Math.max(0, Math.min(chartWidth, x1));
                        const clampedY1 = Math.max(0, Math.min(80, y1));
                        const clampedX2 = Math.max(0, Math.min(chartWidth, x2));
                        const clampedY2 = Math.max(0, Math.min(80, y2));

                        return (
                          <Line
                            key={idx}
                            x1={clampedX1}
                            y1={clampedY1}
                            x2={clampedX2}
                            y2={clampedY2}
                            stroke={displayData.changeColor}
                            strokeWidth="2"
                          />
                        );
                      } catch (error) {
                        console.warn('Error rendering chart line:', error);
                        return null;
                      }
                    })
                  ) : (
                    // Fallback flat line when no data
                    <Line
                      x1={0}
                      y1={40}
                      x2={140}
                      y2={40}
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}
                </Svg>
              </ChartErrorBoundary>
            </View>
            <Text style={styles.pixelPerfectTime}>
              {(displayData.time && typeof displayData.time === 'string') 
                ? displayData.time 
                : '12:00 PM'
              }
            </Text>
          </View>
        </View>

        {/* Right Side - Stats Exactly Like Placeholder Cards */}
        <View style={styles.pixelPerfectStatsSection}>
          {displayData.stats && Array.isArray(displayData.stats) ? (
            displayData.stats.map((stat, index) => {
              try {
                const safeLabel = (stat?.label && typeof stat.label === 'string') 
                  ? stat.label 
                  : 'N/A';
                const safeValue = (stat?.value && (typeof stat.value === 'string' || typeof stat.value === 'number')) 
                  ? String(stat.value) 
                  : 'N/A';
                const safeColor = (stat?.color && typeof stat.color === 'string') 
                  ? stat.color 
                  : null;

                return (
                  <View key={index} style={styles.pixelPerfectStatRow}>
                    <Text style={styles.pixelPerfectStatLabel}>{safeLabel}</Text>
                    <Text style={[
                      styles.pixelPerfectStatValue,
                      safeColor ? { color: safeColor } : null
                    ]}>
                      {safeValue}
                    </Text>
                  </View>
                );
              } catch (error) {
                console.warn('Error rendering stat row:', error);
                return (
                  <View key={index} style={styles.pixelPerfectStatRow}>
                    <Text style={styles.pixelPerfectStatLabel}>N/A</Text>
                    <Text style={styles.pixelPerfectStatValue}>N/A</Text>
                  </View>
                );
              }
            })
          ) : (
            // Fallback stats when data is invalid
            [
              { label: 'Volume', value: 'N/A' },
              { label: 'Market Cap', value: 'N/A' },
              { label: 'P/E Ratio', value: 'N/A' },
              { label: 'Growth Rate', value: 'N/A' },
            ].map((stat, index) => (
              <View key={index} style={styles.pixelPerfectStatRow}>
                <Text style={styles.pixelPerfectStatLabel}>{stat.label}</Text>
                <Text style={styles.pixelPerfectStatValue}>{stat.value}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Insight Text - Pixel Perfect with Error Handling */}
      <View style={styles.pixelPerfectInsightContainer}>
        <Text style={styles.pixelPerfectInsightText}>
          {(displayData.aiAnalysis && typeof displayData.aiAnalysis === 'string' && displayData.aiAnalysis.trim().length > 0)
            ? displayData.aiAnalysis
            : 'Asset analysis is currently unavailable. Please check your connection and try again.'
          }
        </Text>
        {/* Separation line below AI analysis */}
        <View style={styles.separationLine} />
      </View>
    </TouchableOpacity>
  );
};

// Exact Replica Styles to Match Placeholder Investment Cards
const styles = StyleSheet.create({
  exactReplicaCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  pixelPerfectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pixelPerfectLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: '60%',
  },
  pixelPerfectIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pixelPerfectIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  pixelPerfectCompanyInfo: {
    flex: 1,
    maxWidth: 120,
  },
  pixelPerfectCompanyName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
    maxWidth: 120,
  },
  pixelPerfectSymbol: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 0.2,
  },
  pixelPerfectRight: {
    alignItems: 'flex-end',
  },
  priceChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  pixelPerfectPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  pixelPerfectChange: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  pixelPerfectBody: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 4,
  },
  pixelPerfectChartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 24,
  },
  pixelPerfectYAxis: {
    width: 44,
    height: 80,
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  pixelPerfectYLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
  },
  pixelPerfectChartContainer: {
    flex: 1,
  },
  pixelPerfectChart: {
    height: 80,
    position: 'relative',
  },
  pixelPerfectTime: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'left',
  },
  pixelPerfectStatsSection: {
    width: 130,
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  pixelPerfectStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pixelPerfectStatLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  pixelPerfectStatValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  pixelPerfectInsightContainer: {
    paddingTop: 12,
    marginTop: 4,
  },
  separationLine: {
    height: 1,
    backgroundColor: '#333333',
    marginTop: 16,
    marginHorizontal: -20,
  },
  pixelPerfectInsightText: {
    color: '#d1d5db',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});

export default UnifiedAssetCard;