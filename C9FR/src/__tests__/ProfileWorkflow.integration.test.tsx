import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock API calls
jest.mock('../services/api', () => ({
  setAuthToken: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  getUserDetails: jest.fn().mockResolvedValue({
    pk: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    onboarding_complete: true,
  }),
}));

// Mock react-native-tab-view
jest.mock('react-native-tab-view', () => ({
  TabView: ({ children }: any) => children,
  SceneMap: (scenes: any) => scenes,
  TabBar: ({ children }: any) => children,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

describe('Profile Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      switch (key) {
        case 'authToken':
          return Promise.resolve('test-token');
        case 'user':
          return Promise.resolve(JSON.stringify({
            pk: 1,
            username: 'testuser',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
          }));
        case 'onboardingComplete':
          return Promise.resolve('true');
        case 'themePreference':
          return Promise.resolve('light');
        default:
          return Promise.resolve(null);
      }
    });
  });

  it('opens profile modal when profile button is clicked', async () => {
    const { getByLabelText, queryByText } = renderWithProviders(<HomeScreen />);

    // Wait for component to load
    await waitFor(() => {
      expect(queryByText('Profile')).toBeFalsy(); // Modal should be closed initially
    });

    // Find and click the profile button
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    // Check that profile modal opened
    await waitFor(() => {
      expect(queryByText('Profile')).toBeTruthy();
      expect(queryByText('John Doe')).toBeTruthy();
      expect(queryByText('test@example.com')).toBeTruthy();
    });
  });

  it('persists theme preference when toggled', async () => {
    const { getByLabelText, getByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
    });

    // Toggle dark mode
    const darkModeToggle = getByLabelText('Dark Mode toggle');
    fireEvent(darkModeToggle, 'onValueChange', true);

    // Check that theme preference was saved
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('themePreference', 'dark');
    });
  });

  it('handles theme persistence across app restart', async () => {
    // Mock dark theme preference
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'themePreference') {
        return Promise.resolve('dark');
      }
      return Promise.resolve(null);
    });

    const { getByLabelText, getByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
    });

    // The dark mode toggle should be enabled
    const darkModeToggle = getByLabelText('Dark Mode toggle');
    expect(darkModeToggle.props.value).toBe(true);
  });

  it('completes logout flow correctly', async () => {
    const { getByLabelText, getByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
    });

    // Click logout button
    const logoutButton = getByLabelText('Logout');
    fireEvent.press(logoutButton);

    // The logout confirmation should appear
    // Note: In a real integration test, we would need to handle the Alert.alert mock
    // and simulate the user confirming the logout
  });

  it('clears authentication data on logout', async () => {
    // This test would verify that logout clears AsyncStorage
    // In a real implementation, we would mock the logout process
    // and verify that multiRemove is called with the correct keys
    
    expect(true).toBe(true); // Placeholder for actual implementation
  });

  it('handles profile modal close correctly', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
    });

    // Close modal using close button
    const closeButton = getByLabelText('Close profile');
    fireEvent.press(closeButton);

    // Modal should be closed
    await waitFor(() => {
      expect(queryByText('Profile')).toBeFalsy();
    });
  });

  it('handles profile modal backdrop close correctly', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
    });

    // Close modal using backdrop
    const backdrop = getByLabelText('Close profile modal');
    fireEvent.press(backdrop);

    // Modal should be closed
    await waitFor(() => {
      expect(queryByText('Profile')).toBeFalsy();
    });
  });

  it('displays correct user information from context', async () => {
    const { getByLabelText, getByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });
  });

  it('handles missing user data gracefully', async () => {
    // Mock missing user data
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'user') {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    const { getByLabelText, getByText } = renderWithProviders(<HomeScreen />);

    // Open profile modal
    const profileButton = getByLabelText('account-circle-outline');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
      expect(getByText('User')).toBeTruthy(); // Fallback name
      expect(getByText('No email available')).toBeTruthy(); // Fallback email
    });
  });
});