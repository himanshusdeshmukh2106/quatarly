/**
 * AssetsScreen - EXACT Perplexity Finance Design
 * 
 * Using React Native Reusables with triangular grid patterns
 * Matches Perplexity Finance India Markets page exactly
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GeometricBackground } from '../../components/ui/GeometricBackground';
import { Text, Button } from '../../components/reusables';
import { PortfolioSummaryCard } from '../../components/PortfolioSummaryCard';
import { PerplexityInvestmentCard } from '../../components/PerplexityInvestmentCard';
import { PerplexityGrid } from '../../components/PerplexityGrid';
import { perplexityColors, perplexitySpacing } from '../../theme/perplexityTheme';
import { mockInvestments } from './utils/mockData';
import { convertInvestmentToAsset, REFRESH_CONTROL } from '../../utils';
import { showToast } from '../../utils/toast';

interface AssetsScreenFinalProps {
  navigation?: any;
}

export const AssetsScreenFinal: React.FC<AssetsScreenFinalProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [investments, setInvestments] = useState(mockInvestments);

  // Memoize filtered investments
  const filteredInvestments = useMemo(() => investments, [investments]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simulate refresh - in production, fetch new data here
      setInvestments(mockInvestments);
      showToast('Portfolio refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
      showToast('Failed to refresh portfolio');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Navigate to add investment screen
  const handleAddInvestment = useCallback(() => {
    if (navigation) {
      showToast('Add Investment - Coming Soon');
      // TODO: navigation.navigate('AddInvestment');
    }
  }, [navigation]);

  // Navigate to portfolio details
  const handlePortfolioPress = useCallback(() => {
    if (navigation) {
      showToast('Portfolio Details - Coming Soon');
      // TODO: navigation.navigate('PortfolioDetails');
    }
  }, [navigation]);

  // Navigate to asset detail
  const handleInvestmentPress = useCallback((investment: any) => {
    if (!navigation) return;
    
    try {
      const assetData = convertInvestmentToAsset(investment);
      navigation.navigate('AssetDetail', { asset: assetData });
    } catch (error) {
      console.error('Failed to convert investment to asset:', error);
      showToast('Failed to open investment details');
    }
  }, [navigation]);

  // Calculate portfolio stats (memoized)
  const portfolioStats = useMemo(() => {
    const totalValue = 1543151.0;
    const totalReturns = 125651.25;
    const todaysChange = 8245;
    const todaysChangePercent = 0.53;
    const totalReturnsPercent = 8.86;

    // TODO: Calculate from actual investment data when available
    return {
      portfolioValue: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      totalReturns: `+₹${totalReturns.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      totalReturnsPercent: `+${totalReturnsPercent}%`,
      todaysChange: `+₹${todaysChange.toLocaleString('en-IN')}`,
      todaysChangePercent: `+${todaysChangePercent}%`,
    };
  }, [filteredInvestments]);

  // Memoize investment groups
  const investmentGroups = useMemo(() => {
    return filteredInvestments.reduce<Array<typeof filteredInvestments>>((acc, _, index, array) => {
      if (index % 2 === 0) {
        acc.push(array.slice(index, index + 2));
      }
      return acc;
    }, []);
  }, [filteredInvestments]);

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={REFRESH_CONTROL.COLORS}
              progressBackgroundColor={REFRESH_CONTROL.BACKGROUND_COLOR}
              tintColor={REFRESH_CONTROL.COLORS[0]}
              titleColor={REFRESH_CONTROL.TITLE_COLOR}
            />
          }
        >
          {/* Portfolio Summary Card */}
          <View style={styles.section}>
            <PortfolioSummaryCard
              portfolioValue={portfolioStats.portfolioValue}
              totalReturns={portfolioStats.totalReturns}
              totalReturnsPercent={portfolioStats.totalReturnsPercent}
              todaysChange={portfolioStats.todaysChange}
              todaysChangePercent={portfolioStats.todaysChangePercent}
              isMarketOpen={false}
              onPress={handlePortfolioPress}
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
              onPress={handleAddInvestment}
              icon={<Icon name="add" size={18} color={perplexityColors.super} />}
              iconPosition="left"
              style={styles.addButton}
              accessibilityLabel="Add new investment"
              accessibilityHint="Opens the add investment screen"
            >
              <Text variant="body" color="text" weight="600" style={styles.addButtonText}>
                Add Investment
              </Text>
            </Button>
          </View>

          {/* Investment Cards Grid - Grouped in Pairs */}
          {filteredInvestments.length > 0 ? (
            <View style={styles.investmentsContainer}>
            {investmentGroups.map((group, groupIndex) => (
              <View key={`group-${groupIndex}`} style={styles.cardGroup}>
                {group.map((investment, cardIndex) => (
                  <React.Fragment key={investment.id}>
                    <PerplexityInvestmentCard
                      investment={investment}
                      onPress={() => handleInvestmentPress(investment)}
                    />
                    {cardIndex === 0 && group.length === 2 && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            ))}
            </View>
          ) : (
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
