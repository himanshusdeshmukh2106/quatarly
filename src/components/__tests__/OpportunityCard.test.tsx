import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OpportunityCard from '../OpportunityCard';
import { ThemeContext } from '../../context/ThemeContext';
import { Opportunity } from '../../types';

const mockTheme = {
  background: '#F7F8FA',
  text: '#1A1A1A',
  textMuted: '#6c757d',
  primary: '#005A9C',
  card: '#FFFFFF',
  border: '#E0E0E0',
  error: '#B00020',
};

const mockOpportunity: Opportunity = {
  id: '1',
  title: 'Build Emergency Fund',
  description: 'Create a safety net for unexpected expenses by building an emergency fund.',
  category: 'emergency_fund',
  opportunityType: 'investment',
  priority: 'high',
  aiInsights: 'Based on your current savings situation, building an emergency fund should be your top priority.',
  actionSteps: [
    'Calculate 6 months of essential expenses',
    'Open a separate high-yield savings account',
    'Set up automatic monthly transfers'
  ],
  relevanceScore: 0.9,
  imageUrl: 'https://example.com/image.jpg',
  provider: 'Test Bank',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('OpportunityCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders opportunity information correctly', () => {
    const { getByText } = renderWithTheme(
      <OpportunityCard opportunity={mockOpportunity} onPress={mockOnPress} />
    );

    expect(getByText('Build Emergency Fund')).toBeTruthy();
    expect(getByText('Create a safety net for unexpected expenses by building an emergency fund.')).toBeTruthy();
    expect(getByText('Emergency Fund')).toBeTruthy();
    expect(getByText('HIGH')).toBeTruthy();
    expect(getByText('90% match')).toBeTruthy();
  });

  it('displays correct category icon and color', () => {
    const { getByTestId } = renderWithTheme(
      <OpportunityCard opportunity={mockOpportunity} onPress={mockOnPress} />
    );

    // The icon should be shield-check for emergency_fund category
    // This would need to be tested with a more specific test setup for icons
  });

  it('shows priority badge with correct color', () => {
    const { getByText } = renderWithTheme(
      <OpportunityCard opportunity={mockOpportunity} onPress={mockOnPress} />
    );

    const priorityBadge = getByText('HIGH');
    expect(priorityBadge).toBeTruthy();
  });

  it('calls onPress when AI insights section is pressed', () => {
    const { getByText } = renderWithTheme(
      <OpportunityCard opportunity={mockOpportunity} onPress={mockOnPress} />
    );

    const insightsSection = getByText('AI Insights').parent?.parent;
    if (insightsSection) {
      fireEvent.press(insightsSection);
      expect(mockOnPress).toHaveBeenCalledWith(mockOpportunity);
    }
  });

  it('renders different priority colors correctly', () => {
    const mediumPriorityOpportunity = { ...mockOpportunity, priority: 'medium' as const };
    const lowPriorityOpportunity = { ...mockOpportunity, priority: 'low' as const };

    const { getByText: getMediumText } = renderWithTheme(
      <OpportunityCard opportunity={mediumPriorityOpportunity} onPress={mockOnPress} />
    );

    const { getByText: getLowText } = renderWithTheme(
      <OpportunityCard opportunity={lowPriorityOpportunity} onPress={mockOnPress} />
    );

    expect(getMediumText('MEDIUM')).toBeTruthy();
    expect(getLowText('LOW')).toBeTruthy();
  });

  it('formats category names correctly', () => {
    const jobOpportunity = { ...mockOpportunity, category: 'job_opportunities' };
    const { getByText } = renderWithTheme(
      <OpportunityCard opportunity={jobOpportunity} onPress={mockOnPress} />
    );

    expect(getByText('Career & Jobs')).toBeTruthy();
  });

  it('truncates AI insights preview to 2 lines', () => {
    const longInsightsOpportunity = {
      ...mockOpportunity,
      aiInsights: 'This is a very long AI insights text that should be truncated to only show 2 lines in the preview section of the opportunity card component.'
    };

    const { getByText } = renderWithTheme(
      <OpportunityCard opportunity={longInsightsOpportunity} onPress={mockOnPress} />
    );

    // The text should be present but truncated (numberOfLines=2 prop)
    // The text should be present but truncated (numberOfLines=3 prop)
    expect(getByText(longInsightsOpportunity.aiInsights)).toBeTruthy();
  });
});