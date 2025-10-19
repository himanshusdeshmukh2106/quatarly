import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Asset, TradableAsset, PhysicalAsset } from '../types';
import { useTheme } from '../context/ThemeContext';

interface EditAssetModalProps {
  visible: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSave: (updatedAsset: Asset) => void;
  loading?: boolean;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({
  visible,
  asset,
  onClose,
  onSave,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (asset) {
      setFormData({ ...asset });
    }
  }, [asset]);

  const isPhysicalAsset = (asset: Asset): asset is PhysicalAsset => {
    return ['gold', 'silver', 'commodity'].includes(asset.assetType);
  };

  const isTradableAsset = (asset: Asset): asset is TradableAsset => {
    return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
  };

  const handleSave = () => {
    if (!asset) return;

    // Validate required fields
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Asset name is required');
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }

    // Calculate total value for physical assets
    if (isPhysicalAsset(asset)) {
      const currentPrice = formData.currentMarketPrice || formData.purchasePrice;
      formData.totalValue = formData.quantity * currentPrice;
      formData.totalGainLoss = formData.totalValue - (formData.quantity * formData.purchasePrice);
      formData.totalGainLossPercent = ((formData.totalGainLoss / (formData.quantity * formData.purchasePrice)) * 100);
    }

    onSave(formData);
  };

  const renderTradableAssetFields = (tradableAsset: TradableAsset) => (
    <>
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Symbol</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          value={formData.symbol || ''}
          onChangeText={(text) => setFormData({ ...formData, symbol: text.toUpperCase() })}
          placeholder="e.g., AAPL"
          placeholderTextColor={theme.textMuted}
          editable={false} // Symbol shouldn't be editable
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Asset Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          value={formData.name || ''}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Asset name"
          placeholderTextColor={theme.textMuted}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.quantity?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, quantity: parseFloat(text) || 0 })}
            placeholder="0"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Avg. Purchase Price</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.averagePurchasePrice?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, averagePurchasePrice: parseFloat(text) || 0 })}
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Exchange</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          value={formData.exchange || ''}
          onChangeText={(text) => setFormData({ ...formData, exchange: text })}
          placeholder="e.g., NASDAQ, NSE"
          placeholderTextColor={theme.textMuted}
        />
      </View>

      {tradableAsset.assetType === 'stock' && (
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Sector</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.sector || ''}
            onChangeText={(text) => setFormData({ ...formData, sector: text })}
            placeholder="e.g., Technology, Healthcare"
            placeholderTextColor={theme.textMuted}
          />
        </View>
      )}
    </>
  );

  const renderPhysicalAssetFields = (physicalAsset: PhysicalAsset) => (
    <>
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Asset Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          value={formData.name || ''}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Asset name"
          placeholderTextColor={theme.textMuted}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.quantity?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, quantity: parseFloat(text) || 0 })}
            placeholder="0"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Unit</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.unit || ''}
            onChangeText={(text) => setFormData({ ...formData, unit: text })}
            placeholder="grams, ounces"
            placeholderTextColor={theme.textMuted}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Purchase Price</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.purchasePrice?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, purchasePrice: parseFloat(text) || 0 })}
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.fieldGroup, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Current Market Price</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={formData.currentMarketPrice?.toString() || ''}
            onChangeText={(text) => setFormData({ ...formData, currentMarketPrice: parseFloat(text) || 0 })}
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>


    </>
  );

  if (!asset) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: theme.text }]}>Edit Asset</Text>
          
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.assetTypeIndicator}>
            <Icon 
              name={getAssetIcon(asset.assetType)} 
              size={20} 
              color={theme.primary} 
            />
            <Text style={[styles.assetTypeText, { color: theme.text }]}>
              {asset.assetType.toUpperCase()} ASSET
            </Text>
          </View>

          {isPhysicalAsset(asset) 
            ? renderPhysicalAssetFields(asset)
            : isTradableAsset(asset) 
              ? renderTradableAssetFields(asset)
              : null
          }
        </ScrollView>
      </View>
    </Modal>
  );
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  assetTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  assetTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});

export default EditAssetModal;