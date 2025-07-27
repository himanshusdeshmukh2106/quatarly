import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
            <Image 
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.profilePic}
            />
            <Text style={[styles.name, { color: theme.text }]}>John Doe</Text>
            <Text style={[styles.email, { color: theme.textMuted }]}>john.doe@example.com</Text>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => logout()}>
            <Icon name="logout" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#005A9C',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 'auto', // Push to the bottom
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 10,
  }
});

export default ProfileScreen; 