import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle, View } from 'react-native';
import { perplexityColors, perplexitySpacing, perplexityRadius } from '../../theme/perplexityTheme';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({ variant = 'default', size = 'md', icon, iconPosition = 'left', children, style, ...props }, ref) => {
    const buttonStyle: ViewStyle = {
      ...getVariantStyle(variant),
      ...getSizeStyle(size),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: perplexityRadius.md,
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[buttonStyle, style]}
        {...props}
      >
        {icon && iconPosition === 'left' && <View style={{ marginRight: children ? perplexitySpacing.xs : 0 }}>{icon}</View>}
        {children}
        {icon && iconPosition === 'right' && <View style={{ marginLeft: children ? perplexitySpacing.xs : 0 }}>{icon}</View>}
      </TouchableOpacity>
    );
  }
);

const getVariantStyle = (variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: perplexityColors.super,
        borderWidth: 0,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: perplexityColors.border,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    case 'destructive':
      return {
        backgroundColor: perplexityColors.danger,
        borderWidth: 0,
      };
    default:
      return {
        backgroundColor: perplexityColors.super,
        borderWidth: 0,
      };
  }
};

const getSizeStyle = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: perplexitySpacing.xs,
        paddingHorizontal: perplexitySpacing.sm,
      };
    case 'md':
      return {
        paddingVertical: perplexitySpacing.sm,
        paddingHorizontal: perplexitySpacing.md,
      };
    case 'lg':
      return {
        paddingVertical: perplexitySpacing.md,
        paddingHorizontal: perplexitySpacing.lg,
      };
    default:
      return {
        paddingVertical: perplexitySpacing.sm,
        paddingHorizontal: perplexitySpacing.md,
      };
  }
};

Button.displayName = 'Button';

export { Button };
