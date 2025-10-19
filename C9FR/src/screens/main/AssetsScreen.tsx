/**
 * AssetsScreen - Refactored
 * 
 * Main screen for displaying and managing assets/investments
 * Refactored from 1,351 lines to maintain code quality while preserving identical UI/UX
 */

import React, { useState, useContext, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';
import { useAssets } from '../../hooks/useAssets';
import { AssetCard } from '../../components/AssetCard';
import { TradableAssetCard } from '../../components/TradableAssetCard';
import { PhysicalAssetCard } from '../../components/PhysicalAssetCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { mockInvestments } from '../AssetsScreen/utils/mockData';
import {
  PortfolioSummary,
  AddAssetButton,
  InvestmentCard
} from '../AssetsScreen/components';

// Lazy load modals and drawers
const AddAssetModal = React.lazy(() => import('../../components/AddAssetModal'));
const AssetInsightsDrawer = React.lazy(() => import('../../components/AssetInsightsDrawer'));
const EditAssetModal = React.lazy(() => import('../../components/EditAssetModal'));
const AssetActionSheet = React.lazy(() => import('../../components/AssetActionSheet'));

export const AssetsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetForInsights, setSelectedAssetForInsights] = useState<Asset | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedAssetForAction, setSelectedAssetForAction] = useState<Asset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [savingAsset, setSavingAsset] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Asset management
  const {
    assets,
    createNewAsset,
    updatePhysicalAssetValue,
    updateExistingAsset,
    deleteExistingAsset,
  } = useAssets();

  // Asset action handlers
  const handleAssetLongPress = (asset: Asset) => {
    setSelectedAssetForAction(asset);
    setShowActionSheet(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleSaveAsset = async (updatedAsset: Asset) => {
    setSavingAsset(true);
    try {
      await updateExistingAsset(updatedAsset.id, updatedAsset);
      setShowEditModal(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Failed to update asset:', error);
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = (asset: Asset) => {
    // Alert is handled in the AssetActionSheet component
    deleteExistingAsset(asset.id).catch(error => {
      console.error('Failed to delete asset:', error);
    });
  };

  // Render asset card based on type
  const renderAssetCard = (asset: Asset) => {
    const isPhysical = ['gold', 'silver', 'commodity'].includes(asset.assetType);
    const isTradeable = ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);

    if (isPhysical) {
      return (
        <PhysicalAssetCard
          key={asset.id}
          asset={asset as PhysicalAsset}
          onUpdateValue={updatePhysicalAssetValue}
          onInsightsPress={() => setSelectedAssetForInsights(asset)}
          onLongPress={() => handleAssetLongPress(asset)}
        />
      );
    }

    if (isTradeable) {
      return (
        <TradableAssetCard
          key={asset.id}
          asset={asset as TradableAsset}
          onInsightsPress={() => setSelectedAssetForInsights(asset)}
          onLongPress={() => handleAssetLongPress(asset)}
        />
      );
    }

    return (
      <AssetCard
        key={asset.id}
        asset={asset}
        onPress={() => setSelectedAssetForInsights(asset)}
        onLongPress={() => handleAssetLongPress(asset)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (showAddDropdown) {
            setShowAddDropdown(false);
          }
        }}
      >
        {/* Portfolio Summary Card */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (showAddDropdown) {
              setShowAddDropdown(false);
            }
          }}
        >
          <View>
            <PortfolioSummary
              portfolioValue="₹15,43,151.00"
              totalReturns="+₹1,25,651.25"
              todaysChange="+₹8,245 (+0.53%)"
              returnRate="+8.86%"
              isMarketOpen={false}
              showAddDropdown={showAddDropdown}
              onDismissDropdown={() => setShowAddDropdown(false)}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Add Investment Button */}
        <AddAssetButton
          showDropdown={showAddDropdown}
          onToggleDropdown={() => setShowAddDropdown(!showAddDropdown)}
          onAddManually={() => {
            setShowAddDropdown(false);
            setShowAddModal(true);
          }}
        />

        {/* Investment Cards */}
        {mockInvestments.map((investment, index) => (
          <TouchableWithoutFeedback
            key={investment.id}
            onPress={() => {
              if (showAddDropdown) {
                setShowAddDropdown(false);
              }
            }}
          >
            <View>
              <InvestmentCard investment={investment} index={index} />
            </View>
          </TouchableWithoutFeedback>
        ))}

        {/* User's Assets */}
        {assets.length > 0 && (
          <TouchableWithoutFeedback
            onPress={() => {
              if (showAddDropdown) {
                setShowAddDropdown(false);
              }
            }}
          >
            <View style={styles.assetsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Your Assets
              </Text>
              {assets.map(renderAssetCard)}
            </View>
          </TouchableWithoutFeedback>
        )}
      </ScrollView>

      {/* Modals */}
      <Suspense fallback={<LoadingSpinner />}>
        <AddAssetModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAssetCreate={createNewAsset}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <AssetInsightsDrawer
          visible={selectedAssetForInsights !== null}
          asset={selectedAssetForInsights}
          onClose={() => setSelectedAssetForInsights(null)}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <AssetActionSheet
          visible={showActionSheet}
          onClose={() => {
            setShowActionSheet(false);
            setSelectedAssetForAction(null);
          }}
          onEdit={() => selectedAssetForAction && handleEditAsset(selectedAssetForAction)}
          onDelete={() => selectedAssetForAction && handleDeleteAsset(selectedAssetForAction)}
          assetName={selectedAssetForAction?.name || ''}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <EditAssetModal
          visible={showEditModal}
          asset={editingAsset}
          onClose={() => {
            setShowEditModal(false);
            setEditingAsset(null);
          }}
          onSave={handleSaveAsset}
          loading={savingAsset}
        />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  assetsSection: {
    marginTop: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
});

export default AssetsScreen;
