/**
 * Input Component
 * 
 * Reusable input component with label, error messages, and accessibility
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useStyles } from '../../hooks';

/**
 * Input props
 */
export interface InputProps extends TextInputProps {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Input style */
  inputStyle?: TextStyle;
  /** Label style */
  labelStyle?: TextStyle;
  /** Required field indicator */
  required?: boolean;
}

/**
 * Input Component
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  accessibilityLabel,
  accessibilityHint,
  ...textInputProps
}) => {
  const styles = useInputStyles();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[styles.label, hasError && styles.labelError, labelStyle]}
          accessibilityLabel={`${label}${required ? ', required' : ''}`}
        >
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TextInput
        {...textInputProps}
        accessible={true}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={
          accessibilityHint ||
          (hasError ? error : helperText) ||
          undefined
        }
        accessibilityState={{
          disabled: textInputProps.editable === false,
        }}
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          textInputProps.editable === false && styles.inputDisabled,
          inputStyle,
        ]}
      />
      
      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            hasError && styles.errorText,
          ]}
          accessibilityLiveRegion={hasError ? 'polite' : 'none'}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

/**
 * Input styles hook
 */
const useInputStyles = () => {
  return useStyles((theme) => ({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.isDark ? '#e5e7eb' : '#374151',
    },
    labelError: {
      color: '#ef4444',
    },
    required: {
      color: '#ef4444',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.isDark ? '#334155' : '#d1d5db',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.isDark ? '#f3f4f6' : '#111827',
      backgroundColor: theme.isDark ? '#1e293b' : '#ffffff',
      minHeight: 44, // Accessibility requirement
    },
    inputFocused: {
      borderColor: theme.isDark ? '#0284c7' : '#0ea5e9',
      borderWidth: 2,
      shadowColor: '#0ea5e9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    inputError: {
      borderColor: '#ef4444',
      borderWidth: 2,
    },
    inputDisabled: {
      opacity: 0.6,
      backgroundColor: theme.isDark ? '#0f172a' : '#f9fafb',
    },
    helperText: {
      fontSize: 12,
      marginTop: 4,
      color: theme.isDark ? '#9ca3af' : '#6b7280',
    },
    errorText: {
      color: '#ef4444',
    },
  }));
};
