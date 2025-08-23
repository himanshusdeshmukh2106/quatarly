import React, { memo, useMemo, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../context/ThemeContext';

export interface PortfolioData {
  totalValue: number;
  totalReturns: number;
  todayChange: number;
  todayChangePercent: number;
  returnRate: number;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
}

interface PortfolioSummaryProps {
  portfolio: PortfolioData;
  onPress?: () => void;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = memo(({
  portfolio,
  onPress,
}) => {
  const { theme } = useContext(ThemeContext);

  // Memoize formatted values
  const formattedValues = useMemo(() => {
    const formatCurrency = (amount: number): string => 
      `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const formatChange = (amount: number, percent: number): string => {
      const sign = amount >= 0 ? '+' : '';
      return `${sign}${formatCurrency(amount)} (${sign}${percent.toFixed(2)}%)`;
    };

    return {
      portfolioValue: formatCurrency(portfolio.totalValue),
      totalReturns: `+${formatCurrency(portfolio.totalReturns)}`,
      todayChange: formatChange(portfolio.todayChange, portfolio.todayChangePercent),
      returnRate: `+${portfolio.returnRate.toFixed(2)}%`,
    };
  }, [portfolio]);

  // Memoize market status display
  const marketStatusDisplay = useMemo(() => {
    const statusMap = {
      open: { text: 'Market Open', color: '#22c55e' },
      closed: { text: 'Market Closed', color: '#ef4444' },
      'pre-market': { text: 'Pre-Market', color: '#f59e0b' },
      'after-hours': { text: 'After Hours', color: '#8b5cf6' },
    };

    return statusMap[portfolio.marketStatus] || statusMap.closed;
  }, [portfolio.marketStatus]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel="Portfolio summary"
        accessibilityHint="Tap to view detailed portfolio information"
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Portfolio Summary
        </Text>
        <View style={styles.headerRight}>
          <View style={styles.marketStatus}>
            <View
              style={[
                styles.marketDot,
                { backgroundColor: marketStatusDisplay.color }
              ]}
            />
            <Text style={[styles.marketText, { color: theme.textMuted }]}>
              {marketStatusDisplay.text}
            </Text>
          </View>
          <Icon name="keyboard-arrow-right" size={20} color={theme.textMuted} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Primary Metrics Row */}
        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Portfolio Value
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formattedValues.portfolioValue}
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={[styles.label, { color: theme.textMuted }]}>
              Total Returns
            </Text>
            <Text style={[styles.value, { color: theme.success }]}>
              {formattedValues.totalReturns}
            </Text>
          </View>
        </View>

        {/* Secondary Metrics Row */}
        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={[styles.labelSmall, { color: theme.textMuted }]}>
              Today's Change
            </Text>
            <Text style={[
              styles.valueSmall,
              { 
                color: portfolio.todayChange >= 0 ? theme.success : theme.error 
              }
            ]}>
              {formattedValues.todayChange}
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={[styles.labelSmall, { color: theme.textMuted }]}>
              Return Rate
            </Text>
            <Text style={[styles.valueSmall, { color: theme.success }]}>
              {formattedValues.returnRate}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  marketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  marketText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  item: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '400',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  labelSmall: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});

PortfolioSummary.displayName = 'PortfolioSummary';

export default PortfolioSummary;