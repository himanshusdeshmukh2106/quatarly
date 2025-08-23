// Font configuration for FK Grotesk
export const fonts = {
  regular: 'FKGrotesk-Regular',
  medium: 'FKGrotesk-Medium',
  semiBold: 'FKGrotesk-SemiBold',
  bold: 'FKGrotesk-Bold',
  light: 'FKGrotesk-Light',
};

// Font weight mapping for FK Grotesk
export const fontWeights = {
  '300': fonts.light,
  '400': fonts.regular,
  '500': fonts.medium,
  '600': fonts.semiBold,
  '700': fonts.bold,
  '800': fonts.bold,
  normal: fonts.regular,
  bold: fonts.bold,
};

// Helper function to get font family based on weight
export const getFontFamily = (weight: string | number = '400'): string => {
  const weightStr = weight.toString();
  return fontWeights[weightStr as keyof typeof fontWeights] || fonts.regular;
};