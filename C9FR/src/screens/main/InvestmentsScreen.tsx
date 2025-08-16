import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Investment, ChartTouchData, MarketStatus, CreateInvestmentRequest } from '../../types';
// Temporarily disabled API imports to use placeholder data
// import { fetchInvestments, refreshInvestmentPrices, createInvestment, deleteInvestment } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { InvestmentCard } from '../../components/InvestmentCard';
import { InvestmentInsightsDrawer } from '../../components/InvestmentInsightsDrawer';
import { AddInvestmentModal } from '../../components/AddInvestmentModal';
import { showToast } from '../../utils/toast';

const InvestmentsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_marketStatus, _setMarketStatus] = useState<MarketStatus>('closed');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creatingInvestment, setCreatingInvestment] = useState(false);
  const [portfolioCollapsed, setPortfolioCollapsed] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const rotateAnim = new Animated.Value(0);

  const loadInvestments = async () => {
    try {
      setError(null);
      // Using placeholder data instead of API call
      const placeholderInvestments: Investment[] = [
        {
          id: '1',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          quantity: 50,
          averagePurchasePrice: 16800.0,
          currentPrice: 18450.25,
          totalValue: 922500.0,
          dailyChange: 125.5,
          dailyChangePercent: 0.68,
          totalGainLoss: 82500.25,
          totalGainLossPercent: 10.12,
          chartData: [],
          lastUpdated: new Date().toISOString(),
          aiAnalysis: 'Strong performance with positive momentum',
          riskLevel: 'low',
          recommendation: 'hold',
          sector: 'Technology',
          marketCap: 2850000000000,
          growthRate: 12.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          assetType: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          quantity: 25,
          averagePurchasePrice: 12000.0,
          currentPrice: 12750.8,
          totalValue: 318770.0,
          dailyChange: -85.2,
          dailyChangePercent: -0.66,
          totalGainLoss: 18770.0,
          totalGainLossPercent: 6.25,
          chartData: [],
          lastUpdated: new Date().toISOString(),
          aiAnalysis: 'Moderate performance with growth potential',
          riskLevel: 'medium',
          recommendation: 'hold',
          sector: 'Technology',
          marketCap: 1600000000000,
          growthRate: 15.2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          assetType: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          quantity: 15,
          averagePurchasePrice: 18500.0,
          currentPrice: 20125.4,
          totalValue: 301881.0,
          dailyChange: 450.6,
          dailyChangePercent: 2.29,
          totalGainLoss: 24381.0,
          totalGainLossPercent: 8.78,
          chartData: [],
          lastUpdated: new Date().toISOString(),
          aiAnalysis: 'High volatility with strong growth potential',
          riskLevel: 'high',
          recommendation: 'monitor',
          sector: 'Automotive',
          marketCap: 640000000000,
          growthRate: 8.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setInvestments(placeholderInvestments);
    } catch (error) {
      console.error('Failed to load investments:', error);
      setError('Failed to load investments. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      // Simulate refresh with placeholder data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      await loadInvestments();
      showToast.success('Investment prices updated successfully!');
    } catch (error) {
      console.error('Failed to refresh investments:', error);
      setError('Failed to refresh investments. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleInsightsPress = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowInsightsDrawer(true);
  };

  const handleInsightsClose = () => {
    setShowInsightsDrawer(false);
    setSelectedInvestment(null);
  };

  const handleChartInteraction = (touchData: ChartTouchData) => {
    // Handle chart touch interactions
    console.log('Chart interaction:', touchData);
  };

  const handleCreateInvestment = async (investmentData: CreateInvestmentRequest) => {
    setCreatingInvestment(true);
    try {
      // Create placeholder investment from form data
      const purchasePrice = investmentData.purchase_price || 1000;
      const quantity = investmentData.quantity || 1;
      const newInvestment: Investment = {
        id: Date.now().toString(),
        symbol: investmentData.symbol || 'NEW',
        name: investmentData.symbol || 'New Investment',
        assetType: 'stock',
        exchange: 'NSE',
        currency: 'INR',
        quantity: quantity,
        averagePurchasePrice: purchasePrice,
        currentPrice: purchasePrice * (1 + (Math.random() * 0.1 - 0.05)), // ±5% variation
        totalValue: quantity * purchasePrice,
        dailyChange: Math.random() * 100 - 50,
        dailyChangePercent: Math.random() * 4 - 2,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        chartData: [],
        lastUpdated: new Date().toISOString(),
        aiAnalysis: 'New investment added to portfolio',
        riskLevel: 'medium',
        recommendation: 'monitor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInvestments(prevInvestments => [newInvestment, ...prevInvestments]);
      showToast.success('Investment added successfully!');
    } catch (error) {
      console.error('Failed to create investment:', error);
      throw error;
    } finally {
      setCreatingInvestment(false);
    }
  };

  // const handleDeleteInvestment = async (investmentId: string) => {
    try {
      // Using placeholder deletion instead of API call
      setInvestments(prevInvestments => 
        prevInvestments.filter(inv => inv.id !== investmentId)
      );
      showToast.success('Investment removed successfully!');
    } catch (error) {
      console.error('Failed to delete investment:', error);
      showToast.error('Failed to remove investment. Please try again.');
    }
  };

  // const showDeleteConfirmation = (investment: Investment) => {
  //   // Using React Native's Alert for confirmation
  //   // In a real app, you might want to use a custom modal
  //   console.log('Delete confirmation for:', investment.symbol);
  //   showToast.info('Long press functionality - delete confirmation would appear here');
  // };

  // const getMarketStatusColor = (status: MarketStatus) => {
  //   const statusColors = {
  //     'open': theme.success,
  //     'closed': theme.error,
  //     'pre-market': theme.warning,
  //     'after-hours': theme.info,
  //   };
  //   return statusColors[status] || theme.textMuted;
  // };

  // const getMarketStatusText = (status: MarketStatus) => {
  //   const statusTexts = {
  //     'open': 'Market Open',
  //     'closed': 'Market Closed',
  //     'pre-market': 'Pre-Market',
  //     'after-hours': 'After Hours',
  //   };
  //   return statusTexts[status] || 'Unknown';
  // };

  // const calculatePortfolioSummary = () => {
  //   if (investments.length === 0) {
  //     return {
  //       totalValue: 0,
  //       totalGainLoss: 0,
  //       totalGainLossPercent: 0,
  //       dailyChange: 0,
  //       dailyChangePercent: 0,
  //     };
  //   }

  //   const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  //   const totalGainLoss = investments.reduce((sum, inv) => sum + inv.totalGainLoss, 0);
  //   const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
  //   const dailyChange = investments.reduce((sum, inv) => sum + (inv.dailyChange || 0) * inv.quantity, 0);
  //   const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

  //   return {
  //     totalValue,
  //     totalGainLoss,
  //     totalGainLossPercent,
  //     dailyChange,
  //     dailyChangePercent,
  //   };
  // };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return { backgroundColor: theme.success + '20', color: theme.success, borderColor: theme.success + '40' };
      case 'medium':
        return { backgroundColor: theme.warning + '20', color: theme.warning, borderColor: theme.warning + '40' };
      case 'high':
        return { backgroundColor: theme.error + '20', color: theme.error, borderColor: theme.error + '40' };
      default:
        return { backgroundColor: theme.textMuted + '20', color: theme.textMuted, borderColor: theme.textMuted + '40' };
    }
  };

  const togglePortfolioCollapse = () => {
    setPortfolioCollapsed(!portfolioCollapsed);
    Animated.timing(rotateAnim, {
      toValue: portfolioCollapsed ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //     minimumFractionDigits: 2,
  //   }).format(amount);
  // };

  // const formatPercentage = (percentage: number) => {
  //   const sign = percentage >= 0 ? '+' : '';
  //   return `${sign}${percentage.toFixed(2)}%`;
  // };

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.success;
    if (change < 0) return theme.error;
    return theme.textMuted;
  };

  useEffect(() => {
    loadInvestments();
    
    // Set market status based on current time (simplified)
    const updateMarketStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 9 && hour < 16) {
        setMarketStatus('open');
      } else if (hour >= 16 && hour < 20) {
        setMarketStatus('after-hours');
      } else if (hour >= 6 && hour < 9) {
        setMarketStatus('pre-market');
      } else {
        setMarketStatus('closed');
      }
    };

    updateMarketStatus();

    // Disabled price refresh intervals to prevent 404 errors
    // TODO: Re-enable when backend APIs are available
    
    // Update market status every minute
    const statusInterval = setInterval(updateMarketStatus, 60000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading investments..." />;
  }

  // const portfolioSummary = calculatePortfolioSummary();

  return (
    <ErrorBoundary>
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onTouchStart={() => {
          if (showAddDropdown) {
            setShowAddDropdown(false);
          }
        }}
      >
        {/* Header with Market Status - Exact match */}
        <View style={styles.exactHeader}>
          <View style={styles.exactHeaderLeft}>
            <MaterialCommunityIcons name="chart-line" size={20} color={theme.text} />
            <Text style={[styles.exactHeaderTitle, { color: theme.text }]}>
              Your Investments
            </Text>
          </View>
          <View style={styles.exactMarketStatus}>
            <View style={[styles.exactMarketDot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.exactMarketText, { color: theme.textMuted }]}>
              Market Closed
            </Text>
          </View>
        </View>

        {/* Portfolio Summary Card - Exact match */}
        <View style={[styles.exactPortfolioCard, { backgroundColor: theme.card, borderColor: '#e5e7eb' }]}>
          <TouchableOpacity 
            style={styles.exactPortfolioHeader}
            onPress={togglePortfolioCollapse}
            activeOpacity={0.7}
          >
            <Text style={[styles.exactPortfolioTitle, { color: theme.text }]}>Portfolio Summary</Text>
            <Animated.View
              style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg']
                  })
                }]
              }}
            >
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
            </Animated.View>
          </TouchableOpacity>
          
          {!portfolioCollapsed && (
            <View style={styles.exactPortfolioContent}>
              <View style={styles.exactPortfolioRow}>
                <View style={styles.exactPortfolioItem}>
                  <Text style={[styles.exactLabel, { color: '#6b7280' }]}>Total Value</Text>
                  <Text style={[styles.exactValue, { color: theme.text }]}>
                    ₹15,43,151.00
                  </Text>
                </View>
                <View style={styles.exactPortfolioItem}>
                  <Text style={[styles.exactLabel, { color: '#6b7280' }]}>Total P&L</Text>
                  <Text style={[styles.exactValueGreen, { color: '#22c55e' }]}>
                    +₹1,25,651.25 (+8.86%)
                  </Text>
                </View>
              </View>
              <View style={styles.exactPortfolioRow}>
                <View style={styles.exactPortfolioItem}>
                  <Text style={[styles.exactLabel, { color: '#6b7280' }]}>Daily Change</Text>
                  <Text style={[styles.exactValueGreen, { color: '#22c55e' }]}>
                    +₹10,848.915 (+0.70%)
                  </Text>
                </View>
                <View style={styles.exactPortfolioItem}>
                  <Text style={[styles.exactLabel, { color: '#6b7280' }]}>Assets Count</Text>
                  <Text style={[styles.exactValue, { color: theme.text }]}>
                    3 investments
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Add Investment Button with Dropdown - Always show */}
        <View style={styles.addInvestmentContainer}>
          <TouchableOpacity 
            style={[styles.addInvestmentButton, { backgroundColor: '#000000' }]}
            onPress={() => setShowAddDropdown(!showAddDropdown)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addInvestmentButtonText}>Add Investment</Text>
            <MaterialCommunityIcons 
              name={showAddDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {showAddDropdown && (
            <View style={[styles.dropdownContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity 
                style={styles.dropdownOption}
                onPress={() => {
                  setShowAddDropdown(false);
                  setShowAddModal(true);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="pencil-plus" size={20} color={theme.text} />
                <Text style={[styles.dropdownOptionText, { color: theme.text }]}>Add Manually</Text>
              </TouchableOpacity>
              
              <View style={[styles.dropdownSeparator, { backgroundColor: theme.border }]} />
              
              <TouchableOpacity 
                style={styles.dropdownOption}
                onPress={() => {
                  setShowAddDropdown(false);
                  showToast.info('PDF/Document import feature coming soon!');
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="file-document-plus" size={20} color={theme.text} />
                <Text style={[styles.dropdownOptionText, { color: theme.text }]}>Add by PDF/Doc</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Error State */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!error && investments.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-line-variant" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Investments Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Start building your portfolio by adding your first investment.
            </Text>
            <View style={styles.emptyStateButtonsContainer}>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowAddModal(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add Asset"
                accessibilityHint="Add a new asset to your portfolio"
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Asset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.addDocumentButtonEmpty, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {
                  // TODO: Implement PDF/Document import functionality
                  showToast.info('PDF/Document import feature coming soon!');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add PDF or Document"
                accessibilityHint="Import investment data from PDF or document"
              >
                <MaterialCommunityIcons name="file-document-plus" size={20} color={theme.text} />
                <Text style={[styles.addDocumentButtonEmptyText, { color: theme.text }]}>Add PDF/Doc</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Investments List */}
        {investments.length > 0 && (
          <View style={styles.investmentsList}>
            {investments.map(investment => (
              <View key={investment.id} style={styles.investmentGroup}>
                {/* Enhanced Investment Card */}
                <View style={[styles.enhancedInvestmentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  {/* Header with Risk Badge */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.riskBadge, getRiskBadgeColor(investment.riskLevel)]}>
                      <Text style={[styles.riskBadgeText, { color: getRiskBadgeColor(investment.riskLevel).color }]}>
                        {investment.riskLevel.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.assetIcon, { backgroundColor: theme.textMuted + '20', borderColor: theme.border }]}>
                      <MaterialCommunityIcons name="chart-line" size={16} color={theme.text} />
                    </View>
                  </View>

                  {/* Chart Area */}
                  <View style={styles.chartContainer}>
                    <InvestmentCard
                      investment={investment}
                      onInsightsPress={handleInsightsPress}
                      onChartInteraction={handleChartInteraction}
                    />
                  </View>

                  {/* Investment Info */}
                  <View style={styles.investmentInfo}>
                    <View style={styles.priceHeader}>
                      <View style={styles.symbolPriceRow}>
                        <Text style={[styles.symbol, { color: theme.text }]}>{investment.symbol}</Text>
                        <Text style={[styles.currentPrice, { color: theme.text }]}>
                          ₹{investment.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                      <View style={styles.exchangeChangeRow}>
                        <Text style={[styles.exchange, { color: theme.textMuted }]}>{investment.exchange || 'NSE'}</Text>
                        <View style={styles.changeContainer}>
                          <Text style={[styles.dailyChange, { color: getChangeColor(investment.dailyChange || 0) }]}>
                            {(investment.dailyChange || 0) >= 0 ? '+' : ''}₹{(investment.dailyChange || 0).toFixed(2)} ({(investment.dailyChangePercent || 0) >= 0 ? '+' : ''}{(investment.dailyChangePercent || 0).toFixed(2)}%)
                          </Text>
                          <MaterialCommunityIcons 
                            name={(investment.dailyChange || 0) >= 0 ? "trending-up" : "trending-down"} 
                            size={12} 
                            color={getChangeColor(investment.dailyChange || 0)} 
                          />
                        </View>
                      </View>
                      <Text style={[styles.companyName, { color: theme.textMuted }]} numberOfLines={1}>
                        {investment.name || investment.symbol}
                      </Text>
                    </View>

                    {/* Holdings Info */}
                    <View style={styles.holdingsGrid}>
                      <View style={styles.holdingItem}>
                        <Text style={[styles.holdingLabel, { color: theme.textMuted }]}>Quantity: </Text>
                        <Text style={[styles.holdingValue, { color: theme.text }]}>{investment.quantity} shares</Text>
                      </View>
                      <View style={styles.holdingItem}>
                        <Text style={[styles.holdingLabel, { color: theme.textMuted }]}>Total Value: </Text>
                        <Text style={[styles.holdingValue, { color: theme.text }]}>
                          ₹{investment.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.plContainer}>
                      <Text style={[styles.holdingLabel, { color: theme.textMuted }]}>Total P&L: </Text>
                      <Text style={[styles.plValue, { color: getChangeColor(investment.totalGainLoss) }]}>
                        {investment.totalGainLoss >= 0 ? '+' : ''}₹{investment.totalGainLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({investment.totalGainLossPercent >= 0 ? '+' : ''}{investment.totalGainLossPercent.toFixed(2)}%)
                      </Text>
                    </View>

                    {/* Last Updated */}
                    <View style={styles.lastUpdated}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.lastUpdatedText, { color: theme.textMuted }]}>
                        Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* AI Insights Card */}
                <TouchableOpacity
                  style={[styles.aiInsightsCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
                  onPress={() => handleInsightsPress(investment)}
                  activeOpacity={0.7}
                >
                  <View style={styles.aiInsightsContent}>
                    <View style={styles.aiInsightsHeader}>
                      <MaterialCommunityIcons name="sparkles" size={20} color={theme.primary} />
                      <View style={styles.aiInsightsText}>
                        <Text style={[styles.aiInsightsTitle, { color: theme.primary }]}>AI Investment Insights</Text>
                        <Text style={[styles.aiInsightsSubtitle, { color: theme.textMuted }]} numberOfLines={2}>
                          Based on recent earnings and market trends, this investment shows positive momentum...
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.primary} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add Investment Buttons */}
        {investments.length > 0 && (
          <View style={styles.addButtonsContainer}>
            <TouchableOpacity 
              style={[styles.addAssetButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add Asset"
              accessibilityHint="Add a new asset to your portfolio"
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addAssetButtonText}>Add Asset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addDocumentButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => {
                // TODO: Implement PDF/Document import functionality
                showToast.info('PDF/Document import feature coming soon!');
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add PDF or Document"
              accessibilityHint="Import investment data from PDF or document"
            >
              <MaterialCommunityIcons name="file-document-plus" size={20} color={theme.text} />
              <Text style={[styles.addDocumentButtonText, { color: theme.text }]}>Add PDF/Doc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pull to refresh hint */}
        {investments.length > 0 && (
          <View style={styles.refreshHint}>
            <MaterialCommunityIcons name="refresh" size={16} color={theme.textMuted} />
            <Text style={[styles.refreshHintText, { color: theme.textMuted }]}>
              Pull down to refresh prices
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Investment Modal */}
      <AddInvestmentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateInvestment}
        loading={creatingInvestment}
      />

      {/* Investment Insights Drawer */}
      <InvestmentInsightsDrawer
        visible={showInsightsDrawer}
        investment={selectedInvestment}
        onClose={handleInsightsClose}
      />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  exactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exactHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  exactMarketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exactMarketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  exactMarketText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exactPortfolioCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  exactPortfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exactPortfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exactPortfolioContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exactPortfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  exactPortfolioItem: {
    flex: 1,
  },
  exactLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '400',
  },
  exactValue: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  exactValueGreen: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  addInvestmentContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  addInvestmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  addInvestmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
    textAlign: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  dropdownSeparator: {
    height: 1,
    marginHorizontal: 20,
  },
  investmentsList: {
    gap: 16,
  },
  investmentGroup: {
    gap: 8,
  },
  enhancedInvestmentCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    marginBottom: 16,
    height: 120,
  },
  investmentInfo: {
    gap: 12,
  },
  priceHeader: {
    gap: 4,
  },
  symbolPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  exchangeChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exchange: {
    fontSize: 14,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '500',
  },
  holdingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holdingItem: {
    flexDirection: 'row',
  },
  holdingLabel: {
    fontSize: 14,
  },
  holdingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  plContainer: {
    flexDirection: 'row',
  },
  plValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
  },
  aiInsightsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  aiInsightsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  aiInsightsText: {
    flex: 1,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  aiInsightsSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addAssetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minHeight: 56,
  },
  addAssetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addDocumentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  addDocumentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyStateButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingHorizontal: 16,
  },
  addDocumentButtonEmpty: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
  },
  addDocumentButtonEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  refreshHintText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default InvestmentsScreen;