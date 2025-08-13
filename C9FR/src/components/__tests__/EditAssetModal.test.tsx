import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditAssetModal from '../EditAssetModal';
import { ThemeProvider } from '../../context/ThemeContext';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';

// Mock Alert
jest.spyOn(Alert, 'alert');

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

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('EditAssetModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible with tradable asset', () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(getByText('Edit Asset')).toBeTruthy();
    expect(getByText('STOCK ASSET')).toBeTruthy();
    expect(getByDisplayValue('AAPL')).toBeTruthy();
    expect(getByDisplayValue('Apple Inc.')).toBeTruthy();
    expect(getByDisplayValue('10')).toBeTruthy();
    expect(getByDisplayValue('150')).toBeTruthy();
  });

  it('renders correctly when visible with physical asset', () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockPhysicalAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(getByText('Edit Asset')).toBeTruthy();
    expect(getByText('GOLD ASSET')).toBeTruthy();
    expect(getByDisplayValue('Gold Coins')).toBeTruthy();
    expect(getByDisplayValue('5')).toBeTruthy();
    expect(getByDisplayValue('ounces')).toBeTruthy();
    expect(getByDisplayValue('1800')).toBeTruthy();
    expect(getByDisplayValue('1950')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithTheme(
      <EditAssetModal
        visible={false}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(queryByText('Edit Asset')).toBeNull();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const closeButton = getByTestId('close-button') || getByTestId('modal-close');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('validates required fields before saving', async () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Clear the name field
    const nameInput = getByDisplayValue('Apple Inc.');
    fireEvent.changeText(nameInput, '');

    // Try to save
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Asset name is required');
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates quantity field before saving', async () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Set invalid quantity
    const quantityInput = getByDisplayValue('10');
    fireEvent.changeText(quantityInput, '0');

    // Try to save
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Quantity must be greater than 0');
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with updated data when save button is pressed', async () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Update the name
    const nameInput = getByDisplayValue('Apple Inc.');
    fireEvent.changeText(nameInput, 'Apple Inc. Updated');

    // Update quantity
    const quantityInput = getByDisplayValue('10');
    fireEvent.changeText(quantityInput, '15');

    // Save
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Apple Inc. Updated',
          quantity: 15,
        })
      );
    });
  });

  it('calculates total value for physical assets', async () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockPhysicalAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Update quantity and current market price
    const quantityInput = getByDisplayValue('5');
    fireEvent.changeText(quantityInput, '10');

    const marketPriceInput = getByDisplayValue('1950');
    fireEvent.changeText(marketPriceInput, '2000');

    // Save
    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 10,
          currentMarketPrice: 2000,
          totalValue: 20000, // 10 * 2000
        })
      );
    });
  });

  it('shows loading state when saving', () => {
    const { getByText } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={true}
      />
    );

    expect(getByText('Saving...')).toBeTruthy();
  });

  it('disables symbol field for tradable assets', () => {
    const { getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const symbolInput = getByDisplayValue('AAPL');
    expect(symbolInput.props.editable).toBe(false);
  });

  it('shows purity field for gold and silver assets', () => {
    const { getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockPhysicalAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(getByDisplayValue('24K')).toBeTruthy();
  });

  it('handles text input changes correctly', () => {
    const { getByDisplayValue } = renderWithTheme(
      <EditAssetModal
        visible={true}
        asset={mockTradableAsset}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const nameInput = getByDisplayValue('Apple Inc.');
    fireEvent.changeText(nameInput, 'New Asset Name');

    // The input should reflect the change
    expect(nameInput.props.value).toBe('New Asset Name');
  });
});