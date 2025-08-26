import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import DecorativeBackground from '../components/auth/DecorativeBackground';
import { getHeaderFont, getBodyFont } from '../config/fonts';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.detail || 'Invalid username or password.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <DecorativeBackground />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Log in to continue your financial journey.</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
          placeholder="Username"
          placeholderTextColor={theme.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
          placeholder="Password"
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
            <Text style={[styles.link, { color: theme.textMuted }]}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontFamily: getHeaderFont('bold'), // FK Grotesk Bold for main title
    fontSize: 28,
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular for subtitle
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'left',
  },
  input: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular for input text
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontFamily: getHeaderFont('medium'), // FK Grotesk Medium for button text
    color: 'white',
    fontSize: 16,
  },
  link: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular for links
    marginTop: 20,
    textAlign: 'center',
  }
});

export default LoginScreen;