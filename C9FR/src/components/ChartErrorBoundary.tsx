import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallbackColor?: string;
  width?: number;
  height?: number;
}

/**
 * Error boundary specifically for chart rendering failures
 * Provides a fallback chart that maintains visual consistency
 */
class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('ChartErrorBoundary caught a chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallbackColor = '#6B7280', width = 140, height = 80 } = this.props;
      
      return (
        <View style={[styles.fallbackContainer, { width, height }]}>
          <Svg width={width} height={height}>
            {/* Render a simple flat line as fallback */}
            <Line
              x1={0}
              y1={height / 2}
              x2={width}
              y2={height / 2}
              stroke={fallbackColor}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </Svg>
          <Text style={styles.fallbackText}>Chart unavailable</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallbackContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    position: 'absolute',
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ChartErrorBoundary;