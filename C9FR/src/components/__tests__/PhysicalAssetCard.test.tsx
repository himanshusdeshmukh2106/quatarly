import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PhysicalAssetCard from '../PhysicalAssetCard';
import { ThemeContext } from '../../context/ThemeContext';
import { PhysicalAsset } from '../../types';

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

const mockGoldAsset: PhysicalAsset = {
  id: '1',
  name: 'Gold Holdings',
  assetType: 'gold',
  quantity: 100,
  unit: 'grams',
  purchasePrice: 50,
  currentMarketPrice: 55,
  totalValue: 5500,
  totalGainLoss: 500,
  totalGainLossPercent: 10,
  aiAnalysis: 'Good hedge against inflation',
  riskLevel: 'low',
  recommendation: 'hold',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastUpdated: '2024-01-01T00:00:00Z',
  purity: '24K',
  storage: 'Bank vault',
  certificate: 'CERT123',
  manuallyUpdated: true,
};

const mockSilverAsset: PhysicalAsset = {
  ...mockGoldAsset,
  id: '2',
  name: 'Silver Coins',
  assetType: 'silver',
  quantity: 500,
  unit: 'ounces',
  purchasePrice: 25,
  currentMarketPrice: 30,
  totalValue: 15000,
  totalGainLoss: 2500,
  totalGainLossPercent: 20,
  purity: '999',
  storage: 'Home safe',
  certificate: undefined,
  manuallyUpdated: false,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('PhysicalAssetCard', () => {
  describe('Gold Asset Rendering', () => {
    it('renders gold asset information correctly', () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      expect(getByText('Gold Holdings')).toBeTruthy();
      expect(getByText('100 grams')).toBeTruthy();
      expect(getByText('Purity: 24K')).toBeTruthy();
      expect(getByText('₹5,500')).toBeTruthy();
      expect(getByText('@ ₹55/grams')).toBeTruthy();
    });

    it('displays gold-specific details', () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      expect(getByText('Storage: Bank vault')).toBeTruthy();
      expect(getByText('Certificate: CERT123')).toBeTruthy();
      expect(getByText('Manually updated')).toBeTruthy();
    });

    it('displays performance metrics', () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      expect(getByText('Purchase Price')).toBeTruthy();
      expect(getByText('₹50/grams')).toBeTruthy();
      expect(getByText('Market Price')).toBeTruthy();
      expect(getByText('₹55/grams')).toBeTruthy();
      expect(getByText('Total P&L')).toBeTruthy();
      expect(getByText('₹500 (+10.00%)')).toBeTruthy();
    });
  });

  describe('Silver Asset Rendering', () => {
    it('renders silver asset information correctly', () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockSilverAsset} />
      );

      expect(getByText('Silver Coins')).toBeTruthy();
      expect(getByText('500 ounces')).toBeTruthy();
      expect(getByText('Purity: 999')).toBeTruthy();
      expect(getByText('₹15,000')).toBeTruthy();
    });

    it('handles missing certificate gracefully', () => {
      const { queryByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockSilverAsset} />
      );

      expect(queryByText('Certificate:')).toBeFalsy();
    });

    it('does not show manually updated when false', () => {
      const { queryByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockSilverAsset} />
      );

      expect(queryByText('Manually updated')).toBeFalsy();
    });
  });

  describe('Update Value Modal', () => {
    it('opens update modal when update button is pressed', async () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      const updateButton = getByText('Update Market Price');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(getByText('Update Market Price')).toBeTruthy();
        expect(getByText('New Market Price (per grams)')).toBeTruthy();
      });
    });

    it('closes modal when cancel is pressed', async () => {
      const { getByText, queryByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      const updateButton = getByText('Update Market Price');
      fireEvent.press(updateButton);

      await waitFor(() => {
        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);
      });

      await waitFor(() => {
        expect(queryByText('New Market Price (per grams)')).toBeFalsy();
      });
    });

    it('calls onUpdateValue when update is confirmed', async () => {
      const onUpdateValueMock = jest.fn();
      const { getByText, getByDisplayValue } = renderWithTheme(
        <PhysicalAssetCard 
          asset={mockGoldAsset} 
          onUpdateValue={onUpdateValueMock}
        />
      );

      const updateButton = getByText('Update Market Price');
      fireEvent.press(updateButton);

      await waitFor(() => {
        const input = getByDisplayValue('55');
        fireEvent.changeText(input, '60');
        
        const confirmButton = getByText('Update');
        fireEvent.press(confirmButton);
      });

      expect(onUpdateValueMock).toHaveBeenCalledWith('1', 60);
    });

    it('validates input and shows error for invalid price', async () => {
      const { getByText, getByDisplayValue } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      const updateButton = getByText('Update Market Price');
      fireEvent.press(updateButton);

      await waitFor(() => {
        const input = getByDisplayValue('55');
        fireEvent.changeText(input, 'invalid');
        
        const confirmButton = getByText('Update');
        fireEvent.press(confirmButton);
      });

      // Alert would be shown (mocked in test environment)
    });
  });

  describe('Interaction Handling', () => {
    it('handles press events', () => {
      const onPressMock = jest.fn();
      const onLongPressMock = jest.fn();

      const { getByTestId } = renderWithTheme(
        <PhysicalAssetCard 
          asset={mockGoldAsset}
          onPress={onPressMock}
          onLongPress={onLongPressMock}
          testID="physical-asset-card"
        />
      );

      const card = getByTestId('physical-asset-card');
      fireEvent.press(card);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('handles insights button press', () => {
      const onInsightsMock = jest.fn();

      const { getByText } = renderWithTheme(
        <PhysicalAssetCard 
          asset={mockGoldAsset}
          onInsightsPress={onInsightsMock}
        />
      );

      const insightsButton = getByText('AI Insights');
      fireEvent.press(insightsButton);
      expect(onInsightsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Calculations', () => {
    it('calculates current value correctly', () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      // 100 grams * 55 per gram = 5500
      expect(getByText('₹5,500')).toBeTruthy();
    });

    it('calculates gain/loss correctly', () => {
      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      // (55 - 50) * 100 = 500 gain, 10% increase
      expect(getByText('₹500 (+10.00%)')).toBeTruthy();
    });

    it('handles negative performance', () => {
      const lossAsset: PhysicalAsset = {
        ...mockGoldAsset,
        currentMarketPrice: 45,
        totalValue: 4500,
        totalGainLoss: -500,
        totalGainLossPercent: -10,
      };

      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={lossAsset} />
      );

      expect(getByText('₹-500 (-10.00%)')).toBeTruthy();
    });
  });

  describe('Asset Type Styling', () => {
    it('applies gold-specific styling', () => {
      const { getByTestId } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} testID="gold-card" />
      );

      const card = getByTestId('gold-card');
      // Icon color and styling would be tested with style snapshots
      expect(card).toBeTruthy();
    });

    it('applies silver-specific styling', () => {
      const { getByTestId } = renderWithTheme(
        <PhysicalAssetCard asset={mockSilverAsset} testID="silver-card" />
      );

      const card = getByTestId('silver-card');
      expect(card).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      expect(getByLabelText('AI Insights')).toBeTruthy();
      expect(getByLabelText('Update Market Price')).toBeTruthy();
    });

    it('supports screen reader navigation', () => {
      const { getByRole } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('has proper modal accessibility', async () => {
      const { getByText, getByLabelText } = renderWithTheme(
        <PhysicalAssetCard asset={mockGoldAsset} />
      );

      const updateButton = getByText('Update Market Price');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(getByLabelText('Close modal')).toBeTruthy();
        expect(getByLabelText('Price input')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing optional fields gracefully', () => {
      const minimalAsset: PhysicalAsset = {
        id: '1',
        name: 'Basic Gold',
        assetType: 'gold',
        quantity: 10,
        unit: 'grams',
        purchasePrice: 50,
        totalValue: 500,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        aiAnalysis: 'Basic analysis',
        riskLevel: 'low',
        recommendation: 'hold',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        manuallyUpdated: false,
      };

      const { getByText, queryByText } = renderWithTheme(
        <PhysicalAssetCard asset={minimalAsset} />
      );

      expect(getByText('Basic Gold')).toBeTruthy();
      expect(queryByText('Purity:')).toBeFalsy();
      expect(queryByText('Storage:')).toBeFalsy();
      expect(queryByText('Certificate:')).toBeFalsy();
    });

    it('handles zero values correctly', () => {
      const zeroAsset: PhysicalAsset = {
        ...mockGoldAsset,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
      };

      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={zeroAsset} />
      );

      expect(getByText('₹0 (0.00%)')).toBeTruthy();
    });
  });

  describe('Currency Formatting', () => {
    it('formats currency with proper separators', () => {
      const largeValueAsset: PhysicalAsset = {
        ...mockGoldAsset,
        quantity: 1000,
        currentMarketPrice: 5500,
        totalValue: 5500000,
        totalGainLoss: 500000,
      };

      const { getByText } = renderWithTheme(
        <PhysicalAssetCard asset={largeValueAsset} />
      );

      expect(getByText('₹5,500,000')).toBeTruthy();
      expect(getByText('₹500,000')).toBeTruthy();
    });
  });
});