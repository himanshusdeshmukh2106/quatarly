import { TextStyle } from 'react-native';
import { getFontFamily } from '../config/fonts';

// Re-export getFontFamily for convenience
export { getFontFamily };

/**
 * Utility functions for working with FK Grotesk font
 */

// Helper to create text styles with FK Grotesk
export const createFKGroteskStyle = (
  fontSize: number,
  fontWeight: string | number = '400',
  color?: string,
  additionalStyles?: Partial<TextStyle>
): TextStyle => {
  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(fontWeight),
    fontSize,
  };

  if (color) {
    baseStyle.color = color;
  }

  return {
    ...baseStyle,
    ...additionalStyles,
  };
};

// Common text style presets using FK Grotesk
export const fkGroteskPresets = {
  // Headers
  h1: createFKGroteskStyle(32, '700'),
  h2: createFKGroteskStyle(28, '700'),
  h3: createFKGroteskStyle(24, '600'),
  h4: createFKGroteskStyle(20, '600'),
  h5: createFKGroteskStyle(18, '600'),
  h6: createFKGroteskStyle(16, '600'),

  // Body text
  bodyLarge: createFKGroteskStyle(16, '400'),
  bodyMedium: createFKGroteskStyle(14, '400'),
  bodySmall: createFKGroteskStyle(12, '400'),

  // Labels and captions
  labelLarge: createFKGroteskStyle(14, '500'),
  labelMedium: createFKGroteskStyle(12, '500'),
  labelSmall: createFKGroteskStyle(10, '500'),

  // Buttons
  buttonLarge: createFKGroteskStyle(16, '600'),
  buttonMedium: createFKGroteskStyle(14, '600'),
  buttonSmall: createFKGroteskStyle(12, '600'),

  // Financial specific
  priceDisplay: createFKGroteskStyle(24, '700'),
  priceChange: createFKGroteskStyle(14, '600'),
  statLabel: createFKGroteskStyle(12, '500'),
  statValue: createFKGroteskStyle(14, '600'),
  
  // Navigation
  tabLabel: createFKGroteskStyle(12, '500'),
  navTitle: createFKGroteskStyle(18, '600'),
};

// Function to update existing styles with FK Grotesk
export const addFKGroteskToStyle = (
  existingStyle: TextStyle,
  fontWeight: string | number = '400'
): TextStyle => ({
  ...existingStyle,
  fontFamily: getFontFamily(fontWeight),
});

// Batch update multiple styles
export const updateStylesWithFKGrotesk = (
  styles: Record<string, TextStyle>,
  defaultWeight: string | number = '400'
): Record<string, TextStyle> => {
  const updatedStyles: Record<string, TextStyle> = {};
  
  Object.keys(styles).forEach(key => {
    const style = styles[key];
    // Extract fontWeight from existing style or use default
    const fontWeight = style.fontWeight || defaultWeight;
    updatedStyles[key] = addFKGroteskToStyle(style, fontWeight);
  });
  
  return updatedStyles;
};

// Weight mapping helper
export const mapFontWeight = (weight: string | number): string => {
  const weightMap: Record<string, string> = {
    '100': '300', // Map thin to light
    '200': '300', // Map extra-light to light
    '300': '300', // Light
    '400': '400', // Regular
    '500': '500', // Medium
    '600': '600', // SemiBold
    '700': '700', // Bold
    '800': '700', // Map extra-bold to bold
    '900': '700', // Map black to bold
    'normal': '400',
    'bold': '700',
  };
  
  return weightMap[weight.toString()] || '400';
};