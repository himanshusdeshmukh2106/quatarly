/**
 * InvestmentCard Component
 * 
 * Displays investment information with chart, stats, and insights
 * Extracted from AssetsScreen to improve code organization
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { MockInvestment } from '../utils/mockData';

export interface InvestmentCardProps {
  investment: MockInvestment;
  index: number;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = React.memo(({ investment }) => {
  const isNegative = investment.change < 0;
  const chartColor = isNegative ? '#ef4444' : '#22d3ee';
  const percentageColor = isNegative ? '#ef4444' : '#10b981';

  return (
    <View style={styles.exactReplicaCard}>
      {/* Header */}
      <View style={styles.exactReplicaHeader}>
        <View style={styles.exactReplicaLeft}>
          <View style={styles.exactReplicaIconContainer}>
            <Text style={styles.exactReplicaIconText}>
              {investment.symbol.substring(0, 2)}
            </Text>
          </View>
          <View style={styles.exactReplicaCompanyInfo}>
            <Text style={styles.exactReplicaCompanyName}>
              {investment.name}
            </Text>
            <Text style={styles.exactReplicaSymbol}>{investment.symbol}</Text>
          </View>
        </View>
        <View style={styles.exactReplicaRight}>
          <View style={styles.exactReplicaPriceRow}>
            <Text style={styles.exactReplicaPrice}>
              ${investment.price.toFixed(2)}
            </Text>
            <View style={[styles.exactReplicaChangePill, { backgroundColor: percentageColor + '20' }]}>
              <Text style={[styles.exactReplicaChangeIcon, { color: percentageColor }]}>
                {isNegative ? '↓' : '↑'}
              </Text>
              <Text style={[styles.exactReplicaChange, { color: percentageColor }]}>
                {Math.abs(investment.changePercent).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chart and Stats */}
      <View style={styles.exactReplicaBody}>
        {/* Chart Section */}
        <View style={styles.exactReplicaChartSection}>
          <View style={styles.exactReplicaYAxis}>
            <Text style={styles.exactReplicaYLabel}>350</Text>
            <Text style={styles.exactReplicaYLabel}>300</Text>
            <Text style={styles.exactReplicaYLabel}>250</Text>
          </View>
          <View style={styles.exactReplicaChartContainer}>
            <View style={styles.exactReplicaChart}>
              <Svg width={140} height={70}>
                {investment.chartData.map((point: number, idx: number) => {
                  if (idx === investment.chartData.length - 1) return null;
                  const x1 = (idx / (investment.chartData.length - 1)) * 140;
                  const x2 = ((idx + 1) / (investment.chartData.length - 1)) * 140;
                  const y1 = 70 - ((point - 240) / (350 - 240)) * 70;
                  const y2 = 70 - ((investment.chartData[idx + 1] - 240) / (350 - 240)) * 70;

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
            <Text style={styles.exactReplicaTime}>
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.exactReplicaStatsSection}>
          <View style={styles.exactReplicaStatRow}>
            <Text style={styles.exactReplicaStatLabel}>Volume</Text>
            <Text style={styles.exactReplicaStatValue}>{investment.volume}</Text>
          </View>
          <View style={styles.exactReplicaStatRow}>
            <Text style={styles.exactReplicaStatLabel}>Market Cap</Text>
            <Text style={styles.exactReplicaStatValue}>{investment.marketCap}</Text>
          </View>
          <View style={styles.exactReplicaStatRow}>
            <Text style={styles.exactReplicaStatLabel}>P/E Ratio</Text>
            <Text style={styles.exactReplicaStatValue}>{investment.peRatio}</Text>
          </View>
          <View style={styles.exactReplicaStatRow}>
            <Text style={styles.exactReplicaStatLabel}>Growth Rate</Text>
            <Text style={[
              styles.exactReplicaStatValue,
              { 
                color: investment.growthRate && investment.growthRate > 0 
                  ? '#10b981' 
                  : investment.growthRate && investment.growthRate < 0 
                  ? '#ef4444' 
                  : '#ffffff' 
              }
            ]}>
              {investment.growthRate ? `${investment.growthRate.toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Insight */}
      <View style={styles.exactReplicaInsightContainer}>
        <Text style={styles.exactReplicaInsightText}>
          {investment.insight}
        </Text>
      </View>
    </View>
  );
});

InvestmentCard.displayName = 'InvestmentCard';

const styles = StyleSheet.create({
  exactReplicaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  exactReplicaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exactReplicaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exactReplicaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exactReplicaIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  exactReplicaCompanyInfo: {
    flex: 1,
  },
  exactReplicaCompanyName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exactReplicaSymbol: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  exactReplicaRight: {
    alignItems: 'flex-end',
  },
  exactReplicaPriceRow: {
    alignItems: 'flex-end',
  },
  exactReplicaPrice: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  exactReplicaChangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  exactReplicaChangeIcon: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  exactReplicaChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  exactReplicaBody: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  exactReplicaChartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 20,
  },
  exactReplicaYAxis: {
    width: 30,
    justifyContent: 'space-between',
    height: 60,
    paddingVertical: 5,
  },
  exactReplicaYLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
  },
  exactReplicaChartContainer: {
    flex: 1,
    position: 'relative',
  },
  exactReplicaChart: {
    height: 60,
    justifyContent: 'center',
  },
  exactReplicaTime: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    position: 'absolute',
    bottom: -15,
    left: 0,
  },
  exactReplicaStatsSection: {
    width: 100,
    justifyContent: 'space-between',
  },
  exactReplicaStatRow: {
    marginBottom: 8,
  },
  exactReplicaStatLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  exactReplicaStatValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  exactReplicaInsightContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  exactReplicaInsightText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
