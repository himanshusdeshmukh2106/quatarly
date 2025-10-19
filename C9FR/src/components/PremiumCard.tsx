import React, { useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows } from '../styles/designSystem';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  interactive?: boolean;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  onPress,
  onLongPress,
  style,
  padding = 'medium',
  borderRadius = 'large',
  shadow = 'medium',
  interactive = true,
}) => {
  const { theme } = useContext(ThemeContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!interactive || (!onPress && !onLongPress)) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!interactive || (!onPress && !onLongPress)) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: Spacing.sm };
      case 'large':
        return { padding: Spacing.xl };
      default: // medium
        return { padding: Spacing.lg };
    }
  };

  const getBorderRadiusStyle = () => {
    switch (borderRadius) {
      case 'small':
        return { borderRadius: BorderRadius.sm };
      case 'medium':
        return { borderRadius: BorderRadius.md };
      case 'xl':
        return { borderRadius: BorderRadius['2xl'] };
      default: // large
        return { borderRadius: BorderRadius.xl };
    }
  };

  const getShadowStyle = () => {
    switch (shadow) {
      case 'none':
        return {};
      case 'small':
        return Shadows.sm;
      case 'large':
        return Shadows.lg;
      default: // medium
        return Shadows.md;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...getBorderRadiusStyle(),
      ...getPaddingStyle(),
      ...getShadowStyle(),
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: theme.card,
          ...Shadows.lg,
        };
      
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: theme.cardGlass || 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        };
      
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.primary + '20', // 20% opacity
          ...Shadows.md,
        };
      
      default: // default
        return {
          ...baseStyle,
          backgroundColor: theme.card,
        };
    }
  };

  const CardComponent = (onPress || onLongPress) ? TouchableOpacity : View;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <CardComponent
        style={[getVariantStyle(), style]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        {...(CardComponent === TouchableOpacity ? {} : {})}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

// Predefined card variants for common use cases
export const FinancialCard: React.FC<Omit<PremiumCardProps, 'variant'>> = (props) => (
  <PremiumCard {...props} variant="elevated" shadow="large" />
);

export const GlassCard: React.FC<Omit<PremiumCardProps, 'variant'>> = (props) => (
  <PremiumCard {...props} variant="glass" shadow="medium" />
);

export const InteractiveCard: React.FC<Omit<PremiumCardProps, 'variant' | 'interactive'>> = (props) => (
  <PremiumCard {...props} variant="gradient" interactive={true} />
);

export default PremiumCard;
