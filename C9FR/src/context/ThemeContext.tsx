import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';

// Premium Financial App Themes - 2025 Modern Design
const lightTheme = {
  // Core Colors
  background: Colors.background.primary,
  backgroundSecondary: Colors.background.secondary,
  backgroundTertiary: Colors.background.tertiary,
  text: Colors.neutral[900],
  textMuted: Colors.neutral[600],
  textLight: Colors.neutral[500],
  primary: Colors.primary[500],
  primaryLight: Colors.primary[100],
  primaryDark: Colors.primary[700],

  // Surface Colors
  card: Colors.background.primary,
  cardElevated: Colors.background.primary,
  cardGlass: Colors.glass.light,

  // Interactive Colors
  accent: Colors.gold[500],
  accentMuted: Colors.gold[100],
  
  // Status Colors
  success: Colors.success[500],
  successMuted: Colors.success[100],
  successLight: Colors.success[50],
  error: Colors.danger[500],
  errorMuted: Colors.danger[100],
  errorLight: Colors.danger[50],
  warning: Colors.gold[500],
  warningMuted: Colors.gold[100],
  warningLight: Colors.gold[50],
  info: Colors.primary[500],
  infoMuted: Colors.primary[100],
  infoLight: Colors.primary[50],

  // Border and Divider Colors
  border: Colors.neutral[200],
  borderMuted: Colors.neutral[100],
  borderLight: Colors.neutral[50],
  divider: Colors.neutral[200],

  // Investment & Financial Specific Colors
  profit: Colors.success[600],
  loss: Colors.danger[500],
  neutral: Colors.neutral[500],

  // Category Colors for Opportunities/Goals
  investment: Colors.primary[600],
  savings: Colors.success[600],
  debt: Colors.danger[600],
  insurance: '#7c3aed',
  education: '#ea580c',
  travel: '#0891b2',
  emergency: '#be123c',

  // Design System Integration
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  shadows: Shadows
};

const darkTheme = {
  // Core Colors - Dark Mode
  background: Colors.background.dark,
  backgroundSecondary: Colors.background.darkSecondary,
  backgroundTertiary: Colors.background.darkTertiary,
  text: Colors.neutral[50],
  textMuted: Colors.neutral[400],
  textLight: Colors.neutral[500],
  primary: Colors.primary[400],
  primaryLight: Colors.primary[900],
  primaryDark: Colors.primary[300],
  
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