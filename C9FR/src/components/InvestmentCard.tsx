import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Line, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getHeaderFont, getBodyFont, getMonoFont } from '../config/fonts';

export interface InvestmentData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  dividendYield: string;
  chartData: readonly number[];
  insight: string;
  time: string;
}

interface InvestmentCardProps {
  investment: InvestmentData;
  index: number;
  onPress?: (investment: InvestmentData) => void;
  onLongPress?: (investment: InvestmentData) => void;
  groupPosition?: 'single' | 'top' | 'bottom' | 'middle';
}

const OptimizedInvestmentCard: React.FC<InvestmentCardProps> = memo(({
  investment,
  index,
  onPress,
  onLongPress,
  groupPosition = 'single',
}) => {
  // Memoize computed values
  const computedValues = useMemo(() => {
    const isNegative = investment.change < 0;
    const changeColor = isNegative ? '#ef4444' : '#22c55e';
    const changeIcon = isNegative ? '↓' : '↗';
    const backgroundColor = investment.id === '1' ? '#ef4444' : '#6b7280';
    
    return {
      isNegative,
      changeColor,
      changeIcon,
      backgroundColor,
    };
  }, [investment.change, investment.id]);

  // Memoize chart data processing
  const chartPaths = useMemo(() => {
    if (!investment.chartData || investment.chartData.length < 2) {
      return null;
    }

    const minPrice = Math.min(...investment.chartData);
    const maxPrice = Math.max(...investment.chartData);
    const priceRange = maxPrice - minPrice || 1;

    let pathData = '';
    const firstPoint = investment.chartData[0];
    const firstY = 80 - ((firstPoint - minPrice) / priceRange) * 80;
    pathData += `M 0 80 L 0 ${firstY}`;

    // Generate path for area fill
    investment.chartData.forEach((point, idx) => {
      const x = (idx / (investment.chartData.length - 1)) * 140;
      const y = 80 - ((point - minPrice) / priceRange) * 80;
      pathData += ` L ${x} ${y}`;
    });

    pathData += ` L 140 80 Z`;

    // Generate line segments
    const lineSegments = [];
    for (let i = 0; i < investment.chartData.length - 1; i++) {
      const x1 = (i / (investment.chartData.length - 1)) * 140;
      const x2 = ((i + 1) / (investment.chartData.length - 1)) * 140;
      const y1 = 80 - ((investment.chartData[i] - minPrice) / priceRange) * 80;
      const y2 = 80 - ((investment.chartData[i + 1] - minPrice) / priceRange) * 80;
      
      lineSegments.push({ x1, y1, x2, y2, key: `line-${i}` });
    }

    return { pathData, lineSegments };
  }, [investment.chartData]);

  // Memoize event handlers
  const handlePress = useCallback(() => {
    onPress?.(investment);
  }, [onPress, investment]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(investment);
  }, [onLongPress, investment]);

  // Format price with memoization
  const formattedPrice = useMemo(() => 
    `₹${investment.price.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`,
    [investment.price]
  );

  // Dynamic card styles based on group position
  const cardStyles = useMemo(() => {
    const baseStyle = styles.card;
    
    switch (groupPosition) {
      case 'top':
        return [baseStyle, styles.cardTop];
      case 'bottom':
        return [baseStyle, styles.cardBottom];
      case 'middle':
        return [baseStyle, styles.cardMiddle];
      default:
        return baseStyle;
    }
  }, [groupPosition]);

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      accessibilityLabel={`Investment card for ${investment.name}`}
      accessibilityHint="Double tap to view details, long press for options"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: computedValues.backgroundColor }]}>
            <Text style={styles.iconText}>
              {investment.id === '1' ? 'MF' : 'C'}
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={2} ellipsizeMode="tail">
              {investment.name}
            </Text>
            <Text style={styles.symbol}>
              {investment.symbol}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>
            {formattedPrice}
          </Text>
          <View style={[
            styles.changeContainer,
            { 
              backgroundColor: computedValues.isNegative 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(34, 197, 94, 0.15)' 
            }
          ]}>
            <Text style={[styles.change, { color: computedValues.changeColor }]}>
              {computedValues.changeIcon} {Math.abs(investment.changePercent).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Body - Chart and Stats */}
      <View style={styles.body}>
        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.yAxis}>
            <Text style={styles.yLabel}>350</Text>
            <Text style={styles.yLabel}>300</Text>
            <Text style={styles.yLabel}>250</Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {chartPaths && (
                <Svg width={140} height={80}>
                  <Defs>
                    <LinearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                      <Stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                    </LinearGradient>
                    <LinearGradient id="negativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                    </LinearGradient>
                  </Defs>

                  {/* Area fill */}
                  <Path
                    d={chartPaths.pathData}
                    fill={computedValues.isNegative ? "url(#negativeGradient)" : "url(#positiveGradient)"}
                  />

                  {/* Chart lines */}
                  {chartPaths.lineSegments.map(segment => (
                    <Line
                      key={segment.key}
                      x1={segment.x1}
                      y1={segment.y1}
                      x2={segment.x2}
                      y2={segment.y2}
                      stroke={computedValues.changeColor}
                      strokeWidth="2"
                    />
                  ))}
                </Svg>
              )}
            </View>
            <Text style={styles.time}>
              {investment.time}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatRow 
            label="Volume" 
            value={investment.volume} 
          />
          <StatRow 
            label="Market Cap" 
            value={investment.marketCap} 
          />
          <StatRow 
            label="P/E Ratio" 
            value={investment.peRatio.toString()} 
          />
          <StatRow 
            label="Dividend Yield" 
            value={investment.dividendYield} 
          />
        </View>
      </View>

      {/* Insight */}
      <View style={styles.insightContainer}>
        <Text style={styles.insightText} numberOfLines={3}>
          {investment.insight}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// Memoized StatRow component
