import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { TradableAsset } from '../types';
import { useStyles } from '../hooks/useStyles';

interface TradableAssetCardProps {
  asset: TradableAsset;
  onPress?: (asset: TradableAsset) => void;
  onLongPress?: (asset: TradableAsset) => void;
  onInsightsPress?: (asset: TradableAsset) => void;
  style?: any;
  testID?: string;
}

export const TradableAssetCard: React.FC<TradableAssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  onInsightsPress,
  style,
  testID,
}) => {
  const styles = useStyles((theme) => ({
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    logoFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    logoText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    headerInfo: {
      flex: 1,
    },
    symbol: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },
    name: {
      fontSize: 14,
      color: theme.textMuted,
    },
    sector: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    badges: {
      flexDirection: 'row',
      gap: 8,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    badgeBuy: {
      backgroundColor: theme.success + '20',
    },
    badgeHold: {
      backgroundColor: theme.warning + '20',
    },
    badgeSell: {
      backgroundColor: theme.error + '20',
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    badgeTextBuy: {
      color: theme.success,
    },
    badgeTextHold: {
      color: theme.warning,
    },
    badgeTextSell: {
      color: theme.error,
    },
    riskBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: theme.textMuted + '20',
    },
    riskText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.textMuted,
    },
    content: {
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: {
      fontSize: 13,
      color: theme.textMuted,
    },
    value: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    totalValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    quantity: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 12,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    metric: {
      flex: 1,
    },
    metricLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    positive: {
      color: theme.success,
    },
    negative: {
      color: theme.error,
    },
    neutral: {
      color: theme.textMuted,
    },
    insightsButton: {
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.primary + '10',
      borderRadius: 8,
      alignItems: 'center',
    },
    insightsButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.primary,
    },
  }));

  // Format currency with thousands separators
  const formatCurrency = useCallback((amount: number, currency?: string): string => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (currency === 'USD') {
      return `$${formatted}`;
    }
    return `₹${formatted}`;
  }, []);

  // Format change with sign and percentage
  const formatChange = useCallback((amount: number, percent: number, currency?: string): string => {
    const sign = amount >= 0 ? '+' : '';
    const currencySymbol = currency === 'USD' ? '$' : '₹';
    return `${currencySymbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${sign}${percent.toFixed(2)}%)`;
  }, []);

  // Get color based on value
  const getValueColor = useCallback((value: number) => {
    if (value > 0) return styles.positive;
    if (value < 0) return styles.negative;
    return styles.neutral;
  }, [styles]);

  // Event handlers with useCallback
  const handlePress = useCallback(() => {
    onPress?.(asset);
  }, [onPress, asset]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(asset);
  }, [onLongPress, asset]);

  const handleInsightsPress = useCallback(() => {
    onInsightsPress?.(asset);
  }, [onInsightsPress, asset]);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={`${asset.name} stock card`}
      accessibilityHint="Double tap to view stock details, long press for options"
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {asset.logoUrl ? (
            <Image source={{ uri: asset.logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoText}>{asset.symbol?.substring(0, 2) || 'AS'}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.symbol}>{asset.symbol}</Text>
            <Text style={styles.name}>{asset.name}</Text>
            {asset.sector && <Text style={styles.sector}>{asset.sector}</Text>}
          </View>
        </View>
        <View style={styles.badges}>
          {asset.recommendation && (
            <View style={[
              styles.badge,
              asset.recommendation === 'buy' ? styles.badgeBuy :
              asset.recommendation === 'hold' ? styles.badgeHold :
              styles.badgeSell
            ]}>
              <Text style={[
                styles.badgeText,
                asset.recommendation === 'buy' ? styles.badgeTextBuy :
                asset.recommendation === 'hold' ? styles.badgeTextHold :
                styles.badgeTextSell
              ]}>
                {asset.recommendation.toUpperCase()}
              </Text>
            </View>
          )}
          {asset.riskLevel && (
            <View style={styles.riskBadge}>
              <Text style={styles.riskText}>{asset.riskLevel.toUpperCase()} RISK</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.totalValue}>
          {formatCurrency(asset.totalValue, asset.currency)}
        </Text>
        <Text style={styles.quantity}>{asset.quantity} shares</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Current Price</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(asset.currentPrice || 0, asset.currency)}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Daily Change</Text>
            <Text style={[styles.metricValue, getValueColor(asset.dailyChange || 0)]}>
              {formatChange(asset.dailyChange || 0, asset.dailyChangePercent || 0, asset.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total P&L</Text>
          <Text style={[styles.value, getValueColor(asset.totalGainLoss || 0)]}>
            {formatChange(asset.totalGainLoss || 0, asset.totalGainLossPercent || 0, asset.currency)}
          </Text>
        </View>
      </View>

      {asset.aiAnalysis && (
        <TouchableOpacity
          style={styles.insightsButton}
          onPress={handleInsightsPress}
          accessibilityLabel="AI Insights"
          accessibilityHint="View AI analysis for this stock"
          accessibilityRole="button"
        >
          <Text style={styles.insightsButtonText}>View AI Insights</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedTradableAssetCard = React.memo<TradableAssetCardProps>(
  TradableAssetCard,
  (prevProps, nextProps) => {
    return (
      prevProps.asset.id === nextProps.asset.id &&
      prevProps.asset.totalValue === nextProps.asset.totalValue &&
      prevProps.asset.totalGainLoss === nextProps.asset.totalGainLoss &&
      prevProps.asset.currentPrice === nextProps.asset.currentPrice &&
      prevProps.asset.lastUpdated === nextProps.asset.lastUpdated
    );
  }
);

export default MemoizedTradableAssetCard;
