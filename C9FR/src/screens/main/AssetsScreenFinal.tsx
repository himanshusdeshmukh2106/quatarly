/**
 * AssetsScreen - EXACT Perplexity Finance Design
 * 
 * Using React Native Reusables with triangular grid patterns
 * Matches Perplexity Finance India Markets page exactly
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GeometricBackground } from '../../components/ui/GeometricBackground';
import { Text, Button } from '../../components/reusables';
import { PortfolioSummaryCard } from '../../components/PortfolioSummaryCard';
import { PerplexityInvestmentCard } from '../../components/PerplexityInvestmentCard';
import { PerplexityGrid } from '../../components/PerplexityGrid';
import { perplexityColors, perplexitySpacing } from '../../theme/perplexityTheme';
import { mockInvestments, MockInvestment } from './utils/mockData';

export const AssetsScreenFinal: React.FC = () => {
  const filteredInvestments = mockInvestments;

  // Calculate portfolio stats
  const calculatePortfolioStats = () => {
    const totalValue = 1543151.0;
    const totalReturns = 125651.25;
    const todaysChange = 8245;
    const todaysChangePercent = 0.53;
    const totalReturnsPercent = 8.86;

    return {
      portfolioValue: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      totalReturns: `+₹${totalReturns.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      totalReturnsPercent: `+${totalReturnsPercent}%`,
      todaysChange: `+₹${todaysChange.toLocaleString('en-IN')}`,
      todaysChangePercent: `+${todaysChangePercent}%`,
    };
  };

  const stats = calculatePortfolioStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#191a1a" />
      
      <View style={styles.container}>
        {/* Geometric Background with Triangles */}
        <GeometricBackground opacity={0.05} />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Portfolio Summary Card */}
          <View style={styles.section}>
            <PortfolioSummaryCard
              portfolioValue={stats.portfolioValue}
              totalReturns={stats.totalReturns}
              totalReturnsPercent={stats.totalReturnsPercent}
              todaysChange={stats.todaysChange}
              todaysChangePercent={stats.todaysChangePercent}
              isMarketOpen={false}
              onPress={() => console.log('Navigate to portfolio details')}
            />
          </View>

          {/* Investments Header with Add Button */}
          <View style={styles.investmentsHeader}>
            <Text variant="heading2" color="foreground" weight="700">
              Your Investments
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => console.log('Add investment')}
              icon={<Icon name="add" size={18} color={perplexityColors.super} />}
              iconPosition="left"
              style={styles.addButton}
            >
              <Text variant="body" color="text" weight="600" style={styles.addButtonText}>
                Add Investment
              </Text>
            </Button>
          </View>

          {/* Investment Cards Grid - Grouped in Pairs */}
          <View style={styles.investmentsContainer}>
            {filteredInvestments.reduce<MockInvestment[][]>((acc, _: MockInvestment, index: number, array: MockInvestment[]) => {
              if (index % 2 === 0) {
                acc.push(array.slice(index, index + 2));
              }
              return acc;
            }, []).map((group: MockInvestment[], groupIndex: number) => (
              <View key={`group-${groupIndex}`} style={styles.cardGroup}>
                {group.map((investment: MockInvestment, cardIndex: number) => (
                  <React.Fragment key={investment.id}>
                    <PerplexityInvestmentCard
                      investment={investment}
                      onPress={() => console.log('Navigate to:', investment.symbol)}
                    />
                    {cardIndex === 0 && group.length === 2 && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            ))}
          </View>

          {/* Empty State */}
          {filteredInvestments.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color={perplexityColors.quieter} />
              <Text
                variant="heading3"
                color="quiet"
                weight="600"
                style={styles.emptyTitle}
              >
                No investments found
              </Text>
              <Text variant="bodySmall" color="quieter" style={styles.emptySubtext}>
                Try adjusting your search query
              </Text>
            </View>
          )}

          {/* Footer Spacing */}
          <View style={styles.footer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#191a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#191a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: perplexitySpacing.lg,
  },
  section: {
    marginTop: perplexitySpacing.lg,
    marginBottom: perplexitySpacing.md,
  },
  investmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: perplexitySpacing.xl,
    marginBottom: perplexitySpacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: perplexitySpacing.md,
    paddingVertical: perplexitySpacing.sm,
    borderWidth: 1,
    borderColor: perplexityColors.super,
    borderRadius: 8,
    gap: perplexitySpacing.xs,
  },
  addButtonText: {
    color: perplexityColors.super,
    marginLeft: perplexitySpacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: perplexitySpacing['4xl'],
  },
  investmentsContainer: {
    marginBottom: perplexitySpacing.lg,
  },
  cardGroup: {
    backgroundColor: '#1f2121',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: perplexityColors.borderSubtle,
    marginBottom: perplexitySpacing.xl,
    overflow: 'hidden',
  },
  divider: {
    height: 2.5,
    backgroundColor: perplexityColors.border,
    marginHorizontal: perplexitySpacing.lg,
    opacity: 0.9,
  },
  emptyTitle: {
    marginTop: perplexitySpacing.lg,
  },
  emptySubtext: {
    marginTop: perplexitySpacing.xs,
  },
  footer: {
    height: perplexitySpacing['4xl'],
  },
});

export default AssetsScreenFinal;
