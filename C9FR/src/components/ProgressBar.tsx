import React, { useContext, useEffect, useRef } from 'react';
import { View, ViewStyle, Animated, Easing } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, BorderRadius, Spacing, Shadows } from '../styles/designSystem';

interface Props {
  value: number; // 0‒100
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  showGlow?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const ProgressBar: React.FC<Props> = ({
  value,
  height = 8,
  backgroundColor,
  fillColor,
  style,
  animated = true,
  showGlow = false,
  variant = 'default'
}) => {
  const { theme } = useContext(ThemeContext);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(100, value));

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clamped,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clamped);
    }
  }, [clamped, animated, animatedWidth]);

  useEffect(() => {
    if (showGlow) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
    }
  }, [showGlow, glowAnim]);

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'danger':
        return theme.error;
      default:
        return fillColor ?? theme.primary;
    }
  };

  const containerStyle = [
    {
      height,
      borderRadius: height / 2,
      backgroundColor: backgroundColor ?? theme.borderMuted,
      overflow: 'hidden',
      ...Shadows.sm,
    },
    style,
  ];

  return (
    <View style={containerStyle}>
      <Animated.View
        style={{
          width: animatedWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
            extrapolate: 'clamp',
          }),
          height: '100%',
          backgroundColor: getVariantColor(),
          borderRadius: height / 2,
          opacity: showGlow ? glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }) : 1,
          transform: showGlow ? [{
            scale: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.02],
            })
          }] : [],
        }}
      />
    </View>
  );
};

export default ProgressBar; 