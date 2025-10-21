/**
 * Typography Components
 * Pre-styled Text components with proper fonts
 */

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Typography as DesignSystem } from '../../styles/designSystem';

// Heading component - uses Space Grotesk Bold
export const Heading: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.heading, style]} {...props} />
);

// Body text component - uses IBM Plex Sans
export const BodyText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.body, style]} {...props} />
);

// Alternative body text - uses Inter
export const BodyTextAlt: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.bodyAlt, style]} {...props} />
);

// Financial/Mono text - uses IBM Plex Mono
export const MonoText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.mono, style]} {...props} />
);

// Specific typography variants
export const H1: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.heading, styles.h1, style]} {...props} />
);

export const H2: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.heading, styles.h2, style]} {...props} />
);

export const H3: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.heading, styles.h3, style]} {...props} />
);

export const Price: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.mono, styles.price, style]} {...props} />
);

export const Percentage: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.mono, styles.percentage, style]} {...props} />
);

const styles = StyleSheet.create({
  heading: {
    fontFamily: DesignSystem.fontFamily.heading,
    fontWeight: '700',
  },
  body: {
    fontFamily: DesignSystem.fontFamily.body,
    fontWeight: '400',
  },
  bodyAlt: {
    fontFamily: DesignSystem.fontFamily.bodyAlt,
    fontWeight: '400',
  },
  mono: {
    fontFamily: DesignSystem.fontFamily.mono,
    fontWeight: '400',
  },
  h1: {
    fontSize: DesignSystem.fontSize['4xl'],
  },
  h2: {
    fontSize: DesignSystem.fontSize['3xl'],
  },
  h3: {
    fontSize: DesignSystem.fontSize['2xl'],
  },
  price: {
    fontSize: DesignSystem.fontSize.xl,
    fontWeight: '400',
  },
  percentage: {
    fontSize: DesignSystem.fontSize.sm,
    fontWeight: '400',
  },
});
