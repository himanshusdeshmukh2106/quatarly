import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeContext } from '../../context/ThemeContext';
import InvestmentCard from '../InvestmentCard';
import { Investment } from '../../types';

// Mock the CandlestickChart component
jest.mock('../CandlestickChart', () => {
  return function MockCandlestickChart() {
    return null;
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

const mockTheme = {
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#000000',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  primary: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  accent: '#8B5CF6',
  accentMuted: '#F3F4F6',
};

const mockInvestment: Investment = {
  id: '1',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  assetType: 'stock',
  exchange: 'NASDAQ',
  currency: 'USD',
  quantity: 10,
  averagePurchasePrice: 150.00,
  currentPrice: 175.50,
  totalValue: 1755.00,
  dailyChange: 2.50,
  dailyChangePercent: 1.45,
  totalGainLoss: 255.00,
  totalGainLossPercent: 17.00,
  chartData: [
    {
      date: '2024-01-01',
      open: 170,
      high: 180,
      low: 165,
      close: 175.50,
      volume: 1000000,
      timestamp: Date.now(),
    },
  ],
  lastUpdated: new Date().toISOString(),
  aiAnalysis: 'Strong buy recommendation based on recent performance.',
  riskLevel: 'medium',
  recommendation: 'buy',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('InvestmentCard', () => {
  const mockOnInsightsPress = jest.fn();
  const mockOnChartInteraction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders investment information correctly', () => {
    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={mockInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('NASDAQ')).toBeTruthy();
    expect(getByText('$175.50')).toBeTruthy();
    expect(getByText('+1.45%')).toBeTruthy();
  });

  it('displays holdings information', () => {
    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={mockInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    expect(getByText('10')).toBeTruthy(); // Quantity
    expect(getByText('$1,755.00')).toBeTruthy(); // Total Value
  });

  it('shows performance metrics with correct colors', () => {
    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={mockInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    expect(getByText('$255.00 (+17.00%)')).toBeTruthy();
  });

  it('calls onInsightsPress when insights section is pressed', () => {
    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={mockInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    const insightsButton = getByText('AI Investment Insights').parent;
    fireEvent.press(insightsButton);

    expect(mockOnInsightsPress).toHaveBeenCalledWith(mockInvestment);
  });

  it('displays risk level badge correctly', () => {
    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={mockInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    expect(getByText('MEDIUM')).toBeTruthy();
  });

  it('handles negative performance correctly', () => {
    const negativeInvestment = {
      ...mockInvestment,
      dailyChange: -2.50,
      dailyChangePercent: -1.45,
      totalGainLoss: -100.00,
      totalGainLossPercent: -6.67,
    };

    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={negativeInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    expect(getByText('-1.45%')).toBeTruthy();
    expect(getByText('-$100.00 (-6.67%)')).toBeTruthy();
  });

  it('shows chart placeholder when no chart data', () => {
    const noChartInvestment = {
      ...mockInvestment,
      chartData: [],
    };

    const { getByText } = renderWithTheme(
      <InvestmentCard
        investment={noChartInvestment}
        onInsightsPress={mockOnInsightsPress}
        onChartInteraction={mockOnChartInteraction}
      />
    );

    expect(getByText('No chart data available')).toBeTruthy();
  });
});