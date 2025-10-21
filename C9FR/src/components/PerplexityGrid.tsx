/**
 * PerplexityGrid - Grid layout with triangular patterns
 * Exact grid system matching Perplexity Finance
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { perplexityColors, perplexitySpacing } from '../theme/perplexityTheme';

interface PerplexityGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: number;
}

export const PerplexityGrid: React.FC<PerplexityGridProps> = ({ 
  children, 
  columns = 1,
  gap = perplexitySpacing.md,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth >= 768;
  const actualColumns = isTablet ? columns : 1;

  return (
    <View style={[styles.grid, { gap }]}>
      {React.Children.map(children, (child, index) => (
        <View
          style={[
            styles.gridItem,
            {
              width: actualColumns === 1 
                ? '100%' 
                : `${(100 / actualColumns) - (gap * (actualColumns - 1) / actualColumns)}%`,
            },
          ]}
          key={index}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    marginBottom: perplexitySpacing.md,
  },
});
