import { Alert } from 'react-native';

export const showToast = {
  success: (message: string) => {
    Alert.alert('Success', message);
  },
  error: (message: string) => {
    Alert.alert('Error', message);
  },
  info: (message: string) => {
    Alert.alert('Info', message);
  },
};