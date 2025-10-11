import React, { useContext, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, Spacing, BorderRadius, Shadows } from '../styles/designSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'center' | 'bottom' | 'fullscreen';
  animationType?: 'slide' | 'fade' | 'scale';
  backdropBlur?: boolean;
  dismissOnBackdrop?: boolean;
  maxHeight?: number;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  children,
  variant = 'center',
  animationType = 'scale',
  backdropBlur = true,
  dismissOnBackdrop = true,
  maxHeight,
}) => {
  const { theme } = useContext(ThemeContext);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalTransform = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        animationType === 'scale' 
          ? Animated.spring(modalScale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          : Animated.timing(modalTransform, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        animationType === 'scale'
          ? Animated.timing(modalScale, {
              toValue: 0.8,
              duration: 250,
              useNativeDriver: true,
            })
          : Animated.timing(modalTransform, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
      ]).start();
    }
  }, [visible, backdropOpacity, modalTransform, modalScale, animationType]);

  const getModalTransform = () => {
    if (animationType === 'scale') {
      return [{ scale: modalScale }];
    }

    if (variant === 'bottom') {
      return [{
        translateY: modalTransform.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        })
      }];
    }

    return [{
      translateY: modalTransform.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
      })
    }];
  };

  const getModalStyle = () => {
    const baseStyle = [styles.modalContent];

    switch (variant) {
      case 'bottom':
        baseStyle.push(styles.bottomModal);
        if (maxHeight) {
          baseStyle.push({ maxHeight });
        }
        break;
      case 'fullscreen':
        baseStyle.push(styles.fullscreenModal);
        break;
      default: // center
        baseStyle.push(styles.centerModal);
        if (maxHeight) {
          baseStyle.push({ maxHeight });
        }
    }

    baseStyle.push({
      backgroundColor: theme.card,
      shadowColor: theme.text,
    });

    return baseStyle;
  };

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: backdropBlur 
                ? 'rgba(0, 0, 0, 0.6)' 
                : 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              getModalStyle(),
              {
                transform: getModalTransform(),
                opacity: backdropOpacity,
              },
            ]}
          >
            {variant === 'bottom' && (
              <View style={[styles.handle, { backgroundColor: theme.borderMuted }]} />
            )}
            {children}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: BorderRadius.xl,
    ...Shadows.xl,
    overflow: 'hidden',
  },
  centerModal: {
    width: screenWidth - (Spacing.xl * 2),
    maxHeight: screenHeight * 0.8,
    margin: Spacing.xl,
  },
  bottomModal: {
    width: '100%',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'absolute',
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg, // Safe area for iOS
  },
  fullscreenModal: {
    width: screenWidth,
    height: screenHeight,
    borderRadius: 0,
    margin: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

export default PremiumModal;
