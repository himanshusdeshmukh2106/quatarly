/**
 * PerplexityLogo Component
 * Simple logo component for Perplexity Finance branding
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './reusables';
import { perplexityColors } from '../theme/perplexityTheme';

interface PerplexityLogoProps {
  size?: number;
}

export const PerplexityLogo: React.FC<PerplexityLogoProps> = ({ size = 24 }) => {
  return (
    <View style={styles.container}>
      <Text 
        variant="body" 
        color="super" 
        weight="700"
        style={{ fontSize: size }}
      >
        ₽
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
