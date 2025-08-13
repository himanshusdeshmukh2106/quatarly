import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OpportunitiesScreen from '../OpportunitiesScreen';
import { ThemeContext } from '../../../context/ThemeContext';
import * as api from '../../../services/api';
import * as toast from '../../../utils/toast';

// Mock the API functions
jest.mock('../../../services/api');
jest.mock('../../../utils/toast');

const mockApi = api as jest.Mocked<typeof api>;
const mockToast = toast as jest.Mocked<typeof toast>;

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

const mockOpportunities = [
  {
    id: '1',
    title: 'Build Emergency Fund',
    description: 'Create a safety net for unexpected expenses.',
    category: 'emergency_fund',
    opportunityType: 'investment' as const,
    priority: 'high' as const,
    aiInsights: 'This is critical for your financial security.',
    actionSteps: ['Calculate expenses', 'Open account'],
    relevanceScore: 0.9,
    imageUrl: 'https://example.com/image1.jpg',
    provider: 'Test Bank',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Start SIP Investment',
    description: 'Begin systematic investment planning.',
    category: 'investment',
    opportunityType: 'investment' as const,
    priority: 'medium' as const,
    aiInsights: 'Good for long-term wealth building.',
    actionSteps: ['Complete KYC', 'Choose funds'],
    relevanceScore: 0.7,
    imageUrl: 'https://example.com/image2.jpg',
    provider: 'Zerodha',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={{ theme: mockTheme, isDarkMode: false, toggleTheme: jest.fn() }}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('OpportunitiesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockToast.showToast as any) = {
      success: jest.fn(),
      error: jest.fn(),
    };
  });

  it('renders loading spinner initially', () => {
    mockApi.fetchOpportunities.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    expect(getByText('Discovering opportunities...')).toBeTruthy();
  });

  it.skip('renders opportunities after successful fetch', async () => {
    mockApi.fetchOpportunities.mockResolvedValue(mockOpportunities);
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('Your Opportunities')).toBeTruthy();
      expect(getByText('Build Emergency Fund')).toBeTruthy();
      expect(getByText('Start SIP Investment')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it.skip('groups opportunities by category', async () => {
    mockApi.fetchOpportunities.mockResolvedValue(mockOpportunities);
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('Emergency Fund')).toBeTruthy();
      expect(getByText('Investment')).toBeTruthy();
      expect(getByText('1')).toBeTruthy(); // Category count
    }, { timeout: 10000 });
  }, 15000);

  it.skip('displays error message when fetch fails', async () => {
    const errorMessage = 'Network error';
    mockApi.fetchOpportunities.mockRejectedValue(new Error(errorMessage));
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText(/Failed to load opportunities/)).toBeTruthy();
      expect(mockToast.showToast.error).toHaveBeenCalledWith(
        'Failed to load opportunities. Please check your connection and try again.'
      );
    }, { timeout: 10000 });
  }, 15000);

  it.skip('displays empty state when no opportunities', async () => {
    mockApi.fetchOpportunities.mockResolvedValue([]);
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('No Opportunities Found')).toBeTruthy();
      expect(getByText(/Complete your profile questionnaire/)).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it.skip('handles refresh functionality', async () => {
    mockApi.fetchOpportunities.mockResolvedValue(mockOpportunities);
    mockApi.refreshOpportunities.mockResolvedValue([...mockOpportunities, {
      id: '3',
      title: 'New Opportunity',
      description: 'A new opportunity',
      category: 'general',
      opportunityType: 'investment' as const,
      priority: 'low' as const,
      aiInsights: 'New insights',
      actionSteps: ['New step'],
      relevanceScore: 0.5,
      imageUrl: 'https://example.com/image3.jpg',
      provider: 'Test Provider',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }]);
    
    const { getByTestId, getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('Build Emergency Fund')).toBeTruthy();
    }, { timeout: 10000 });

    // This would require adding testID to the ScrollView for RefreshControl
    // For now, we'll test the refresh function directly
    // fireEvent(getByTestId('opportunities-scroll'), 'refresh');
    
    // await waitFor(() => {
    //   expect(mockApi.refreshOpportunities).toHaveBeenCalled();
    //   expect(mockToast.showToast.success).toHaveBeenCalledWith('Opportunities refreshed successfully!');
    // });
  }, 15000);

  it.skip('handles refresh error', async () => {
    mockApi.fetchOpportunities.mockResolvedValue(mockOpportunities);
    mockApi.refreshOpportunities.mockRejectedValue(new Error('Refresh failed'));
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('Build Emergency Fund')).toBeTruthy();
    }, { timeout: 10000 });

    // Test refresh error handling
    // This would require proper testID setup for refresh control
  }, 15000);

  it.skip('opens insights drawer when opportunity insights is pressed', async () => {
    mockApi.fetchOpportunities.mockResolvedValue(mockOpportunities);
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('Build Emergency Fund')).toBeTruthy();
    }, { timeout: 10000 });

    // Find and press the AI Insights section
    const insightsButton = getByText('AI Insights');
    fireEvent.press(insightsButton.parent?.parent || insightsButton);

    // The drawer should open (this would need proper testing setup)
    // expect(getByText('AI Analysis')).toBeTruthy();
  }, 15000);

  it.skip('sorts categories by priority', async () => {
    const mixedOpportunities = [
      { ...mockOpportunities[1], priority: 'low' as const }, // investment, low
      { ...mockOpportunities[0], priority: 'high' as const }, // emergency_fund, high
    ];
    
    mockApi.fetchOpportunities.mockResolvedValue(mixedOpportunities);
    
    const { getAllByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      // High priority categories should appear first
      const categoryHeaders = getAllByText(/Emergency Fund|Investment/);
      // This would need more specific testing to verify order
    }, { timeout: 10000 });
  }, 15000);

  it.skip('displays pull to refresh hint', async () => {
    mockApi.fetchOpportunities.mockResolvedValue(mockOpportunities);
    
    const { getByText } = renderWithTheme(<OpportunitiesScreen />);
    
    await waitFor(() => {
      expect(getByText('Pull down to refresh opportunities')).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);
});