const StatRow: React.FC<{
  label: string;
  value: string;
}> = memo(({ label, value }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f1f1f', // Dark background matching image
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, // Stronger shadow for dark theme
    shadowRadius: 12,
    elevation: 12,
  },
  cardTop: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardBottom: {
    marginTop: 0,
    marginBottom: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cardMiddle: {
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: '60%',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontFamily: getMonoFont('semiBold'), // IBM Plex Mono SemiBold for icons
    color: '#ffffff',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  companyInfo: {
    flex: 1,
    maxWidth: 120,
  },
  companyName: {
    fontFamily: getHeaderFont('medium'), // FK Grotesk Medium for company names
    color: '#ffffff', // White text for dark theme
    fontSize: 17,
    marginBottom: 4,
    lineHeight: 20,
    maxWidth: 120,
  },
  symbol: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular for symbols
    color: '#9ca3af', // Light gray for symbol
    fontSize: 13,
    letterSpacing: 0.5,
  },
  right: {
    minWidth: '35%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  price: {
    fontFamily: getMonoFont('medium'), // IBM Plex Mono Medium for prices
    color: '#ffffff', // White text for price
    fontSize: 20,
    letterSpacing: -0.2,
    marginRight: 8,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  change: {
    fontFamily: getMonoFont('medium'), // IBM Plex Mono Medium for percentage changes
    fontSize: 14,
    letterSpacing: 0.2,
  },
  body: {
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 4,
  },
  chartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 24,
  },
  yAxis: {
    width: 44,
    height: 80,
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  yLabel: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular for Y-axis values
    color: '#6b7280', // Gray for Y-axis labels
    fontSize: 11,
    textAlign: 'right',
    letterSpacing: 0.2,
  },
  chartContainer: {
    flex: 1,
  },
  chart: {
    height: 80,
    position: 'relative',
  },
  time: {
    fontFamily: getBodyFont('light'), // IBM Plex Sans Light for timestamps
    color: '#6b7280', // Gray for time
    fontSize: 11,
    marginTop: 10,
    textAlign: 'left',
  },
  statsSection: {
    width: 130,
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontFamily: getBodyFont('light'), // IBM Plex Sans Light for stat labels
    color: '#6b7280', // Gray for stat labels
    fontSize: 12,
  },
  statValue: {
    fontFamily: getMonoFont('medium'), // IBM Plex Mono Medium for stat values
    color: '#ffffff', // White for stat values
    fontSize: 13,
    textAlign: 'right',
    letterSpacing: 0.2,
  },
  insightContainer: {
    paddingTop: 20,
    marginTop: 4,
  },
  insightText: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular for insights
    color: '#d1d5db', // Light gray for insight text
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
});

OptimizedInvestmentCard.displayName = 'OptimizedInvestmentCard';

export default OptimizedInvestmentCard;