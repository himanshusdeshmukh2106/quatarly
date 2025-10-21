/**
 * GeometricBackground Component
 * Perplexity-inspired triangular geometric pattern background
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { perplexityColors } from '../../theme/perplexityTheme';

interface GeometricBackgroundProps {
  opacity?: number;
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({ opacity = 0.03 }) => {
  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="triangleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={perplexityColors.super} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={perplexityColors.super} stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="triangleGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={perplexityColors.chartPositive} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={perplexityColors.chartPositive} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        
        <Path d="M0,0 L120,0 L60,100 Z" fill="url(#triangleGrad1)" stroke={perplexityColors.super} strokeWidth="1" strokeOpacity="0.2" />
        <Path d="M120,0 L180,100 L60,100 Z" fill="none" stroke={perplexityColors.super} strokeWidth="0.5" strokeOpacity="0.15" />
        <Path d="M200,150 L320,150 L260,280 Z" fill="none" stroke={perplexityColors.chartPositive} strokeWidth="0.5" strokeOpacity="0.1" />
        <Path d="M260,280 L200,150 L140,280 Z" fill="url(#triangleGrad2)" stroke={perplexityColors.chartPositive} strokeWidth="1" strokeOpacity="0.15" />
        <Path d="M350,100 L400,100 L400,200 Z" fill="url(#triangleGrad1)" stroke={perplexityColors.super} strokeWidth="0.5" strokeOpacity="0.1" />
        <Path d="M50,450 L150,450 L100,550 Z" fill="none" stroke={perplexityColors.chartPositive} strokeWidth="1" strokeOpacity="0.08" />
        <Path d="M380,450 L400,450 L390,480 Z" fill={perplexityColors.super} fillOpacity="0.15" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
