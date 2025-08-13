import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileModal from '../ProfileModal';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock ErrorBoundary
jest.mock('../ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return children;
  };
});

// Mock the contexts
const mockThemeContext = {
  theme: {
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
  },
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

const mockAuthContext = {
  authToken: 'test-token',
  user: {
    pk: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
  },
  isLoading: false,
  onboardingComplete: true,
  login: jest.fn(),
  logout: jest.fn(),
  completeOnboarding: jest.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

describe('ProfileModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithProviders(
      <ProfileModal visible={false} onClose={mockOnClose} />
    );

    expect(queryByText('Profile')).toBeFalsy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    const closeButton = getByLabelText('Close profile');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    const backdrop = getByLabelText('Close profile modal');
    fireEvent.press(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('toggles theme when dark mode switch is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    const themeToggle = getByLabelText('Dark Mode toggle');
    fireEvent(themeToggle, 'onValueChange', true);

    expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows profile picture edit alert when edit button is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    const editButton = getByLabelText('Edit profile picture');
    fireEvent.press(editButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Change Profile Picture',
      'Choose an option to update your profile picture',
      expect.any(Array)
    );
  });

  it('shows logout confirmation when logout button is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    const logoutButton = getByLabelText('Logout');
    fireEvent.press(logoutButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array)
    );
  });

  it('handles logout process correctly', async () => {
    const { getByLabelText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    const logoutButton = getByLabelText('Logout');
    fireEvent.press(logoutButton);

    // Simulate pressing the logout confirmation
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const logoutConfirmation = alertCall[2][1]; // Second button (Logout)
    
    await logoutConfirmation.onPress();

    expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles logout error correctly', async () => {
    const mockLogoutError = jest.fn().mockRejectedValue(new Error('Logout failed'));
    const errorAuthContext = { ...mockAuthContext, logout: mockLogoutError };

    const { getByLabelText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={errorAuthContext}>
          <ProfileModal visible={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );

    const logoutButton = getByLabelText('Logout');
    fireEvent.press(logoutButton);

    // Simulate pressing the logout confirmation
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const logoutConfirmation = alertCall[2][1]; // Second button (Logout)
    
    await logoutConfirmation.onPress();

    expect(mockLogoutError).toHaveBeenCalledTimes(1);
    
    // Check that error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Logout Failed',
        'There was an error logging out. Please try again.',
        [{ text: 'OK' }]
      );
    });
  });

  it('displays user information correctly', () => {
    const { getByText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
  });

  it('displays fallback user information when user data is missing', () => {
    const noUserAuthContext = { ...mockAuthContext, user: null };

    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={noUserAuthContext}>
          <ProfileModal visible={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('User')).toBeTruthy();
    expect(getByText('No email available')).toBeTruthy();
  });

  it('displays username when first and last name are empty', () => {
    const usernameOnlyAuthContext = {
      ...mockAuthContext,
      user: {
        ...mockAuthContext.user,
        first_name: '',
        last_name: '',
      },
    };

    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={usernameOnlyAuthContext}>
          <ProfileModal visible={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('testuser')).toBeTruthy();
  });

  it('renders all menu items correctly', () => {
    const { getByText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('Account Settings')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Privacy & Security')).toBeTruthy();
    expect(getByText('Help & Support')).toBeTruthy();
  });

  it('displays app version', () => {
    const { getByText } = renderWithProviders(
      <ProfileModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText('Version 1.0.0')).toBeTruthy();
  });

  it('applies dark theme correctly', () => {
    const darkThemeContext = {
      ...mockThemeContext,
      isDarkMode: true,
      theme: {
        background: '#1C1C1E',
        text: '#E5E5E7',
        textMuted: '#adb5bd',
        primary: '#5E5CE6',
        card: '#2C2C2E',
        border: '#3A3A3C',
        error: '#CF6679',
      },
    };

    const { getByText } = render(
      <ThemeContext.Provider value={darkThemeContext}>
        <AuthContext.Provider value={mockAuthContext}>
          <ProfileModal visible={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('Profile')).toBeTruthy();
    // The component should render with dark theme colors
  });
});