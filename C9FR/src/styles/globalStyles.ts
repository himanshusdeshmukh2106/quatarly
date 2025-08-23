import { StyleSheet, TextStyle } from 'react-native';
import { getFontFamily } from '../config/fonts';

// Global text styles using FK Grotesk
export const globalTextStyles = StyleSheet.create({
  // Base text styles
  text: {
    fontFamily: getFontFamily('400'),
    color: '#000000',
  },
  
  textLight: {
    fontFamily: getFontFamily('300'),
    color: '#000000',
  },
  textMedium: {
    fontFamily: getFontFamily('500'),
    color: '#000000',
  },
  textSemiBold: {
    fontFamily: getFontFamily('600'),
    color: '#000000',
  },
  textBold: {
    fontFamily: getFontFamily('700'),
    color: '#000000',
  },

  // Heading styles
  h1: {
    fontFamily: getFontFamily('700'),
    fontSize: 32,
    lineHeight: 40,
    color: '#000000',
  },
  h2: {
    fontFamily: getFontFamily('700'),
    fontSize: 28,
    lineHeight: 36,
    color: '#000000',
  },
  h3: {
    fontFamily: getFontFamily('600'),
    fontSize: 24,
    lineHeight: 32,
    color: '#000000',
  },
  h4: {
    fontFamily: getFontFamily('600'),
    fontSize: 20,
    lineHeight: 28,
    color: '#000000',
  },
  h5: {
    fontFamily: getFontFamily('600'),
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
  },
  h6: {
    fontFamily: getFontFamily('600'),
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },

  // Body text styles
  body1: {
    fontFamily: getFontFamily('400'),
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  body2: {
    fontFamily: getFontFamily('400'),
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  body3: {
    fontFamily: getFontFamily('400'),
    fontSize: 12,
    lineHeight: 18,
    color: '#000000',
  },

  // Caption and small text
  caption: {
    fontFamily: getFontFamily('400'),
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
  },
  small: {
    fontFamily: getFontFamily('400'),
    fontSize: 10,
    lineHeight: 14,
    color: '#666666',
  },

  // Button text
  button: {
    fontFamily: getFontFamily('600'),
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
  },
  buttonSmall: {
    fontFamily: getFontFamily('600'),
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  },

  // Input text
  input: {
    fontFamily: getFontFamily('400'),
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  inputLabel: {
    fontFamily: getFontFamily('500'),
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },

  // Navigation text
  tabLabel: {
    fontFamily: getFontFamily('500'),
    fontSize: 12,
    lineHeight: 16,
    color: '#000000',
  },
  navTitle: {
    fontFamily: getFontFamily('600'),
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
  },
});

// Helper function to create text style with FK Grotesk
export const createTextStyle = (
  fontSize: number,
  fontWeight: string | number = '400',
  color: string = '#000000',
  additionalStyles: Partial<TextStyle> = {}
): TextStyle => ({
  fontFamily: getFontFamily(fontWeight),
  fontSize,
  color,
  ...additionalStyles,
});

// Common font weights for easy use
export const fontWeightStyles = {
  light: { fontFamily: getFontFamily('300') },
  regular: { fontFamily: getFontFamily('400') },
  medium: { fontFamily: getFontFamily('500') },
  semiBold: { fontFamily: getFontFamily('600') },
  bold: { fontFamily: getFontFamily('700') },
};