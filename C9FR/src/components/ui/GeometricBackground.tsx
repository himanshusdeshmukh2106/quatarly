/**
 * GeometricBackground Component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Line, Circle, Rect, Mask, G } from 'react-native-svg';
import { perplexityColors } from '../../theme/perplexityTheme';

interface GeometricBackgroundProps {
  opacity?: number; // treated as intensity, not container opacity
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({ opacity = 0.18 }) => {
  // Visible yet subtle opacities
  const gridOpacity = Math.max(0.86, Math.min(0.5, opacity * .5));
  const dotOpacity = Math.max(0.08, Math.min(0.08, opacity * .8));
  const width = 400;
  const height = 600;
  // Fade earlier towards top
  const fadeToPx = 90;
  const fadeTo = Math.min(1, Math.max(0, fadeToPx / height));
  const fadeSoftEdge = Math.min(1, fadeTo + 0.12);
  // Grid spec: keep 4 columns, increase rows to reduce row height (smaller triangles)
  const cols = 4;
  const rows = 5.6;
  const colW = width / cols;
  const rowH = height / rows;
  const vLineCount = cols + 1;
  const hLineCount = Math.floor(rows) + 1;
  // minimal triangles formed by connecting grid dots (span 2 columns, 1 row tall)
  const triOpacity = Math.max(.003, Math.min(0.20, opacity * .5));
  const triCols = Math.floor(cols / 2); // keep same horizontal count (2)
  const triApexRows = [0, Math.floor(rows / 2)]; // keep same vertical count (2)

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <Defs>

          {/* Vertical fade mask gradient (top visible -> transparent by fadeToPx) */}
          <LinearGradient id="fadeGrad" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#fff" stopOpacity="1" />
            <Stop offset={`${fadeTo}`} stopColor="#fff" stopOpacity="1" />
            <Stop offset={`${fadeSoftEdge}`} stopColor="#fff" stopOpacity="0" />
            <Stop offset="1" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
          <Mask id="fadeMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            <Rect x={0} y={0} width={width} height={height} fill="url(#fadeGrad)" />
          </Mask>

          
        </Defs>
        <G mask="url(#fadeMask)">
          {/* 4x4 Grid lines */}
          {/* Vertical lines */}
          {Array.from({ length: vLineCount }).map((_, i) => (
            <Line key={`v-${i}`} x1={i * colW} y1={0} x2={i * colW} y2={height} stroke={perplexityColors.border} strokeOpacity={gridOpacity} strokeWidth={1.2} />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: hLineCount }).map((_, j) => (
            <Line key={`h-${j}`} x1={0} y1={j * rowH} x2={width} y2={j * rowH} stroke={perplexityColors.border} strokeOpacity={gridOpacity} strokeWidth={1.2} />
          ))}
      
          
          {/* Dots at intersections */}
          {Array.from({ length: vLineCount }).map((_, i) => (
            Array.from({ length: hLineCount }).map((__, j) => (
              <Circle key={`d-${i}-${j}`} cx={i * colW} cy={j * rowH} r={1.6} fill={perplexityColors.quiet} fillOpacity={dotOpacity} />
            ))
          ))}

          {/* Minimal upward triangles connecting grid dots (fixed count, smaller height due to more rows) */}
          {Array.from({ length: triCols }).map((_, bi) => (
            triApexRows.map((j) => {
              const i = bi * 2; // start column (0, 2)
              const apexX = (i + 1) * colW;
              const apexY = j * rowH;
              const baseLeftX = i * colW;
              const baseRightX = (i + 2) * colW;
              const baseY = (j + 1) * rowH; // one row tall
              return (
                <G key={`t-${i}-${j}`}>
                  <Line x1={baseLeftX} y1={baseY} x2={baseRightX} y2={baseY} stroke="#ffffff" strokeOpacity={triOpacity} strokeWidth={1} />
                  <Line x1={baseLeftX} y1={baseY} x2={apexX} y2={apexY} stroke="#ffffff" strokeOpacity={triOpacity} strokeWidth={1} />
                  <Line x1={baseRightX} y1={baseY} x2={apexX} y2={apexY} stroke="#ffffff" strokeOpacity={triOpacity} strokeWidth={1} />
                </G>
              );
            })
          ))}
        </G>
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
