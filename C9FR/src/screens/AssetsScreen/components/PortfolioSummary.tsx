/**
 * PortfolioSummary Component
 * 
 * Displays portfolio summary with market status and key metrics
 * Extracted from AssetsScreen to improve code organization
 */

import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../../context/ThemeContext';

export interface PortfolioSummaryProps {
  portfolioValue: string;
  totalReturns: string;
  todaysChange: string;
  returnRate: string;
  isMarketOpen: boolean;
  onPress?: () => void;
  showAddDropdown: boolean;
  onDismissDropdown: () => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = React.memo(({
  portfolioValue,
  totalReturns,
  todaysChange,
  returnRate,
  isMarketOpen,
  onPress,
  showAddDropdown,
  onDismissDropdown,
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableWithoutFeedback 
      onPress={() => {
        if (showAddDropdown) {
          onDismissDropdown();
        }
      }}
    >
      <View 
        style={[
          styles.exactPortfolioCard, 
          { 
            backgroundColor: theme.card, 
            borderColor: '#e5e7eb'
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.exactPortfolioHeader}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Text style={[styles.exactPortfolioTitle, { color: theme.text }]}>
            Portfolio Summary
          </Text>
          <View style={styles.portfolioHeaderRight}>
            <View style={styles.exactMarketStatus}>
              <View 
                style={[
                  styles.exactMarketDot, 
                  { 
                    backgroundColor: isMarketOpen ? '#22c55e' : '#ef4444'
                  }
                ]} 
              />
              <Text style={[styles.exactMarketText, { color: theme.textMuted }]}>
                {isMarketOpen ? 'Market Open' : 'Market Closed'}
              </Text>
            </View>
            <Icon name="keyboard-arrow-right" size={20} color={theme.textMuted} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.exactPortfolioContent}>
          {/* Primary Metrics Row */}
          <View style={styles.exactPortfolioRow}>
            <View style={styles.exactPortfolioItem}>
              <Text style={[styles.exactLabel, { color: '#6b7280' }]}>
                Portfolio Value
              </Text>
              <Text style={[styles.exactValue, { color: theme.text }]}>
                {portfolioValue}
              </Text>
            </View>
            <View style={styles.exactPortfolioItem}>
              <Text style={[styles.exactLabel, { color: '#6b7280' }]}>
                Total Returns
              </Text>
              <Text style={[styles.exactValueGreen, { color: '#22c55e' }]}>
                {totalReturns}
              </Text>
            </View>
          </View>

          {/* Secondary Metrics Row */}
          <View style={styles.exactPortfolioRow}>
            <View style={styles.exactPortfolioItem}>
              <Text style={[styles.exactLabelSmall, { color: '#9ca3af' }]}>
                Today's Change
              </Text>
              <Text style={[styles.exactValueSmall, { color: '#22c55e' }]}>
                {todaysChange}
              </Text>
            </View>
            <View style={styles.exactPortfolioItem}>
              <Text style={[styles.exactLabelSmall, { color: '#9ca3af' }]}>
                Return Rate
              </Text>
              <Text style={[styles.exactValueSmall, { color: '#22c55e' }]}>
                {returnRate}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
});

PortfolioSummary.displayName = 'PortfolioSummary';

const styles = StyleSheet.create({
  exactMarketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exactMarketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  exactMarketText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exactPortfolioCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  exactPortfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  portfolioHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exactPortfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exactPortfolioContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exactPortfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  exactPortfolioItem: {
    flex: 1,
  },
  exactLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '400',
  },
  exactValue: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  exactValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  exactLabelSmall: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exactValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});
