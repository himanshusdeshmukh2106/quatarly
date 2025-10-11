import React, { useContext, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Easing } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows } from '../styles/designSystem';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  variant?: 'default' | 'overlay' | 'inline';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  color,
  variant = 'default',
}) => {
  const { theme } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Premium entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const getContainerStyle = () => {
    const baseStyle = [
      styles.container,
      {
        backgroundColor: variant === 'overlay'
          ? 'rgba(0, 0, 0, 0.5)'
          : theme.background,
      }
    ];

    if (variant === 'overlay') {
      baseStyle.push(styles.overlay);
    } else if (variant === 'inline') {
      baseStyle.push(styles.inline);
    }

    return baseStyle;
  };

  return (
    <Animated.View
      style={[
        getContainerStyle(),
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
      testID="loading-spinner"
    >
      <View style={[
        styles.spinnerContainer,
        variant === 'overlay' && styles.overlaySpinner,
        { backgroundColor: variant === 'overlay' ? theme.card : 'transparent' }
      ]}>
        <ActivityIndicator
          size={size}
          color={color || theme.primary}
        />
        {message !== undefined && message !== '' && (
          <Text style={[
            styles.message,
            { color: variant === 'overlay' ? theme.text : theme.text }
          ]}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  inline: {
    flex: 0,
    padding: Spacing.md,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  overlaySpinner: {
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
    minWidth: 120,
    minHeight: 120,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingSpinner;