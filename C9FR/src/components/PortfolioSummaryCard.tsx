/**
 * PortfolioSummaryCard - Perplexity style portfolio overview
 * Glassmorphism card with stats
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from './reusables';
import { perplexitySpacing } from '../theme/perplexityTheme';

interface PortfolioSummaryCardProps {
  portfolioValue: string;
  totalReturns: string;
  totalReturnsPercent: string;
  todaysChange: string;
  todaysChangePercent: string;
  isMarketOpen: boolean;
  onPress?: () => void;
}

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  portfolioValue,
  totalReturns,
  totalReturnsPercent,
  todaysChange,
  todaysChangePercent,
  isMarketOpen,
  onPress,
}) => {
  const isPositive = totalReturns.startsWith('+');
  const isTodayPositive = todaysChange.startsWith('+');

  return (
    <Card variant="glass" padding="md">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.compactContainer}>
          {/* Left Side - Portfolio Value and Total Change */}
          <View style={styles.leftSection}>
            <Text variant="heading2" color="foreground" weight="700">
              {portfolioValue}
            </Text>
            <Text
              variant="body"
              color={isPositive ? 'success' : 'danger'}
              weight="600"
              style={styles.totalChangeText}
            >
              {totalReturns}
            </Text>
          </View>

          {/* Right Side - Today's Change */}
          <View style={styles.rightSection}>
            <Text variant="caption" color="quieter" weight="500" style={styles.todayLabel}>
              TODAY
            </Text>
            <Text
              variant="heading3"
              color={isTodayPositive ? 'success' : 'danger'}
              weight="700"
            >
              {todaysChange}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    gap: perplexitySpacing.xs,
  },
  totalChangeText: {
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: perplexitySpacing.xs,
  },
  todayLabel: {
    letterSpacing: 0.5,
  },
});
