/**
 * Mock Goal Data
 * 
 * This file contains mock data for goals used in development and testing.
 * Only loaded when __DEV__ is true.
 */

import { Goal } from '../types';

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Fund',
    currentAmount: 5000,
    targetAmount: 10000,
    description: 'Build a 6-month emergency fund for financial security',
    category: 'savings',
    image_url: 'https://example.com/emergency-fund.jpg',
    logo: 'https://example.com/bank-logo.png',
    aiAnalysis:
      'You are 50% towards your emergency fund goal. Consider increasing monthly contributions to reach your target faster.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    progressPercentage: 50,
  },
  {
    id: 'goal-2',
    title: 'Down Payment for House',
    currentAmount: 15000,
    targetAmount: 50000,
    description: 'Save for a 20% down payment on a new home',
    category: 'real_estate',
    image_url: 'https://example.com/house.jpg',
    logo: 'https://example.com/bank-logo.png',
    aiAnalysis:
      'You have saved 30% of your down payment goal. At your current savings rate, you will reach your goal in 2.5 years.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    progressPercentage: 30,
  },
  {
    id: 'goal-3',
    title: 'Vacation to Europe',
    currentAmount: 3500,
    targetAmount: 5000,
    description: 'Save for a 2-week European vacation',
    category: 'travel',
    image_url: 'https://example.com/europe.jpg',
    logo: 'https://example.com/bank-logo.png',
    aiAnalysis:
      'You are 70% towards your vacation goal. You should be able to take your trip within 6 months.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    progressPercentage: 70,
  },
  {
    id: 'goal-4',
    title: 'Retirement Fund',
    currentAmount: 75000,
    targetAmount: 500000,
    description: 'Build a comfortable retirement nest egg',
    category: 'retirement',
    image_url: 'https://example.com/retirement.jpg',
    logo: 'https://example.com/bank-logo.png',
    aiAnalysis:
      'You have saved 15% of your retirement goal. Consider maximizing your 401(k) contributions to accelerate growth.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    progressPercentage: 15,
  },
  {
    id: 'goal-5',
    title: 'New Car',
    currentAmount: 8000,
    targetAmount: 8000,
    description: 'Save for a reliable used car',
    category: 'vehicle',
    image_url: 'https://example.com/car.jpg',
    logo: 'https://example.com/bank-logo.png',
    aiAnalysis:
      'Congratulations! You have reached your car savings goal. You can now make your purchase.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    progressPercentage: 100,
  },
];

// Only export mock data in development
export const getGoalMocks = (): Goal[] => {
  if (__DEV__) {
    return mockGoals;
  }
  return [];
};
