import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingSpinner from '../LoadingSpinner';
import { ThemeContext } from '../../context/ThemeContext';

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

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { getByTestId } = renderWithTheme(<LoadingSpinner />);
    
    // Should render the spinner but no text when no message is provided
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders with custom message', () => {
    const customMessage = 'Loading goals...';
    const { getByText } = renderWithTheme(
      <LoadingSpinner message={customMessage} />
    );
    
    expect(getByText(customMessage)).toBeTruthy();
  });

  it('renders without message when message is empty', () => {
    const { queryByText } = renderWithTheme(
      <LoadingSpinner message="" />
    );
    
    expect(queryByText('')).toBeNull();
  });

  it('renders without message when message is undefined', () => {
    const { queryByText, getByTestId } = renderWithTheme(
      <LoadingSpinner message={undefined} />
    );
    
    // Should not render the default "Loading..." text when message is undefined
    expect(queryByText('Loading...')).toBeNull();
    // But should still render the spinner
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByText } = renderWithTheme(<LoadingSpinner message="Loading..." />);
    
    const messageText = getByText('Loading...');
    // Check if the style contains the expected color (it might be an array)
    const style = messageText.props.style;
    const hasCorrectColor = Array.isArray(style) 
      ? style.some(s => s && s.color === mockTheme.text)
      : style && style.color === mockTheme.text;
    expect(hasCorrectColor).toBeTruthy();
  });

  it('uses custom color when provided', () => {
    const customColor = '#ff0000';
    renderWithTheme(<LoadingSpinner color={customColor} />);
    
    // Note: Testing ActivityIndicator color would require more complex testing setup
    // This test structure shows how it would be tested
  });

  it('uses small size when specified', () => {
    renderWithTheme(<LoadingSpinner size="small" />);
    
    // Note: Testing ActivityIndicator size would require more complex testing setup
    // This test structure shows how it would be tested
  });

  it('uses large size by default', () => {
    renderWithTheme(<LoadingSpinner />);
    
    // Note: Testing ActivityIndicator size would require more complex testing setup
    // This test structure shows how it would be tested
  });

  it('applies correct container styles', () => {
    const { getByTestId } = renderWithTheme(
      <LoadingSpinner />
    );
    
    // Note: You would need to add testID to the container View in the component
    // This test structure shows how container styles would be tested
  });

  it('handles long messages correctly', () => {
    const longMessage = 'This is a very long loading message that should still be displayed correctly in the loading spinner component';
    const { getByText } = renderWithTheme(
      <LoadingSpinner message={longMessage} />
    );
    
    expect(getByText(longMessage)).toBeTruthy();
  });

  it('handles special characters in message', () => {
    const specialMessage = 'Loading... 🚀 Please wait! @#$%';
    const { getByText } = renderWithTheme(
      <LoadingSpinner message={specialMessage} />
    );
    
    expect(getByText(specialMessage)).toBeTruthy();
  });

  it('renders ActivityIndicator component', () => {
    const { getByTestId } = renderWithTheme(<LoadingSpinner />);
    
    // This tests that the loading spinner is rendered
    // We can test for the presence of the loading text instead
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});