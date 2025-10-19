# Phase 5 Refactoring - Execution Plan

## Objective
Complete the AssetsScreen refactoring while maintaining **pixel-perfect UI/UX** identical to the original.

## Current Status
- Original file: 1,351 lines
- Current refactored: 87 lines (BUT MISSING CRITICAL UI ELEMENTS)
- Target: < 300 lines with ALL UI elements

## Step-by-Step Execution Plan

### Step 1: Create InvestmentCard Component ✅ (NEXT)
**File**: `C9FR/src/screens/AssetsScreen/components/InvestmentCard.tsx`

Extract from original lines 230-350 and styles from lines 1000-1200.

Component should include:
- Props interface for MockInvestment type
- Header with company icon, name, symbol, price, change pill
- Chart section with Y-axis labels and SVG line chart
- Stats section with Volume, Market Cap, P/E Ratio, Growth Rate
- Insight text section
- All styles using StyleSheet.create()
- React.memo for performance

### Step 2: Create Component Index File
**File**: `C9FR/src/screens/AssetsScreen/components/index.ts`

Export all components:
```typescript
export { PortfolioSummary } from './PortfolioSummary';
export { AddAssetButton } from './AddAssetButton';
export { AssetFilters } from './AssetFilters';
export { InvestmentCard } from './InvestmentCard';
```

### Step 3: Rewrite Main AssetsScreen
**File**: `C9FR/src/screens/main/AssetsScreen.tsx`

Structure:
```typescript
import { mockInvestments } from './AssetsScreen/utils/mockData';
import { PortfolioSummary, AddAssetButton, InvestmentCard } from '../../screens/AssetsScreen/components';

export const AssetsScreen: React.FC = () => {
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [selectedAssetForInsights, setSelectedAssetForInsights] = useState<Asset | null>(null);
  
  // Hooks
  const { theme } = useContext(ThemeContext);
  const { assets, createNewAsset, bulkImportAssets, updatePhysicalAssetValue } = useAssets();
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
    closeEditModal
  } = useAssetActions();

  // Render asset cards
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
        {/* Portfolio Summary */}
        <TouchableWithoutFeedback onPress={() => showAddDropdown && setShowAddDropdown(false)}>
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
            onPress={() => showAddDropdown && setShowAddDropdown(false)}
          >
            <View>
              <InvestmentCard investment={investment} index={index} />
            </View>
          </TouchableWithoutFeedback>
        ))}

        {/* User's Assets */}
        {assets.length > 0 && (
          <TouchableWithoutFeedback onPress={() => showAddDropdown && setShowAddDropdown(false)}>
            <View style={styles.assetsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Assets</Text>
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
          onBulkImport={bulkImportAssets}
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
```

### Step 4: Verify and Test
1. Check TypeScript errors
2. Verify UI looks identical to original
3. Test all interactions (dropdown, modals, asset actions)
4. Verify line count is under 300

### Step 5: Mark Tasks Complete
- Task 21: Create AssetList component ✅ (Already done)
- Task 21.1: Write unit tests ⏳ (Optional)
- Task 22: Create useAssetActions hook ✅ (Already done)
- Task 22.1: Write unit tests ⏳ (Optional)
- Task 23: Create usePortfolioData hook ✅ (Already done)
- Task 24: Refactor main AssetsScreen ⏳ (In progress)
- Task 24.1: Write integration tests ⏳ (Optional)

## Estimated Line Counts
- InvestmentCard component: ~200 lines (with styles)
- Main AssetsScreen: ~250 lines (with all UI elements)
- Total: Well under 300 lines per file ✅

## Critical Success Factor
**UI/UX MUST BE PIXEL-PERFECT IDENTICAL TO ORIGINAL**
- Same layout
- Same components
- Same interactions
- Same visual appearance
