import React, { memo } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { UnifiedAssetCard } from './UnifiedAssetCard';
import { Asset } from '../types';

interface GroupedAssetCardProps {
  assets: [Asset, Asset?]; // Array of 1 or 2 assets
  onAssetPress?: (asset: Asset) => void;
  onAssetLongPress?: (asset: Asset) => void;
  updatePhysicalAssetValue?: (assetId: string, newValue: number) => void;
}

const GroupedAssetCard: React.FC<GroupedAssetCardProps> = memo(({
  assets,
  onAssetPress,
  onAssetLongPress,
  updatePhysicalAssetValue,
}) => {
  // If we only have one asset, render it normally
  if (assets.length === 1 || !assets[1]) {
    return (
      <UnifiedAssetCard
        asset={assets[0]}
        onPress={() => onAssetPress?.(assets[0])}
        onLongPress={() => onAssetLongPress?.(assets[0])}
        onUpdateValue={updatePhysicalAssetValue}
        style={styles.singleCard}
      />
    );
  }

  // Render two cards grouped together seamlessly
  return (
    <>
      <UnifiedAssetCard
        asset={assets[0]}
        onPress={() => onAssetPress?.(assets[0])}
        onLongPress={() => onAssetLongPress?.(assets[0])}
        onUpdateValue={updatePhysicalAssetValue}
        style={styles.topCard}
      />
      <UnifiedAssetCard
        asset={assets[1]}
        onPress={() => onAssetPress?.(assets[1])}
        onLongPress={() => onAssetLongPress?.(assets[1])}
        onUpdateValue={updatePhysicalAssetValue}
        style={styles.bottomCard}
      />
    </>
  );
});

const styles = StyleSheet.create({
  singleCard: {
    // Normal card styling
  },
  topCard: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  bottomCard: {
    marginTop: 0,
    marginBottom: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

GroupedAssetCard.displayName = 'GroupedAssetCard';

export default GroupedAssetCard;