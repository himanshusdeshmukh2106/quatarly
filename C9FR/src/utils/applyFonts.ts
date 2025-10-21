/**
 * Font Application Helpers
 * Quick utilities to apply fonts in StyleSheets
 */

import { TextStyle } from 'react-native';
import { Typography } from '../styles/designSystem';

/**
 * Apply heading font (Space Grotesk Bold) to a style object
 * Use for: titles, headers, section names, company names
 */
export const withHeadingFont = (style: TextStyle): TextStyle => ({
  fontFamily: Typography.fontFamily.heading,
  ...style,
});

/**
 * Apply mono font (IBM Plex Mono) to a style object
 * Use for: prices, percentages, financial numbers, quantities
 */
export const withMonoFont = (style: TextStyle): TextStyle => ({
  fontFamily: Typography.fontFamily.mono,
  ...style,
});

/**
 * Apply body font (IBM Plex Sans) explicitly
 * Usually not needed as it's the default
 */
export const withBodyFont = (style: TextStyle): TextStyle => ({
  fontFamily: Typography.fontFamily.body,
  ...style,
});

// Pre-built font styles for common use cases
export const fontStyles = {
  // Headings
  h1: withHeadingFont({ fontSize: 36, fontWeight: '700' }),
  h2: withHeadingFont({ fontSize: 30, fontWeight: '700' }),
  h3: withHeadingFont({ fontSize: 24, fontWeight: '700' }),
  h4: withHeadingFont({ fontSize: 20, fontWeight: '700' }),
  h5: withHeadingFont({ fontSize: 18, fontWeight: '700' }),
  h6: withHeadingFont({ fontSize: 16, fontWeight: '600' }),
  
  // Financial/Numbers
  priceHero: withMonoFont({ fontSize: 32, fontWeight: '700' }),
  priceLarge: withMonoFont({ fontSize: 24, fontWeight: '700' }),
  price: withMonoFont({ fontSize: 18, fontWeight: '600' }),
  priceSmall: withMonoFont({ fontSize: 14, fontWeight: '600' }),
  percentage: withMonoFont({ fontSize: 14, fontWeight: '600' }),
  number: withMonoFont({ fontSize: 16, fontWeight: '400' }),
  
  // Body (explicit)
  bodyLarge: withBodyFont({ fontSize: 18, fontWeight: '400' }),
  body: withBodyFont({ fontSize: 16, fontWeight: '400' }),
  bodySmall: withBodyFont({ fontSize: 14, fontWeight: '400' }),
  caption: withBodyFont({ fontSize: 12, fontWeight: '400' }),
};

/**
 * Helper to quickly identify if a style should use heading font
 * Based on fontSize and fontWeight
 */
export const shouldUseHeadingFont = (fontSize: number, fontWeight: string): boolean => {
  // Large text with bold weight = likely a heading
  return (fontSize >= 18 && (fontWeight === '600' || fontWeight === '700' || fontWeight === 'bold'));
};

/**
 * Helper to identify if a style should use mono font
 * Based on common financial number patterns
 */
export const isFinancialValue = (text: string): boolean => {
  // Check for currency symbols, percentages, or number patterns
  return /[$₹€£¥]|%|\d+[,.]\d+/.test(text);
};
