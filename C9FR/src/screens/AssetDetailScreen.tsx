/**
 * AssetDetailScreen - Perplexity Finance Design
 * 
 * Displays detailed information about a specific asset with chart and financial profile
 * Enhanced with performance optimizations and best practices
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Asset, TradableAsset } from '../types';
import { Text } from '../components/reusables';
import { GeometricBackground } from '../components/ui/GeometricBackground';
import { perplexityColors, perplexitySpacing } from '../theme/perplexityTheme';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  formatCurrency,
  formatCompact,
  formatTimestamp,
  formatDate,
  formatChangeWithArrow,
  formatPercentage,
  isTradableAsset,
  validateAsset,
  calculate52WeekRange,
  calculateDayRange,
  TIMEFRAMES,
  ASSET_DETAIL_TABS,
  DEFAULT_FINANCIAL_VALUES,
  TimeFrame,
  AssetDetailTab,
} from '../utils';

interface AssetDetailScreenProps {
  route: RouteProp<RootStackParamList, 'AssetDetail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssetDetail'>;
}

const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({ route, navigation }) => {
  const { asset } = route.params;
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1D');
  const [activeTab, setActiveTab] = useState<AssetDetailTab>('Overview');
  const [imageError, setImageError] = useState(false);

  // Validate asset data
  if (!validateAsset(asset)) {
    console.error('Invalid asset data received');
    navigation.goBack();
    return null;
  }

  // Type guard with useMemo for performance
  const tradableAsset = useMemo(() => isTradableAsset(asset) ? asset : null, [asset]);

  // Navigation handler
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Tab and timeframe handlers
  const handleTabChange = useCallback((tab: AssetDetailTab) => {
    setActiveTab(tab);
  }, []);

  const handleTimeframeChange = useCallback((timeframe: TimeFrame) => {
    setSelectedTimeframe(timeframe);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Memoized calculations
  const yearRange = useMemo(() => calculate52WeekRange(asset.totalValue), [asset.totalValue]);
  const dayRange = useMemo(() => {
    const currentPrice = tradableAsset?.currentPrice || asset.totalValue;
    return calculateDayRange(currentPrice);
  }, [tradableAsset?.currentPrice, asset.totalValue]);

  const isPositive = asset.totalGainLoss >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#191a1a" />
      
      <View style={styles.container}>
        <GeometricBackground opacity={0.05} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigate back to assets list"
          >
            <Icon name="arrow-back" size={24} color={perplexityColors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            {tradableAsset?.logoUrl && !imageError ? (
              <Image
                source={{ uri: tradableAsset.logoUrl }}
                style={styles.headerLogo}
                onError={handleImageError}
                accessibilityLabel={`${asset.name} logo`}
              />
            ) : (
              <View style={[styles.headerLogo, styles.logoPlaceholder]}>
                <Icon name="business" size={16} color={perplexityColors.quiet} />
              </View>
            )}
            <Text variant="heading3" color="foreground" weight="700" style={styles.headerTitle}>
              {asset.name}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              {ASSET_DETAIL_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => handleTabChange(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === tab }}
                  accessibilityLabel={`${tab} tab`}
                >
                  <Text
                    variant="body"
                    color={activeTab === tab ? 'super' : 'quiet'}
                    weight="600"
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text variant="heading1" color="foreground" weight="700" style={styles.price}>
              {formatCurrency(tradableAsset?.currentPrice || asset.totalValue, tradableAsset?.currency)}
            </Text>
            <View style={styles.changeRow}>
              <Text
                variant="body"
                weight="600"
                style={[styles.change, { color: isPositive ? perplexityColors.success : perplexityColors.danger }]}
              >
                {formatChangeWithArrow(asset.totalGainLoss, tradableAsset?.currency)}
              </Text>
              <Text
                variant="body"
                weight="600"
                style={{ color: isPositive ? perplexityColors.success : perplexityColors.danger }}
              >
                {formatPercentage(asset.totalGainLossPercent)}
              </Text>
            </View>
            <Text variant="bodySmall" color="quieter" style={styles.timestamp}>
              At close: {formatTimestamp(asset.lastUpdated)}
            </Text>
          </View>

          {/* Chart Placeholder */}
          <View style={styles.chartContainer}>
            {/* Timeframe Selector */}
            <View style={styles.timeframeSelector}>
              {TIMEFRAMES.map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === tf && styles.timeframeButtonActive,
                  ]}
                  onPress={() => handleTimeframeChange(tf)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedTimeframe === tf }}
                  accessibilityLabel={`${tf} timeframe`}
                >
                  <Text
                    variant="bodySmall"
                    color={selectedTimeframe === tf ? 'foreground' : 'quiet'}
                    weight="600"
                  >
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chart Display Area */}
            <View style={styles.chartDisplay}>
              <View style={styles.chartPlaceholder}>
                {/* Simulated chart line */}
                <View style={[styles.chartLine, { backgroundColor: isPositive ? perplexityColors.success : perplexityColors.danger }]} />
                <Text variant="bodySmall" color="quieter" style={styles.chartLabel}>
                  Chart visualization
                </Text>
              </View>
            </View>

            {/* Chart Stats */}
            <View style={styles.chartStats}>
              <View style={styles.chartStat}>
                <Text variant="bodySmall" color="quieter">
                  {formatChangeWithArrow(asset.totalGainLoss, tradableAsset?.currency)}
                </Text>
              </View>
              <View style={styles.chartStat}>
                <Text variant="bodySmall" color="quieter">
                  Prev close: {formatCurrency(tradableAsset?.averagePurchasePrice || asset.totalValue, tradableAsset?.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Financial Profile */}
          <View style={styles.section}>
            <Text variant="heading3" color="foreground" weight="700" style={styles.sectionTitle}>
              Financial Profile
            </Text>

            <View style={styles.profileGrid}>
              <View style={styles.profileRow}>
                <View style={styles.profileItem}>
                  <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                    Prev Close
                  </Text>
                  <Text variant="body" color="foreground" weight="600">
                    {formatCurrency(tradableAsset?.averagePurchasePrice || asset.totalValue, tradableAsset?.currency)}
                  </Text>
                </View>
                <View style={styles.profileItem}>
                  <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                    52W Range
                  </Text>
                  <Text variant="body" color="foreground" weight="600">
                    {formatCompact(yearRange.low)} - {formatCompact(yearRange.high)}
                  </Text>
                </View>
              </View>

              <View style={styles.profileRow}>
                <View style={styles.profileItem}>
                  <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                    Market Cap
                  </Text>
                  <Text variant="body" color="foreground" weight="600">
                    {formatCompact(tradableAsset?.marketCap || asset.totalValue * 1000)}
                  </Text>
                </View>
                <View style={styles.profileItem}>
                  <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                    Open
                  </Text>
                  <Text variant="body" color="foreground" weight="600">
                    {formatCurrency(tradableAsset?.currentPrice || asset.totalValue, tradableAsset?.currency)}
                  </Text>
                </View>
              </View>

              {tradableAsset && (
                <>
                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                        P/E Ratio
                      </Text>
                      <Text variant="body" color="foreground" weight="600">
                        {tradableAsset.peRatio?.toFixed(2) || DEFAULT_FINANCIAL_VALUES.PE_RATIO}
                      </Text>
                    </View>
                    <View style={styles.profileItem}>
                      <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                        Dividend Yield
                      </Text>
                      <Text variant="body" color="foreground" weight="600">
                        {tradableAsset.growthRate?.toFixed(2) || DEFAULT_FINANCIAL_VALUES.DIVIDEND_YIELD}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                        Day Range
                      </Text>
                      <Text variant="body" color="foreground" weight="600">
                        {formatCurrency(dayRange.low, tradableAsset.currency)} - {formatCurrency(dayRange.high, tradableAsset.currency)}
                      </Text>
                    </View>
                    <View style={styles.profileItem}>
                      <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                        Volume
                      </Text>
                      <Text variant="body" color="foreground" weight="600">
                        {tradableAsset.volume || DEFAULT_FINANCIAL_VALUES.VOLUME}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileRow}>
                    <View style={styles.profileItem}>
                      <Text variant="bodySmall" color="quiet" style={styles.profileLabel}>
                        EPS
                      </Text>
                      <Text variant="body" color="foreground" weight="600">
                        ₹{DEFAULT_FINANCIAL_VALUES.EPS}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* AI Analysis */}
          {asset.aiAnalysis && (
            <View style={styles.section}>
              <Text variant="heading3" color="foreground" weight="700" style={styles.sectionTitle}>
                AI Insights
              </Text>
              <View style={styles.aiCard}>
                <Icon name="lightbulb-outline" size={20} color={perplexityColors.super} style={styles.aiIcon} />
                <Text variant="body" color="text" style={styles.aiText}>
                  {asset.aiAnalysis}
                </Text>
              </View>
            </View>
          )}

          {/* Latest News Section */}
          <View style={styles.section}>
            <Text variant="heading3" color="foreground" weight="700" style={styles.sectionTitle}>
              Latest News
            </Text>
            <View style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <Icon name="article" size={32} color={perplexityColors.danger} style={styles.newsIcon} />
                <View style={styles.newsContent}>
                  <Text variant="body" color="foreground" weight="600" numberOfLines={2}>
                    Market Update: {asset.name} Performance Analysis
                  </Text>
                  <View style={styles.newsFooter}>
                    <Icon name="schedule" size={14} color={perplexityColors.quieter} />
                    <Text variant="bodySmall" color="quieter" style={styles.newsDate}>
                      {formatDate(asset.lastUpdated)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: perplexitySpacing.lg,
    paddingVertical: perplexitySpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: perplexityColors.border,
  },
  backButton: {
    padding: perplexitySpacing.sm,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: perplexitySpacing.sm,
  },
  headerLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  logoPlaceholder: {
    backgroundColor: perplexityColors.subtler,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: perplexityColors.border,
  },
  tabs: {
    paddingHorizontal: perplexitySpacing.lg,
    gap: perplexitySpacing.xl,
  },
  tab: {
    paddingVertical: perplexitySpacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: perplexityColors.super,
  },
  priceSection: {
    paddingHorizontal: perplexitySpacing.lg,
    paddingVertical: perplexitySpacing.xl,
  },
  price: {
    fontSize: 36,
    marginBottom: perplexitySpacing.xs,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: perplexitySpacing.sm,
    marginBottom: perplexitySpacing.xs,
  },
  change: {
    fontSize: 16,
  },
  timestamp: {
    marginTop: perplexitySpacing.xs,
  },
  chartContainer: {
    paddingHorizontal: perplexitySpacing.lg,
    paddingVertical: perplexitySpacing.md,
  },
  timeframeSelector: {
    flexDirection: 'row',
    gap: perplexitySpacing.sm,
    marginBottom: perplexitySpacing.lg,
  },
  timeframeButton: {
    paddingHorizontal: perplexitySpacing.md,
    paddingVertical: perplexitySpacing.sm,
    borderRadius: 6,
    backgroundColor: perplexityColors.subtler,
  },
  timeframeButtonActive: {
    backgroundColor: perplexityColors.border,
  },
  chartDisplay: {
    height: 200,
    marginBottom: perplexitySpacing.md,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: perplexityColors.subtler,
    borderRadius: 12,
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 80,
    opacity: 0.3,
    borderRadius: 4,
  },
  chartLabel: {
    marginTop: perplexitySpacing.md,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartStat: {
    flex: 1,
  },
  section: {
    paddingHorizontal: perplexitySpacing.lg,
    paddingVertical: perplexitySpacing.xl,
    borderTopWidth: 1,
    borderTopColor: perplexityColors.border,
  },
  sectionTitle: {
    marginBottom: perplexitySpacing.lg,
  },
  profileGrid: {
    gap: perplexitySpacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    gap: perplexitySpacing.lg,
  },
  profileItem: {
    flex: 1,
  },
  profileLabel: {
    marginBottom: perplexitySpacing.xs,
  },
  aiCard: {
    flexDirection: 'row',
    backgroundColor: perplexityColors.subtler,
    borderRadius: 12,
    padding: perplexitySpacing.lg,
    borderWidth: 1,
    borderColor: perplexityColors.border,
  },
  aiIcon: {
    marginRight: perplexitySpacing.md,
    marginTop: 2,
  },
  aiText: {
    flex: 1,
    lineHeight: 22,
  },
  newsCard: {
    backgroundColor: perplexityColors.subtler,
    borderRadius: 12,
    padding: perplexitySpacing.lg,
    borderWidth: 1,
    borderColor: perplexityColors.border,
  },
  newsHeader: {
    flexDirection: 'row',
    gap: perplexitySpacing.md,
  },
  newsIcon: {
    marginTop: 4,
  },
  newsContent: {
    flex: 1,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: perplexitySpacing.xs,
    marginTop: perplexitySpacing.sm,
  },
  newsDate: {
    marginLeft: perplexitySpacing.xs,
  },
  footer: {
    height: perplexitySpacing['4xl'],
  },
});

// Memoize component to prevent unnecessary re-renders
export default React.memo(AssetDetailScreen);
