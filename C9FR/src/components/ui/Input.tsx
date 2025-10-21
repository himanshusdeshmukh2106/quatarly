/**
 * Input Component - shadcn/ui inspired
 * Perplexity-style search and text inputs
 */

import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { perplexityColors, perplexityRadius, perplexitySpacing } from '../../theme/perplexityTheme';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({ 
  icon, 
  iconPosition = 'left',
  containerStyle,
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <TextInput
        style={[
          styles.input,
          icon && iconPosition === 'left' && styles.inputWithIconLeft,
          icon && iconPosition === 'right' && styles.inputWithIconRight,
          style
        ]}
        placeholderTextColor={perplexityColors.quieter}
        {...props}
      />
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  input: {
    backgroundColor: perplexityColors.subtler,
    borderWidth: 1,
    borderColor: perplexityColors.borderSubtle,
    borderRadius: perplexityRadius.full,
    paddingHorizontal: perplexitySpacing.md,
    paddingVertical: perplexitySpacing.sm,
    color: perplexityColors.foreground,
    fontSize: 14,
    fontWeight: '400',
  },
  inputWithIconLeft: {
    paddingLeft: 40,
  },
  inputWithIconRight: {
    paddingRight: 40,
  },
  iconLeft: {
    position: 'absolute',
    left: perplexitySpacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: perplexitySpacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
});
