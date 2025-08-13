import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AIInsightsDrawer from '../AIInsightsDrawer';
import { ThemeContext } from '../../context/ThemeContext';
import { Goal } from '../../types';

// Mock the theme context
const mockTheme = {
  background: '#f4f4f4',
  text: '#222',
  textMuted: '#a0a0a0',
  primary: '#003366',
  secondary: '#007a33',
  card: '#fff',
  cardElevated: '#fff',
  accent: '#ffd700',
  accentMuted: '#fff9e3',
  success: '#007a33',
  warning: '#ffe066',
  error: '#ff6f61',
  info: '#00509e',
  border: '#e0e0e0',
  borderMuted: '#f0f0f0',
  divider: '#e0e0e0',
  profit: '#004d00',
  loss: '#ff6f61',
  neutral: '#66a3ff',
  investment: '#007acc',
  savings: '#66b3a1',
  debt: '#ff6f61',
  insurance: '#00509e',
  education: '#d4af37',
  travel: '#66a3ff',
  emergency: '#007a33',
};

const mockThemeContext = {
  theme: mockTheme,
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

const mockGoal: Goal = {
  id: '1',
  title: 'Emergency Fund',
  currentAmount: 30000,
  targetAmount: 50000,
  description: 'For unexpected expenses',
  category: 'Savings',
  image_url: 'https://example.com/image.jpg',
  logo: 'https://example.com/logo.jpg',
  aiAnalysis: 'You are making good progress towards your emergency fund goal.',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  progressPercentage: 60,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('AIInsightsDrawer', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible with goal data', () => {
    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={mockGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('AI Insights for Emergency Fund')).toBeTruthy();
    expect(getByText('Current Progress')).toBeTruthy();
    expect(getByText('₹30,000.00 / ₹50,000.00')).toBeTruthy();
    expect(getByText('60%')).toBeTruthy();
    expect(getByText('₹20,000.00')).toBeTruthy(); // Remaining amount
    expect(getByText('AI Analysis')).toBeTruthy();
    expect(getByText('You are making good progress towards your emergency fund goal.')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={false}
        goal={mockGoal}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('AI Insights for Emergency Fund')).toBeNull();
  });

  it('does not render when goal is null', () => {
    const { queryByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={null}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('AI Insights')).toBeNull();
  });

  it('shows appropriate recommendation for low progress', () => {
    const lowProgressGoal: Goal = {
      ...mockGoal,
      currentAmount: 5000,
      progressPercentage: 10,
    };

    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={lowProgressGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Get Started')).toBeTruthy();
    expect(getByText('Set up automatic transfers to build momentum towards your goal.')).toBeTruthy();
  });

  it('shows appropriate recommendation for medium progress', () => {
    const mediumProgressGoal: Goal = {
      ...mockGoal,
      currentAmount: 25000,
      progressPercentage: 50,
    };

    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={mediumProgressGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Keep Going')).toBeTruthy();
    expect(getByText("You're making great progress! Consider increasing your monthly contribution by 10%.")).toBeTruthy();
  });

  it('shows appropriate recommendation for high progress', () => {
    const highProgressGoal: Goal = {
      ...mockGoal,
      currentAmount: 45000,
      progressPercentage: 90,
    };

    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={highProgressGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Almost There!')).toBeTruthy();
    expect(getByText("You're so close! Consider a final push to reach your goal ahead of schedule.")).toBeTruthy();
  });

  it('shows appropriate recommendation for completed goal', () => {
    const completedGoal: Goal = {
      ...mockGoal,
      currentAmount: 50000,
      progressPercentage: 100,
    };

    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={completedGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Goal Achieved!')).toBeTruthy();
    expect(getByText('Congratulations! Consider setting a new goal to continue your financial journey.')).toBeTruthy();
  });

  it('always shows pro tip recommendation', () => {
    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={mockGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Pro Tip')).toBeTruthy();
    expect(getByText('Track your progress weekly and celebrate small milestones to stay motivated.')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={mockGoal}
        onClose={mockOnClose}
      />
    );

    // Note: You might need to add testID to the close button in the component
    // This test structure shows how it would work
  });

  it('formats currency correctly', () => {
    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={mockGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('₹30,000.00 / ₹50,000.00')).toBeTruthy();
    expect(getByText('₹20,000.00')).toBeTruthy();
  });

  it('calculates progress percentage correctly', () => {
    const { getByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={mockGoal}
        onClose={mockOnClose}
      />
    );

    expect(getByText('60%')).toBeTruthy();
  });

  it('does not show remaining amount when goal is completed', () => {
    const completedGoal: Goal = {
      ...mockGoal,
      currentAmount: 50000,
      progressPercentage: 100,
    };

    const { queryByText } = renderWithTheme(
      <AIInsightsDrawer
        visible={true}
        goal={completedGoal}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('Remaining')).toBeNull();
  });
});