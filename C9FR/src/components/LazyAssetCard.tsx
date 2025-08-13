import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Asset, TradableAsset, PhysicalAsset } from '../types';
import AssetCard from './AssetCard';
import TradableAssetCard from './TradableAssetCard';
import PhysicalAssetCard from './PhysicalAssetCard';

interface LazyAssetCardProps {
  asset: Asset;
  onInsightsPress: (asset: Asset) => void;
  onLongPress: (asset: Asset) => void;
  onUpdateValue?: (assetId: string, newMarketPrice: number) => Promise<void>;
  index: number;
  isVisible?: boolean;
}

// const { height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = 200; // Approximate height of an asset card
// const VIEWPORT_BUFFER = screenHeight; // Load cards within one screen height

export const LazyAssetCard: React.FC<LazyAssetCardProps> = ({
  asset,
  onInsightsPress,
  onLongPress,
  onUpdateValue,
  _index,
  isVisible = true,
}) => {
  const [hasRendered, setHasRendered] = useState(false);
  const cardRef = useRef<View>(null);

  const handleLayout = useCallback(() => {
    if (!hasRendered && isVisible) {
      setHasRendered(true);
    }
  }, [hasRendered, isVisible]);

  const isPhysicalAsset = (asset: Asset): asset is PhysicalAsset => {
    return ['gold', 'silver', 'commodity'].includes(asset.assetType);
  };

  const isTradableAsset = (asset: Asset): asset is TradableAsset => {
    return ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);
  };

  const renderAssetCard = () => {
    if (!hasRendered && !isVisible) {
      // Render placeholder with same height to maintain scroll position
      return (
        <View 
          style={[styles.placeholder, { height: CARD_HEIGHT }]}
          onLayout={handleLayout}
          accessible={true}
          accessibilityLabel="Loading asset card"
          accessibilityHint="Asset information is being loaded"
        />
      );
    }

    if (isPhysicalAsset(asset)) {
      return (
        <PhysicalAssetCard
          asset={asset}
          onUpdateValue={onUpdateValue || (() => Promise.resolve())}
          onInsightsPress={() => onInsightsPress(asset)}
          onLongPress={() => onLongPress(asset)}
        />
      );
    }

    if (isTradableAsset(asset)) {
      return (
        <TradableAssetCard
          asset={asset}
          onInsightsPress={() => onInsightsPress(asset)}
          onLongPress={() => onLongPress(asset)}
        />
      );
    }

    // Fallback to generic AssetCard
    return (
      <AssetCard
        asset={asset}
        onPress={() => onInsightsPress(asset)}
        onLongPress={() => onLongPress(asset)}
      />
    );
  };

  return (
    <View ref={cardRef} style={styles.container}>
      {renderAssetCard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
});

export default LazyAssetCard;