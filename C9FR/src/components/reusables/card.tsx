/**
 * Card Component - shadcn/ui inspired
 * Reusable card with Perplexity dark theme
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { perplexityColors, perplexityRadius, perplexitySpacing } from '../../theme/perplexityTheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'subtle';
  padding?: keyof typeof perplexitySpacing;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  padding = 'lg',
  style 
}) => {
  return (
    <View style={[
      styles.card,
      variant === 'glass' && styles.glass,
      variant === 'subtle' && styles.subtle,
      { padding: perplexitySpacing[padding] },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: perplexityColors.subtler,
    borderRadius: perplexityRadius.lg,
    borderWidth: 1,
    borderColor: perplexityColors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  glass: {
    backgroundColor: perplexityColors.glass,
    borderColor: perplexityColors.borderSubtlest,
  },
  subtle: {
    backgroundColor: perplexityColors.base,
    borderColor: perplexityColors.borderSubtlest,
  },
});
