import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { getFontFamily, FontType } from '../config/fonts';

interface OHLCDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number; // Main data point used for line chart
  volume: number;
}

interface OHLCLineChartProps {
  data: OHLCDataPoint[];
  symbol: string;
  timeframe: string;
  width?: number;
  height?: number;
  showVolume?: boolean;
  loading?: boolean;
  error?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const OHLCLineChart: React.FC<OHLCLineChartProps> = ({
  data,
  symbol,
  timeframe,
  width = screenWidth - 32,
  height = 200,
  showVolume = false,
  loading = false,
  error = null,
}) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Use only closing prices for the line chart
    const closingPrices = sortedData.map(d => d.close);
    const minPrice = Math.min(...closingPrices);
    const maxPrice = Math.max(...closingPrices);
    const priceRange = maxPrice - minPrice || 1;

    // Calculate chart dimensions
    const padding = { top: 20, right: 60, bottom: 50, left: 20 }; // Increased bottom padding for X-axis labels
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Generate line path using only close prices
    const pathData: string[] = [];
    const points: { x: number; y: number; price: number; timestamp: string; date: string }[] = [];

    sortedData.forEach((point, index) => {
      const x = padding.left + (index / (sortedData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.close - minPrice) / priceRange) * chartHeight;
      
      // Format date for display
      const date = new Date(point.timestamp);
      const formattedDate = date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      points.push({ 
        x, 
        y, 
        price: point.close, 
        timestamp: point.timestamp,
        date: formattedDate
      });
      
      if (index === 0) {
        pathData.push(`M ${x} ${y}`);
      } else {
        pathData.push(`L ${x} ${y}`);
      }
    });

    // Generate Y-axis labels based on closing price range
    const yAxisLabels: { y: number; value: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange * i / 4);
      const y = padding.top + chartHeight - (i / 4) * chartHeight;
      yAxisLabels.push({
        y,
        value: price.toFixed(2)
      });
    }

    // Generate X-axis labels (show 4-5 dates across the month)
    const xAxisLabels: { x: number; label: string }[] = [];
    const labelCount = Math.min(5, sortedData.length);
    for (let i = 0; i < labelCount; i++) {
      const dataIndex = Math.floor((sortedData.length - 1) * i / (labelCount - 1));
      const point = points[dataIndex];
      if (point) {
        xAxisLabels.push({
          x: point.x,
          label: point.date
        });
      }
    }

    return {
      path: pathData.join(' '),
      points,
      yAxisLabels,
      xAxisLabels,
      minPrice,
      maxPrice,
      priceRange,
      padding,
      chartWidth,
      chartHeight,
    };
  }, [data, width, height]);

  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text, fontFamily: getFontFamily() }]}>
            Loading {symbol} chart data...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error, fontFamily: getFontFamily() }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!chartData || !data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textMuted, fontFamily: getFontFamily() }]}>
            No chart data available for {symbol}
          </Text>
        </View>
      </View>
    );
  }

  const strokeColor = data.length > 1 && data[data.length - 1].close > data[0].close 
    ? theme.success 
    : theme.error;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {/* Chart Header */}
      <View style={styles.header}>
        <Text style={[styles.symbolText, { color: theme.text, fontFamily: getFontFamily(FontType.BODY, '500') }]}>
          {symbol}
        </Text>
        <Text style={[styles.timeframeText, { color: theme.textMuted, fontFamily: getFontFamily(FontType.BODY) }]}>
          Past Month • {data.length} days
        </Text>
      </View>

      {/* SVG Chart */}
      <Svg width={width} height={height - 40} style={styles.chart}>
        {/* Grid lines */}
        {chartData.yAxisLabels.map((label, index) => (
          <Line
            key={`grid-${index}`}
            x1={chartData.padding.left}
            y1={label.y}
            x2={chartData.padding.left + chartData.chartWidth}
            y2={label.y}
            stroke={theme.border}
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}

        {/* Y-axis labels */}
        {chartData.yAxisLabels.map((label, index) => (
          <SvgText
            key={`label-${index}`}
            x={width - 50}
            y={label.y + 4}
            fill={theme.textMuted}
            fontSize="12"
            textAnchor="start"
            fontFamily={getFontFamily(FontType.BODY)}
          >
            ₹{label.value}
          </SvgText>
        ))}

        {/* X-axis labels */}
        {chartData.xAxisLabels.map((label, index) => (
          <SvgText
            key={`x-label-${index}`}
            x={label.x}
            y={height - 10}
            fill={theme.textMuted}
            fontSize="10"
            textAnchor="middle"
            fontFamily={getFontFamily(FontType.BODY)}
          >
            {label.label}
          </SvgText>
        ))}

        {/* Price line */}
        <Path
          d={chartData.path}
          stroke={strokeColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {chartData.points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={strokeColor}
            opacity="0.8"
          />
        ))}

        {/* First and last price labels */}
        {chartData.points.length > 0 && (
          <>
            <SvgText
              x={chartData.points[0].x}
              y={chartData.points[0].y - 10}
              fill={theme.textMuted}
              fontSize="10"
              textAnchor="middle"
              fontFamily={getFontFamily(FontType.BODY)}
            >
              ₹{chartData.points[0].price.toFixed(2)}
            </SvgText>
            <SvgText
              x={chartData.points[chartData.points.length - 1].x}
              y={chartData.points[chartData.points.length - 1].y - 10}
              fill={strokeColor}
              fontSize="10"
              textAnchor="middle"
              fontFamily={getFontFamily(FontType.BODY, '500')}
            >
              ₹{chartData.points[chartData.points.length - 1].price.toFixed(2)}
            </SvgText>
          </>
        )}
      </Svg>

      {/* Chart Footer */}
      <View style={styles.footer}>
        {data.length > 0 && (
          <View style={styles.priceInfo}>
            <Text style={[styles.currentPrice, { color: strokeColor, fontFamily: getFontFamily(FontType.BODY, '500') }]}>
              ₹{data[data.length - 1].close.toFixed(2)}
            </Text>
            <Text style={[styles.priceChange, { color: theme.textMuted, fontFamily: getFontFamily(FontType.BODY) }]}>
              {data.length > 1 && (
                <>
                  Monthly: {data[data.length - 1].close > data[0].close ? '+' : ''}
                  {((data[data.length - 1].close - data[0].close) / data[0].close * 100).toFixed(2)}%
                </>
              )}
            </Text>
          </View>
        )}
        <Text style={[styles.volumeText, { color: theme.textMuted, fontFamily: getFontFamily(FontType.BODY) }]}>
          Avg Vol: {data.length > 0 ? formatVolume(data.reduce((sum, d) => sum + d.volume, 0) / data.length) : 'N/A'}
        </Text>
      </View>
    </View>
  );
};

const formatVolume = (volume: number): string => {
  if (volume >= 10_000_000) {
    return `${(volume / 10_000_000).toFixed(1)}Cr`;
  } else if (volume >= 100_000) {
    return `${(volume / 100_000).toFixed(1)}L`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbolText: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeframeText: {
    fontSize: 14,
  },
  chart: {
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceChange: {
    fontSize: 14,
  },
  volumeText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OHLCLineChart;