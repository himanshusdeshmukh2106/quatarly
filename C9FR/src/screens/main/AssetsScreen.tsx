import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { Asset } from '../../types';
import { useAssets } from '../../hooks/useAssets';
import { UnifiedAssetCard } from '../../components/UnifiedAssetCard';
import { AddAssetModal } from '../../components/AddAssetModal';
import { AssetInsightsDrawer } from '../../components/AssetInsightsDrawer';
import { EditAssetModal } from '../../components/EditAssetModal';
import { AssetActionSheet } from '../../components/AssetActionSheet';



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

    const {
        assets,
        createNewAsset,
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
        return (
            <UnifiedAssetCard
                key={asset.id}
                asset={asset}
                onUpdateValue={updatePhysicalAssetValue}
                onInsightsPress={() => setSelectedAssetForInsights(asset)}
                onLongPress={() => handleAssetLongPress(asset)}
                onPress={() => setSelectedAssetForInsights(asset)}
            />
        );
    };



    const renderContent = () => {
        return (
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => {
                    if (showAddDropdown) {
                        setShowAddDropdown(false);
                    }
                }}
            >
                {/* Portfolio Summary Card */}
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

                {/* Add Investment Button */}
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

            <AddAssetModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAssetCreate={createNewAsset}
            />

            <AssetInsightsDrawer
                visible={selectedAssetForInsights !== null}
                asset={selectedAssetForInsights}
                onClose={() => setSelectedAssetForInsights(null)}
            />

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },

    // Portfolio Summary Styles
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

    // Add Investment Button Styles
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

    // Investment Card Styles
    exactReplicaCard: {
        backgroundColor: '#1f1f1f', // Exact dark background from image
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4, // Stronger shadow for dark theme
        shadowRadius: 12,
        elevation: 12,
    },

    // Price and Change Row Styles
    priceChangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    changeContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },

    // Pixel Perfect Styles - Exact Match to Image
    pixelPerfectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pixelPerfectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    pixelPerfectIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    pixelPerfectIconText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '800',
    },
    pixelPerfectCompanyInfo: {
        flex: 1,
    },
    pixelPerfectCompanyName: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    pixelPerfectSymbol: {
        color: '#9ca3af',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    pixelPerfectRight: {
        alignItems: 'flex-end',
    },
    pixelPerfectPrice: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    pixelPerfectChange: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    pixelPerfectBody: {
        flexDirection: 'row',
        marginBottom: 24,
        marginTop: 4,
    },
    pixelPerfectChartSection: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 24,
    },
    pixelPerfectYAxis: {
        width: 44,
        height: 80,
        justifyContent: 'space-between',
        paddingRight: 10,
        paddingTop: 4,
        paddingBottom: 4,
    },
    pixelPerfectYLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'right',
    },
    pixelPerfectChartContainer: {
        flex: 1,
    },
    pixelPerfectChart: {
        height: 80,
        position: 'relative',
    },
    pixelPerfectTime: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 10,
        textAlign: 'left',
    },
    pixelPerfectStatsSection: {
        width: 130,
        justifyContent: 'space-between',
        paddingTop: 4,
    },
    pixelPerfectStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    pixelPerfectStatLabel: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
    },
    pixelPerfectStatValue: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'right',
    },
    pixelPerfectInsightContainer: {
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#333333',
        marginTop: 4,
    },
    pixelPerfectInsightText: {
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        letterSpacing: 0.1,
    },

    // Assets Section Styles
    assetsSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
});

export default AssetsScreen;