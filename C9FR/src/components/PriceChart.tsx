import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemeContext } from '../context/ThemeContext';
import { CandlestickData, ChartTimeframe } from '../types';

interface PriceChartProps {
  data: CandlestickData[];
  width: number;
  height: number;
  timeframe: ChartTimeframe;
  showYield?: boolean;
  yieldData?: number[];
}

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  width,
  height,
  timeframe,
  showYield = false,
  yieldData,
}) => {
  const { theme } = useContext(ThemeContext);

  const transformDataForChart = () => {
    if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: () => theme.textMuted,
        }]
      };
    }

    const labels = data.map((item) => {
      const date = new Date(item.date);
      if (timeframe === 'daily') {
        return date.getDate().toString();
      } else if (timeframe === 'weekly') {
        return `W${Math.ceil(date.getDate() / 7)}`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
    });

    const prices = data.map(item => item.close);
    const datasets = [{
      data: prices.slice(-10), // Show last 10 data points
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for bond prices
      strokeWidth: 2,
    }];

    // Add yield data if provided
    if (showYield && yieldData && yieldData.length > 0) {
      datasets.push({
        data: yieldData.slice(-10),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for yield
        strokeWidth: 2,
      });
    }

    return {
      labels: labels.slice(-10),
      datasets,
    };
  };

  const chartData = transformDataForChart();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height, backgroundColor: theme.background }]}>
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.textMuted }]}>
            No price data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <LineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: () => theme.textMuted,
          style: {
            borderRadius: 0,
          },
          propsForDots: {
            r: '2',
            strokeWidth: '1',
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: theme.border,
            strokeWidth: 0.5,
          },
        }}
        bezier
        style={styles.chart}
        withHorizontalLabels={false}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        withScrollableDot={false}
      />
      
      {/* Legend for dual-axis chart */}
      {showYield && yieldData && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>Price</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>Yield</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 0,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default PriceChart;