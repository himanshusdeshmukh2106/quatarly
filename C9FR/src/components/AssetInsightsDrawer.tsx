import React, { useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../context/ThemeContext';
import { Asset, TradableAsset } from '../types';

interface AssetInsightsDrawerProps {
  visible: boolean;
  asset: Asset | null;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');
const DRAWER_HEIGHT = screenHeight * 0.8;

export const AssetInsightsDrawer: React.FC<AssetInsightsDrawerProps> = ({
  visible,
  asset,
  onClose,
}) => {
  const { theme } = useContext(ThemeContext);
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeDrawer();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openDrawer = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: DRAWER_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      openDrawer();
    } else {
      translateY.setValue(DRAWER_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible, openDrawer, translateY, opacity]);

  const formatCurrency = (amount: number, currency?: string) => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString()}`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#10B981';
    if (value < 0) return '#EF4444';
    return '#6B7280';
  };

  const renderAssetSummary = () => {
    if (!asset) return null;

    const isTradeable = ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
    // const isPhysical = ['gold', 'silver', 'commodity'].includes(asset.assetType);

    return (
      <View style={[styles.summarySection, { backgroundColor: theme.cardElevated }]}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.assetName, { color: theme.text }]}>{asset.name}</Text>
          {isTradeable && (
            <Text style={[styles.assetSymbol, { color: theme.textMuted }]}>
              {(asset as TradableAsset).symbol}
            </Text>
          )}
        </View>

        <View style={styles.summaryMetrics}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Current Value</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>
              {formatCurrency(asset.totalValue, isTradeable ? (asset as TradableAsset).currency : undefined)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Total P&L</Text>
            <Text style={[
              styles.metricValue,
              { color: getPerformanceColor(asset.totalGainLoss) }
            ]}>
              {formatCurrency(asset.totalGainLoss, isTradeable ? (asset as TradableAsset).currency : undefined)}
            </Text>
            <Text style={[
              styles.metricSubValue,
              { color: getPerformanceColor(asset.totalGainLoss) }
            ]}>
              {formatPercentage(asset.totalGainLossPercent)}
            </Text>
          </View>

          {isTradeable && (
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Daily Change</Text>
              <Text style={[
                styles.metricValue,
                { color: getPerformanceColor((asset as TradableAsset).dailyChange) }
              ]}>
                {formatCurrency((asset as TradableAsset).dailyChange, (asset as TradableAsset).currency)}
              </Text>
              <Text style={[
                styles.metricSubValue,
                { color: getPerformanceColor((asset as TradableAsset).dailyChange) }
              ]}>
                {formatPercentage((asset as TradableAsset).dailyChangePercent)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAIInsights = () => {
    if (!asset) return null;

    return (
      <View style={styles.insightsSection}>
        <View style={styles.sectionHeader}>
          <Icon name="psychology" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Analysis</Text>
        </View>

        <View style={[styles.insightCard, { backgroundColor: theme.cardElevated }]}>
          <Text style={[styles.insightText, { color: theme.text }]}>
            {asset.aiAnalysis}
          </Text>
        </View>

        <View style={styles.recommendationContainer}>
          <View style={[
            styles.recommendationBadge,
            { backgroundColor: getRecommendationColor(asset.recommendation) }
          ]}>
            <Icon 
              name={getRecommendationIcon(asset.recommendation)} 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.recommendationText}>
              {asset.recommendation.toUpperCase()}
            </Text>
          </View>

          <View style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(asset.riskLevel) }
          ]}>
            <Text style={styles.riskText}>
              {asset.riskLevel.toUpperCase()} RISK
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMarketInsights = () => {
    if (!asset || !['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType)) return null;

    const tradableAsset = asset as TradableAsset;

    return (
      <View style={styles.marketSection}>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Market Insights</Text>
        </View>

        <View style={[styles.marketCard, { backgroundColor: theme.cardElevated }]}>
          <View style={styles.marketMetrics}>
            <View style={styles.marketMetric}>
              <Text style={[styles.marketMetricLabel, { color: theme.textMuted }]}>
                Current Price
              </Text>
              <Text style={[styles.marketMetricValue, { color: theme.text }]}>
                {formatCurrency(tradableAsset.currentPrice, tradableAsset.currency)}
              </Text>
            </View>

            <View style={styles.marketMetric}>
              <Text style={[styles.marketMetricLabel, { color: theme.textMuted }]}>
                Avg Purchase Price
              </Text>
              <Text style={[styles.marketMetricValue, { color: theme.text }]}>
                {formatCurrency(tradableAsset.averagePurchasePrice, tradableAsset.currency)}
              </Text>
            </View>

            {tradableAsset.sector && (
              <View style={styles.marketMetric}>
                <Text style={[styles.marketMetricLabel, { color: theme.textMuted }]}>
                  Sector
                </Text>
                <Text style={[styles.marketMetricValue, { color: theme.text }]}>
                  {tradableAsset.sector}
                </Text>
              </View>
            )}

            {tradableAsset.marketCap && (
              <View style={styles.marketMetric}>
                <Text style={[styles.marketMetricLabel, { color: theme.textMuted }]}>
                  Market Cap
                </Text>
                <Text style={[styles.marketMetricValue, { color: theme.text }]}>
                  {formatCurrency(tradableAsset.marketCap, tradableAsset.currency)}
                </Text>
              </View>
            )}

            {tradableAsset.growthRate && (
              <View style={styles.marketMetric}>
                <Text style={[styles.marketMetricLabel, { color: theme.textMuted }]}>
                  Growth Rate
                </Text>
                <Text style={[styles.marketMetricValue, { 
                  color: tradableAsset.growthRate > 0 ? '#22c55e' : tradableAsset.growthRate < 0 ? '#ef4444' : theme.text 
                }]}>
                  {tradableAsset.growthRate.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPersonalizedRecommendations = () => {
    if (!asset) return null;

    const recommendations = [
      {
        icon: 'lightbulb',
        title: 'Portfolio Diversification',
        description: `Consider adding more ${asset.assetType === 'stock' ? 'bonds or ETFs' : 'stocks'} to balance your portfolio risk.`,
      },
      {
        icon: 'schedule',
        title: 'Rebalancing Suggestion',
        description: 'Based on your risk profile, consider rebalancing this position if it exceeds 10% of your total portfolio.',
      },
      {
        icon: 'trending-up',
        title: 'Performance Alert',
        description: asset.totalGainLoss > 0 
          ? 'This asset is performing well. Consider taking partial profits if it aligns with your strategy.'
          : 'This asset is underperforming. Review your investment thesis and consider your options.',
      },
    ];

    return (
      <View style={styles.recommendationsSection}>
        <View style={styles.sectionHeader}>
          <Icon name="recommend" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personalized Recommendations</Text>
        </View>

        {recommendations.map((rec, index) => (
          <View key={index} style={[styles.recommendationCard, { backgroundColor: theme.cardElevated }]}>
            <View style={styles.recommendationHeader}>
              <Icon name={rec.icon} size={20} color={theme.primary} />
              <Text style={[styles.recommendationTitle, { color: theme.text }]}>
                {rec.title}
              </Text>
            </View>
            <Text style={[styles.recommendationDescription, { color: theme.textMuted }]}>
              {rec.description}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const getRecommendationColor = (recommendation: string) => {
    const colorMap: Record<string, string> = {
      buy: '#10B981',
      hold: '#F59E0B',
      sell: '#EF4444',
      monitor: '#6B7280',
    };
    return colorMap[recommendation] || '#6B7280';
  };

  const getRecommendationIcon = (recommendation: string) => {
    const iconMap: Record<string, string> = {
      buy: 'trending-up',
      hold: 'pause',
      sell: 'trending-down',
      monitor: 'visibility',
    };
    return iconMap[recommendation] || 'help';
  };

  const getRiskColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
    };
    return colorMap[riskLevel] || '#6B7280';
  };

  if (!visible || !asset) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
        
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: theme.background,
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
          accessible={true}
          accessibilityLabel={`${asset?.name} insights drawer`}
          accessibilityHint="Swipe down to close, or use the close button"
          accessibilityViewIsModal={true}
        >
          <View style={styles.handle} />
          
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Asset Insights</Text>
            <TouchableOpacity 
              onPress={closeDrawer} 
              style={[styles.closeButton, { backgroundColor: theme.cardElevated }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close insights"
              accessibilityHint="Close the asset insights drawer"
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {renderAssetSummary()}
            {renderAIInsights()}
            {renderMarketInsights()}
            {renderPersonalizedRecommendations()}
            
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textMuted }]}>
                Last updated: {new Date(asset.lastUpdated).toLocaleString()}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    height: DRAWER_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summarySection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  assetName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricSubValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
  },
  recommendationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  riskBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  marketSection: {
    marginBottom: 24,
  },
  marketCard: {
    borderRadius: 12,
    padding: 16,
  },
  marketMetrics: {
    gap: 12,
  },
  marketMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketMetricLabel: {
    fontSize: 14,
  },
  marketMetricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
  },
});

export default AssetInsightsDrawer;