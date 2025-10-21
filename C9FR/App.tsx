/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Typography } from './src/styles/designSystem';

function App() {
  useEffect(() => {
    // TEMPORARILY DISABLED - Testing if this is causing issues
    // Set default font for all Text components globally
    // const defaultFontFamily = {
    //   fontFamily: Typography.fontFamily.body,
    // };
    
    // @ts-ignore - Setting default props for Text component
    // Text.defaultProps = Text.defaultProps || {};
    // Text.defaultProps.style = defaultFontFamily;
    
    // @ts-ignore - Setting default props for TextInput component
    // TextInput.defaultProps = TextInput.defaultProps || {};
    // TextInput.defaultProps.style = defaultFontFamily;
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <PaperProvider>
            <RootNavigator />
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
