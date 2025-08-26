import { StyleSheet, TextStyle } from 'react-native';
import { 
  getFontFamily, 
  getHeaderFont, 
  getBodyFont, 
  getMonoFont, 
  getCondensedFont,
  FontType 
} from '../config/fonts';

// Global text styles using the new typography system
// Headers: Inter (Medium/Bold weights) - FREE alternative to FK Grotesk
// Body text: IBM Plex Sans (Regular/Light weights) - FREE
// Code/Data: IBM Plex Mono for numbers, symbols, and technical content - FREE
export const globalTextStyles = StyleSheet.create({
  // Base text styles with IBM Plex Sans
  text: {
    fontFamily: getBodyFont('regular'),
    color: '#000000',
  },
  
  textLight: {
    fontFamily: getBodyFont('light'),
    color: '#000000',
  },
  textMedium: {
    fontFamily: getBodyFont('medium'),
    color: '#000000',
  },
  textSemiBold: {
    fontFamily: getHeaderFont('medium'), // Headers use Inter
    color: '#000000',
  },
  textBold: {
    fontFamily: getHeaderFont('bold'), // Headers use Inter
    color: '#000000',
  },

  // Heading styles - Inter Bold/Medium
  h1: {
    fontFamily: getHeaderFont('bold'), // Inter Bold
    fontSize: 32,
    lineHeight: 40,
    color: '#000000',
  },
  h2: {
    fontFamily: getHeaderFont('bold'), // Inter Bold
    fontSize: 28,
    lineHeight: 36,
    color: '#000000',
  },
  h3: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 24,
    lineHeight: 32,
    color: '#000000',
  },
  h4: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
  },
  h5: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
  },
  h6: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },

  // Body text styles - IBM Plex Sans Regular/Light
  body1: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  body2: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  body3: {
    fontFamily: getBodyFont('light'), // IBM Plex Sans Light
    fontSize: 12,
    lineHeight: 18,
    color: '#000000',
  },

  // Caption and small text - IBM Plex Sans Light
  caption: {
    fontFamily: getBodyFont('light'), // IBM Plex Sans Light
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
  },
  small: {
    fontFamily: getBodyFont('light'), // IBM Plex Sans Light
    fontSize: 10,
    lineHeight: 14,
    color: '#666666',
  },

  // Secondary information - IBM Plex Sans Condensed
  secondary: {
    fontFamily: getCondensedFont(false), // IBM Plex Sans Condensed
    fontSize: 14,
    lineHeight: 18,
    color: '#666666',
  },
  secondaryLight: {
    fontFamily: getCondensedFont(true), // IBM Plex Sans Condensed Light
    fontSize: 12,
    lineHeight: 16,
    color: '#999999',
  },

  // Button text - Inter Medium for strong hierarchy
  button: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
  },
  buttonSmall: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  },

  // Input text - IBM Plex Sans Regular
  input: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  inputLabel: {
    fontFamily: getBodyFont('medium'), // IBM Plex Sans Medium
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },

  // Navigation text - Inter Medium
  tabLabel: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 12,
    lineHeight: 16,
    color: '#000000',
  },
  navTitle: {
    fontFamily: getHeaderFont('medium'), // Inter Medium
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
  },

  // Code and Data styles - IBM Plex Mono
  code: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  codeSmall: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular
    fontSize: 12,
    lineHeight: 16,
    color: '#000000',
  },
  
  // Numbers and symbols - IBM Plex Mono
  number: {
    fontFamily: getMonoFont('medium'), // IBM Plex Mono Medium
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
  },
  numberLarge: {
    fontFamily: getMonoFont('medium'), // IBM Plex Mono Medium
    fontSize: 20,
    lineHeight: 24,
    color: '#000000',
  },
  numberSmall: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular
    fontSize: 12,
    lineHeight: 16,
    color: '#000000',
  },
  
  // Technical content - IBM Plex Mono
  technical: {
    fontFamily: getMonoFont('regular'), // IBM Plex Mono Regular
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  },
  symbol: {
    fontFamily: getMonoFont('semiBold'), // IBM Plex Mono SemiBold
    fontSize: 14,
    lineHeight: 16,
    color: '#000000',
  },
});

// Helper function to create text style with the new typography system
export const createTextStyle = (
  fontSize: number,
  fontType: FontType = FontType.BODY,
  fontWeight: string | number = '400',
  color: string = '#000000',
  additionalStyles: Partial<TextStyle> = {}
): TextStyle => ({
  fontFamily: getFontFamily(fontType, fontWeight),
  fontSize,
  color,
  ...additionalStyles,
});

// Helper function for creating header styles
export const createHeaderStyle = (
  fontSize: number,
  weight: 'medium' | 'bold' = 'medium',
  color: string = '#000000',
  additionalStyles: Partial<TextStyle> = {}
): TextStyle => ({
  fontFamily: getHeaderFont(weight),
  fontSize,
  color,
  ...additionalStyles,
});

// Helper function for creating body text styles
export const createBodyStyle = (
  fontSize: number,
  weight: 'light' | 'regular' | 'medium' = 'regular',
  color: string = '#000000',
  additionalStyles: Partial<TextStyle> = {}
): TextStyle => ({
  fontFamily: getBodyFont(weight),
  fontSize,
  color,
  ...additionalStyles,
});

// Helper function for creating mono text styles (numbers, symbols, code)
export const createMonoStyle = (
  fontSize: number,
  weight: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular',
  color: string = '#000000',
  additionalStyles: Partial<TextStyle> = {}
): TextStyle => ({
  fontFamily: getMonoFont(weight),
  fontSize,
  color,
  ...additionalStyles,
});

// Common font weight styles with new system
export const fontWeightStyles = {
  // Header styles (Inter)
  headerMedium: { fontFamily: getHeaderFont('medium') },
  headerSemiBold: { fontFamily: getHeaderFont('semiBold') },
  headerBold: { fontFamily: getHeaderFont('bold') },
  
  // Body styles (IBM Plex Sans)
  bodyLight: { fontFamily: getBodyFont('light') },
  bodyRegular: { fontFamily: getBodyFont('regular') },
  bodyMedium: { fontFamily: getBodyFont('medium') },
  
  // Mono styles (IBM Plex Mono)
  monoLight: { fontFamily: getMonoFont('light') },
  monoRegular: { fontFamily: getMonoFont('regular') },
  monoMedium: { fontFamily: getMonoFont('medium') },
  monoSemiBold: { fontFamily: getMonoFont('semiBold') },
  monoBold: { fontFamily: getMonoFont('bold') },
  
  // Condensed styles (IBM Plex Sans Condensed)
  condensed: { fontFamily: getCondensedFont(false) },
  condensedLight: { fontFamily: getCondensedFont(true) },
  
  // Legacy support - Updated to use new system
  light: { fontFamily: getBodyFont('light') },
  regular: { fontFamily: getBodyFont('regular') },
  medium: { fontFamily: getBodyFont('medium') },
  semiBold: { fontFamily: getHeaderFont('medium') },
  bold: { fontFamily: getHeaderFont('bold') },
};