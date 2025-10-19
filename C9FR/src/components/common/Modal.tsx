/**
 * Modal Component
 * 
 * Reusable modal component with header, content, footer, and accessibility
 */

import React, { ReactNode, useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useStyles } from '../../hooks';

/**
 * Modal props
 */
export interface ModalProps {
  /** Modal visibility */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Content style */
  contentStyle?: ViewStyle;
  /** Animation type */
  animationType?: 'none' | 'slide' | 'fade';
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Modal Component
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  containerStyle,
  contentStyle,
  animationType = 'slide',
  accessibilityLabel,
  testID,
}) => {
  const styles = useModalStyles();

  // Focus management: trap focus when modal opens
  useEffect(() => {
    if (visible) {
      // Modal is opening - focus will be trapped inside
      // React Native handles this automatically with Modal component
    }
    
    return () => {
      // Modal is closing - focus will be restored
    };
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />
        
        <View style={[styles.container, containerStyle]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text
                  style={styles.title}
                  accessibilityRole="header"
                  accessibilityLabel={title}
                >
                  {title}
                </Text>
              )}
              
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  accessibilityHint="Closes the modal and returns to previous screen"
                  testID={`${testID}-close-button`}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Content */}
          <ScrollView
            style={[styles.content, contentStyle]}
            showsVerticalScrollIndicator={true}
            accessible={true}
            accessibilityRole="scrollbar"
          >
            {children}
          </ScrollView>
          
          {/* Footer */}
          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

/**
 * Modal styles hook
 */
const useModalStyles = () => {
  return useStyles((theme) => ({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      backgroundColor: theme.isDark ? '#1e293b' : '#ffffff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.isDark ? '#334155' : '#e5e7eb',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.isDark ? '#f3f4f6' : '#111827',
      flex: 1,
    },
    closeButton: {
      padding: 4,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? '#334155' : '#e5e7eb',
    },
  }));
};

// Import StyleSheet for absoluteFillObject
import { StyleSheet } from 'react-native';
