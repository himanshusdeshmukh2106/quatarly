/**
 * Font Debug Screen
 * Add this to navigation to test fonts
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FontDebugScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Font Debug - Check if ANY font works</Text>
      
      {/* System font baseline */}
      <View style={styles.testBox}>
        <Text style={styles.label}>System Default (no fontFamily)</Text>
        <Text style={styles.testText}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      {/* Test with sans-serif (should work) */}
      <View style={styles.testBox}>
        <Text style={styles.label}>sans-serif (should work)</Text>
        <Text style={[styles.testText, { fontFamily: 'sans-serif' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      {/* Test with monospace (should work) */}
      <View style={styles.testBox}>
        <Text style={styles.label}>monospace (should work)</Text>
        <Text style={[styles.testText, { fontFamily: 'monospace' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      {/* XML family names */}
      <View style={styles.testBox}>
        <Text style={styles.label}>spacegrotesk (XML family)</Text>
        <Text style={[styles.testText, { fontFamily: 'spacegrotesk' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      <View style={styles.testBox}>
        <Text style={styles.label}>ibmplexsans (XML family)</Text>
        <Text style={[styles.testText, { fontFamily: 'ibmplexsans' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      <View style={styles.testBox}>
        <Text style={styles.label}>ibmplexmono (XML family)</Text>
        <Text style={[styles.testText, { fontFamily: 'ibmplexmono' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      {/* Direct font file names */}
      <View style={styles.testBox}>
        <Text style={styles.label}>spacegrotesk_bold (file name)</Text>
        <Text style={[styles.testText, { fontFamily: 'spacegrotesk_bold' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      <View style={styles.testBox}>
        <Text style={styles.label}>ibmplexsans_regular (file name)</Text>
        <Text style={[styles.testText, { fontFamily: 'ibmplexsans_regular' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      {/* Try with @ symbol (Android XML reference) */}
      <View style={styles.testBox}>
        <Text style={styles.label}>@font/spacegrotesk_bold</Text>
        <Text style={[styles.testText, { fontFamily: '@font/spacegrotesk_bold' }]}>
          The Quick Brown Fox 123456
        </Text>
      </View>

      <Text style={styles.instructions}>
        INSTRUCTIONS:{'\n'}
        - System fonts (sans-serif, monospace) SHOULD look different{'\n'}
        - If custom fonts work, they'll look different from system{'\n'}
        - If ALL text looks the same = custom fonts not loading
      </Text>
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
  },
  testBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  testText: {
    fontSize: 18,
    color: '#000',
  },
  instructions: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default FontDebugScreen;
