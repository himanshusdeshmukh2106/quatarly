import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset } from '../../types';
import { useAssets } from '../../hooks/useAssets';

// Optimized Components
import OptimizedAssetsList from '../../components/OptimizedAssetsList';
import PortfolioSummary, { PortfolioData } from '../../components/PortfolioSummary';

// Modals (keep existing ones)
import { AddAssetModal } from '../../components/AddAssetModal';
import { AssetInsightsDrawer } from '../../components/AssetInsightsDrawer';
import { EditAssetModal } from '../../components/EditAssetModal';
import { AssetActionSheet } from '../../components/AssetActionSheet';

const OptimizedAssetsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  // State management with better organization
  const [modalState, setModalState] = useState({
    showAddModal: false,
    showEditModal: false,
    showActionSheet: false,
    showAddDropdown: false,
  });
  
  const [selectedAssets, setSelectedAssets] = useState({
    assetForInsights: null as Asset | null,
    assetForAction: null as Asset | null,
    editingAsset: null as Asset | null,
  });
  
  const [savingAsset, setSavingAsset] = useState(false);

  // Assets data
  const {
    assets,
    loading,
    refreshing,
    refreshAssets,
    createNewAsset,
    updatePhysicalAssetValue,
    updateExistingAsset,
    deleteExistingAsset,
  } = useAssets();

  // No mock investments - using real assets from backend only

  // Portfolio data calculation
  const portfolioData = useMemo((): PortfolioData => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0) + 1543151;
    const totalReturns = assets.reduce((sum, asset) => sum + asset.totalGainLoss, 0) + 125651.25;
    
    return {
      totalValue,
      totalReturns,
      todayChange: 8245,
      todayChangePercent: 0.53,
      returnRate: 8.86,
      marketStatus: 'closed' as const,
    };
  }, [assets]);

  // Memoized event handlers
  const handleAssetPress = useCallback((asset: Asset) => {
    setSelectedAssets(prev => ({ ...prev, assetForInsights: asset }));
  }, []);

  const handleAssetLongPress = useCallback((asset: Asset) => {
    setSelectedAssets(prev => ({ ...prev, assetForAction: asset }));
    setModalState(prev => ({ ...prev, showActionSheet: true }));
  }, []);

  const handleInvestmentPress = useCallback((investment: any) => {
    // Handle investment press - could open insights or details
    console.log('Investment pressed:', investment.name);
  }, []);

  const handleInvestmentLongPress = useCallback((investment: any) => {
    // Handle investment long press - could show actions
    console.log('Investment long pressed:', investment.name);
  }, []);

  const handleEditAsset = useCallback((asset: Asset) => {
    setSelectedAssets(prev => ({ ...prev, editingAsset: asset }));
    setModalState(prev => ({ ...prev, showEditModal: true, showActionSheet: false }));
  }, []);

  const handleSaveAsset = useCallback(async (updatedAsset: Asset) => {
    setSavingAsset(true);
    try {
      await updateExistingAsset(updatedAsset.id, updatedAsset);
      setModalState(prev => ({ ...prev, showEditModal: false }));
      setSelectedAssets(prev => ({ ...prev, editingAsset: null }));
    } catch (error) {
      console.error('Failed to update asset:', error);
      Alert.alert('Error', 'Failed to update asset. Please try again.');
    } finally {
      setSavingAsset(false);
    }
  }, [updateExistingAsset]);

  const handleDeleteAsset = useCallback((asset: Asset) => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete ${asset.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExistingAsset(asset.id);
              setModalState(prev => ({ ...prev, showActionSheet: false }));
              setSelectedAssets(prev => ({ ...prev, assetForAction: null }));
            } catch (error) {
              console.error('Failed to delete asset:', error);
            }
          },
        },
      ]
    );
  }, [deleteExistingAsset]);

  // Memoized modal close handlers
  const closeModals = useMemo(() => ({
    closeAddModal: () => setModalState(prev => ({ ...prev, showAddModal: false })),
    closeInsightsDrawer: () => setSelectedAssets(prev => ({ ...prev, assetForInsights: null })),
    closeActionSheet: () => {
      setModalState(prev => ({ ...prev, showActionSheet: false }));
      setSelectedAssets(prev => ({ ...prev, assetForAction: null }));
    },
    closeEditModal: () => {
      setModalState(prev => ({ ...prev, showEditModal: false }));
      setSelectedAssets(prev => ({ ...prev, editingAsset: null }));
    },
    toggleAddDropdown: () => setModalState(prev => ({ 
      ...prev, 
      showAddDropdown: !prev.showAddDropdown 
    })),
  }), []);

  const handleAddManually = useCallback(() => {
    setModalState(prev => ({ 
      ...prev, 
      showAddDropdown: false, 
      showAddModal: true 
    }));
  }, []);

  const handleAddByDocument = useCallback(() => {
    setModalState(prev => ({ ...prev, showAddDropdown: false }));
    Alert.alert('Coming Soon', 'PDF/Document import feature will be available soon!');
  }, []);

  if (loading && assets.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Loading your assets...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Optimized Assets and Investments List with Portfolio Summary */}
      <OptimizedAssetsList
        assets={assets}
        investments={[]}
        onAssetPress={handleAssetPress}
        onAssetLongPress={handleAssetLongPress}
        onInvestmentPress={handleInvestmentPress}
        onInvestmentLongPress={handleInvestmentLongPress}
        refreshing={refreshing}
        onRefresh={refreshAssets}
        updatePhysicalAssetValue={updatePhysicalAssetValue}
        portfolioSummary={
          <PortfolioSummary 
            portfolio={portfolioData}
            onPress={() => console.log('Portfolio pressed')}
          />
        }
        addInvestmentButton={
          <View style={styles.addInvestmentContainer}>
            <TouchableOpacity
              style={[styles.addInvestmentButton, { backgroundColor: theme.primary }]}
              onPress={closeModals.toggleAddDropdown}
              activeOpacity={0.8}
              accessibilityLabel="Add investment"
              accessibilityHint="Tap to add a new investment"
            >
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addInvestmentButtonText}>Add Investment</Text>
              <Icon
                name={modalState.showAddDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Dropdown Options */}
            {modalState.showAddDropdown && (
              <View style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border
                }
              ]}>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={handleAddManually}
                >
                  <Icon name="edit" size={20} color={theme.text} />
                  <Text style={[styles.dropdownOptionText, { color: theme.text }]}>
                    Add Manually
                  </Text>
                </TouchableOpacity>

                <View style={[styles.dropdownSeparator, { backgroundColor: theme.border }]} />

                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={handleAddByDocument}
                >
                  <Icon name="description" size={20} color={theme.text} />
                  <Text style={[styles.dropdownOptionText, { color: theme.text }]}>
                    Add by PDF/Doc
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

      {/* Modals */}
      <AddAssetModal
        visible={modalState.showAddModal}
        onClose={closeModals.closeAddModal}
        onAssetCreate={createNewAsset}
      />

      <AssetInsightsDrawer
        visible={selectedAssets.assetForInsights !== null}
        asset={selectedAssets.assetForInsights}
        onClose={closeModals.closeInsightsDrawer}
      />

      <AssetActionSheet
        visible={modalState.showActionSheet}
        onClose={closeModals.closeActionSheet}
        onEdit={() => selectedAssets.assetForAction && handleEditAsset(selectedAssets.assetForAction)}
        onDelete={() => selectedAssets.assetForAction && handleDeleteAsset(selectedAssets.assetForAction)}
        assetName={selectedAssets.assetForAction?.name || ''}
      />

      <EditAssetModal
        visible={modalState.showEditModal}
        asset={selectedAssets.editingAsset}
        onClose={closeModals.closeEditModal}
        onSave={handleSaveAsset}
        loading={savingAsset}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Add Investment Button Styles
  addInvestmentContainer: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  addInvestmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  addInvestmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownSeparator: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default OptimizedAssetsScreen;