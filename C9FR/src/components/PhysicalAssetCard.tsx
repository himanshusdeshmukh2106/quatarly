import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { PhysicalAsset } from '../types';
import { useStyles } from '../hooks/useStyles';

interface PhysicalAssetCardProps {
  asset: PhysicalAsset;
  onPress?: (asset: PhysicalAsset) => void;
  onLongPress?: (asset: PhysicalAsset) => void;
  onInsightsPress?: (asset: PhysicalAsset) => void;
  onUpdateValue?: (assetId: string, newValue: number) => void;
  style?: any;
  testID?: string;
}

export const PhysicalAssetCard: React.FC<PhysicalAssetCardProps> = ({
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
    logoFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.warning,
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
    physicalInfo: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderMuted,
    },
    physicalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    physicalLabel: {
      fontSize: 12,
      color: theme.textMuted,
    },
    physicalValue: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.text,
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
  const formatCurrency = useCallback((amount: number): string => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `₹${formatted}`;
  }, []);

  // Format change with sign and percentage
  const formatChange = useCallback((amount: number, percent: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `₹${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${sign}${percent.toFixed(2)}%)`;
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
      accessibilityLabel={`${asset.name} physical asset card`}
      accessibilityHint="Double tap to view asset details, long press for options"
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoFallback}>
            <Text style={styles.logoText}>{asset.assetType.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.symbol}>{asset.name}</Text>
            <Text style={styles.name}>{asset.assetType.toUpperCase()}</Text>
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
        <Text style={styles.totalValue}>{formatCurrency(asset.totalValue)}</Text>
        <Text style={styles.quantity}>{asset.quantity} {asset.unit}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Purchase Price</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(asset.purchasePrice)}/{asset.unit}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Market Price</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(asset.currentMarketPrice || asset.purchasePrice)}/{asset.unit}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total P&L</Text>
          <Text style={[styles.value, getValueColor(asset.totalGainLoss || 0)]}>
            {formatChange(asset.totalGainLoss || 0, asset.totalGainLossPercent || 0)}
          </Text>
        </View>

        {asset.manuallyUpdated && (
          <View style={styles.physicalInfo}>
            <View style={styles.physicalRow}>
              <Text style={styles.physicalLabel}>Manually updated</Text>
            </View>
          </View>
        )}
      </View>

      {asset.aiAnalysis && (
        <TouchableOpacity
          style={styles.insightsButton}
          onPress={handleInsightsPress}
          accessibilityLabel="AI Insights"
          accessibilityHint="View AI analysis for this asset"
          accessibilityRole="button"
        >
          <Text style={styles.insightsButtonText}>View AI Insights</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedPhysicalAssetCard = React.memo<PhysicalAssetCardProps>(
  PhysicalAssetCard,
  (prevProps, nextProps) => {
    return (
      prevProps.asset.id === nextProps.asset.id &&
      prevProps.asset.totalValue === nextProps.asset.totalValue &&
      prevProps.asset.totalGainLoss === nextProps.asset.totalGainLoss &&
      prevProps.asset.currentMarketPrice === nextProps.asset.currentMarketPrice &&
      prevProps.asset.lastUpdated === nextProps.asset.lastUpdated
    );
  }
);

export default MemoizedPhysicalAssetCard;
