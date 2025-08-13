import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import DecorativeBackground from '../components/auth/DecorativeBackground';

const WelcomeScreen = ({ navigation }: { navigation: { navigate: (screen: string) => void }}) => {
  const { theme, isDarkMode } = useContext(ThemeContext);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <DecorativeBackground />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: theme.primary }]}>C9FR</Text>
          <Text style={[styles.tagline, { color: theme.textMuted }]}>Your Financial Companion</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.buttonOutline, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonOutlineText, { color: theme.primary }]}>Log In</Text>
          </TouchableOpacity>
          <Text style={[styles.legalText, { color: isDarkMode ? '#888' : '#666' }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.link, { color: theme.primary }]}>Terms of Service</Text>.
            For more information, see our{' '}
            <Text style={[styles.link, { color: theme.primary }]}>Privacy Notice</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 18,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
  },
  legalText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  link: {
      textDecorationLine: 'underline',
  }
});

export default WelcomeScreen; 