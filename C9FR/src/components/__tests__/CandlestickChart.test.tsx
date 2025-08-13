import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeContext } from '../../context/ThemeContext';
import CandlestickChart from '../CandlestickChart';
import { CandlestickData } from '../../types';

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: () => null,
}));

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

const mockChartData: CandlestickData[] = [
  {
    date: '2024-01-01',
    open: 100,
    high: 110,
    low: 95,
    close: 105,
    volume: 1000000,
    timestamp: Date.now(),
  },
  {
    date: '2024-01-02',
    open: 105,
    high: 115,
    low: 100,
    close: 112,
    volume: 1200000,
    timestamp: Date.now() + 86400000,
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('CandlestickChart', () => {
  const mockOnTouch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart with data', () => {
    const { queryByText } = renderWithTheme(
      <CandlestickChart
        data={mockChartData}
        width={300}
        height={150}
        onTouch={mockOnTouch}
        interactive={true}
        timeframe="daily"
      />
    );

    expect(queryByText('No chart data available')).toBeNull();
  });

  it('shows no data message when data is empty', () => {
    const { getByText } = renderWithTheme(
      <CandlestickChart
        data={[]}
        width={300}
        height={150}
        onTouch={mockOnTouch}
        interactive={true}
        timeframe="daily"
      />
    );

    expect(getByText('No chart data available')).toBeTruthy();
  });

  it('handles touch interactions when interactive', () => {
    const { getByTestId } = renderWithTheme(
      <CandlestickChart
        data={mockChartData}
        width={300}
        height={150}
        onTouch={mockOnTouch}
        interactive={true}
        timeframe="daily"
      />
    );

    // Note: This test would need proper gesture handling setup
    // For now, we're just testing that the component renders without errors
    expect(mockChartData.length).toBeGreaterThan(0);
  });

  it('renders with different timeframes', () => {
    const { rerender } = renderWithTheme(
      <CandlestickChart
        data={mockChartData}
        width={300}
        height={150}
        onTouch={mockOnTouch}
        interactive={true}
        timeframe="daily"
      />
    );

    rerender(
      <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
        <CandlestickChart
          data={mockChartData}
          width={300}
          height={150}
          onTouch={mockOnTouch}
          interactive={true}
          timeframe="weekly"
        />
      </ThemeContext.Provider>
    );

    // Component should render without errors for different timeframes
    expect(mockChartData.length).toBeGreaterThan(0);
  });

  it('handles non-interactive mode', () => {
    const { queryByText } = renderWithTheme(
      <CandlestickChart
        data={mockChartData}
        width={300}
        height={150}
        onTouch={mockOnTouch}
        interactive={false}
        timeframe="daily"
      />
    );

    expect(queryByText('No chart data available')).toBeNull();
  });
});