import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PhysicalAsset } from '../types';
import { ThemeContext } from '../context/ThemeContext';

interface PhysicalAssetCardProps {
  asset: PhysicalAsset;
  onPress?: () => void;
  onLongPress?: () => void;
  onInsightsPress?: () => void;
  onUpdateValue?: (assetId: string, newMarketPrice: number) => void;
  style?: any;
}

export const PhysicalAssetCard: React.FC<PhysicalAssetCardProps> = ({
  asset,
  onPress,
  onLongPress,
  onInsightsPress,
  onUpdateValue,
  style,
}) => {
  const { theme } = useContext(ThemeContext);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newMarketPrice, setNewMarketPrice] = useState(
    asset.currentMarketPrice?.toString() || asset.purchasePrice.toString()
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return '#10B981'; // Green for positive
    if (value < 0) return '#EF4444'; // Red for negative
    return '#6B7280'; // Gray for neutral
  };

  const getAssetIcon = (assetType: string) => {
    const iconMap: Record<string, string> = {
      gold: 'star',
      silver: 'star-border',
      commodity: 'grain',
    };
    return iconMap[assetType] || 'help';
  };

  const getAssetColor = (assetType: string) => {
    const colorMap: Record<string, string> = {
      gold: '#F59E0B',
      silver: '#9CA3AF',
      commodity: '#8B5CF6',
    };
    return colorMap[assetType] || '#6B7280';
  };

  const handleUpdateValue = () => {
    const price = parseFloat(newMarketPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    onUpdateValue?.(asset.id, price);
    setShowUpdateModal(false);
  };

  const calculateCurrentValue = () => {
    const marketPrice = asset.currentMarketPrice || asset.purchasePrice;
    return asset.quantity * marketPrice;
  };

  const calculateGainLoss = () => {
    const currentValue = calculateCurrentValue();
    const purchaseValue = asset.quantity * asset.purchasePrice;
    return currentValue - purchaseValue;
  };

  const calculateGainLossPercent = () => {
    const purchaseValue = asset.quantity * asset.purchasePrice;
    const gainLoss = calculateGainLoss();
    return purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
  };

  const renderUpdateModal = () => (
    <Modal
      visible={showUpdateModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowUpdateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Update Market Price
            </Text>
            <TouchableOpacity
              onPress={() => setShowUpdateModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
            {asset.name} - Current: {formatCurrency(asset.currentMarketPrice || asset.purchasePrice)}/{asset.unit}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              New Market Price (per {asset.unit})
            </Text>
            <TextInput
              style={[
                styles.priceInput,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text 
                }
              ]}
              value={newMarketPrice}
              onChangeText={setNewMarketPrice}
              keyboardType="numeric"
              placeholder="Enter new price"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={() => setShowUpdateModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textMuted }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateValue}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {/* Asset Header */}
        <View style={styles.assetHeader}>
          <View style={styles.assetInfo}>
            <View style={[
              styles.assetIconContainer,
              { backgroundColor: `${getAssetColor(asset.assetType)}20` }
            ]}>
              <Icon 
                name={getAssetIcon(asset.assetType)} 
                size={28} 
                color={getAssetColor(asset.assetType)} 
              />
            </View>
            
            <View style={styles.assetDetails}>
              <Text style={[styles.assetName, { color: theme.text }]}>{asset.name}</Text>
              <Text style={[styles.assetQuantity, { color: theme.textMuted }]}>
                {asset.quantity.toLocaleString()} {asset.unit}
              </Text>
              {asset.purity && (
                <Text style={[styles.assetPurity, { color: theme.textMuted }]}>
                  Purity: {asset.purity}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.assetValue}>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              {formatCurrency(calculateCurrentValue())}
            </Text>
            <Text style={[styles.unitPrice, { color: theme.textMuted }]}>
              @ {formatCurrency(asset.currentMarketPrice || asset.purchasePrice)}/{asset.unit}
            </Text>
          </View>
        </View>

        {/* Price Information */}
        <View style={styles.priceSection}>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Purchase Price</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              {formatCurrency(asset.purchasePrice)}/{asset.unit}
            </Text>
          </View>
          
          {asset.currentMarketPrice && asset.currentMarketPrice !== asset.purchasePrice && (
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Market Price</Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                {formatCurrency(asset.currentMarketPrice)}/{asset.unit}
              </Text>
            </View>
          )}
          
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Total P&L</Text>
            <Text style={[
              styles.priceValue,
              { color: getPerformanceColor(calculateGainLoss()) }
            ]}>
              {formatCurrency(calculateGainLoss())} 
              ({formatPercentage(calculateGainLossPercent())})
            </Text>
          </View>
        </View>

        {/* Asset Details */}
        <View style={styles.detailsSection}>
          {asset.storage && (
            <View style={styles.detailItem}>
              <Icon name="location-on" size={16} color={theme.textMuted} />
              <Text style={[styles.detailText, { color: theme.textMuted }]}>
                Storage: {asset.storage}
              </Text>
            </View>
          )}
          
          {asset.certificate && (
            <View style={styles.detailItem}>
              <Icon name="verified" size={16} color={theme.textMuted} />
              <Text style={[styles.detailText, { color: theme.textMuted }]}>
                Certificate: {asset.certificate}
              </Text>
            </View>
          )}
          
          {asset.manuallyUpdated && (
            <View style={styles.detailItem}>
              <Icon name="edit" size={16} color="#F59E0B" />
              <Text style={[styles.detailText, { color: '#F59E0B' }]}>
                Manually updated
              </Text>
            </View>
          )}
        </View>

        {/* Update Price Button */}
        <TouchableOpacity
          style={[styles.updatePriceButton, { backgroundColor: theme.cardElevated }]}
          onPress={() => setShowUpdateModal(true)}
        >
          <Icon name="edit" size={16} color={theme.primary} />
          <Text style={[styles.updatePriceText, { color: theme.primary }]}>
            Update Market Price
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
            Updated {new Date(asset.lastUpdated).toLocaleDateString()}
          </Text>
          
          <TouchableOpacity 
            style={[styles.insightsButton, { backgroundColor: theme.cardElevated }]}
            onPress={onInsightsPress}
          >
            <Icon name="insights" size={16} color={theme.textMuted} />
            <Text style={[styles.insightsButtonText, { color: theme.textMuted }]}>
              AI Insights
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {renderUpdateModal()}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
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
  assetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetDetails: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetQuantity: {
    fontSize: 14,
    marginBottom: 2,
  },
  assetPurity: {
    fontSize: 12,
  },
  assetValue: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: 12,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 8,
  },
  updatePriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  updatePriceText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  lastUpdated: {
    fontSize: 12,
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  insightsButtonText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PhysicalAssetCard;