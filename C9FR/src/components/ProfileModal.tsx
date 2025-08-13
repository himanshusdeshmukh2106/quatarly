import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ErrorBoundary from './ErrorBoundary';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout, user } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleProfilePictureEdit = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option to update your profile picture',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Camera',
          onPress: () => {
            // TODO: Implement camera functionality
            Alert.alert('Camera', 'Camera functionality will be implemented soon');
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            // TODO: Implement gallery functionality
            Alert.alert('Gallery', 'Gallery functionality will be implemented soon');
          },
        },
      ]
    );
  };

  const profileMenuItems = [
    {
      id: 'theme',
      title: 'Dark Mode',
      icon: isDarkMode ? 'weather-night' : 'weather-sunny',
      hasSwitch: true,
      switchValue: isDarkMode,
      onPress: toggleTheme,
    },
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'account-cog',
      hasSwitch: false,
      onPress: () => {
        console.log('Navigate to account settings');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell-outline',
      hasSwitch: false,
      onPress: () => {
        console.log('Navigate to notification settings');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-account',
      hasSwitch: false,
      onPress: () => {
        console.log('Navigate to privacy settings');
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      hasSwitch: false,
      onPress: () => {
        console.log('Navigate to help');
      },
    },
  ];

  const renderMenuItem = (item: typeof profileMenuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={item.onPress}
      activeOpacity={0.7}
      accessibilityLabel={item.title}
      accessibilityHint={item.hasSwitch ? `Toggle ${item.title}` : `Navigate to ${item.title}`}
      accessibilityRole={item.hasSwitch ? 'switch' : 'button'}
      accessibilityState={item.hasSwitch ? { checked: item.switchValue } : undefined}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.accent + '20' }]}>
          <Icon name={item.icon} size={20} color={theme.accent} />
        </View>
        <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onPress}
            trackColor={{ false: theme.border, true: theme.accent + '40' }}
            thumbColor={item.switchValue ? theme.accent : theme.textMuted}
            accessibilityLabel={`${item.title} toggle`}
          />
        ) : (
          <Icon name="chevron-right" size={20} color={theme.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
        accessibilityLabel="Close profile modal"
      >
        <TouchableOpacity 
          style={[styles.modalContent, { backgroundColor: theme.background }]} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Profile</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              accessibilityLabel="Close profile"
              accessibilityHint="Tap to close the profile modal"
            >
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <ErrorBoundary>
              {/* Profile Header */}
              <View style={styles.profileHeader}>
                <View style={[styles.profilePicContainer, { borderColor: theme.accent }]}>
                  <Image 
                    source={{ 
                      uri: 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User' 
                    }}
                    style={styles.profilePic}
                    onError={() => {
                      // Handle image load error gracefully
                      console.log('Profile picture failed to load');
                    }}
                  />
                  <TouchableOpacity 
                    style={[styles.editButton, { backgroundColor: theme.accent }]}
                    onPress={handleProfilePictureEdit}
                    accessibilityLabel="Edit profile picture"
                    accessibilityHint="Tap to change your profile picture"
                  >
                    <Icon name="camera" size={12} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.name, { color: theme.text }]}>
                  {user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'User'}
                </Text>
                <Text style={[styles.email, { color: theme.textMuted }]}>
                  {user?.email || 'No email available'}
                </Text>
              </View>

              {/* Menu Items */}
              <View style={styles.menuSection}>
                {profileMenuItems.map(renderMenuItem)}
              </View>

              {/* Logout Button */}
              <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: theme.error }]} 
                onPress={() => {
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: async () => {
                          setIsLoggingOut(true);
                          try {
                            await logout();
                            onClose();
                          } catch (error) {
                            console.error('Logout failed:', error);
                            Alert.alert(
                              'Logout Failed',
                              'There was an error logging out. Please try again.',
                              [{ text: 'OK' }]
                            );
                          } finally {
                            setIsLoggingOut(false);
                          }
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.8}
                disabled={isLoggingOut}
                accessibilityLabel="Logout"
                accessibilityHint="Tap to logout from your account"
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                ) : (
                  <Icon name="logout" size={18} color="white" style={styles.buttonIcon} />
                )}
                <Text style={styles.logoutButtonText}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Text>
              </TouchableOpacity>

              {/* App Version */}
              <Text style={[styles.versionText, { color: theme.textMuted }]}>
                Version 1.0.0
              </Text>
            </ErrorBoundary>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
});

export default ProfileModal;