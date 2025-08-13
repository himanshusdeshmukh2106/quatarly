import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

interface AssetActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  assetName: string;
}

export const AssetActionSheet: React.FC<AssetActionSheetProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  assetName,
}) => {
  const { theme } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleEdit = () => {
    onClose();
    setTimeout(onEdit, 100); // Small delay for smooth transition
  };

  const handleDelete = () => {
    onClose();
    setTimeout(onDelete, 100); // Small delay for smooth transition
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.actionSheet,
          {
            backgroundColor: theme.background,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: theme.textMuted }]} />
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Manage Asset
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
            {assetName}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: theme.border }]}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
              <Icon name="edit" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Edit Asset
              </Text>
              <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
                Update quantity, price, or other details
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
              <Icon name="delete" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#EF4444' }]}>
                Delete Asset
              </Text>
              <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
                Remove this asset from your portfolio
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.cardElevated }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.5,
  },
  actionSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
    maxHeight: screenHeight * 0.6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  actions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
  },
  cancelButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AssetActionSheet;