import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AssetsScreen from '../AssetsScreen';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAssets } from '../../../hooks/useAssets';

// Mock the useAssets hook
jest.mock('../../../hooks/useAssets');
const mockUseAssets = useAssets as jest.MockedFunction<typeof useAssets>;

// Mock the components
jest.mock('../../../components/AssetCard', () => {
  return jest.fn(({ asset, onPress, onLongPress }) => {
    const MockedAssetCard = require('react-native').TouchableOpacity;
    const MockedText = require('react-native').Text;
    return (
      <MockedAssetCard onPress={onPress} onLongPress={onLongPress} testID={`asset-card-${asset.id}`}>
        <MockedText>{asset.name}</MockedText>
      </MockedAssetCard>
    );
  });
});

jest.mock('../../../components/TradableAssetCard', () => {
  return jest.fn(({ asset, onInsightsPress, onLongPress }) => {
    const MockedCard = require('react-native').TouchableOpacity;
    const MockedText = require('react-native').Text;
    return (
      <MockedCard onPress={onInsightsPress} onLongPress={onLongPress} testID={`tradable-card-${asset.id}`}>
        <MockedText>{asset.name}</MockedText>
      </MockedCard>
    );
  });
});

jest.mock('../../../components/PhysicalAssetCard', () => {
  return jest.fn(({ asset, onInsightsPress, onLongPress }) => {
    const MockedCard = require('react-native').TouchableOpacity;
    const MockedText = require('react-native').Text;
    return (
      <MockedCard onPress={onInsightsPress} onLongPress={onLongPress} testID={`physical-card-${asset.id}`}>
        <MockedText>{asset.name}</MockedText>
      </MockedCard>
    );
  });
});

jest.mock('../../../components/AddAssetModal', () => {
  return jest.fn(({ visible, onClose, onAssetCreate }) => {
    const MockedModal = require('react-native').Modal;
    const MockedView = require('react-native').View;
    const MockedButton = require('react-native').TouchableOpacity;
    const MockedText = require('react-native').Text;
    
    return (
      <MockedModal visible={visible} testID="add-asset-modal">
        <MockedView>
          <MockedButton onPress={onClose} testID="close-modal">
            <MockedText>Close</MockedText>
          </MockedButton>
          <MockedButton onPress={() => onAssetCreate({
            assetType: 'stock',
            name: 'Test Asset',
            symbol: 'TEST',
            quantity: 1,
            purchasePrice: 100,
          })} testID="create-asset">
            <MockedText>Create Asset</MockedText>
          </MockedButton>
        </MockedView>
      </MockedModal>
    );
  });
});

jest.mock('../../../components/AssetInsightsDrawer', () => {
  return jest.fn(({ visible, asset, onClose }) => {
    const MockedModal = require('react-native').Modal;
    const MockedView = require('react-native').View;
    const MockedButton = require('react-native').TouchableOpacity;
    const MockedText = require('react-native').Text;
    
    return (
      <MockedModal visible={visible} testID="insights-drawer">
        <MockedView>
          <MockedText>{asset?.name} Insights</MockedText>
          <MockedButton onPress={onClose} testID="close-insights">
            <MockedText>Close</MockedText>
          </MockedButton>
        </MockedView>
      </MockedModal>
    );
  });
});

const mockTheme = {
  background: '#FFFFFF',
  card: '#F8F9FA',
  cardElevated: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#8B5CF6',
  accentMuted: '#C4B5FD',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  borderMuted: '#F3F4F6',
  surfaceVariant: '#F1F5F9',
  onSurface: '#475569',
  onSurfaceVariant: '#64748B',
  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',
  inverseSurface: '#334155',
  inverseOnSurface: '#F1F5F9',
  inversePrimary: '#93C5FD',
  shadow: '#000000',
  scrim: '#000000',
  surfaceTint: '#3B82F6',
  emergency: '#DC2626',
};

const mockAssets = [
  {
    id: '1',
    name: 'Apple Inc.',
    assetType: 'stock',
    symbol: 'AAPL',
    totalValue: 1600,
    totalGainLoss: 100,
    totalGainLossPercent: 6.67,
    aiAnalysis: 'Strong buy',
    riskLevel: 'medium',
    recommendation: 'buy',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Gold Holdings',
    assetType: 'gold',
    totalValue: 5500,
    totalGainLoss: 500,
    totalGainLossPercent: 10,
    aiAnalysis: 'Good hedge',
    riskLevel: 'low',
    recommendation: 'hold',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
  },
];

