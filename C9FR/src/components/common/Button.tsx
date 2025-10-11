/**
 * Button Component
 * 
 * Reusable button component with variants, loading states, and accessibility
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useStyles } from '../../hooks';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button props
 */
export interface ButtonProps {
  /** Button label text */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style for button container */
  style?: ViewStyle;
  /** Custom style for button text */
  textStyle?: TextStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const styles = useButtonStyles();

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={[
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#0ea5e9'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Button styles hook
 */
const useButtonStyles = () => {
  return useStyles((theme) => ({
    // Base button style
    button: {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44, // Minimum touch target size
      minWidth: 44,
    },

    // Variant styles
    primaryButton: {
      backgroundColor: theme.isDark ? '#0284c7' : '#0ea5e9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.isDark ? '#0284c7' : '#0ea5e9',
    },
    ghostButton: {
      backgroundColor: 'transparent',
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    // Size styles
    smallButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    mediumButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    largeButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },

    // State styles
    disabled: {
      opacity: 0.5,
    },
    fullWidth: {
      width: '100%',
    },

    // Text styles
    text: {
      fontWeight: '600',
      textAlign: 'center',
    },
    primaryText: {
      color: '#FFFFFF',
    },
    secondaryText: {
      color: theme.isDark ? '#0284c7' : '#0ea5e9',
    },
    ghostText: {
      color: theme.isDark ? '#0284c7' : '#0ea5e9',
    },
    dangerText: {
      color: '#FFFFFF',
    },
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    disabledText: {
      opacity: 0.7,
    },
  }));
};
