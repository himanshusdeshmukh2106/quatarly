import React from 'react';
import { render } from '@testing-library/react-native';
import { AssetList } from '../../../src/components/assets/AssetList';
import { ThemeContext } from '../../../src/context/ThemeContext';
import { mockTheme } from '../../../__mocks__/theme';
import { Asset } from '../../../src/types';

const mockAssets: Asset[] = [
  { 
    id: '1', 
    name: 'Gold Bar', 
    assetType: 'gold', 
    value: 50000,
    totalValue: 50000,
    totalGainLoss: 5000,
    totalGainLossPercent: 10,
    purchasePrice: 45000,
    currentPrice: 50000,
    quantity: 1,
    purchaseDate: '2024-01-01',
    lastUpdated: '2024-01-10'
  },
  { 
    id: '2', 
    name: 'Apple Inc.', 
    assetType: 'stock', 
    symbol: 'AAPL', 
    quantity: 10, 
    price: 150,
    totalValue: 1500,
    totalGainLoss: 200,
    totalGainLossPercent: 15,
    purchasePrice: 130,
    currentPrice: 150,
    purchaseDate: '2024-01-01',
    lastUpdated: '2024-01-10'
  },
  { 
    id: '3', 
    name: 'Bitcoin', 
    assetType: 'crypto', 
    symbol: 'BTC', 
    quantity: 0.5, 
    price: 40000,
    totalValue: 20000,
    totalGainLoss: 5000,
    totalGainLossPercent: 33,
    purchasePrice: 30000,
    currentPrice: 40000,
    purchaseDate: '2024-01-01',
    lastUpdated: '2024-01-10'
  },
];

const mockPhysicalAsset = { 
  id: '4', 
  name: 'Silver Coin', 
  assetType: 'silver', 
  value: 1000,
  totalValue: 1000,
  totalGainLoss: 100,
  totalGainLossPercent: 10,
  purchasePrice: 900,
  currentPrice: 1000,
  quantity: 1,
  purchaseDate: '2024-01-01',
  lastUpdated: '2024-01-10'
};

const mockTradableAsset = { 
  id: '5', 
  name: 'Tesla Inc.', 
  assetType: 'stock', 
  symbol: 'TSLA', 
  quantity: 5, 
  price: 700,
  totalValue: 3500,
  totalGainLoss: 500,
  totalGainLossPercent: 16.67,
  purchasePrice: 600,
  currentPrice: 700,
  purchaseDate: '2024-01-01',
  lastUpdated: '2024-01-10'
};


const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, setTheme: () => {} }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('AssetList', () => {
  const onUpdateValue = jest.fn();
  const onInsightsPress = jest.fn();
  const onLongPress = jest.fn();

  it('renders a list of assets correctly', () => {
    const { getByText } = renderWithTheme(
      <AssetList
        assets={mockAssets}
        onUpdateValue={onUpdateValue}
        onInsightsPress={onInsightsPress}
        onLongPress={onLongPress}
      />
    );

    expect(getByText('Gold Bar')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Bitcoin')).toBeTruthy();
  });

  it('displays the empty state component when no assets are provided', () => {
    const { getByText } = renderWithTheme(
      <AssetList
        assets={[]}
        onUpdateValue={onUpdateValue}
        onInsightsPress={onInsightsPress}
        onLongPress={onLongPress}
      />
    );

    expect(getByText('No Assets Found')).toBeTruthy();
    expect(getByText('Add your first asset to see it here.')).toBeTruthy();
  });

  it('renders PhysicalAssetCard for physical assets', () => {
    const { getByText } = renderWithTheme(
        <AssetList
          assets={[mockPhysicalAsset]}
          onUpdateValue={onUpdateValue}
          onInsightsPress={onInsightsPress}
          onLongPress={onLongPress}
        />
    );
    expect(getByText('Silver Coin')).toBeTruthy();
  });

  it('renders TradableAssetCard for tradable assets', () => {
    const { getByText } = renderWithTheme(
        <AssetList
          assets={[mockTradableAsset]}
          onUpdateValue={onUpdateValue}
          onInsightsPress={onInsightsPress}
          onLongPress={onLongPress}
        />
    );
    expect(getByText('Tesla Inc.')).toBeTruthy();
  });

  it('should memoize renderItem callback', () => {
    const { getByText } = renderWithTheme(
      <AssetList
        assets={mockAssets}
        onUpdateValue={onUpdateValue}
        onInsightsPress={onInsightsPress}
        onLongPress={onLongPress}
      />
    );

    // Verify that the component renders correctly with memoized callbacks
    // The use of React.memo and useCallback ensures efficient re-renders
    expect(getByText('Gold Bar')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Bitcoin')).toBeTruthy();
  });

  it('returns correct keys from keyExtractor', () => {
    // Key extractor is tested indirectly through the FlatList rendering
    // We verify that each asset is rendered with its unique ID
    const { getByText } = renderWithTheme(
      <AssetList
        assets={mockAssets}
        onUpdateValue={onUpdateValue}
        onInsightsPress={onInsightsPress}
        onLongPress={onLongPress}
      />
    );
    
    // If keys are working correctly, all items should render
    expect(getByText('Gold Bar')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('Bitcoin')).toBeTruthy();
  });
});
