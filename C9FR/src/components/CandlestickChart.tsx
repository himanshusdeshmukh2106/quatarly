import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemeContext } from '../context/ThemeContext';
import { CandlestickData, ChartTouchData, ChartTimeframe } from '../types';

interface CandlestickChartProps {
  data: CandlestickData[];
  width: number;
  height: number;
  onTouch?: (touchData: ChartTouchData) => void;
  interactive?: boolean;
  timeframe: ChartTimeframe;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  width,
  height,
  onTouch,
  interactive = true,
  timeframe,
}) => {
  const { theme } = useContext(ThemeContext);
  const [touchData, setTouchData] = useState<ChartTouchData | null>(null);
  const chartRef = useRef<View>(null);

  // Transform candlestick data to line chart format for now
  // In a real implementation, you'd use a proper candlestick chart library
  const transformDataForLineChart = () => {
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

    return {
      labels: labels.slice(-10), // Show last 10 data points
      datasets: [{
        data: prices.slice(-10),
        color: (opacity = 1) => {
          const lastPrice = prices[prices.length - 1];
          const firstPrice = prices[0];
          return lastPrice >= firstPrice 
            ? `rgba(34, 197, 94, ${opacity})` // Green for gains
            : `rgba(239, 68, 68, ${opacity})`; // Red for losses
        },
        strokeWidth: 2,
      }]
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => interactive,
      onPanResponderGrant: (evt) => {
        if (!interactive || !data || data.length === 0) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const dataIndex = Math.floor((locationX / width) * data.length);
        const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));
        const candlestick = data[clampedIndex];
        
        if (candlestick) {
          const touchInfo: ChartTouchData = {
            x: locationX,
            y: locationY,
            date: candlestick.date,
            price: candlestick.close,
            candlestick,
          };
          
          setTouchData(touchInfo);
          onTouch?.(touchInfo);
        }
      },
      onPanResponderMove: (evt) => {
        if (!interactive || !data || data.length === 0) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const dataIndex = Math.floor((locationX / width) * data.length);
        const clampedIndex = Math.max(0, Math.min(dataIndex, data.length - 1));
        const candlestick = data[clampedIndex];
        
        if (candlestick) {
          const touchInfo: ChartTouchData = {
            x: locationX,
            y: locationY,
            date: candlestick.date,
            price: candlestick.close,
            candlestick,
          };
          
          setTouchData(touchInfo);
          onTouch?.(touchInfo);
        }
      },
      onPanResponderRelease: () => {
        setTouchData(null);
      },
    })
  ).current;

  const chartData = transformDataForLineChart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height, backgroundColor: theme.background }]}>
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.textMuted }]}>
            No chart data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View 
      style={[styles.container, { width, height }]}
      ref={chartRef}
      {...panResponder.panHandlers}
    >
      <LineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: theme.card,
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          labelColor: () => theme.textMuted,
          style: {
            borderRadius: 0,
          },
          propsForDots: {
            r: '0',
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
        withDots={false}
        withShadow={false}
        withScrollableDot={false}
      />
      
      {/* Touch Indicator */}
      {touchData && (
        <View 
          style={[
            styles.touchIndicator, 
            { 
              left: touchData.x - 50, 
              top: touchData.y - 60,
              backgroundColor: theme.card,
              borderColor: theme.border,
            }
          ]}
        >
          <Text style={[styles.touchPrice, { color: theme.text }]}>
            {formatPrice(touchData.price)}
          </Text>
          <Text style={[styles.touchDate, { color: theme.textMuted }]}>
            {formatDate(touchData.date)}
          </Text>
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
  touchIndicator: {
    position: 'absolute',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  touchPrice: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  touchDate: {
    fontSize: 10,
  },
});

export default CandlestickChart;