import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItemInfo } from 'react-native';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';
import { AssetCard } from '../AssetCard';
import { TradableAssetCard } from '../TradableAssetCard';
import { PhysicalAssetCard } from '../PhysicalAssetCard';
import { ThemeContext } from '../../context/ThemeContext';

interface AssetListProps {
  assets: Asset[];
  onUpdateValue: (assetId: string, value: number) => void;
  onInsightsPress: (asset: Asset) => void;
  onLongPress: (asset: Asset) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
}

const AssetListComponent: React.FC<AssetListProps> = ({
  assets,
  onUpdateValue,
  onInsightsPress,
  onLongPress,
  ListHeaderComponent,
}) => {
  const { theme } = React.useContext(ThemeContext);

  const renderAssetCard = useCallback(({ item }: ListRenderItemInfo<Asset>) => {
    const isPhysical = ['gold', 'silver', 'commodity'].includes(item.assetType);
    const isTradeable = ['stock', 'etf', 'bond', 'crypto'].includes(item.assetType);

    if (isPhysical) {
      return (
        <PhysicalAssetCard
          asset={item as PhysicalAsset}
          onUpdateValue={onUpdateValue}
          onInsightsPress={() => onInsightsPress(item)}
          onLongPress={() => onLongPress(item)}
        />
      );
    }

    if (isTradeable) {
      return (
        <TradableAssetCard
          asset={item as TradableAsset}
          onInsightsPress={() => onInsightsPress(item)}
          onLongPress={() => onLongPress(item)}
        />
      );
    }

    return (
      <AssetCard
        asset={item}
        onPress={() => onInsightsPress(item)}
        onLongPress={() => onLongPress(item)}
      />
    );
  }, [onUpdateValue, onInsightsPress, onLongPress]);

  const keyExtractor = useCallback((item: Asset) => item.id, []);

  const EmptyListComponent = (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Assets Found</Text>
      <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
        Add your first asset to see it here.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={assets}
      renderItem={renderAssetCard}
      keyExtractor={keyExtractor}
      ListEmptyComponent={EmptyListComponent}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21}
      getItemLayout={(_data, index) => (
        // Assuming a fixed height for each item for optimization.
        // Adjust the height based on your actual card height.
        { length: 150, offset: 150 * index, index }
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export const AssetList = React.memo(AssetListComponent);
