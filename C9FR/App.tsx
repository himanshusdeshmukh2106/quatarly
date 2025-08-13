/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PaperProvider>
          <RootNavigator />
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
