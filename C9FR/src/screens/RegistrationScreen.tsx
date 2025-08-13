import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { registerUser } from '../services/api';
import DecorativeBackground from '../components/auth/DecorativeBackground';

const RegistrationScreen = ({ navigation }: { navigation: any }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const handleRegister = async () => {
    if (!username || !email || !password || !password2) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== password2) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ username, email, password1: password, password2: password2 });
      await login(username, password);
    } catch (error: any) {
      console.error(JSON.stringify(error.response?.data, null, 2));
      const errorMessage = error.response?.data ? formatErrorMessage(error.response.data) : 'An unexpected error occurred. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (errors: any) => {
    return Object.keys(errors).map(field => {
      return `${field}: ${errors[field].join(', ')}`;
    }).join('\n');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <DecorativeBackground />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Create Your Account</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Join us to take control of your finances.</Text>
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
            placeholder="Email"
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
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
        <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
        />
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register & Continue</Text>
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
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
      textAlign: 'left',
    },
    input: {
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
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    link: {
        marginTop: 20,
        textAlign: 'center',
    }
  });

export default RegistrationScreen; 