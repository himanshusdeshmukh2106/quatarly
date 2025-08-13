import React, { useMemo, useCallback } from 'react';
import { FlatList, RefreshControl, View, Text, StyleSheet } from 'react-native';
import { Asset } from '../types';
import LazyAssetCard from './LazyAssetCard';
import { useTheme } from '../context/ThemeContext';

interface VirtualizedAssetListProps {
  assets: Asset[];
  refreshing: boolean;
  onRefresh: () => void;
  onInsightsPress: (asset: Asset) => void;
  onLongPress: (asset: Asset) => void;
  onUpdateValue?: (assetId: string, newMarketPrice: number) => Promise<void>;
  ListEmptyComponent?: React.ComponentType<any>;
  ListHeaderComponent?: React.ComponentType<any>;
  ListFooterComponent?: React.ComponentType<any>;
}

const ITEM_HEIGHT = 220; // Approximate height including margins

export const VirtualizedAssetList: React.FC<VirtualizedAssetListProps> = ({
  assets,
  refreshing,
  onRefresh,
  onInsightsPress,
  onLongPress,
  onUpdateValue,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  const { theme } = useTheme();

  const keyExtractor = useCallback((item: Asset) => item.id, []);

  const getItemLayout = useCallback(
    (data: Asset[] | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Asset; index: number }) => (
      <LazyAssetCard
        asset={item}
        onInsightsPress={onInsightsPress}
        onLongPress={onLongPress}
        onUpdateValue={onUpdateValue}
        index={index}
      />
    ),
    [onInsightsPress, onLongPress, onUpdateValue]
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[theme.primary]}
        tintColor={theme.primary}
        progressBackgroundColor={theme.background}
      />
    ),
    [refreshing, onRefresh, theme.primary, theme.background]
  );

  const renderFooter = useCallback(() => {
    if (ListFooterComponent) {
      return <ListFooterComponent />;
    }
    
    return (
      <View style={styles.defaultFooter}>
        <Text style={[styles.footerText, { color: theme.textMuted }]}>
          {assets.length} asset{assets.length !== 1 ? 's' : ''} shown
        </Text>
      </View>
    );
  }, [ListFooterComponent, assets.length, theme.textMuted]);

  return (
    <FlatList
      data={assets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={5}
      windowSize={10}
      contentContainerStyle={styles.contentContainer}
      style={[styles.container, { backgroundColor: theme.background }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 0, // No separator needed as cards have their own margins
  },
  defaultFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
});

export default VirtualizedAssetList;