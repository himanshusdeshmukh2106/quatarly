/**
 * AssetDetailScreen
 * 
 * Displays detailed information about a specific asset
 */

import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Asset } from '../types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface AssetDetailScreenProps {
  route: {
    params: {
      asset: Asset;
    };
  };
  navigation: any;
}

const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { asset } = route.params;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Asset Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Asset Name */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.assetName, { color: theme.text }]}>{asset.name}</Text>
          <Text style={[styles.assetType, { color: theme.textMuted }]}>
            {asset.assetType.toUpperCase()}
          </Text>
        </View>

        {/* Value Section */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Total Value</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatCurrency(asset.totalValue)}
          </Text>
        </View>

        {/* Performance Section */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Performance</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Total Gain/Loss:</Text>
            <Text
              style={[
                styles.value,
                { color: asset.totalGainLoss >= 0 ? theme.success : theme.error },
              ]}
            >
              {formatCurrency(asset.totalGainLoss)} ({asset.totalGainLossPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Risk & Recommendation */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Analysis</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Risk Level:</Text>
            <Text style={[styles.badge, { backgroundColor: theme.accentMuted, color: theme.accent }]}>
              {asset.riskLevel.toUpperCase()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Recommendation:</Text>
            <Text style={[styles.badge, { backgroundColor: theme.primaryLight, color: theme.primary }]}>
              {asset.recommendation.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* AI Analysis */}
        {asset.aiAnalysis && (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>AI Insights</Text>
            <Text style={[styles.aiText, { color: theme.text }]}>{asset.aiAnalysis}</Text>
          </View>
        )}

        {/* Metadata */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Information</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Created:</Text>
            <Text style={[styles.text, { color: theme.textMuted }]}>
              {new Date(asset.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Last Updated:</Text>
            <Text style={[styles.text, { color: theme.textMuted }]}>
              {new Date(asset.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  assetName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  text: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AssetDetailScreen;
