/**
 * AssetDetailScreen - Perplexity Finance Design
 * 
 * Displays detailed information about a specific asset with chart and financial profile
 * Enhanced with performance optimizations and best practices
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../components/reusables';
import { GeometricBackground } from '../components/ui/GeometricBackground';
import { perplexityColors, perplexitySpacing } from '../theme/perplexityTheme';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  formatCurrency,
  formatCompact,
  formatTimestamp,
  formatDate,
  formatPercentage,
  isTradableAsset,
  validateAsset,
  calculate52WeekRange,
  calculateDayRange,
  DEFAULT_FINANCIAL_VALUES,
} from '../utils';

interface AssetDetailScreenProps {
  route: RouteProp<RootStackParamList, 'AssetDetail'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssetDetail'>;
}

const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({ route, navigation }) => {
  const { asset } = route.params;
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

  // Timeframe controls removed

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
  const absChangeText = `${isPositive ? '+' : '-'}${formatCurrency(Math.abs(asset.totalGainLoss), tradableAsset?.currency)}`;
  const percentText = formatPercentage(asset.totalGainLossPercent).replace(/^[+-]/, '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.container}>
        <GeometricBackground opacity={0.18} />

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
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Tabs removed as requested */}

          {/* Price Section */}
          <View style={styles.priceSection}>
            {/* Company branding row */}
            <View style={styles.brandRow}>
              {tradableAsset?.logoUrl && !imageError ? (
                <Image
                  source={{ uri: tradableAsset.logoUrl }}
                  style={styles.brandLogo}
                  onError={handleImageError}
                  accessibilityLabel={`${asset.name} logo`}
                />
              ) : (
                <View style={[styles.brandLogo, styles.brandLogoPlaceholder]}>
                  <Icon name="business" size={16} color={perplexityColors.quiet} />
                </View>
              )}
              <Text variant="heading2" color="foreground" weight="700" style={styles.brandName}>
                {asset.name}
              </Text>
            </View>
            {/* Price summary card */}
            <View style={styles.priceSummaryCard}>
              <View style={styles.priceSummaryRow}>
                <Text
                  variant="heading3"
                  color="foreground"
                  weight="700"
                  style={styles.priceSummaryPrice}
                >
                  {formatCurrency(tradableAsset?.currentPrice || asset.totalValue, tradableAsset?.currency)}
                </Text>
                <Text
                  variant="body"
                  weight="600"
                  style={styles.priceSummaryChange}
                  numberOfLines={1}
                >
                  {absChangeText}
                </Text>
                <View style={styles.priceSummaryPercentContainer}>
                  <Icon
                    name={isPositive ? 'arrow-upward' : 'arrow-downward'}
                    size={16}
                    color={isPositive ? perplexityColors.success : perplexityColors.danger}
                    style={[
                      styles.priceSummaryArrow,
                      { transform: [{ rotate: isPositive ? '45deg' : '-45deg' }] },
                    ]}
                  />
                  <Text
                    variant="body"
                    weight="700"
                    style={[styles.priceSummaryPercent, { color: isPositive ? perplexityColors.success : perplexityColors.danger }]}
                    numberOfLines={1}
                  >
                    {percentText}
                  </Text>
                </View>
              </View>
              <Text variant="bodySmall" color="quieter" style={styles.priceSummaryTimestamp}>
                At close: {formatTimestamp(asset.lastUpdated)}
              </Text>
            </View>
            {/* Removed duplicate large price/change row and moved timestamp into the card */}
          </View>

          {/* Chart Card */}
          <View style={styles.chartContainer}>
            <View style={styles.chartCard}>
              {/* Chart Display Area with 7x3 grid (internal dividing lines only) and mock line */}
              <View style={styles.chartDisplay}>
                <Svg width="100%" height="100%" viewBox="0 0 350 270" preserveAspectRatio="none">
                  {/* Grid: 7 columns x 3 rows (including outer edges to touch all sides) */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Line key={`v-${i}`} x1={i * (350 / 7)} y1={0} x2={i * (350 / 7)} y2={270} stroke={perplexityColors.border} strokeOpacity={0.6} strokeWidth={1} />
                  ))}
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Line key={`h-${j}`} x1={0} y1={j * (270 / 3)} x2={350} y2={j * (270 / 3)} stroke={perplexityColors.border} strokeOpacity={0.6} strokeWidth={1} />
                  ))}

                  {/* Mock chart line */}
                  <Path
                    d="M 0 210 L 50 190 L 100 160 L 150 180 L 200 140 L 250 160 L 300 120 L 350 140"
                    stroke={isPositive ? perplexityColors.success : perplexityColors.danger}
                    strokeWidth={2}
                    fill="none"
                    strokeOpacity={0.9}
                  />
                </Svg>
                {/* Date label overlay */}
                <View style={styles.chartOverlay} pointerEvents="none">
                  <Text variant="bodySmall" color="quiet" weight="600">
                    Date: {formatDate(asset.lastUpdated)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Financial Profile replaced with 3x3 table */}
          <View style={styles.section}>
            <View style={styles.tableCard}>
              {/* Connected grid overlay with rounded corners */}
              <View style={styles.tableGridOverlay} pointerEvents="none">
                <View style={styles.gridCols}>
                  <View style={styles.gridCol} />
                  <View style={[styles.gridCol, styles.gridColDivider]} />
                  <View style={[styles.gridCol, styles.gridColDivider]} />
                </View>
                <View style={styles.gridRows}>
                  <View style={styles.gridRow} />
                  <View style={[styles.gridRow, styles.gridRowDivider]} />
                  <View style={[styles.gridRow, styles.gridRowDivider]} />
                </View>
              </View>
              {/* Row 1 */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell]}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>Previous Close</Text>
                  <Text variant="body" color="foreground" weight="600" style={[styles.tableValue, styles.prevCloseValueSmall]}>
                    {formatCurrency(tradableAsset?.averagePurchasePrice || asset.totalValue, tradableAsset?.currency)}
                  </Text>
                </View>
                <View style={[styles.tableCell]}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>52W Range</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {formatCompact(yearRange.low)} - {formatCompact(yearRange.high)}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>Market Cap</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {formatCompact(tradableAsset?.marketCap || asset.totalValue * 1000)}
                  </Text>
                </View>
              </View>

              {/* Row 2 */}
              <View style={[styles.tableRow]}>
                <View style={[styles.tableCell]}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>Open</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {formatCurrency(tradableAsset?.currentPrice || asset.totalValue, tradableAsset?.currency)}
                  </Text>
                </View>
                <View style={[styles.tableCell]}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>P/E Ratio</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {tradableAsset?.peRatio?.toFixed(2) || DEFAULT_FINANCIAL_VALUES.PE_RATIO}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>Dividend Yield</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {(tradableAsset?.growthRate?.toFixed(2) || DEFAULT_FINANCIAL_VALUES.DIVIDEND_YIELD) + '%'}
                  </Text>
                </View>
              </View>

              {/* Row 3 */}
              <View style={[styles.tableRow]}>
                <View style={[styles.tableCell]}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>Day Range</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {formatCurrency(dayRange.low, tradableAsset?.currency)} - {formatCurrency(dayRange.high, tradableAsset?.currency)}
                  </Text>
                </View>
                <View style={[styles.tableCell]}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>Volume</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    {tradableAsset?.volume || DEFAULT_FINANCIAL_VALUES.VOLUME}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text variant="bodySmall" color="quiet" style={styles.tableLabel}>EPS</Text>
                  <Text variant="body" color="foreground" weight="600" style={styles.tableValue}>
                    ₹{DEFAULT_FINANCIAL_VALUES.EPS}
                  </Text>
                </View>
              </View>
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
  companyName: {
    marginBottom: perplexitySpacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: perplexitySpacing.sm,
    marginBottom: perplexitySpacing.xs,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  brandLogoPlaceholder: {
    backgroundColor: perplexityColors.subtler,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    // slightly larger and brighter via variant+color; extra spacing if needed
  },
  priceSummaryCard: {
    alignSelf: 'flex-start',
    width: '75%',
    backgroundColor: '#1f2121',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: perplexityColors.borderSubtle,
    marginBottom: perplexitySpacing.sm,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: perplexitySpacing.md,
    paddingVertical: perplexitySpacing.sm,
    gap: perplexitySpacing.sm,
  },
  priceSummaryPrice: {
    fontSize: 28,
    flexShrink: 0,
  },
  priceSummaryChange: {
    fontSize: 16,
    color: perplexityColors.quiet,
    flexGrow: 1,
    flexBasis: 0,
    flexShrink: 1,
    textAlign: 'center',
    marginHorizontal: perplexitySpacing.xs,
  },
  priceSummaryPercent: {
    fontSize: 16,
    flexShrink: 0,
  },
  priceSummaryPercentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: perplexitySpacing.xs,
    flexShrink: 0,
    minWidth: 72,
  },
  priceSummaryArrow: {
    marginRight: perplexitySpacing.xs,
  },
  priceSummaryTimestamp: {
    paddingHorizontal: perplexitySpacing.md,
    paddingBottom: perplexitySpacing.xs,
    paddingTop: 0,
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
    paddingTop: perplexitySpacing.xl,
    paddingBottom: 0,
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
    paddingTop: 0,
    paddingBottom: perplexitySpacing.md,
  },
  chartCard: {
    backgroundColor: '#1f2121',
    borderRadius: 14,
    borderWidth: 0,
    overflow: 'hidden',
    padding: 0,
  },
  tableCard: {
    backgroundColor: '#191a1a',
    borderRadius: 14,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 1.5,
    borderColor: perplexityColors.border,
    borderStyle: 'solid',
    position: 'relative',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tableRowBorderTop: {
    borderTopWidth: 1.5,
    borderTopColor: perplexityColors.border,
  },
  tableCell: {
    flex: 1,
    paddingVertical: perplexitySpacing.sm,
    paddingHorizontal: perplexitySpacing.sm,
    backgroundColor: 'transparent',
  },
  tableCellRightBorder: {
    borderRightWidth: 1.5,
    borderRightColor: perplexityColors.border,
  },
  tableLabel: {
    marginBottom: 2,
  },
  tableValue: {
    fontWeight: '700',
    fontSize: 13.6,
  },
  prevCloseValueSmall: {
    fontSize: 13.6,
  },
  tableGridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridCols: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  gridCol: {
    flex: 1,
  },
  gridColDivider: {
    borderLeftWidth: 1.5,
    borderLeftColor: perplexityColors.border,
  },
  gridRows: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  gridRow: {
    flex: 1,
  },
  gridRowDivider: {
    borderTopWidth: 1.5,
    borderTopColor: perplexityColors.border,
  },
  chartDisplay: {
    height: 300,
    marginBottom: perplexitySpacing.md,
    backgroundColor: 'transparent',
  },
  chartOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
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