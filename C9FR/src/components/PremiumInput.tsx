import React, { useContext, useRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../styles/designSystem';

interface PremiumInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
}

const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  ...textInputProps
}) => {
  const { theme } = useContext(ThemeContext);
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      textInputProps.value || textInputProps.defaultValue ? null : Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ].filter(Boolean)).start();
    textInputProps.onBlur?.(e);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: Spacing.md,
    };

    return baseStyle;
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BorderRadius.lg,
      position: 'relative',
    };

    // Size variations
    switch (size) {
      case 'small':
        baseStyle.minHeight = 40;
        baseStyle.paddingHorizontal = Spacing.md;
        break;
      case 'large':
        baseStyle.minHeight = 56;
        baseStyle.paddingHorizontal = Spacing.lg;
        break;
      default: // medium
        baseStyle.minHeight = 48;
        baseStyle.paddingHorizontal = Spacing.lg;
    }

    // Variant styles
    switch (variant) {
      case 'filled':
        baseStyle.backgroundColor = theme.backgroundSecondary;
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = error ? theme.error : (isFocused ? theme.primary : theme.border);
        baseStyle.backgroundColor = theme.card;
        if (isFocused) {
          Object.assign(baseStyle, Shadows.sm);
        }
        break;
      default: // default
        baseStyle.borderBottomWidth = 1;
        baseStyle.borderBottomColor = error ? theme.error : (isFocused ? theme.primary : theme.border);
        baseStyle.backgroundColor = 'transparent';
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: theme.text,
      fontSize: size === 'small' ? Typography.fontSize.sm : 
               size === 'large' ? Typography.fontSize.lg : Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
    };

    // Add padding for icons
    if (leftIcon) {
      baseStyle.marginLeft = Spacing.sm;
    }
    if (rightIcon) {
      baseStyle.marginRight = Spacing.sm;
    }

    return baseStyle;
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      color: error ? theme.error : theme.textMuted,
      marginBottom: Spacing.xs,
    };

    return baseStyle;
  };

  const getFloatingLabelStyle = () => {
    return {
      position: 'absolute' as const,
      left: leftIcon ? 48 : Spacing.lg,
      color: error ? theme.error : (isFocused ? theme.primary : theme.textMuted),
      fontSize: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [Typography.fontSize.base, Typography.fontSize.sm],
      }),
      top: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [size === 'small' ? 12 : size === 'large' ? 18 : 15, -8],
      }),
      backgroundColor: variant === 'outlined' ? theme.card : 'transparent',
      paddingHorizontal: variant === 'outlined' ? 4 : 0,
      zIndex: 1,
    };
  };

  const renderLabel = () => {
    if (!label) return null;

    if (variant === 'outlined' && (isFocused || textInputProps.value || textInputProps.defaultValue)) {
      return (
        <Animated.Text style={getFloatingLabelStyle()}>
          {label}{required && ' *'}
        </Animated.Text>
      );
    }

    return (
      <Text style={[getLabelStyle(), labelStyle]}>
        {label}{required && ' *'}
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Text style={styles.errorText}>
        {error}
      </Text>
    );
  };

  const renderHint = () => {
    if (!hint || error) return null;

    return (
      <Text style={[styles.hintText, { color: theme.textMuted }]}>
        {hint}
      </Text>
    );
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {variant !== 'outlined' && renderLabel()}
      
      <Animated.View style={getInputContainerStyle()}>
        {variant === 'outlined' && renderLabel()}
        
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          {...textInputProps}
          style={[getInputStyle(), inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.textMuted}
          placeholder={variant === 'outlined' ? undefined : textInputProps.placeholder}
        />
        
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </Animated.View>
      
      {renderError()}
      {renderHint()}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.danger[500],
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  hintText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default PremiumInput;
