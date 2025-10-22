/**
 * PriceChart Component - Perplexity Finance Design
 * 
 * Advanced price chart with dual-color gradient (cyan above threshold, red below)
 * Y-axis labels on the left, X-axis time labels at the bottom
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from './reusables';
import { perplexityColors } from '../theme/perplexityTheme';
import { Timeframe } from './TimeframeSelector';

interface PriceChartProps {
  data: Array<{ timestamp: number; price: number }>;
  timeframe: Timeframe;
  width?: number;
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  timeframe,
  width = 350,
  height = 270,
}) => {
  // Layout constants (memoized)
  const PADDING_LEFT = 40;
  const PADDING_RIGHT = 10;
  const PADDING_BOTTOM = 30;
  const chartWidth = useMemo(() => Math.max(1, width - PADDING_LEFT - PADDING_RIGHT), [width]);
  const chartHeight = useMemo(() => Math.max(1, height - PADDING_BOTTOM), [height]);

  // Calculate chart data and labels
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock data based on timeframe
      return generateMockData(timeframe);
    }
    return data;
  }, [data, timeframe]);

  // Calculate price range and threshold
  const { minPrice, maxPrice, threshold, yLabels, range } = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const r = Math.max(max - min, 1e-6);
    const thresh = min + r * 0.5; // Middle threshold for color change
    
    // Generate 4 Y-axis labels
    const labels = [
      max,
      min + r * 0.66,
      min + r * 0.33,
      min,
    ];
    
    return { minPrice: min, maxPrice: max, threshold: thresh, yLabels: labels, range: r };
  }, [chartData]);

  // Generate X-axis time labels based on timeframe
  const xLabels = useMemo(() => {
    return generateTimeLabels(chartData, timeframe);
  }, [chartData, timeframe]);

  // Convert data points to SVG path coordinates
  const pathData = useMemo(() => {
    const n = chartData.length;
    if (n === 0) return [] as Array<{ x: number; y: number; price: number }>;
    const denom = Math.max(1, n - 1);
    return chartData.map((point, index) => {
      const x = PADDING_LEFT + (index / denom) * chartWidth;
      const y = chartHeight - ((point.price - minPrice) / range) * chartHeight;
      return { x, y, price: point.price };
    });
  }, [chartData, minPrice, range, chartWidth, chartHeight]);

  // Split path into two segments: above and below threshold
  const { abovePath, belowPath } = useMemo(() => {
    if (pathData.length === 0) {
      return { abovePath: '', belowPath: '' };
    }

    const thresholdY = chartHeight - ((threshold - minPrice) / range) * chartHeight;
    
    const aboveSegments: string[] = [];
    const belowSegments: string[] = [];
    
    pathData.forEach((point, i) => {
      const isPointAbove = point.price >= threshold;
      const x = point.x.toFixed(2);
      const y = point.y.toFixed(2);
      
      if (i === 0) {
        if (isPointAbove) {
          aboveSegments.push(`M ${x} ${y}`);
        } else {
          belowSegments.push(`M ${x} ${y}`);
        }
      } else {
        const prevPoint = pathData[i - 1];
        const wasPrevAbove = prevPoint.price >= threshold;
        
        if (isPointAbove === wasPrevAbove) {
          // Continue on same path
          if (isPointAbove) {
            aboveSegments.push(`L ${x} ${y}`);
          } else {
            belowSegments.push(`L ${x} ${y}`);
          }
        } else {
          // Crossing threshold - calculate intersection point
          const t = (threshold - prevPoint.price) / (point.price - prevPoint.price);
          const intersectX = (prevPoint.x + t * (point.x - prevPoint.x)).toFixed(2);
          const intersectY = thresholdY.toFixed(2);
          
          if (wasPrevAbove) {
            // Was above, now below
            aboveSegments.push(`L ${intersectX} ${intersectY}`);
            belowSegments.push(`M ${intersectX} ${intersectY}`);
            belowSegments.push(`L ${x} ${y}`);
          } else {
            // Was below, now above
            belowSegments.push(`L ${intersectX} ${intersectY}`);
            aboveSegments.push(`M ${intersectX} ${intersectY}`);
            aboveSegments.push(`L ${x} ${y}`);
          }
        }
      }
    });
    
    return { 
      abovePath: aboveSegments.join(' '), 
      belowPath: belowSegments.join(' ') 
    };
  }, [pathData, threshold, minPrice, maxPrice, height]);

  // Format price for Y-axis labels
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k`;
    }
    return price.toFixed(0);
  };

  return (
    <View style={[styles.container, { height }] }>
      {/* Y-axis labels */}
      <View style={styles.yAxisLabels}>
        {yLabels.map((label, index) => (
          <Text
            key={index}
            variant="bodySmall"
            color="quieter"
            style={styles.yLabel}
          >
            {formatPrice(label)}
          </Text>
        ))}
      </View>

      {/* Chart SVG */}
      <View style={styles.chartArea}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="aboveGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={perplexityColors.chartPositive} stopOpacity={0.8} />
              <Stop offset="1" stopColor={perplexityColors.chartPositive} stopOpacity={0.6} />
            </LinearGradient>
            <LinearGradient id="belowGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={perplexityColors.chartNegative} stopOpacity={0.8} />
              <Stop offset="1" stopColor={perplexityColors.chartNegative} stopOpacity={0.6} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={PADDING_LEFT + i * (chartWidth / 7)}
              y1={0}
              x2={PADDING_LEFT + i * (chartWidth / 7)}
              y2={chartHeight}
              stroke={perplexityColors.border}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 4 }).map((_, j) => (
            <Line
              key={`h-${j}`}
              x1={PADDING_LEFT}
              y1={j * (chartHeight / 3)}
              x2={width - PADDING_RIGHT}
              y2={j * (chartHeight / 3)}
              stroke={perplexityColors.border}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          ))}

          {/* Threshold line (dashed) */}
          <Line
            x1={PADDING_LEFT}
            y1={chartHeight - ((threshold - minPrice) / range) * chartHeight}
            x2={width - PADDING_RIGHT}
            y2={chartHeight - ((threshold - minPrice) / range) * chartHeight}
            stroke={perplexityColors.quiet}
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Price line - above threshold (cyan) */}
          {abovePath && abovePath !== 'M' && (
            <Path
              d={abovePath}
              stroke="url(#aboveGradient)"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Price line - below threshold (red) */}
          {belowPath && belowPath !== 'M' && (
            <Path
              d={belowPath}
              stroke="url(#belowGradient)"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>

        {/* X-axis time labels */}
        <View style={styles.xAxisLabels}>
          {xLabels.map((label, index) => (
            <Text
              key={index}
              variant="bodySmall"
              color="quieter"
              style={styles.xLabel}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default React.memo(PriceChart);

// Generate mock data for demonstration
function generateMockData(timeframe: Timeframe): Array<{ timestamp: number; price: number }> {
  const now = Date.now();
  let points = 50;
  let interval = 3600000; // 1 hour
  
  switch (timeframe) {
    case '1D':
      points = 24;
      interval = 3600000; // 1 hour
      break;
    case '5D':
      points = 40;
      interval = 3600000 * 3; // 3 hours
      break;
    case '1M':
      points = 30;
      interval = 86400000; // 1 day
      break;
    case '6M':
      points = 50;
      interval = 86400000 * 3.6; // ~3.6 days
      break;
    case 'YTD':
    case '1Y':
      points = 52;
      interval = 86400000 * 7; // 1 week
      break;
    case '5Y':
      points = 60;
      interval = 86400000 * 30; // 1 month
      break;
    case 'MAX':
      points = 100;
      interval = 86400000 * 30; // 1 month
      break;
  }
  
  const basePrice = 2400;
  const data: Array<{ timestamp: number; price: number }> = [];
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * interval;
    // Create realistic price movement with threshold crossing
    const progress = i / points;
    const wave = Math.sin(progress * Math.PI * 3) * 200;
    const trend = progress < 0.3 ? -100 : progress < 0.6 ? -200 : 100;
    const noise = (Math.random() - 0.5) * 50;
    const price = basePrice + wave + trend + noise;
    
    data.push({ timestamp, price });
  }
  
  return data;
}

// Generate time labels based on timeframe
function generateTimeLabels(data: Array<{ timestamp: number; price: number }>, timeframe: Timeframe): string[] {
  if (data.length === 0) return [];
  
  const labelCount = 4;
  const indices = Array.from({ length: labelCount }, (_, i) => 
    Math.floor((i / (labelCount - 1)) * (data.length - 1))
  );
  
  return indices.map(index => {
    const date = new Date(data[index].timestamp);
    
    switch (timeframe) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      case '5D':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '1M':
      case '6M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'YTD':
      case '1Y':
        return date.toLocaleDateString('en-US', { month: 'short' });
      case '5Y':
      case 'MAX':
        return date.toLocaleDateString('en-US', { year: '2-digit' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short' });
    }
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingRight: 5,
  },
  yLabel: {
    fontSize: 11,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingTop: 5,
    height: 30,
  },
  xLabel: {
    fontSize: 11,
  },
});
