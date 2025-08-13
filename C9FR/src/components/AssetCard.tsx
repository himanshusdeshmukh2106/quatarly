import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Asset, TradableAsset, PhysicalAsset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  style,
}) => {
  const isPhysicalAsset = (asset: Asset): asset is PhysicalAsset => {
    return ['gold', 'silver', 'commodity'].includes(asset.assetType);
  };

  const isTradableAsset = (asset: Asset): asset is TradableAsset => {
    return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
  };

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

  const getAssetIcon = (assetType: string) => {
    const iconMap: Record<string, string> = {
      stock: 'trending-up',
      etf: 'account-balance',
      bond: 'security',
      crypto: 'currency-bitcoin',
      gold: 'star',
      silver: 'star-border',
      commodity: 'grain',
    };
    return iconMap[assetType] || 'help';
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#10B981'; // Green for positive
    if (value < 0) return '#EF4444'; // Red for negative
    return '#6B7280'; // Gray for neutral
  };

  const renderTradableAssetContent = (tradableAsset: TradableAsset) => (
    <>
      <View style={styles.assetHeader}>
        <View style={styles.assetInfo}>
          {tradableAsset.logoUrl ? (
            <Image source={{ uri: tradableAsset.logoUrl }} style={styles.assetLogo} />
          ) : (
            <View style={styles.assetIconContainer}>
              <Icon name={getAssetIcon(tradableAsset.assetType)} size={24} color="#6B7280" />
            </View>
          )}
          
          <View style={styles.assetDetails}>
            <Text style={styles.assetSymbol}>{tradableAsset.symbol}</Text>
            <Text style={styles.assetName} numberOfLines={1}>
              {tradableAsset.name}
            </Text>
            {tradableAsset.sector && (
              <Text style={styles.assetSector}>{tradableAsset.sector}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.assetValue}>
          <Text style={styles.totalValue}>
            {formatCurrency(tradableAsset.totalValue, tradableAsset.currency)}
          </Text>
          <Text style={styles.quantity}>
            {tradableAsset.quantity.toLocaleString()} shares
          </Text>
        </View>
      </View>

      <View style={styles.performanceSection}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Current Price</Text>
          <Text style={styles.performanceValue}>
            {formatCurrency(tradableAsset.currentPrice, tradableAsset.currency)}
          </Text>
        </View>
        
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Daily Change</Text>
          <Text style={[
            styles.performanceValue,
            { color: getPerformanceColor(tradableAsset.dailyChange) }
          ]}>
            {formatCurrency(tradableAsset.dailyChange, tradableAsset.currency)} 
            ({formatPercentage(tradableAsset.dailyChangePercent)})
          </Text>
        </View>
        
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Total P&L</Text>
          <Text style={[
            styles.performanceValue,
            { color: getPerformanceColor(tradableAsset.totalGainLoss) }
          ]}>
            {formatCurrency(tradableAsset.totalGainLoss, tradableAsset.currency)} 
            ({formatPercentage(tradableAsset.totalGainLossPercent)})
          </Text>
        </View>
      </View>

      {tradableAsset.recommendation && (
        <View style={styles.recommendationSection}>
          <View style={[
            styles.recommendationBadge,
            { backgroundColor: getRecommendationColor(tradableAsset.recommendation) }
          ]}>
            <Icon 
              name={getRecommendationIcon(tradableAsset.recommendation)} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.recommendationText}>
              {tradableAsset.recommendation.toUpperCase()}
            </Text>
          </View>
          
          <View style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(tradableAsset.riskLevel) }
          ]}>
            <Text style={styles.riskText}>
              {tradableAsset.riskLevel.toUpperCase()} RISK
            </Text>
          </View>
        </View>
      )}
    </>
  );

  const renderPhysicalAssetContent = (physicalAsset: PhysicalAsset) => (
    <>
      <View style={styles.assetHeader}>
        <View style={styles.assetInfo}>
          <View style={styles.assetIconContainer}>
            <Icon name={getAssetIcon(physicalAsset.assetType)} size={24} color="#F59E0B" />
          </View>
          
          <View style={styles.assetDetails}>
            <Text style={styles.assetSymbol}>{physicalAsset.name}</Text>
            <Text style={styles.assetName}>
              {physicalAsset.quantity} {physicalAsset.unit}
            </Text>
            {physicalAsset.purity && (
              <Text style={styles.assetSector}>Purity: {physicalAsset.purity}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.assetValue}>
          <Text style={styles.totalValue}>
            {formatCurrency(physicalAsset.totalValue)}
          </Text>
          <Text style={styles.quantity}>
            @ ₹{physicalAsset.purchasePrice.toLocaleString()}/{physicalAsset.unit}
          </Text>
        </View>
      </View>

      <View style={styles.performanceSection}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Purchase Price</Text>
          <Text style={styles.performanceValue}>
            ₹{physicalAsset.purchasePrice.toLocaleString()}/{physicalAsset.unit}
          </Text>
        </View>
        
        {physicalAsset.currentMarketPrice && (
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Market Price</Text>
            <Text style={styles.performanceValue}>
              ₹{physicalAsset.currentMarketPrice.toLocaleString()}/{physicalAsset.unit}
            </Text>
          </View>
        )}
        
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Total P&L</Text>
          <Text style={[
            styles.performanceValue,
            { color: getPerformanceColor(physicalAsset.totalGainLoss) }
          ]}>
            ₹{physicalAsset.totalGainLoss.toLocaleString()} 
            ({formatPercentage(physicalAsset.totalGainLossPercent)})
          </Text>
        </View>
      </View>

      <View style={styles.physicalAssetInfo}>
        {physicalAsset.storage && (
          <View style={styles.infoItem}>
            <Icon name="location-on" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Storage: {physicalAsset.storage}</Text>
          </View>
        )}
        
        {physicalAsset.certificate && (
          <View style={styles.infoItem}>
            <Icon name="verified" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Cert: {physicalAsset.certificate}</Text>
          </View>
        )}
        
        {physicalAsset.manuallyUpdated && (
          <View style={styles.infoItem}>
            <Icon name="edit" size={16} color="#F59E0B" />
            <Text style={styles.infoText}>Manually updated</Text>
          </View>
        )}
      </View>
    </>
  );

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

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${asset.name} asset card`}
      accessibilityHint="Tap to view details, long press for options"
      accessibilityValue={{
        text: `Current value ${formatCurrency(asset.totalValue)}, ${
          asset.totalGainLoss >= 0 ? 'gain' : 'loss'
        } of ${formatCurrency(Math.abs(asset.totalGainLoss))}`
      }}
    >
      {isPhysicalAsset(asset) 
        ? renderPhysicalAssetContent(asset)
        : isTradableAsset(asset) 
          ? renderTradableAssetContent(asset)
          : null
      }
      
      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Updated {new Date(asset.lastUpdated).toLocaleDateString()}
        </Text>
        
        <TouchableOpacity style={styles.insightsButton}>
          <Icon name="insights" size={16} color="#6B7280" />
          <Text style={styles.insightsButtonText}>AI Insights</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assetInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  assetLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  assetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetDetails: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  assetSector: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assetValue: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  performanceSection: {
    marginBottom: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  recommendationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  riskBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  physicalAssetInfo: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  insightsButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default AssetCard;