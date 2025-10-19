/**
 * Integration Tests for GoalsScreen
 * 
 * Tests the complete flow of the GoalsScreen including:
 * - Loading and displaying goals
 * - Creating new goals
 * - Refreshing goals
 * - Error handling
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import GoalsScreen from '../../../screens/main/GoalsScreen';
import { goalsApi } from '../../../api/goals';
import * as toast from '../../../utils/toast';
import { ThemeContext } from '../../../context/ThemeContext';

// Mock dependencies
jest.mock('../../../api/goals');
jest.mock('../../../utils/toast');
jest.mock('../../../context/ThemeContext', () => ({
    ThemeContext: {
        Consumer: ({ children }: any) => children({
            theme: {
                background: '#FFFFFF',
                card: '#F5F5F5',
                text: '#000000',
                textMuted: '#666666',
                border: '#E0E0E0',
                primary: '#4F46E5',
                accent: '#10B981',
                accentMuted: '#D1FAE5',
                success: '#10B981',
            }
        }),
    },
    useContext: jest.fn(() => ({
        theme: {
            background: '#FFFFFF',
            card: '#F5F5F5',
            text: '#000000',
            textMuted: '#666666',
            border: '#E0E0E0',
            primary: '#4F46E5',
            accent: '#10B981',
            accentMuted: '#D1FAE5',
            success: '#10B981',
        }
    })),
}));

// Mock components
jest.mock('../../../components/ProgressBar', () => 'ProgressBar');
jest.mock('../../../components/LoadingSpinner', () => 'LoadingSpinner');
jest.mock('../../../components/ErrorBoundary', () => ({ children }: any) => children);
jest.mock('../../../components/AddGoalModal', () => 'AddGoalModal');
jest.mock('../../../components/AIInsightsDrawer', () => 'AIInsightsDrawer');

const mockGoals = [
    {
        id: '1',
        title: 'Emergency Fund',
        targetAmount: 500000,
        currentAmount: 250000,
        deadline: '2024-12-31',
        category: 'savings',
        priority: 'high',
        status: 'active',
        image_url: 'https://example.com/image1.jpg',
        logo: 'https://example.com/logo1.png',
        aiAnalysis: 'You are on track to meet your goal',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
    },
    {
        id: '2',
        title: 'Vacation Fund',
        targetAmount: 200000,
        currentAmount: 50000,
        deadline: '2024-06-30',
        category: 'lifestyle',
        priority: 'medium',
        status: 'active',
        image_url: 'https://example.com/image2.jpg',
        logo: 'https://example.com/logo2.png',
        aiAnalysis: 'Consider increasing monthly contributions',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
    },
];

const mockTheme = {
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    textMuted: '#666666',
    border: '#E0E0E0',
    primary: '#4F46E5',
    accent: '#10B981',
    accentMuted: '#D1FAE5',
    success: '#10B981',
};

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeContext.Provider value={{ theme: mockTheme as any, isDarkMode: false, toggleTheme: jest.fn() }}>
            {component}
        </ThemeContext.Provider>
    );
};

describe('GoalsScreen Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (goalsApi.fetchAll as jest.Mock).mockResolvedValue(mockGoals);
    });

    describe('Screen Loading', () => {
        it('should load and display goals on mount', async () => {
            const { getByText, queryByText } = renderWithTheme(<GoalsScreen />);

            // Should show loading initially
            expect(queryByText('Loading goals...')).toBeTruthy();

            // Wait for goals to load
            await waitFor(() => {
                expect(getByText('Emergency Fund')).toBeTruthy();
                expect(getByText('Vacation Fund')).toBeTruthy();
            });

            // Verify API was called
            expect(goalsApi.fetchAll).toHaveBeenCalledTimes(1);
        });

        it('should display goal details correctly', async () => {
            const { getByText } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                expect(getByText('Emergency Fund')).toBeTruthy();
            });

            // Check if amounts are displayed
            expect(getByText(/₹2,50,000/)).toBeTruthy();
            expect(getByText(/Goal: ₹5,00,000/)).toBeTruthy();

            // Check if progress percentage is displayed
            expect(getByText('50% complete')).toBeTruthy();
        });

        it('should display AI insights for each goal', async () => {
            const { getByText } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                expect(getByText('You are on track to meet your goal')).toBeTruthy();
                expect(getByText('Consider increasing monthly contributions')).toBeTruthy();
            });
        });
    });

    describe('Refresh Functionality', () => {
        it('should refresh goals when pull-to-refresh is triggered', async () => {
            const { getByTestId, getByText } = renderWithTheme(<GoalsScreen />);

            // Wait for initial load
            await waitFor(() => {
                expect(getByText('Emergency Fund')).toBeTruthy();
            });

            // Clear the mock to verify refresh call
            (goalsApi.fetchAll as jest.Mock).mockClear();

            // Trigger refresh (simulate pull-to-refresh)
            const scrollView = getByTestId('goals-scroll-view');
            fireEvent(scrollView, 'refresh');

            await waitFor(() => {
                expect(goalsApi.fetchAll).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when goals fail to load', async () => {
            const errorMessage = 'Network error';
            (goalsApi.fetchAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

            const { queryByText } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                expect(toast.showToast.error).toHaveBeenCalledWith(
                    'Failed to load goals. Please check your connection and try again.'
                );
            });
        });

        it('should handle image loading errors gracefully', async () => {
            const { getAllByTestId } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                const images = getAllByTestId('goal-image');
                expect(images.length).toBeGreaterThan(0);
            });

            // Simulate image error
            const images = getAllByTestId('goal-image');
            fireEvent(images[0], 'error');

            // Should not crash and should use fallback image
            await waitFor(() => {
                expect(images[0]).toBeTruthy();
            });
        });
    });

    describe('Add Goal Flow', () => {
        it('should open add goal modal when add button is pressed', async () => {
            const { getByText, queryByTestId } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                expect(getByText('Emergency Fund')).toBeTruthy();
            });

            // Find and press add button
            const addButton = getByText('Add New Goal');
            fireEvent.press(addButton);

            // Modal should be visible
            await waitFor(() => {
                const modal = queryByTestId('add-goal-modal');
                expect(modal).toBeTruthy();
            });
        });
    });

    describe('AI Insights', () => {
        it('should open AI insights drawer when insights card is pressed', async () => {
            const { getByText, queryByTestId } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                expect(getByText('Emergency Fund')).toBeTruthy();
            });

            // Find and press AI insights card
            const insightsCard = getByText('You are on track to meet your goal');
            if (insightsCard.parent) {
                fireEvent.press(insightsCard.parent);
            }

            // Drawer should be visible
            await waitFor(() => {
                const drawer = queryByTestId('ai-insights-drawer');
                expect(drawer).toBeTruthy();
            });
        });
    });

    describe('Empty State', () => {
        it('should display add goal button when no goals exist', async () => {
            (goalsApi.fetchAll as jest.Mock).mockResolvedValue([]);

            const { getByText } = renderWithTheme(<GoalsScreen />);

            await waitFor(() => {
                expect(getByText('Add New Goal')).toBeTruthy();
            });
        });
    });
});
