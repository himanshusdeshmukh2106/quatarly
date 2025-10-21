/**
 * Badge Component - shadcn/ui inspired
 * Perplexity-style badges for status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { perplexityColors, perplexityRadius, perplexitySpacing } from '../../theme/perplexityTheme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'super';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  size = 'md',
  style,
  textStyle 
}) => {
  const variantStyles = {
    success: { bg: perplexityColors.successSubtle, text: perplexityColors.success },
    danger: { bg: perplexityColors.dangerSubtle, text: perplexityColors.danger },
    warning: { bg: perplexityColors.warningSubtle, text: perplexityColors.warning },
    neutral: { bg: perplexityColors.subtle, text: perplexityColors.quiet },
    super: { bg: perplexityColors.superMuted, text: perplexityColors.super },
  };

  const sizeStyles = {
    sm: { paddingH: perplexitySpacing.xs, paddingV: perplexitySpacing['2xs'], fontSize: 11 },
    md: { paddingH: perplexitySpacing.sm, paddingV: perplexitySpacing.xs, fontSize: 12 },
    lg: { paddingH: perplexitySpacing.md, paddingV: perplexitySpacing.sm, fontSize: 13 },
  };

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: variantStyles[variant].bg,
        paddingHorizontal: sizeStyles[size].paddingH,
        paddingVertical: sizeStyles[size].paddingV,
      },
      style
    ]}>
      <Text style={[
        styles.text,
        { color: variantStyles[variant].text, fontSize: sizeStyles[size].fontSize },
        textStyle
      ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: perplexityRadius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
