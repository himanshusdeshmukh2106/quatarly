/**
 * Card Component
 * 
 * Reusable card component with variants and accessibility
 */

import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useStyles } from '../../hooks';

/**
 * Card variants
 */
export type CardVariant = 'default' | 'elevated' | 'outlined';

/**
 * Card props
 */
export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Card variant */
  variant?: CardVariant;
  /** Custom style */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility role */
  accessibilityRole?: 'none' | 'button' | 'link' | 'header' | 'summary';
  /** Test ID */
  testID?: string;
}

/**
 * Card Component
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  accessibilityLabel,
  accessibilityRole = 'none',
  testID,
}) => {
  const styles = useCardStyles();

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      testID={testID}
      style={[styles.card, styles[`${variant}Card`], style]}
    >
      {children}
    </View>
  );
};

/**
 * Card styles hook
 */
const useCardStyles = () => {
  return useStyles((theme) => ({
    // Base card style
    card: {
      borderRadius: 16,
      padding: 16,
      backgroundColor: theme.isDark ? '#1e293b' : '#ffffff',
    },

    // Variant styles
    defaultCard: {
      // Base styles only
    },
    elevatedCard: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    outlinedCard: {
      borderWidth: 1,
      borderColor: theme.isDark ? '#334155' : '#e5e7eb',
    },
  }));
};
