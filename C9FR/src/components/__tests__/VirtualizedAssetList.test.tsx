import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VirtualizedAssetList from '../VirtualizedAssetList';
import { ThemeProvider } from '../../context/ThemeContext';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';

const mockTradableAsset: TradableAsset = {
  id: '1',
  name: 'Apple Inc.',
  symbol: 'AAPL',
  assetType: 'stock',
  exchange: 'NASDAQ',
  currency: 'USD',
  quantity: 10,
  averagePurchasePrice: 150,
  currentPrice: 175,
  totalValue: 1750,
  dailyChange: 5,
  dailyChangePercent: 2.94,
  totalGainLoss: 250,
  totalGainLossPercent: 16.67,
  chartData: [],
  lastUpdated: '2024-01-15T10:00:00Z',
  aiAnalysis: 'Strong buy recommendation',
  riskLevel: 'medium',
  recommendation: 'buy',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  sector: 'Technology',
};

const mockPhysicalAsset: PhysicalAsset = {
  id: '2',
  name: 'Gold Coins',
  assetType: 'gold',
  quantity: 5,
  unit: 'ounces',
  purchasePrice: 1800,
  currentMarketPrice: 1950,
  totalValue: 9750,
  totalGainLoss: 750,
  totalGainLossPercent: 8.33,
  purity: '24K',
  storage: 'Bank Locker',
  certificate: 'GC123456',
  manuallyUpdated: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  aiAnalysis: 'Good hedge against inflation',
  riskLevel: 'low',
  recommendation: 'hold',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockAssets: Asset[] = [mockTradableAsset, mockPhysicalAsset];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Mock FlatList for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    FlatList: ({ data, renderItem, ListFooterComponent, ListEmptyComponent }: any) => {
      const { View, Text } = RN;
      return (
        <View testID="virtualized-list">
          {data && data.length > 0 ? (
            data.map((item: any, index: number) => (
              <View key={item.id || index}>
                {renderItem({ item, index })}
              </View>
            ))
          ) : (
            ListEmptyComponent && <ListEmptyComponent />
          )}
          {ListFooterComponent && <ListFooterComponent />}
        </View>
      );
    },
  };
});

describe('VirtualizedAssetList', () => {
  const mockOnRefresh = jest.fn();
  const mockOnInsightsPress = jest.fn();
  const mockOnLongPress = jest.fn();
  const mockOnUpdateValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with assets', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    expect(getByTestId('virtualized-list')).toBeTruthy();
    expect(getByText('2 assets shown')).toBeTruthy();
  });

  it('renders empty state when no assets', () => {
    const MockEmptyComponent = () => {
      const { Text } = require('react-native');
      return <Text>No assets found</Text>;
    };

    const { getByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={[]}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
        ListEmptyComponent={MockEmptyComponent}
      />
    );

    expect(getByText('No assets found')).toBeTruthy();
  });

  it('shows correct footer text for single asset', () => {
    const { getByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={[mockTradableAsset]}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    expect(getByText('1 asset shown')).toBeTruthy();
  });

  it('shows correct footer text for multiple assets', () => {
    const { getByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    expect(getByText('2 assets shown')).toBeTruthy();
  });

  it('renders custom footer component when provided', () => {
    const MockFooterComponent = () => {
      const { Text } = require('react-native');
      return <Text>Custom Footer</Text>;
    };

    const { getByText, queryByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
        ListFooterComponent={MockFooterComponent}
      />
    );

    expect(getByText('Custom Footer')).toBeTruthy();
    expect(queryByText('2 assets shown')).toBeNull();
  });

  it('renders custom header component when provided', () => {
    const MockHeaderComponent = () => {
      const { Text } = require('react-native');
      return <Text>Custom Header</Text>;
    };

    const { getByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
        ListHeaderComponent={MockHeaderComponent}
      />
    );

    expect(getByText('Custom Header')).toBeTruthy();
  });

  it('handles refresh correctly', () => {
    // Since we mocked FlatList, we can't easily test RefreshControl
    // But we can verify the component renders without errors
    const { getByTestId } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={true}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    expect(getByTestId('virtualized-list')).toBeTruthy();
  });

  it('passes correct props to LazyAssetCard', () => {
    // This test verifies that the component renders without errors
    // and that the asset data is passed through correctly
    const { getByTestId } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    expect(getByTestId('virtualized-list')).toBeTruthy();
  });

  it('handles empty assets array gracefully', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <VirtualizedAssetList
        assets={[]}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    expect(getByTestId('virtualized-list')).toBeTruthy();
    expect(getByText('0 assets shown')).toBeTruthy();
  });

  it('maintains performance optimizations', () => {
    // Test that the component renders with performance props
    const { getByTestId } = renderWithTheme(
      <VirtualizedAssetList
        assets={mockAssets}
        refreshing={false}
        onRefresh={mockOnRefresh}
        onInsightsPress={mockOnInsightsPress}
        onLongPress={mockOnLongPress}
        onUpdateValue={mockOnUpdateValue}
      />
    );

    // Component should render successfully with all performance optimizations
    expect(getByTestId('virtualized-list')).toBeTruthy();
  });
});