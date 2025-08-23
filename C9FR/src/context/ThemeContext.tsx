import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFontFamily } from '../config/fonts';

// Financial App Color Themes - Following 2025 Financial UI Best Practices
const lightTheme = {
  // Core Financial Colors
  background: '#f4f4f4', // Minimal Gray - Clean, modern background
  text: '#222', // Deep charcoal for excellent readability
  textMuted: '#a0a0a0', // Muted gray for secondary text
  primary: '#003366', // Corporate Blue - Trust and stability
  secondary: '#007a33', // Wealthy Green - Growth and prosperity
  
  // Typography - FK Grotesk Font Family
  fonts: {
    light: getFontFamily('300'),
    regular: getFontFamily('400'),
    medium: getFontFamily('500'),
    semiBold: getFontFamily('600'),
    bold: getFontFamily('700'),
  },
  
  // Surface Colors
  card: '#fff', // Pure white cards for clean separation
  cardElevated: '#fff', // Elevated cards (same as card in light mode)
  
  // Interactive Colors
  accent: '#ffd700', // Golden accent for premium features
  accentMuted: '#fff9e3', // Light gold for subtle highlights
  
  // Status Colors
  success: '#007a33', // Wealthy green for positive actions
  warning: '#ffe066', // Gold warning for attention
  error: '#ff6f61', // Coral red for errors (not harsh red)
  info: '#00509e', // Medium blue for information
  
  // Border and Divider Colors
  border: '#e0e0e0', // Light gray borders
  borderMuted: '#f0f0f0', // Very light borders
  divider: '#e0e0e0',
  
  // Investment & Financial Specific Colors
  profit: '#004d00', // Dark green for profits
  loss: '#ff6f61', // Coral for losses (softer than red)
  neutral: '#66a3ff', // Light blue for neutral states
  
  // Category Colors for Opportunities/Goals
  investment: '#007acc', // Bright blue for investments
  savings: '#66b3a1', // Teal for savings
  debt: '#ff6f61', // Coral for debt management
  insurance: '#00509e', // Professional blue for insurance
  education: '#d4af37', // Gold for education/skills
  travel: '#66a3ff', // Light blue for travel
  emergency: '#007a33', // Green for emergency funds
};

const darkTheme = {
  // Core Financial Colors - Dark Mode
  background: '#1C1C1E', // Standard dark background
  text: '#E5E5E7', // Off-white for readability
  textMuted: '#adb5bd', // Muted text in dark mode
  primary: '#66a3ff', // Lighter blue for dark mode visibility
  secondary: '#66b3a1', // Teal green for dark mode
  
  // Typography - FK Grotesk Font Family (same as light theme)
  fonts: {
    light: getFontFamily('300'),
    regular: getFontFamily('400'),
    medium: getFontFamily('500'),
    semiBold: getFontFamily('600'),
    bold: getFontFamily('700'),
  },
  
  // Surface Colors
  card: '#2C2C2E', // Dark cards
  cardElevated: '#3A3A3C', // Elevated cards with more contrast
  
  // Interactive Colors
  accent: '#ffe066', // Brighter gold for dark mode visibility
  accentMuted: '#333025', // Dark gold background
  
  // Status Colors
  success: '#66b3a1', // Lighter green for dark mode
  warning: '#fff6cc', // Light gold warning
  error: '#ff8a80', // Lighter coral for dark mode
  info: '#66a3ff', // Light blue for information
  
  // Border and Divider Colors
  border: '#3A3A3C', // Dark borders
  borderMuted: '#2C2C2E', // Subtle dark borders
  divider: '#3A3A3C',
  
  // Investment & Financial Specific Colors
  profit: '#b2e0d4', // Light green for profits in dark mode
  loss: '#ff8a80', // Light coral for losses
  neutral: '#cce0ff', // Very light blue for neutral states
  
  // Category Colors for Opportunities/Goals (Dark Mode)
  investment: '#66a3ff', // Light blue for investments
  savings: '#b2e0d4', // Light teal for savings
  debt: '#ff8a80', // Light coral for debt management
  insurance: '#66a3ff', // Light blue for insurance
  education: '#fff6cc', // Light gold for education/skills
  travel: '#cce0ff', // Very light blue for travel
  emergency: '#b2e0d4', // Light green for emergency funds
};

interface ThemeContextType {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // Use system preference if no saved preference
          setIsDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setIsDarkMode(colorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [colorScheme]);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Revert the change if saving fails
      setIsDarkMode(isDarkMode);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Show loading state while theme is being loaded
  if (isLoading) {
    // Provide a basic theme while loading
    return (
      <ThemeContext.Provider value={{ theme: lightTheme, isDarkMode: false, toggleTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 