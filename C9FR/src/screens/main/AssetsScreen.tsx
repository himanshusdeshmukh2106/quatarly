import React, { useState, useContext, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset, TradableAsset, PhysicalAsset } from '../../types';
import { useAssets } from '../../hooks/useAssets';
import { AssetCard } from '../../components/AssetCard';
import { TradableAssetCard } from '../../components/TradableAssetCard';
import { PhysicalAssetCard } from '../../components/PhysicalAssetCard';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load modals and drawers to reduce initial bundle size
// These components use default exports, so we import them directly
const AddAssetModal = React.lazy(() => import('../../components/AddAssetModal'));
const AssetInsightsDrawer = React.lazy(() => import('../../components/AssetInsightsDrawer'));
const EditAssetModal = React.lazy(() => import('../../components/EditAssetModal'));
const AssetActionSheet = React.lazy(() => import('../../components/AssetActionSheet'));

export const AssetsScreen: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetForInsights, setSelectedAssetForInsights] = useState<Asset | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedAssetForAction, setSelectedAssetForAction] = useState<Asset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [savingAsset, setSavingAsset] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  
  // Removed animations to prevent re-rendering issues when dropdown state changes
  
  const {
    assets,
    createNewAsset,
    bulkImportAssets,
    updatePhysicalAssetValue,
    updateExistingAsset,
    deleteExistingAsset,
  } = useAssets();

  const handleAssetLongPress = (asset: Asset) => {
    setSelectedAssetForAction(asset);
    setShowActionSheet(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleSaveAsset = async (updatedAsset: Asset) => {
    setSavingAsset(true);
    try {
      await updateExistingAsset(updatedAsset.id, updatedAsset);
      setShowEditModal(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Failed to update asset:', error);
      Alert.alert('Error', 'Failed to update asset. Please try again.');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = (asset: Asset) => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete ${asset.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExistingAsset(asset.id);
            } catch (error) {
              console.error('Failed to delete asset:', error);
            }
          },
        },
      ]
    );
  };





  const renderAssetCard = (asset: Asset) => {
    const isPhysical = ['gold', 'silver', 'commodity'].includes(asset.assetType);
    const isTradeable = ['stock', 'etf', 'bond', 'crypto'].includes(asset.assetType);

    if (isPhysical) {
      return (
        <PhysicalAssetCard
          key={asset.id}
          asset={asset as PhysicalAsset}
          onUpdateValue={updatePhysicalAssetValue}
          onInsightsPress={() => setSelectedAssetForInsights(asset)}
          onLongPress={() => handleAssetLongPress(asset)}
        />
      );
    }

    if (isTradeable) {
      return (
        <TradableAssetCard
          key={asset.id}
          asset={asset as TradableAsset}
          onInsightsPress={() => setSelectedAssetForInsights(asset)}
          onLongPress={() => handleAssetLongPress(asset)}
        />
      );
    }

    // Fallback to generic AssetCard
    return (
      <AssetCard
        key={asset.id}
        asset={asset}
        onPress={() => setSelectedAssetForInsights(asset)}
        onLongPress={() => handleAssetLongPress(asset)}
      />
    );
  };

  // Mock investment data for demonstration
  const mockInvestments = [
    {
      id: '1',
      name: 'Gartner, Inc.',
      symbol: 'IT',
      price: 241.68,
      change: -28.22,
      changePercent: -10.45,
      volume: '2.63M',
      marketCap: '18.6B',
      peRatio: 14.71,
      growthRate: undefined,
      chartData: [350, 340, 330, 320, 310, 300, 290, 280, 270, 260, 250, 240],
      insight: 'IT shares plunged today after President Trump signed a sweeping executive order imposing new global tariffs and escalating trade tensions, triggering a broad selloff in related sectors and increasing investor concerns about rising costs and economic slowdown.',
      time: '6:00 PM'
    },
    {
      id: '2',
      name: 'Vertex Pharmaceuticals',
      symbol: 'VRTX',
      price: 392.66,
      change: -16.86,
      changePercent: -4.12,
      volume: '5.96M',
      marketCap: '100.83B',
      peRatio: -100.17,
      growthRate: undefined,
      chartData: [420, 415, 410, 405, 400, 395, 390, 385, 380, 375, 385, 392],
      insight: 'Vertex Pharmaceuticals shares plunged today after the company announced its experimental pain drug VX-993 failed a key Phase 2 trial, prompting the discontinuation of its development as a solo treatment and overshadowing its strong quarterly earnings.',
      time: '6:00 PM'
    },
    {
      id: '3',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      price: 185.92,
      change: 4.25,
      changePercent: 2.34,
      volume: '45.2M',
      marketCap: '2.85T',
      peRatio: 28.45,
      growthRate: 12.5,
      chartData: [175, 178, 180, 182, 184, 186, 188, 185, 183, 184, 186, 185],
      insight: 'Apple shares gained momentum today following strong iPhone 15 sales data from China and positive analyst upgrades citing improved supply chain efficiency and robust services revenue growth in the holiday quarter.',
      time: '6:00 PM'
    },
    {
      id: '4',
      name: 'Microsoft Corporation',
      symbol: 'MSFT',
      price: 412.34,
      change: 8.76,
      changePercent: 2.17,
      volume: '28.9M',
      marketCap: '3.06T',
      peRatio: 34.12,
      growthRate: 15.2,
      chartData: [395, 398, 402, 405, 408, 410, 412, 415, 413, 411, 412, 412],
      insight: 'Microsoft stock rose today after the company announced significant AI integration improvements in Office 365 and Azure cloud services, with enterprise customers showing strong adoption rates and increased subscription renewals.',
      time: '6:00 PM'
    },
    {
      id: '5',
      name: 'Tesla, Inc.',
      symbol: 'TSLA',
      price: 248.73,
      change: -12.45,
      changePercent: -4.77,
      volume: '89.4M',
      marketCap: '791.2B',
      peRatio: 62.18,
      growthRate: undefined,
      chartData: [270, 265, 260, 255, 250, 248, 245, 247, 249, 251, 250, 248],
      insight: 'Tesla shares declined today amid concerns over increased competition in the EV market and reports of production delays at the Berlin Gigafactory, overshadowing positive news about Supercharger network expansion.',
      time: '6:00 PM'
    },
    {
      id: '6',
      name: 'NVIDIA Corporation',
      symbol: 'NVDA',
      price: 875.28,
      change: 23.45,
      changePercent: 2.75,
      volume: '52.1M',
      marketCap: '2.16T',
      peRatio: 65.43,
      growthRate: 8.7,
      chartData: [840, 845, 850, 855, 860, 865, 870, 875, 878, 876, 875, 875],
      insight: 'NVIDIA surged today following reports of breakthrough AI chip developments and major cloud computing partnerships, with analysts raising price targets citing strong demand for next-generation GPU architecture.',
      time: '6:00 PM'
    }
  ];

  const InvestmentCard = ({ investment }: { investment: any; index: number }) => {
    const isNegative = investment.change < 0;
    const chartColor = isNegative ? '#ef4444' : '#22d3ee'; // Cyan for positive (Perplexity style)
    const percentageColor = isNegative ? '#ef4444' : '#10b981'; // Green for positive percentage

    // Remove animations completely to prevent re-rendering issues
    // Cards will appear instantly without animation

    return (
      <View
        key={investment.id}
        style={styles.exactReplicaCard}
      >
        {/* Perplexity-Style Header Layout */}
        <View style={styles.perplexityHeader}>
          <View style={styles.perplexityLeft}>
            <View style={styles.perplexityIconFallback}>
              <Text style={styles.perplexityIconText}>{investment.symbol.substring(0, 2)}</Text>
            </View>
            <View style={styles.perplexityCompanyInfo}>
              <Text style={styles.perplexityCompanyName}>
                {investment.name}
              </Text>
              <Text style={styles.perplexitySymbol}>{investment.symbol}</Text>
            </View>
          </View>
          <View style={styles.perplexityRight}>
            <View style={styles.perplexityPriceRow}>
              <Text style={styles.perplexityPrice}>
                ${investment.price.toFixed(2)}
              </Text>
              <View style={[styles.perplexityChangePill, { backgroundColor: percentageColor + '20' }]}>
                <Text style={[styles.perplexityChangeIcon, { color: percentageColor }]}>
                  {isNegative ? '↓' : '↑'}
                </Text>
                <Text style={[styles.perplexityChange, { color: percentageColor }]}>
                  {Math.abs(investment.changePercent).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chart and Stats Layout - Perplexity Style */}
        <View style={styles.perplexityBody}>
          {/* Left Side - Chart with Y-axis */}
          <View style={styles.perplexityChartSection}>
            {/* Y-axis labels */}
            <View style={styles.perplexityYAxis}>
              <Text style={styles.perplexityYLabel}>350</Text>
              <Text style={styles.perplexityYLabel}>300</Text>
              <Text style={styles.perplexityYLabel}>250</Text>
            </View>

            {/* Chart area */}
            <View style={styles.perplexityChartContainer}>
              <View style={styles.perplexityChart}>
                {/* Simple line chart with Perplexity colors */}
                <Svg width={140} height={70}>
                  {/* Chart line */}
                  {investment.chartData.map((point: number, idx: number) => {
                    if (idx === investment.chartData.length - 1) return null;
                    const x1 = (idx / (investment.chartData.length - 1)) * 140;
                    const x2 = ((idx + 1) / (investment.chartData.length - 1)) * 140;
                    const y1 = 70 - ((point - 240) / (350 - 240)) * 70;
                    const y2 = 70 - ((investment.chartData[idx + 1] - 240) / (350 - 240)) * 70;

                    return (
                      <Line
                        key={idx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={chartColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </Svg>
              </View>
              <Text style={styles.perplexityTime}>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
            </View>
          </View>

          {/* Right Side - Stats Perplexity Style */}
          <View style={styles.perplexityStatsSection}>
            <View style={styles.perplexityStatRow}>
              <Text style={styles.perplexityStatLabel}>Volume</Text>
              <Text style={styles.perplexityStatValue}>{investment.volume}</Text>
            </View>
            <View style={styles.perplexityStatRow}>
              <Text style={styles.perplexityStatLabel}>Market Cap</Text>
              <Text style={styles.perplexityStatValue}>{investment.marketCap}</Text>
            </View>
            <View style={styles.perplexityStatRow}>
              <Text style={styles.perplexityStatLabel}>P/E Ratio</Text>
              <Text style={styles.perplexityStatValue}>{investment.peRatio}</Text>
            </View>
            <View style={styles.perplexityStatRow}>
              <Text style={styles.perplexityStatLabel}>Growth Rate</Text>
              <Text style={[
                styles.perplexityStatValue,
                { color: investment.growthRate && investment.growthRate > 0 ? '#10b981' : investment.growthRate && investment.growthRate < 0 ? '#ef4444' : '#ffffff' }
              ]}>
                {investment.growthRate ? `${investment.growthRate.toFixed(1)}%` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Insight Text - Perplexity Style */}
        <View style={styles.perplexityInsightContainer}>
          <Text style={styles.perplexityInsightText}>
            {investment.insight}
          </Text>
        </View>
      </View>
    );
  };



  const renderContent = () => {
    // Always show investment cards with mock data - bypass all loading/error states
    return (
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={() => {}}
        onScrollBeginDrag={() => {
          if (showAddDropdown) {
            setShowAddDropdown(false);
          }
        }}

      >
        {/* Portfolio Summary Card - Remove animations to prevent re-render issues */}
        <TouchableWithoutFeedback 
          onPress={() => {
            if (showAddDropdown) {
              setShowAddDropdown(false);
            }
          }}
        >
          <View 
            style={[
              styles.exactPortfolioCard, 
              { 
                backgroundColor: theme.card, 
                borderColor: '#e5e7eb'
              }
            ]}
          >
          <TouchableOpacity 
            style={styles.exactPortfolioHeader}
            activeOpacity={0.7}
          >
            <Text style={[styles.exactPortfolioTitle, { color: theme.text }]}>Portfolio Summary</Text>
            <View style={styles.portfolioHeaderRight}>
              <View style={styles.exactMarketStatus}>
                <View 
                  style={[
                    styles.exactMarketDot, 
                    { 
                      backgroundColor: '#ef4444'
                    }
                  ]} 
                />
                <Text style={[styles.exactMarketText, { color: theme.textMuted }]}>
                  Market Closed
                </Text>
              </View>
              <Icon name="keyboard-arrow-right" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.exactPortfolioContent}>
            {/* Primary Metrics Row */}
            <View style={styles.exactPortfolioRow}>
              <View style={styles.exactPortfolioItem}>
                <Text style={[styles.exactLabel, { color: '#6b7280' }]}>Portfolio Value</Text>
                <Text style={[styles.exactValue, { color: theme.text }]}>
                  ₹15,43,151.00
                </Text>
              </View>
              <View style={styles.exactPortfolioItem}>
                <Text style={[styles.exactLabel, { color: '#6b7280' }]}>Total Returns</Text>
                <Text style={[styles.exactValueGreen, { color: '#22c55e' }]}>
                  +₹1,25,651.25
                </Text>
              </View>
            </View>

            {/* Secondary Metrics Row */}
            <View style={styles.exactPortfolioRow}>
              <View style={styles.exactPortfolioItem}>
                <Text style={[styles.exactLabelSmall, { color: '#9ca3af' }]}>Today's Change</Text>
                <Text style={[styles.exactValueSmall, { color: '#22c55e' }]}>
                  +₹8,245 (+0.53%)
                </Text>
              </View>
              <View style={styles.exactPortfolioItem}>
                <Text style={[styles.exactLabelSmall, { color: '#9ca3af' }]}>Return Rate</Text>
                <Text style={[styles.exactValueSmall, { color: '#22c55e' }]}>
                  +8.86%
                </Text>
              </View>
            </View>


          </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Add Investment Button - Remove animations to prevent re-render issues */}
        <View style={styles.addInvestmentContainer}>
          <TouchableOpacity 
            style={[styles.addInvestmentButton, { backgroundColor: '#000000' }]}
            onPress={() => {
              setShowAddDropdown(!showAddDropdown);
            }}
            activeOpacity={0.8}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addInvestmentButtonText}>Add Investment</Text>
            <Icon 
              name={showAddDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {showAddDropdown && (
            <View 
              style={[
                styles.dropdownContainer, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.dropdownOption}
                onPress={() => {
                  setShowAddDropdown(false);
                  setShowAddModal(true);
                }}
              >
                <Icon name="edit" size={20} color={theme.text} />
                <Text style={[styles.dropdownOptionText, { color: theme.text }]}>Add Manually</Text>
              </TouchableOpacity>
              
              <View style={[styles.dropdownSeparator, { backgroundColor: theme.border }]} />
              
              <TouchableOpacity 
                style={styles.dropdownOption}
                onPress={() => {
                  setShowAddDropdown(false);
                  Alert.alert('Coming Soon', 'PDF/Document import feature will be available soon!');
                }}
              >
                <Icon name="description" size={20} color={theme.text} />
                <Text style={[styles.dropdownOptionText, { color: theme.text }]}>Add by PDF/Doc</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Investment Cards - wrapped with touch handler to close dropdown */}
        {mockInvestments.map((investment, index) => (
          <TouchableWithoutFeedback 
            key={investment.id}
            onPress={() => {
              if (showAddDropdown) {
                setShowAddDropdown(false);
              }
            }}
          >
            <View>
              <InvestmentCard investment={investment} index={index} />
            </View>
          </TouchableWithoutFeedback>
        ))}
        
        {/* Show actual assets if any */}
        {assets.length > 0 && (
          <TouchableWithoutFeedback 
            onPress={() => {
              if (showAddDropdown) {
                setShowAddDropdown(false);
              }
            }}
          >
            <View style={styles.assetsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Assets</Text>
              {assets.map(renderAssetCard)}
            </View>
          </TouchableWithoutFeedback>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderContent()}
      
      <Suspense fallback={<LoadingSpinner />}>
        <AddAssetModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAssetCreate={createNewAsset}
          onBulkImport={bulkImportAssets}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <AssetInsightsDrawer
          visible={selectedAssetForInsights !== null}
          asset={selectedAssetForInsights}
          onClose={() => setSelectedAssetForInsights(null)}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <AssetActionSheet
          visible={showActionSheet}
          onClose={() => {
            setShowActionSheet(false);
            setSelectedAssetForAction(null);
          }}
          onEdit={() => selectedAssetForAction && handleEditAsset(selectedAssetForAction)}
          onDelete={() => selectedAssetForAction && handleDeleteAsset(selectedAssetForAction)}
          assetName={selectedAssetForAction?.name || ''}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <EditAssetModal
          visible={showEditModal}
          asset={editingAsset}
          onClose={() => {
            setShowEditModal(false);
            setEditingAsset(null);
          }}
          onSave={handleSaveAsset}
          loading={savingAsset}
        />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioSummary: {
    marginBottom: 16,
  },
  portfolioLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  gainLossContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gainLossText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastUpdatedText: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonActive: {
    opacity: 0.6,
  },
  addAssetContainer: {
    position: 'relative',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    right: 0,
    left: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownSeparator: {
    height: 1,
    marginHorizontal: 16,
  },
  // Exact match styles from InvestmentsScreen
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
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },

  exactPortfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  portfolioHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '400',
  },
  exactValue: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  exactValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  exactLabelSmall: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exactValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },

  addInvestmentContainer: {
    position: 'relative',
    marginBottom: 24,
    marginHorizontal: 20,
    zIndex: 1000,
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

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addFirstAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addFirstAssetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Investment Card Styles - Exact match
  scrollContainer: {
    flex: 1,
  },
  exactInvestmentCard: {
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exactInvestmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exactInvestmentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exactInvestmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exactInvestmentIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  exactInvestmentInfo: {
    flex: 1,
  },
  exactInvestmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exactInvestmentSymbol: {
    fontSize: 14,
    fontWeight: '500',
  },
  exactInvestmentPriceContainer: {
    alignItems: 'flex-end',
  },
  exactInvestmentPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  exactInvestmentChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  exactChartStatsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  exactChartContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 100,
    marginRight: 20,
  },
  exactChartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  exactChartYLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  exactChartArea: {
    flex: 1,
    position: 'relative',
  },
  exactChartLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },
  exactChartPointContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  exactChartPoint: {
    width: 2,
    borderRadius: 1,
    minHeight: 2,
  },
  exactChartConnector: {
    position: 'absolute',
    top: '50%',
    right: -2,
    width: 4,
    height: 1,
  },
  exactChartTime: {
    position: 'absolute',
    bottom: -15,
    left: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  exactStatsContainer: {
    width: 120,
    justifyContent: 'space-between',
  },
  exactStatItem: {
    marginBottom: 8,
  },
  exactStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  exactStatValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  exactInsightContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  exactInsightText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  assetsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  // Enhanced Candlestick Chart Styles
  candlestickContainer: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-start',
  },
  yAxisLabels: {
    width: 45,
    height: 80,
    justifyContent: 'space-between',
    paddingRight: 5,
    position: 'relative',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  xAxisLabels: {
    flexDirection: 'row',
    height: 20,
    position: 'relative',
    marginTop: 5,
  },
  axisLabel: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '500',
    position: 'absolute',
  },

  // Perplexity-Style Card Design
  exactReplicaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  exactReplicaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exactReplicaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exactReplicaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exactReplicaIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  exactReplicaCompanyInfo: {
    flex: 1,
  },
  exactReplicaCompanyName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exactReplicaSymbol: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  exactReplicaRight: {
    alignItems: 'flex-end',
  },
  exactReplicaPrice: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  exactReplicaChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  exactReplicaBody: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  exactReplicaChartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 20,
  },
  exactReplicaYAxis: {
    width: 30,
    justifyContent: 'space-between',
    height: 60,
    paddingVertical: 5,
  },
  exactReplicaYLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
  },
  exactReplicaChartContainer: {
    flex: 1,
    position: 'relative',
  },
  exactReplicaChart: {
    height: 60,
    justifyContent: 'center',
  },
  exactReplicaTime: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    position: 'absolute',
    bottom: -15,
    left: 0,
  },
  exactReplicaStatsSection: {
    width: 100,
    justifyContent: 'space-between',
  },
  exactReplicaStatRow: {
    marginBottom: 8,
  },
  exactReplicaStatLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  exactReplicaStatValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  exactReplicaInsightContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  exactReplicaInsightText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },

  // Compact Layout Styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  compactCompanyInfo: {
    flex: 1,
    marginRight: 10,
  },
  compactCompanyName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 18,
  },
  compactRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  compactChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  compactStatsSection: {
    width: 120,
    justifyContent: 'space-between',
  },
  compactStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  compactStatLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '500',
  },
  compactStatValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // Perplexity-Style Placeholder Investment Card Styles
  perplexityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  perplexityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  perplexityIconFallback: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  perplexityIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  perplexityCompanyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  perplexityCompanyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  perplexitySymbol: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 0.2,
  },
  perplexityRight: {
    alignItems: 'flex-end',
  },
  perplexityPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perplexityPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  perplexityChangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  perplexityChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perplexityChangeIcon: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
  perplexityChange: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  perplexityBody: {
    flexDirection: 'row',
    marginBottom: 24,
    minHeight: 100,
  },
  perplexityChartSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 24,
  },
  perplexityYAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingRight: 8,
  },
  perplexityYLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'right',
  },
  perplexityChartContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  perplexityChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perplexityTime: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  perplexityStatsSection: {
    width: 180,
    justifyContent: 'space-between',
  },
  perplexityStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  perplexityStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 0.1,
    flex: 1,
  },
  perplexityStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
    textAlign: 'right',
  },
  perplexityInsightContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  perplexityInsightText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#9ca3af',
    letterSpacing: 0.1,
  },

});

export default AssetsScreen;