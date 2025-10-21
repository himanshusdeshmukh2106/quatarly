/**
 * Font Tester Component
 * Use this to verify which fonts are actually loaded
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FontTester = () => {
  const fontTests = [
    { name: 'System Default', fontFamily: undefined },
    { name: 'SpaceGrotesk-Bold', fontFamily: 'SpaceGrotesk-Bold' },
    { name: 'Space Grotesk Bold', fontFamily: 'Space Grotesk Bold' },
    { name: 'Space Grotesk', fontFamily: 'Space Grotesk' },
    { name: 'IBMPlexSans-Regular', fontFamily: 'IBMPlexSans-Regular' },
    { name: 'IBM Plex Sans', fontFamily: 'IBM Plex Sans' },
    { name: 'IBMPlexMono-Regular', fontFamily: 'IBMPlexMono-Regular' },
    { name: 'IBM Plex Mono', fontFamily: 'IBM Plex Mono' },
    { name: 'Inter_24pt-Regular', fontFamily: 'Inter_24pt-Regular' },
    { name: 'Inter', fontFamily: 'Inter' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Font Tester - Check Console</Text>
      <Text style={styles.subtitle}>
        If a font is working, text below should look different
      </Text>
      
      {fontTests.map((test, index) => (
        <View key={index} style={styles.testItem}>
          <Text style={styles.label}>{test.name}:</Text>
          <Text style={[styles.testText, { fontFamily: test.fontFamily }]}>
            The Quick Brown Fox Jumps 12345
          </Text>
          <Text style={[styles.testNumber, { fontFamily: test.fontFamily }]}>
            $1,234.56 +12.5%
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  testItem: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  testText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  testNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FontTester;
