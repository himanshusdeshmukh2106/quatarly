import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();

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
        // TODO: Navigate to account settings
        console.log('Navigate to account settings');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell-outline',
      hasSwitch: false,
      onPress: () => {
        // TODO: Navigate to notification settings
        console.log('Navigate to notification settings');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-account',
      hasSwitch: false,
      onPress: () => {
        // TODO: Navigate to privacy settings
        console.log('Navigate to privacy settings');
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      hasSwitch: false,
      onPress: () => {
        // TODO: Navigate to help
        console.log('Navigate to help');
      },
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-outline',
      hasSwitch: false,
      onPress: () => {
        // TODO: Navigate to about
        console.log('Navigate to about');
      },
    },
  ];

  const renderMenuItem = (item: typeof profileMenuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Icon name={item.icon} size={24} color={theme.primary} />
        </View>
        <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onPress}
            trackColor={{ false: theme.border, true: theme.primary + '40' }}
            thumbColor={item.switchValue ? theme.primary : theme.textMuted}
          />
        ) : (
          <Icon name="chevron-right" size={24} color={theme.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with back button */}
      <View style={[styles.headerBar, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.profilePicContainer, { borderColor: theme.primary }]}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profilePic}
            />
            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.primary }]}>
              <Icon name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>John Doe</Text>
          <Text style={[styles.email, { color: theme.textMuted }]}>john.doe@example.com</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Settings</Text>
          {profileMenuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.error }]} 
          onPress={() => logout()}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.textMuted }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: -32, // Compensate for back button width
  },
  headerRight: {
    width: 32, // Same width as back button for centering
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
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
    marginBottom: 30,
  },
});

export default ProfileScreen; 