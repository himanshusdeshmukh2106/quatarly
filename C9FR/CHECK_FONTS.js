/**
 * Font Name Checker
 * Run this in your app to see which font names work
 * Usage: Add <FontTester /> to your HomeScreen temporarily
 */

// Common font name variations to try:
const FONT_VARIATIONS = {
  'Space Grotesk': [
    'SpaceGrotesk-Bold',
    'Space Grotesk Bold',
    'Space Grotesk',
    'SpaceGroteskBold',
    'space-grotesk-bold',
  ],
  'IBM Plex Sans': [
    'IBMPlexSans-Regular',
    'IBM Plex Sans',
    'IBMPlexSans',
    'IBM Plex Sans Regular',
  ],
  'IBM Plex Mono': [
    'IBMPlexMono-Regular', 
    'IBM Plex Mono',
    'IBMPlexMono',
    'IBM Plex Mono Regular',
  ],
  'Inter': [
    'Inter_24pt-Regular',
    'Inter-Regular',
    'Inter',
    'Inter 24pt',
  ],
};

// MOST LIKELY CORRECT NAMES (based on Google Fonts):
const CORRECT_FONT_NAMES = {
  heading: 'Space Grotesk',      // Family name without weight
  body: 'IBM Plex Sans',          // Family name
  mono: 'IBM Plex Mono',          // Family name  
  bodyAlt: 'Inter',               // Family name
};

console.log('Font variations to test:', FONT_VARIATIONS);
console.log('Most likely correct names:', CORRECT_FONT_NAMES);

module.exports = { FONT_VARIATIONS, CORRECT_FONT_NAMES };
