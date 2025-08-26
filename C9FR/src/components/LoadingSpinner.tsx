import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getBodyFont } from '../config/fonts';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  color,
}) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} testID="loading-spinner">
      <ActivityIndicator 
        size={size} 
        color={color || theme.primary} 
      />
      {message !== undefined && message !== '' && (
        <Text style={[styles.message, { color: theme.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontFamily: getBodyFont('regular'), // IBM Plex Sans Regular for loading messages
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingSpinner;