import React, { useState, Suspense } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset } from '../../types';
import { usePortfolioData } from './AssetsScreen/hooks/usePortfolioData';
import { useAssetActions } from './AssetsScreen/hooks/useAssetActions';
import { AssetList } from '../../components/assets/AssetList';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load modals and drawers to reduce initial bundle size
// These components use default exports, so we import them directly
const AddAssetModal = React.lazy(() => import('../../components/AddAssetModal'));
const AssetInsightsDrawer = React.lazy(() => import('../../components/AssetInsightsDrawer'));
const EditAssetModal = React.lazy(() => import('../../components/EditAssetModal'));
const AssetActionSheet = React.lazy(() => import('../../components/AssetActionSheet'));

export const AssetsScreen: React.FC = () => {
  const { theme } = React.useContext(ThemeContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetForInsights, setSelectedAssetForInsights] = useState<Asset | null>(null);

  const { assets, isLoading, error, refetchAssets, portfolioValue } = usePortfolioData();
  const {
    showActionSheet,
    selectedAssetForAction,
    showEditModal,
    editingAsset,
    isSaving,
    handleAssetLongPress,
    handleEditRequest,
    handleDeleteRequest,
    handleSaveAsset,
    closeActionSheet,
    closeEditModal,
  } = useAssetActions();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // TODO: Add a proper error component
  if (error) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AssetList
        assets={assets}
        onUpdateValue={() => {}} // This should be passed from a relevant hook if needed
        onInsightsPress={setSelectedAssetForInsights}
        onLongPress={handleAssetLongPress}
        // ListHeaderComponent={<PortfolioSummaryCard value={portfolioValue} />}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <AddAssetModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAssetCreate={() => {}}
          onBulkImport={() => {}}
        />
        <AssetInsightsDrawer
          visible={selectedAssetForInsights !== null}
          asset={selectedAssetForInsights}
          onClose={() => setSelectedAssetForInsights(null)}
        />
        <AssetActionSheet
          visible={showActionSheet}
          onClose={closeActionSheet}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          assetName={selectedAssetForAction?.name || ''}
        />
        <EditAssetModal
          visible={showEditModal}
          asset={editingAsset}
          onClose={closeEditModal}
          onSave={handleSaveAsset}
          loading={isSaving}
        />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AssetsScreen;