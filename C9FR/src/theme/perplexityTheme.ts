/**
 * Perplexity Finance-Inspired Dark Theme
 * Color system matching Perplexity's design language
 */

export const perplexityColors = {
  // Base colors
  base: '#0A0A0A',           // Main background
  underlay: '#000000',        // Deeper background
  subtler: '#1A1A1A',        // Subtle background (cards, inputs)
  subtle: '#202020',          // Hover states
  
  // Text colors
  foreground: '#FFFFFF',      // Primary text
  text: '#E8E8E8',           // Secondary text
  quiet: '#B4B4B4',          // Muted text
  quieter: '#8A8A8A',        // More muted text
  quietest: '#6B6B6B',       // Most muted text
  
  // Border colors
  border: '#2A2A2A',         // Default border
  borderSubtle: '#1F1F1F',   // Subtle border
  borderSubtlest: '#151515', // Most subtle border
  
  // Accent colors (Super = Perplexity teal)
  super: '#20D9D2',          // Primary accent (teal)
  superSubtle: '#1A4D4A',    // Subtle super
  superMuted: '#0D2625',     // Muted super
  
  // Success colors
  success: '#22C55E',
  successSubtle: '#1A4D2E',
  
  // Error/Danger colors
  danger: '#EF4444',
  dangerSubtle: '#4D1F1F',
  
  // Warning colors
  warning: '#F59E0B',
  warningSubtle: '#4D3A1F',
  
  // Chart colors
  chartPositive: '#22D3EE',  // Cyan for positive trends
  chartNegative: '#EF4444',  // Red for negative trends
  chartNeutral: '#8B5CF6',   // Purple for neutral
  
  // Glassmorphism
  glass: 'rgba(26, 26, 26, 0.7)',
  glassSubtle: 'rgba(10, 10, 10, 0.5)',
};

export const perplexitySpacing = {
  '2xs': 2,
  'xs': 4,
  'sm': 8,
  'md': 12,
  'lg': 16,
  'xl': 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const perplexityRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const perplexityFonts = {
  heading: 'Space Grotesk Bold', // For all headings - ACTUAL internal name
  body: 'IBM Plex Sans Regular', // Primary body text - ACTUAL internal name
  bodyAlt: 'Inter 24pt Regular', // Alternative body text - ACTUAL internal name
  mono: 'IBM Plex Mono Regular', // Financial data & code - ACTUAL internal name
  
  // Deprecated - keeping for backwards compatibility
  sans: 'IBM Plex Sans Regular',
};

export const perplexityShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
};

export const perplexityAnimations = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export type PerplexityTheme = {
  colors: typeof perplexityColors;
  spacing: typeof perplexitySpacing;
  radius: typeof perplexityRadius;
  fonts: typeof perplexityFonts;
  shadows: typeof perplexityShadows;
  animations: typeof perplexityAnimations;
};

export const perplexityTheme: PerplexityTheme = {
  colors: perplexityColors,
  spacing: perplexitySpacing,
  radius: perplexityRadius,
  fonts: perplexityFonts,
  shadows: perplexityShadows,
  animations: perplexityAnimations,
};
