import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DecorativeBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top group */}
      <View style={[styles.shape, styles.blue, { top: '10%', left: '15%', transform: [{ rotate: '15deg' }] }]} />
      <View style={[styles.shape, styles.orange, { top: '12%', left: '40%', transform: [{ rotate: '-10deg' }] }]} />
      <View style={[styles.shape, styles.blue, { top: '8%', right: '15%', transform: [{ rotate: '25deg' }] }]} />

      {/* Middle group */}
      <View style={[styles.shape, styles.blue, { top: '20%', left: '30%' }]} />
      <View style={[styles.shape, styles.blue, { top: '22%', left: '50%' }]} />
      <Text style={[styles.asterisk, { top: '18%', right: '20%' }]}>*</Text>

      {/* Bottom group */}
      <View style={[styles.shape, styles.black, { top: '25%', left: '60%', transform: [{ rotate: '20deg' }] }]} />
      <View style={[styles.shape, styles.orange, { bottom: '15%', right: '10%', transform: [{ rotate: '30deg' }] }]} />
      <View style={[styles.shape, styles.blue, { bottom: '10%', left: '5%', transform: [{ rotate: '-15deg' }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  blue: {
    backgroundColor: '#ADD8E6', // Light Blue
  },
  orange: {
    backgroundColor: '#FFA07A', // Light Salmon
  },
  black: {
    backgroundColor: '#36454F', // Charcoal
  },
  asterisk: {
    position: 'absolute',
    fontSize: 60,
    color: '#36454F',
    fontWeight: 'bold',
  },
});

export default DecorativeBackground; 