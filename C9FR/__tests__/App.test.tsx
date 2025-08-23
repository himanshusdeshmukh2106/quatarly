import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';
import { AuthContext } from '../src/context/AuthContext';
import { ThemeContext } from '../src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock api service
jest.mock('../src/services/api', () => ({
  apiClient: {
    interceptors: {
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
  },
}));


// Mock ThemeContext
const mockThemeContext = {
  theme: {
    background: '#fff',
    text: '#000',
    primary: '#6200ee',
  },
  isDarkMode: false,
  toggleTheme: () => {},
};

const mockAuthContext = {
    authToken: null,
    user: null,
    isLoading: true,
    onboardingComplete: false,
    login: jest.f
n(),
    logout: jest.fn(),
    completeOnboarding: jest.fn(),
  };

const renderWithProviders = (authContextValue) => {
  return render(
    <AuthContext.Provider value={authContextValue}>
      <ThemeContext.Provider value={mockThemeContext}>
        <App />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

describe('<App />', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
  });

  it('renders loading indicator when isLoading is true', () => {
    renderWithProviders({ ...mockAuthContext, isLoading: true });
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  it('renders the AuthNavigator when the user is not authenticated', () => {
    renderWithProviders({ ...mockAuthContext, isLoading: false, authToken: null });
    expect(screen.getByText('Your Financial Companion')).toBeTruthy();
  });

  it('renders the OnboardingNavigator when the user is authenticated but has not completed onboarding', () => {
    renderWithProviders({ ...mockAuthContext, isLoading: false, authToken: 'some-token', onboardingComplete: false });
    expect(screen.getByText('Welcome to C9FR')).toBeTruthy();
  });

  it('renders the AppNavigator when the user is authenticated and has completed onboarding', () => {
    renderWithProviders({ ...mockAuthContext, isLoading: false, authToken: 'some-token', onboardingComplete: true });
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });
});
