import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

const lightTheme = {
  background: '#F7F8FA', // Off-white for a softer look
  text: '#1A1A1A', // Very dark grey instead of pure black
  textMuted: '#6c757d',
  primary: '#005A9C', // A sophisticated, professional blue
  card: '#FFFFFF', // Pure white cards for clean separation
  border: '#E0E0E0',
  error: '#B00020',
};

const darkTheme = {
  background: '#1C1C1E', // Standard dark mode background
  text: '#E5E5E7', // Off-white for readability
  textMuted: '#adb5bd',
  primary: '#5E5CE6', // A modern, less saturated purple
  card: '#2C2C2E', // Slightly lighter cards
  border: '#3A3A3C',
  error: '#CF6679',
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

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 