/**
 * Updated Font Tester - Test with correct names
 * Add this to HomeScreen temporarily to verify fonts load
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FontTester = () => {
  const fontTests = [
    { name: 'System Default', fontFamily: undefined },
    { name: 'SpaceGroteskBold', fontFamily: 'SpaceGroteskBold' },
    { name: 'IBMPlexSansRegular', fontFamily: 'IBMPlexSansRegular' },
    { name: 'IBMPlexMonoRegular', fontFamily: 'IBMPlexMonoRegular' },
    { name: 'InterRegular', fontFamily: 'InterRegular' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Font Tester - Updated Names</Text>
      <Text style={styles.subtitle}>
        If fonts work, you'll see different styles below
      </Text>
      
      {fontTests.map((test, index) => (
        <View key={index} style={styles.testItem}>
          <Text style={styles.label}>{test.name}:</Text>
          <Text style={[styles.testText, { fontFamily: test.fontFamily }]}>
            The Quick Brown Fox Jumps
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
