// Font configuration for the new typography system
// Headers: Inter (Medium/Bold weights) - FREE alternative to FK Grotesk
export const headerFonts = {
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold', 
  bold: 'Inter-Bold',
};

// Body text: IBM Plex Sans (Regular/Light weights) - FREE
export const bodyFonts = {
  light: 'IBMPlexSans-Light',
  regular: 'IBMPlexSans-Regular',
  medium: 'IBMPlexSans-Medium',
  condensed: 'IBMPlexSansCondensed-Regular',
  condensedLight: 'IBMPlexSansCondensed-Light',
};

// Code/Data: IBM Plex Mono for numbers, symbols, and technical content - FREE
export const monoFonts = {
  light: 'IBMPlexMono-Light',
  regular: 'IBMPlexMono-Regular',
  medium: 'IBMPlexMono-Medium',
  semiBold: 'IBMPlexMono-SemiBold',
  bold: 'IBMPlexMono-Bold',
};

// Font type enum for clarity
export enum FontType {
  HEADER = 'header',
  BODY = 'body', 
  MONO = 'mono',
}

// Weight combinations as specified
export const fontCombinations = {
  // Strong contrast: Inter Bold + IBM Plex Sans Regular
  strongContrast: {
    header: headerFonts.bold,
    body: bodyFonts.regular,
  },
  // Softer hierarchy: Inter Medium + IBM Plex Sans Light
  softHierarchy: {
    header: headerFonts.medium,
    body: bodyFonts.light,
  },
  // Secondary information: IBM Plex Sans Condensed
  secondary: {
    condensed: bodyFonts.condensed,
    condensedLight: bodyFonts.condensedLight,
  },
};

// Legacy support - Updated to use body fonts as default
export const fonts = {
  light: bodyFonts.light,
  regular: bodyFonts.regular,
  medium: bodyFonts.medium,
  semiBold: headerFonts.medium, // Map to header for semi-bold
  bold: headerFonts.bold,
};

// Enhanced font weight mapping
export const fontWeights = {
  '300': bodyFonts.light,
  '400': bodyFonts.regular,
  '500': bodyFonts.medium,
  '600': headerFonts.medium,
  '700': headerFonts.bold,
  '800': headerFonts.bold,
  normal: bodyFonts.regular,
  bold: headerFonts.bold,
};

// Enhanced helper functions for the new typography system
export const getFontFamily = (
  type: FontType = FontType.BODY,
  weight: string | number = '400'
): string => {
  const weightStr = weight.toString();
  
  switch (type) {
    case FontType.HEADER:
      switch (weightStr) {
        case '500':
        case 'medium':
          return headerFonts.medium;
        case '600':
        case 'semiBold':
          return headerFonts.semiBold;
        case '700':
        case '800':
        case 'bold':
          return headerFonts.bold;
        default:
          return headerFonts.medium;
      }
      
    case FontType.MONO:
      switch (weightStr) {
        case '300':
        case 'light':
          return monoFonts.light;
        case '400':
        case 'normal':
        case 'regular':
          return monoFonts.regular;
        case '500':
        case 'medium':
          return monoFonts.medium;
        case '600':
        case 'semiBold':
          return monoFonts.semiBold;
        case '700':
        case '800':
        case 'bold':
          return monoFonts.bold;
        default:
          return monoFonts.regular;
      }
      
    case FontType.BODY:
    default:
      switch (weightStr) {
        case '300':
        case 'light':
          return bodyFonts.light;
        case '400':
        case 'normal':
        case 'regular':
          return bodyFonts.regular;
        case '500':
        case 'medium':
          return bodyFonts.medium;
        default:
          return bodyFonts.regular;
      }
  }
};

// Legacy helper function - Updated to use body fonts
export const getLegacyFontFamily = (weight: string | number = '400'): string => {
  const weightStr = weight.toString();
  return fontWeights[weightStr as keyof typeof fontWeights] || bodyFonts.regular;
};

// Specific helper functions for different content types
export const getHeaderFont = (weight: 'medium' | 'semiBold' | 'bold' = 'medium'): string => {
  return headerFonts[weight];
};

export const getBodyFont = (weight: 'light' | 'regular' | 'medium' = 'regular'): string => {
  return bodyFonts[weight];
};

export const getMonoFont = (weight: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular'): string => {
  return monoFonts[weight];
};

export const getCondensedFont = (light: boolean = false): string => {
  return light ? bodyFonts.condensedLight : bodyFonts.condensed;
};