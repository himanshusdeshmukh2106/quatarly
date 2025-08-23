import React, { memo, useCallback, useMemo, ReactNode } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { Asset } from '../types';
import { UnifiedAssetCard } from './UnifiedAssetCard';
import GroupedInvestmentCard from './GroupedInvestmentCard';
import GroupedAssetCard from './GroupedAssetCard';
import { InvestmentData } from './InvestmentCard';

interface OptimizedAssetsListProps {
  assets: Asset[];
  investments: InvestmentData[];
  onAssetPress?: (asset: Asset) => void;
  onAssetLongPress?: (asset: Asset) => void;
  onInvestmentPress?: (investment: InvestmentData) => void;
  onInvestmentLongPress?: (investment: InvestmentData) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  updatePhysicalAssetValue?: (assetId: string, newValue: number) => void;
  // New props for header components
  portfolioSummary?: ReactNode;
  addInvestmentButton?: ReactNode;
}

type ListItem = 
  | { type: 'portfolio'; data: null }
  | { type: 'addButton'; data: null }
  | { type: 'assetGroup'; data: [Asset, Asset?] }
  | { type: 'investmentGroup'; data: [InvestmentData, InvestmentData?] };

const OptimizedAssetsList: React.FC<OptimizedAssetsListProps> = memo(({
  assets,
  investments,
  onAssetPress,
  onAssetLongPress,
  onInvestmentPress,
  onInvestmentLongPress,
  refreshing = false,
  onRefresh,
  updatePhysicalAssetValue,
  portfolioSummary,
  addInvestmentButton,
}) => {
  // Memoize combined data to prevent unnecessary re-computations
  const listData = useMemo((): ListItem[] => {
    const combinedData: ListItem[] = [];
    
    // Add portfolio summary at the top if provided
    if (portfolioSummary) {
      combinedData.push({ type: 'portfolio', data: null });
    }
    
    // Add investment button after portfolio summary if provided
    if (addInvestmentButton) {
      combinedData.push({ type: 'addButton', data: null });
    }
    
    // Group investments in pairs
    for (let i = 0; i < investments.length; i += 2) {
      const investmentPair: [InvestmentData, InvestmentData?] = [
        investments[i],
        investments[i + 1] // This could be undefined if odd number
      ];
      combinedData.push({ type: 'investmentGroup', data: investmentPair });
    }
    
    // Group assets in pairs
    for (let i = 0; i < assets.length; i += 2) {
      const assetPair: [Asset, Asset?] = [
        assets[i],
        assets[i + 1] // This could be undefined if odd number
      ];
      combinedData.push({ type: 'assetGroup', data: assetPair });
    }
    
    return combinedData;
  }, [assets, investments, portfolioSummary, addInvestmentButton]);

  // Memoize key extractor
  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === 'portfolio') {
      return 'portfolio-summary';
    } else if (item.type === 'addButton') {
      return 'add-investment-button';
    } else if (item.type === 'investmentGroup') {
      const firstId = item.data[0]?.id || '';
      const secondId = item.data[1]?.id || '';
      return `investment-group-${firstId}-${secondId}-${index}`;
    } else if (item.type === 'assetGroup') {
      const firstId = item.data[0]?.id || '';
      const secondId = item.data[1]?.id || '';
      return `asset-group-${firstId}-${secondId}-${index}`;
    }
    // This should never happen, but provide a fallback
    return `unknown-${index}`;
  }, []);

  // Memoize render item
  const renderItem: ListRenderItem<ListItem> = useCallback(({ item }) => {
    if (item.type === 'portfolio') {
      return portfolioSummary ? <>{portfolioSummary}</> : null;
    } else if (item.type === 'addButton') {
      return addInvestmentButton ? <>{addInvestmentButton}</> : null;
    } else if (item.type === 'assetGroup') {
      return (
        <GroupedAssetCard
          assets={item.data}
          onAssetPress={onAssetPress}
          onAssetLongPress={onAssetLongPress}
          updatePhysicalAssetValue={updatePhysicalAssetValue}
        />
      );
    } else {
      return (
        <GroupedInvestmentCard
          investments={item.data}
          onPress={onInvestmentPress}
          onLongPress={onInvestmentLongPress}
        />
      );
    }
  }, [
    onAssetPress,
    onAssetLongPress,
    onInvestmentPress,
    onInvestmentLongPress,
    updatePhysicalAssetValue,
    portfolioSummary,
    addInvestmentButton,
  ]);

  // Memoize item layout for better performance
  const getItemLayout = useCallback((data: ListItem[] | null | undefined, index: number) => {
    if (!data || index >= data.length) {
      return { length: 200, offset: 200 * index, index };
    }
    
    const item = data[index];
    let itemHeight = 200; // Default height
    
    // Set specific heights for different item types
    if (item.type === 'portfolio') {
      itemHeight = 160; // Portfolio summary height
    } else if (item.type === 'addButton') {
      itemHeight = 100; // Add button height
    } else if (item.type === 'investmentGroup') {
      // Height for grouped investment cards (2 cards combined)
      const hasSecondCard = item.data[1] !== undefined;
      itemHeight = hasSecondCard ? 400 : 200; // ~200px per card
    } else if (item.type === 'assetGroup') {
      // Height for grouped asset cards (2 cards combined)
      const hasSecondCard = item.data[1] !== undefined;
      itemHeight = hasSecondCard ? 400 : 200; // ~200px per card
    } else {
      itemHeight = 200; // Single card height
    }
    
    // Calculate offset based on previous items
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const prevItem = data[i];
      if (prevItem.type === 'portfolio') {
        offset += 160;
      } else if (prevItem.type === 'addButton') {
        offset += 100;
      } else if (prevItem.type === 'investmentGroup') {
        const hasSecondCard = prevItem.data[1] !== undefined;
        offset += hasSecondCard ? 400 : 200;
      } else if (prevItem.type === 'assetGroup') {
        const hasSecondCard = prevItem.data[1] !== undefined;
        offset += hasSecondCard ? 400 : 200;
      } else {
        offset += 200;
      }
    }
    
    return { length: itemHeight, offset, index };
  }, []);

  // Memoize refresh control
  const refreshControl = useMemo(() => (
    onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#007AFF"
        titleColor="#007AFF"
      />
    ) : undefined
  ), [refreshing, onRefresh]);

  return (
    <FlatList
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={5}
      windowSize={10}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
      contentContainerStyle={styles.contentContainer}
      // Optimize scrolling performance
      scrollEventThrottle={16}
      // Remove nested scrolling issues
      nestedScrollEnabled={false}
    />
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 0,
    paddingBottom: 20,
  },
});

OptimizedAssetsList.displayName = 'OptimizedAssetsList';

export default OptimizedAssetsList;