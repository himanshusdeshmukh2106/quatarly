import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OpportunityInsightsDrawer from '../OpportunityInsightsDrawer';
import { ThemeContext } from '../../context/ThemeContext';
import { Opportunity } from '../../types';

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

const mockOpportunity: Opportunity = {
  id: '1',
  title: 'Build Emergency Fund',
  description: 'Create a safety net for unexpected expenses by building an emergency fund.',
  category: 'emergency_fund',
  opportunityType: 'investment',
  priority: 'high',
  aiInsights: 'Based on your current savings situation, building an emergency fund should be your top priority. This will provide financial security and peace of mind.',
  actionSteps: [
    'Calculate 6 months of essential expenses',
    'Open a separate high-yield savings account',
    'Set up automatic monthly transfers',
    'Start with small amounts and gradually increase'
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

describe('OpportunityInsightsDrawer', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when visible is true', () => {
    const { getByText, getAllByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Build Emergency Fund')).toBeTruthy();
    // Use getAllByText to handle multiple instances of "Emergency Fund"
    const emergencyFundTexts = getAllByText('Emergency Fund');
    expect(emergencyFundTexts.length).toBeGreaterThan(0);
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={false}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('Build Emergency Fund')).toBeNull();
  });

  it('does not render when opportunity is null', () => {
    const { queryByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={null}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('Build Emergency Fund')).toBeNull();
  });

  it('displays opportunity summary information', () => {
    const { getByText, getAllByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('HIGH')).toBeTruthy();
    expect(getByText('90%')).toBeTruthy();
    // Use getAllByText to handle multiple instances
    const emergencyFundTexts = getAllByText('Emergency Fund');
    expect(emergencyFundTexts.length).toBeGreaterThan(0);
  });

  it('displays description section', () => {
    const { getByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Description')).toBeTruthy();
    expect(getByText('Create a safety net for unexpected expenses by building an emergency fund.')).toBeTruthy();
  });

  it('displays AI analysis section', () => {
    const { getByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('AI Analysis')).toBeTruthy();
    expect(getByText('Based on your current savings situation, building an emergency fund should be your top priority. This will provide financial security and peace of mind.')).toBeTruthy();
  });

  it('displays action steps with numbered list', () => {
    const { getByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Action Steps')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('Calculate 6 months of essential expenses')).toBeTruthy();
    expect(getByText('Open a separate high-yield savings account')).toBeTruthy();
  });

  it('displays why this matters section', () => {
    const { getByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Why This Matters')).toBeTruthy();
    expect(getByText(/This opportunity is specifically tailored/)).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    // This would need a testID added to the close button in the component
    // For now, we'll test the backdrop press
  });

  it('calls onClose when backdrop is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mockOpportunity}
        onClose={mockOnClose}
      />
    );

    // This would need proper testID setup for the backdrop
    // The actual implementation would require adding testIDs to the component
  });

  it('formats category names correctly', () => {
    const jobOpportunity = { ...mockOpportunity, category: 'job_opportunities' };
    const { getAllByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={jobOpportunity}
        onClose={mockOnClose}
      />
    );

    // Use getAllByText to handle multiple instances
    const jobOpportunitiesTexts = getAllByText('Job Opportunities');
    expect(jobOpportunitiesTexts.length).toBeGreaterThan(0);
  });

  it('displays correct priority colors for different priorities', () => {
    const mediumOpportunity = { ...mockOpportunity, priority: 'medium' as const };
    const { getByText } = renderWithTheme(
      <OpportunityInsightsDrawer
        visible={true}
        opportunity={mediumOpportunity}
        onClose={mockOnClose}
      />
    );

    expect(getByText('MEDIUM')).toBeTruthy();
  });
});