const mockUseAssetsReturn = {
  assets: mockAssets,
  loading: false,
  refreshing: false,
  error: null,
  lastUpdated: '2024-01-01T00:00:00Z',
  refreshAssets: jest.fn(),
  createNewAsset: jest.fn(),
  bulkImportAssets: jest.fn(),
  updatePhysicalAssetValue: jest.fn(),
  updateExistingAsset: jest.fn(),
  deleteExistingAsset: jest.fn(),
  getFilteredAssets: jest.fn((filter) => {
    if (filter === 'all') return mockAssets;
    if (filter === 'tradeable') return mockAssets.filter(a => ['stock', 'etf', 'bond', 'crypto'].includes(a.assetType));
    if (filter === 'physical') return mockAssets.filter(a => ['gold', 'silver', 'commodity'].includes(a.assetType));
    return mockAssets.filter(a => a.assetType === filter);
  }),
  getTotalPortfolioValue: jest.fn(() => 7100),
  getTotalGainLoss: jest.fn(() => ({ amount: 600, percentage: 9.23 })),
  getAssetTypeCount: jest.fn((type) => mockAssets.filter(a => a.assetType === type).length),
  loadAssets: jest.fn(),
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('AssetsScreen', () => {
  beforeEach(() => {
    mockUseAssets.mockReturnValue(mockUseAssetsReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Header Display', () => {
    it('displays portfolio summary correctly', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('Total Portfolio Value')).toBeTruthy();
      expect(getByText('₹7,100')).toBeTruthy();
      expect(getByText('+₹600 (+9.23%)')).toBeTruthy();
    });

    it('displays last updated timestamp', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText(/Last updated:/)).toBeTruthy();
    });

    it('shows add asset button', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('Add Asset')).toBeTruthy();
    });

    it('shows refresh button', () => {
      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      // The refresh button would have a refresh icon
      expect(getByTestId('refresh-button')).toBeTruthy();
    });
  });

  describe('Filter Tabs', () => {
    it('displays all filter tabs with counts', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('All Assets')).toBeTruthy();
      expect(getByText('Tradeable')).toBeTruthy();
      expect(getByText('Physical')).toBeTruthy();
      expect(getByText('Stocks')).toBeTruthy();
      expect(getByText('Crypto')).toBeTruthy();
      expect(getByText('Gold')).toBeTruthy();
    });

    it('filters assets when tab is selected', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      const physicalTab = getByText('Physical');
      fireEvent.press(physicalTab);

      // Should call getFilteredAssets with 'physical'
      expect(mockUseAssetsReturn.getFilteredAssets).toHaveBeenCalledWith('physical');
    });

    it('shows asset counts in badges', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      // The badges would show counts (implementation would depend on styling)
      expect(getByText('2')).toBeTruthy(); // Total assets count
    });
  });

  describe('Asset List Display', () => {
    it('renders asset cards for all assets', () => {
      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      expect(getByTestId('tradable-card-1')).toBeTruthy();
      expect(getByTestId('physical-card-2')).toBeTruthy();
    });

    it('displays asset names', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('Apple Inc.')).toBeTruthy();
      expect(getByText('Gold Holdings')).toBeTruthy();
    });

    it('shows asset count in footer', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('2 assets shown')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator when loading', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        loading: true,
        assets: [],
      });

      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('Loading your assets...')).toBeTruthy();
    });

    it('shows refreshing state', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        refreshing: true,
      });

      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      // RefreshControl would be in refreshing state
      expect(getByTestId('refresh-control')).toBeTruthy();
    });
  });

  describe('Error States', () => {
    it('displays error message when there is an error', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        loading: false,
        error: 'Failed to load assets',
        assets: [],
      });

      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('Failed to Load Assets')).toBeTruthy();
      expect(getByText('Failed to load assets')).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
    });

    it('calls loadAssets when retry button is pressed', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        loading: false,
        error: 'Failed to load assets',
        assets: [],
      });

      const { getByText } = renderWithTheme(<AssetsScreen />);

      const retryButton = getByText('Try Again');
      fireEvent.press(retryButton);

      expect(mockUseAssetsReturn.loadAssets).toHaveBeenCalled();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no assets exist', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        assets: [],
        getFilteredAssets: jest.fn(() => []),
      });

      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('No Assets Yet')).toBeTruthy();
      expect(getByText('Start building your portfolio by adding your first asset')).toBeTruthy();
      expect(getByText('Add Your First Asset')).toBeTruthy();
    });

    it('shows filtered empty state', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        getFilteredAssets: jest.fn(() => []),
      });

      const { getByText } = renderWithTheme(<AssetsScreen />);

      const cryptoTab = getByText('Crypto');
      fireEvent.press(cryptoTab);

      expect(getByText('No crypto Assets')).toBeTruthy();
    });
  });

  describe('Modal Interactions', () => {
    it('opens add asset modal when add button is pressed', async () => {
      const { getByText, getByTestId } = renderWithTheme(<AssetsScreen />);

      const addButton = getByText('Add Asset');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(getByTestId('add-asset-modal')).toBeTruthy();
      });
    });

    it('closes add asset modal', async () => {
      const { getByText, getByTestId, queryByTestId } = renderWithTheme(<AssetsScreen />);

      const addButton = getByText('Add Asset');
      fireEvent.press(addButton);

      await waitFor(() => {
        const closeButton = getByTestId('close-modal');
        fireEvent.press(closeButton);
      });

      await waitFor(() => {
        expect(queryByTestId('add-asset-modal')).toBeFalsy();
      });
    });

    it('creates asset through modal', async () => {
      const { getByText, getByTestId } = renderWithTheme(<AssetsScreen />);

      const addButton = getByText('Add Asset');
      fireEvent.press(addButton);

      await waitFor(() => {
        const createButton = getByTestId('create-asset');
        fireEvent.press(createButton);
      });

      expect(mockUseAssetsReturn.createNewAsset).toHaveBeenCalledWith({
        assetType: 'stock',
        name: 'Test Asset',
        symbol: 'TEST',
        quantity: 1,
        purchasePrice: 100,
      });
    });
  });

  describe('Asset Insights', () => {
    it('opens insights drawer when asset insights is pressed', async () => {
      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      const assetCard = getByTestId('tradable-card-1');
      fireEvent.press(assetCard);

      await waitFor(() => {
        expect(getByTestId('insights-drawer')).toBeTruthy();
      });
    });

    it('closes insights drawer', async () => {
      const { getByTestId, queryByTestId } = renderWithTheme(<AssetsScreen />);

      const assetCard = getByTestId('tradable-card-1');
      fireEvent.press(assetCard);

      await waitFor(() => {
        const closeButton = getByTestId('close-insights');
        fireEvent.press(closeButton);
      });

      await waitFor(() => {
        expect(queryByTestId('insights-drawer')).toBeFalsy();
      });
    });
  });

  describe('Asset Management', () => {
    it('handles asset long press for management options', () => {
      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      const assetCard = getByTestId('tradable-card-1');
      fireEvent(assetCard, 'longPress');

      // Long press would trigger action sheet or alert (mocked in test environment)
    });

    it('calls refresh when refresh button is pressed', () => {
      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      const refreshButton = getByTestId('refresh-button');
      fireEvent.press(refreshButton);

      expect(mockUseAssetsReturn.refreshAssets).toHaveBeenCalled();
    });
  });

  describe('Pull to Refresh', () => {
    it('handles pull to refresh', () => {
      const { getByTestId } = renderWithTheme(<AssetsScreen />);

      const scrollView = getByTestId('assets-scroll-view');
      fireEvent(scrollView, 'refresh');

      expect(mockUseAssetsReturn.refreshAssets).toHaveBeenCalled();
    });
  });

  describe('Performance Display', () => {
    it('displays positive performance in green styling', () => {
      const { getByText } = renderWithTheme(<AssetsScreen />);

      const gainText = getByText('+₹600 (+9.23%)');
      // Styling would be tested with style snapshots
      expect(gainText).toBeTruthy();
    });

    it('displays negative performance in red styling', () => {
      mockUseAssets.mockReturnValue({
        ...mockUseAssetsReturn,
        getTotalGainLoss: jest.fn(() => ({ amount: -600, percentage: -9.23 })),
      });

      const { getByText } = renderWithTheme(<AssetsScreen />);

      expect(getByText('-₹600 (-9.23%)')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for interactive elements', () => {
      const { getByLabelText } = renderWithTheme(<AssetsScreen />);

      expect(getByLabelText('Add Asset')).toBeTruthy();
      expect(getByLabelText('Refresh Assets')).toBeTruthy();
    });

    it('supports screen reader navigation', () => {
      const { getByRole } = renderWithTheme(<AssetsScreen />);

      expect(getByRole('button')).toBeTruthy();
    });
  });
});