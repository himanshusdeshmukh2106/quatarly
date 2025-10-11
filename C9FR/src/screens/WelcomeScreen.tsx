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
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 20,
    marginTop: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonOutlineText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
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