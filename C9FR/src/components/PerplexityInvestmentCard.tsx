/**
 * PerplexityInvestmentCard Component
 * Investment card matching Perplexity Finance design
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Card, Badge } from './reusables';
import { perplexityColors, perplexityRadius, perplexitySpacing } from '../theme/perplexityTheme';

interface InvestmentData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  chartData: number[];
  insight: string;
}

interface PerplexityInvestmentCardProps {
  investment: InvestmentData;
  onPress?: () => void;
}

export const PerplexityInvestmentCard: React.FC<PerplexityInvestmentCardProps> = ({ 
  investment, 
  onPress 
}) => {
  const isPositive = investment.change >= 0;
  const chartColor = isPositive ? perplexityColors.chartPositive : perplexityColors.chartNegative;
  const changeColor = isPositive ? perplexityColors.success : perplexityColors.danger;
  
  // Split company name: first word on line 1, rest on line 2
  const nameParts = investment.name.split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{investment.symbol.substring(0, 2)}</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{firstName}</Text>
              {restName && (
                <Text style={styles.companyNameSecond} numberOfLines={1} ellipsizeMode="tail">
                  {restName}
                </Text>
              )}
              <Text style={styles.symbol}>{investment.symbol}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{investment.price.toFixed(2)}</Text>
              <Badge 
                variant={isPositive ? 'success' : 'danger'} 
                size="md"
                style={{
                  ...styles.changeBadge,
                  borderRadius: 6,
                  ...(isPositive && { backgroundColor: 'rgba(34, 167, 185, 0.15)' })
                }}
              >
                <Text style={[
                  styles.changeText,
                  isPositive && { color: '#22a7b9' }
                ]}>
                  {isPositive ? '↑' : '↓'} {Math.abs(investment.changePercent).toFixed(2)}%
                </Text>
              </Badge>
            </View>
          </View>
        </View>

        {/* Chart & Stats Grid */}
        <View style={styles.content}>
          {/* Chart Section */}
          <View style={styles.chartSection}>
            <View style={styles.yAxis}>
              <Text style={styles.yLabel}>
                {Math.max(...investment.chartData).toFixed(0)}
              </Text>
              <Text style={styles.yLabel}>
                {(
                  (Math.max(...investment.chartData) + Math.min(...investment.chartData)) / 2
                ).toFixed(0)}
              </Text>
              <Text style={styles.yLabel}>
                {Math.min(...investment.chartData).toFixed(0)}
              </Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg width={160} height={80}>
                <Defs>
                  <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={chartColor} stopOpacity="0.15" />
                    <Stop offset="100%" stopColor={chartColor} stopOpacity="0.005" />
                  </LinearGradient>
                </Defs>
                
                {/* Gradient fill area below the line */}
                {(() => {
                  const minVal = Math.min(...investment.chartData);
                  const maxVal = Math.max(...investment.chartData);
                  const range = maxVal - minVal || 1;
                  
                  // Create polygon points for the filled area
                  const points = investment.chartData.map((point, idx) => {
                    const x = (idx / (investment.chartData.length - 1)) * 160;
                    const y = 80 - ((point - minVal) / range) * 80;
                    return `${x},${y}`;
                  }).join(' ');
                  
                  // Add bottom corners to close the polygon
                  const polygonPoints = `0,80 ${points} 160,80`;
                  
                  return (
                    <Polygon
                      points={polygonPoints}
                      fill="url(#chartGradient)"
                    />
                  );
                })()}
                
                {/* Chart line */}
                {investment.chartData.map((point, idx) => {
                  if (idx === investment.chartData.length - 1) return null;
                  const minVal = Math.min(...investment.chartData);
                  const maxVal = Math.max(...investment.chartData);
                  const range = maxVal - minVal || 1;
                  
                  const x1 = (idx / (investment.chartData.length - 1)) * 160;
                  const x2 = ((idx + 1) / (investment.chartData.length - 1)) * 160;
                  const y1 = 80 - ((point - minVal) / range) * 80;
                  const y2 = 80 - ((investment.chartData[idx + 1] - minVal) / range) * 80;

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
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel} numberOfLines={1}>Volume</Text>
              <Text style={styles.statValue}>{investment.volume}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel} numberOfLines={1}>Market Cap</Text>
              <Text style={styles.statValue}>{investment.marketCap}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel} numberOfLines={1}>P/E Ratio</Text>
              <Text style={styles.statValue}>{investment.peRatio.toFixed(2)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel} numberOfLines={1}>Dividend Yield</Text>
              <Text style={styles.statValue}>{investment.dividendYield.toFixed(2)}%</Text>
            </View>
          </View>
        </View>

        {/* Insight */}
        {investment.insight && (
          <View style={styles.insightContainer}>
            <Text style={styles.insightText} numberOfLines={2}>
              {investment.insight}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: perplexitySpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: perplexitySpacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: perplexityRadius.md,
    backgroundColor: perplexityColors.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: perplexitySpacing.md,
  },
  iconText: {
    color: perplexityColors.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: perplexityColors.foreground,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
  companyNameSecond: {
    color: perplexityColors.foreground,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  symbol: {
    color: perplexityColors.quiet,
    fontSize: 13,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: perplexitySpacing.sm,
  },
  price: {
    color: perplexityColors.foreground,
    fontSize: 24,
    fontWeight: '700',
  },
  changeBadge: {
    marginLeft: perplexitySpacing.sm,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    marginBottom: perplexitySpacing.lg,
  },
  chartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: perplexitySpacing.md,
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  yLabel: {
    color: perplexityColors.quietest,
    fontSize: 10,
    fontWeight: '500',
  },
  chartContainer: {
    flex: 1,
    height: 80,
  },
  statsSection: {
    width: 140,
    justifyContent: 'space-between',
    paddingLeft: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: perplexitySpacing.sm,
  },
  statLabel: {
    color: perplexityColors.quieter,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    letterSpacing: -0.1,
  },
  statValue: {
    color: perplexityColors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  insightContainer: {
    paddingTop: perplexitySpacing.md,
    borderTopWidth: 1,
    borderTopColor: perplexityColors.borderSubtle,
  },
  insightText: {
    color: perplexityColors.quiet,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
