import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../context/ThemeContext';
import OHLCLineChart from '../../components/OHLCLineChart';
import { fetchMonthlyOHLCData, fetchEnhancedMarketData } from '../../services/api';

interface AssetDetailScreenProps {
  route?: {
    params?: {
      asset?: any;
    };
  };
  navigation?: any;
}

export const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [ohlcData, setOhlcData] = useState<any>(null);
  const [ohlcLoading, setOhlcLoading] = useState(false);
  const [ohlcError, setOhlcError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [marketData, setMarketData] = useState<any>(null);
  const [marketDataLoading, setMarketDataLoading] = useState(false);

  // Function to fetch OHLC data and enhanced market data for a symbol
  const fetchSymbolOHLCData = async (symbol: string) => {
    if (!symbol.trim()) return;
    
    setOhlcLoading(true);
    setMarketDataLoading(true);
    setOhlcError(null);
    setSelectedSymbol(symbol.toUpperCase());
    
    try {
      // Fetch both OHLC data and enhanced market data in parallel
      const [ohlcResponse, marketResponse] = await Promise.allSettled([
        fetchMonthlyOHLCData(symbol),
        fetchEnhancedMarketData(symbol, 'stock')
      ]);

      // Handle OHLC data
      if (ohlcResponse.status === 'fulfilled' && ohlcResponse.value.success && ohlcResponse.value.data) {
        setOhlcData(ohlcResponse.value.data);
      } else {
        setOhlcError(`No chart data available for ${symbol}`);
        setOhlcData(null);
      }

      // Handle enhanced market data
      if (marketResponse.status === 'fulfilled' && marketResponse.value) {
        setMarketData(marketResponse.value);
      } else {
        setMarketData(null);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setOhlcError(error.message || 'Failed to fetch data');
      setOhlcData(null);
      setMarketData(null);
    } finally {
      setOhlcLoading(false);
      setMarketDataLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      fetchSymbolOHLCData(searchQuery.trim());
    }
  };



  const renderAssetCard = (asset: any, key: string) => {
    const isPositive = asset.change > 0;
    const changeColor = isPositive ? '#22c55e' : '#ef4444';
    const changeIcon = isPositive ? '↗' : '↓';

    return (
      <View key={key} style={styles.assetCard}>
        {/* Header Section */}
        <View style={styles.assetHeader}>
          <View style={styles.assetLeft}>
            <View style={[styles.assetLogo, { backgroundColor: asset.logoColor }]}>
              <Text style={styles.assetLogoText}>{asset.logo}</Text>
            </View>
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetSymbol}>{asset.symbol} • {asset.exchange}</Text>
            </View>
          </View>
          <View style={styles.assetRight}>
            <Text style={styles.assetPrice}>₹{asset.price.toLocaleString()}</Text>
            <Text style={[styles.assetChange, { color: changeColor }]}>
              {changeIcon} {Math.abs(asset.changePercent).toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Chart and Stats Section */}
        <View style={styles.chartStatsContainer}>
          {/* Chart Section */}
          <View style={styles.chartSection}>
            {/* Y-axis Labels */}
            <View style={styles.yAxisContainer}>
              {asset.yAxisLabels.map((label: number, index: number) => (
                <Text key={index} style={styles.yAxisLabel}>{label}</Text>
              ))}
            </View>
            
            {/* Chart Area */}
            <View style={styles.chartContainer}>
              <View style={styles.chartArea}>
                <Svg width={140} height={70}>
                  {asset.chartData.map((point: number, idx: number) => {
                    if (idx === asset.chartData.length - 1) return null;
                    const x1 = (idx / (asset.chartData.length - 1)) * 140;
                    const x2 = ((idx + 1) / (asset.chartData.length - 1)) * 140;
                    const minPrice = Math.min(...asset.yAxisLabels);
                    const maxPrice = Math.max(...asset.yAxisLabels);
                    const y1 = 70 - ((point - minPrice) / (maxPrice - minPrice)) * 70;
                    const y2 = 70 - ((asset.chartData[idx + 1] - minPrice) / (maxPrice - minPrice)) * 70;
                    
                    return (
                      <Line
                        key={idx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={changeColor}
                        strokeWidth="2"
                      />
                    );
                  })}
                </Svg>
              </View>
              <Text style={styles.chartTime}>{asset.time}</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Volume</Text>
              <Text style={styles.statValue}>{asset.volume}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Market Cap</Text>
              <Text style={styles.statValue}>{asset.marketCap}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>P/E Ratio</Text>
              <Text style={styles.statValue}>{asset.peRatio}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Dividend Yield</Text>
              <Text style={styles.statValue}>
                {typeof asset.dividendYield === 'number' 
                  ? `${asset.dividendYield.toFixed(2)}%` 
                  : asset.dividendYield}
              </Text>
            </View>
          </View>
        </View>

        {/* Insight Section */}
        <View style={styles.insightContainer}>
          <Text style={styles.insightText}>{asset.insight}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation?.goBack()}
        >
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="share" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Symbol (e.g., TCS, RELIANCE)"
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          autoCapitalize="characters"
        />
        <TouchableOpacity onPress={handleSearchSubmit} style={styles.searchButton}>
          <Icon name="arrow-forward" size={20} color="#00d4aa" />
        </TouchableOpacity>
      </View>

      {/* Standouts Section */}
      <View style={styles.standoutsContainer}>
        <Text style={styles.standoutsTitle}>Standouts</Text>
      </View>

      {/* Asset Cards */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* OHLC Chart Section */}
        {selectedSymbol && (
          <View style={styles.chartSection}>
            <OHLCLineChart
              data={ohlcData?.data || []}
              symbol={selectedSymbol}
              timeframe={ohlcData?.timeframe || '1Day'}
              loading={ohlcLoading}
              error={ohlcError}
              showVolume={true}
            />
          </View>
        )}

        {/* Enhanced Market Data Section */}
        {selectedSymbol && marketData && (
          <View style={styles.marketDataSection}>
            <Text style={styles.marketDataTitle}>Market Information</Text>
            <View style={styles.marketDataGrid}>
              <View style={styles.marketDataRow}>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Company</Text>
                  <Text style={styles.marketDataValue}>{marketData.name || selectedSymbol}</Text>
                </View>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Sector</Text>
                  <Text style={styles.marketDataValue}>{marketData.sector || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.marketDataRow}>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Current Price</Text>
                  <Text style={styles.marketDataValue}>
                    ₹{marketData.current_price ? marketData.current_price.toFixed(2) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Volume</Text>
                  <Text style={styles.marketDataValue}>{marketData.volume || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.marketDataRow}>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Market Cap</Text>
                  <Text style={styles.marketDataValue}>
                    {marketData.market_cap ? 
                      (marketData.market_cap >= 100000 ? 
                        `₹${Math.round(marketData.market_cap / 100000)}L Cr` :
                        marketData.market_cap >= 1000 ? 
                        `₹${Math.round(marketData.market_cap / 1000)}K Cr` :
                        `₹${Math.round(marketData.market_cap)} Cr`
                      ) : 'N/A'
                    }
                  </Text>
                </View>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>P/E Ratio</Text>
                  <Text style={styles.marketDataValue}>
                    {marketData.pe_ratio ? marketData.pe_ratio.toFixed(2) : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.marketDataRow}>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Growth Rate</Text>
                  <Text style={styles.marketDataValue}>
                    {marketData.growth_rate ? `${marketData.growth_rate.toFixed(1)}%` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.marketDataItem}>
                  <Text style={styles.marketDataLabel}>Exchange</Text>
                  <Text style={styles.marketDataValue}>{marketData.exchange || 'NSE'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Loading state for market data */}
        {selectedSymbol && marketDataLoading && (
          <View style={styles.loadingSection}>
            <Text style={styles.loadingText}>Loading market data...</Text>
          </View>
        )}
        
        {/* Placeholder for other asset cards */}
      </ScrollView>

      {/* Bottom Input */}
      <View style={styles.bottomInputContainer}>
        <Text style={styles.bottomInputLabel}>Ask any question about finance</Text>
        <View style={styles.bottomInputRow}>
          <TouchableOpacity style={styles.micButton}>
            <Icon name="mic" size={20} color="#00d4aa" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton}>
            <Icon name="send" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
  },
  searchButton: {
    marginLeft: 8,
    padding: 4,
  },
  standoutsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  standoutsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  marketDataSection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  marketDataTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  marketDataGrid: {
    gap: 12,
  },
  marketDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketDataItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  marketDataLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  marketDataValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingSection: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  assetCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetLogoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetSymbol: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartStatsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  yAxisContainer: {
    width: 40,
    height: 70,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
  },
  chartContainer: {
    flex: 1,
  },
  chartArea: {
    height: 70,
    position: 'relative',
  },
  chartTime: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'left',
  },
  statsSection: {
    width: 120,
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  insightContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  insightText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  bottomInputContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  bottomInputLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  bottomInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  micButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
});