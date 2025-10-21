/**
 * Font System Configuration
 * 
 * Font files should be placed in: src/assets/fonts/
 * After adding fonts, run: npx react-native-asset
 * Then rebuild the app
 */

export const FontFamilies = {
  // Headings: Space Grotesk Bold (700)
  // IMPORTANT: Use ACTUAL internal font name from TTF file
  heading: 'Space Grotesk Bold',
  
  // Body text: IBM Plex Sans Regular (400) or Inter Regular
  body: 'IBM Plex Sans Regular',
  bodyAlt: 'Inter 24pt Regular',
  
  // Code/technical and monospace numbers: IBM Plex Mono
  mono: 'IBM Plex Mono Regular',
  
  // Fallback to system fonts
  system: {
    ios: 'System',
    android: 'Roboto',
  },
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Font usage guide
export const FontUsage = {
  // Use for all headings (H1, H2, H3, etc.)
  heading: {
    fontFamily: FontFamilies.heading,
    fontWeight: FontWeights.bold,
  },
  
  // Use for body text, descriptions, labels
  body: {
    fontFamily: FontFamilies.body,
    fontWeight: FontWeights.regular,
  },
  
  // Alternative body text (Inter)
  bodyAlt: {
    fontFamily: FontFamilies.bodyAlt,
    fontWeight: FontWeights.regular,
  },
  
  // Use for financial data, prices, percentages
  financial: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.regular,
  },
  
  // Use for code snippets, technical data
  code: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.regular,
  },
} as const;

// Font files required (download from Google Fonts)
export const REQUIRED_FONT_FILES = {
  'SpaceGrotesk-Bold.ttf': 'https://fonts.google.com/specimen/Space+Grotesk',
  'IBMPlexSans-Regular.ttf': 'https://fonts.google.com/specimen/IBM+Plex+Sans',
  'Inter_24pt-Regular.ttf': 'https://fonts.google.com/specimen/Inter',
  'IBMPlexMono-Regular.ttf': 'https://fonts.google.com/specimen/IBM+Plex+Mono',
} as const;
