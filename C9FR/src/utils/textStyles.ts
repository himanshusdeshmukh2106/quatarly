/**
 * Global Text Styles with Font Families
 * Use these style objects in your Text components
 */

import { TextStyle } from 'react-native';
import { Typography } from '../styles/designSystem';

// Heading styles
// NOTE: fontWeight removed - using bold font file directly
export const headingStyles: Record<string, TextStyle> = {
  h1: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize['4xl'],
  },
  h2: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize['3xl'],
  },
  h3: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize['2xl'],
  },
  h4: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xl,
  },
  h5: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.lg,
  },
  h6: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.base,
  },
};

// Body text styles
export const bodyStyles: Record<string, TextStyle> = {
  large: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.lg,
    fontWeight: '400',
  },
  regular: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    fontWeight: '400',
  },
  small: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    fontWeight: '400',
  },
  tiny: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    fontWeight: '400',
  },
};

// Financial/Mono text styles (for numbers, prices, percentages)
export const monoStyles: Record<string, TextStyle> = {
  price: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xl,
    fontWeight: '400',
  },
  priceSmall: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.base,
    fontWeight: '400',
  },
  percentage: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.sm,
    fontWeight: '400',
  },
  number: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.base,
    fontWeight: '400',
  },
};

// Quick access exports
export const textStyles = {
  ...headingStyles,
  ...bodyStyles,
  ...monoStyles,
};
