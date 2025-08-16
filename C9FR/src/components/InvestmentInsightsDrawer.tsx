import React, { useRef, useContext, memo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Investment } from '../types';

interface InvestmentInsightsDrawerProps {
  visible: boolean;
  investment: Investment | null;
  onClose: () => void;
}

const InvestmentInsightsDrawer: React.FC<InvestmentInsightsDrawerProps> = ({
  visible,
  investment,
  onClose,
}) => {
  const { theme } = useContext(ThemeContext);
  const panY = useRef(new Animated.Value(1000)).current;

  const closeSheet = useCallback(() => {
    Animated.timing(panY, {
      toValue: 1000, // Animate off-screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [panY, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      // Decide quickly if we want to claim the gesture (down-swipe only)
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5 && g.vy > 0,
      // Ensure we receive the event even if a child (ScrollView) is involved
      onMoveShouldSetPanResponderCapture: (_, g) => g.dy > 5 && g.vy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150 || g.vy > 1.2) {
          closeSheet();
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  const openSheet = () => {
    // Reset position off-screen first
    panY.setValue(1000);
    // Run animation on next tick so Modal has mounted
    setTimeout(() => {
      Animated.timing(panY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 0);
  };

  React.useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible]);

  if (!investment) return null;

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.success;
    if (change < 0) return theme.error;
    return theme.textMuted;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      'low': theme.success,
      'medium': theme.warning,
      'high': theme.error,
    };
    return colorMap[riskLevel] || theme.textMuted;
  };

  const getRecommendationColor = (recommendation: string) => {
    const colorMap: Record<string, string> = {
      'buy': theme.success,
      'hold': theme.warning,
      'sell': theme.error,
    };
    return colorMap[recommendation] || theme.textMuted;
  };

  const getAssetTypeIcon = (assetType: string) => {
    const iconMap: Record<string, string> = {
      'stock': 'chart-line',
      'etf': 'chart-box',
      'mutual_fund': 'chart-pie',
      'crypto': 'currency-btc',
      'bond': 'certificate',
    };
    return iconMap[assetType] || 'chart-line';
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={closeSheet}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        {/* Backdrop – tap outside to close */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              backgroundColor: theme.card,
              transform: [{ translateY: panY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons 
                name={getAssetTypeIcon(investment.assetType)} 
                size={24} 
                color={theme.primary} 
                style={styles.headerIcon} 
              />
              <View style={styles.headerText}>
                <Text style={[styles.symbolText, { color: theme.textMuted }]}>
                  {investment.symbol} • {investment.exchange}
                </Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {investment.name}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={closeSheet} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Close investment insights drawer"
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Investment Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Current Price</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {formatCurrency(investment.currentPrice, investment.currency)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Daily Change</Text>
                <Text style={[styles.summaryValue, { color: getChangeColor(investment.dailyChange) }]}>
                  {formatCurrency(investment.dailyChange, investment.currency)} ({formatPercentage(investment.dailyChangePercent)})
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Holdings</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {investment.quantity.toLocaleString()} shares
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Value</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {formatCurrency(investment.totalValue, investment.currency)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total P&L</Text>
                <Text style={[styles.summaryValue, { color: getChangeColor(investment.totalGainLoss) }]}>
                  {formatCurrency(investment.totalGainLoss, investment.currency)} ({formatPercentage(investment.totalGainLossPercent)})
                </Text>
              </View>
            </View>

            {/* Investment Details Card */}
            <View style={[styles.detailsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.detailsHeader}>
                <MaterialCommunityIcons 
                  name="information" 
                  size={20} 
                  color={theme.primary} 
                />
                <Text style={[styles.detailsTitle, { color: theme.text }]}>
                  Investment Details
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Asset Type:
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {investment.assetType.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                  Average Purchase Price:
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatCurrency(investment.averagePurchasePrice, investment.currency)}
                </Text>
              </View>
              
              {investment.sector && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                    Sector:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {investment.sector}
                  </Text>
                </View>
              )}
              
              {investment.marketCap && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                    Market Cap:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatCurrency(investment.marketCap, investment.currency)}
                  </Text>
                </View>
              )}
              
              {investment.growthRate && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                    Growth Rate:
                  </Text>
                  <Text style={[styles.detailValue, { 
                    color: investment.growthRate > 0 ? '#22c55e' : investment.growthRate < 0 ? '#ef4444' : theme.text 
                  }]}>
                    {investment.growthRate.toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>

            {/* Risk & Recommendation */}
            <View style={styles.riskRecommendationContainer}>
              <View style={[styles.riskCard, { backgroundColor: getRiskLevelColor(investment.riskLevel) + '10', borderColor: getRiskLevelColor(investment.riskLevel) + '30' }]}>
                <MaterialCommunityIcons 
                  name="shield-alert" 
                  size={20} 
                  color={getRiskLevelColor(investment.riskLevel)} 
                />
                <View style={styles.riskContent}>
                  <Text style={[styles.riskTitle, { color: getRiskLevelColor(investment.riskLevel) }]}>
                    Risk Level: {investment.riskLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.recommendationCard, { backgroundColor: getRecommendationColor(investment.recommendation) + '10', borderColor: getRecommendationColor(investment.recommendation) + '30' }]}>
                <MaterialCommunityIcons 
                  name="thumb-up" 
                  size={20} 
                  color={getRecommendationColor(investment.recommendation)} 
                />
                <View style={styles.recommendationContent}>
                  <Text style={[styles.recommendationTitle, { color: getRecommendationColor(investment.recommendation) }]}>
                    Recommendation: {investment.recommendation.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* AI Analysis */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Analysis</Text>
              <Text style={[styles.analysisText, { color: theme.text }]}>
                {investment.aiAnalysis}
              </Text>
            </View>

            {/* Market Insights */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Market Insights</Text>
              <View style={[styles.insightCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                <MaterialCommunityIcons 
                  name="chart-timeline-variant" 
                  size={20} 
                  color={theme.primary} 
                />
                <View style={styles.insightContent}>
                  <Text style={[styles.insightText, { color: theme.text }]}>
                    Based on recent market trends and your investment profile, this asset shows {investment.totalGainLossPercent >= 0 ? 'positive' : 'negative'} performance. 
                    Consider your risk tolerance and investment timeline when making decisions.
                  </Text>
                </View>
              </View>
            </View>

            {/* Last Updated */}
            <View style={[styles.section, styles.lastSection]}>
              <View style={styles.lastUpdatedContainer}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.textMuted} />
                <Text style={[styles.lastUpdatedText, { color: theme.textMuted }]}>
                  Last updated: {new Date(investment.lastUpdated).toLocaleString()}
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    height: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  detailsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  riskRecommendationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  riskCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskContent: {
    marginLeft: 8,
    flex: 1,
  },
  riskTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  recommendationContent: {
    marginLeft: 8,
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default memo(InvestmentInsightsDrawer);