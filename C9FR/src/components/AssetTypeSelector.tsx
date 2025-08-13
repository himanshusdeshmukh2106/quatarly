import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AssetType } from '../types';

interface AssetTypeOption {
  type: AssetType;
  title: string;
  description: string;
  icon: string;
  category: 'tradeable' | 'physical';
}

interface AssetTypeSelectorProps {
  selectedType?: AssetType;
  onTypeSelect: (type: AssetType) => void;
  style?: any;
}

const ASSET_TYPE_OPTIONS: AssetTypeOption[] = [
  {
    type: 'stock',
    title: 'Stocks',
    description: 'Individual company shares',
    icon: 'trending-up',
    category: 'tradeable',
  },
  {
    type: 'etf',
    title: 'ETFs',
    description: 'Exchange-traded funds',
    icon: 'account-balance',
    category: 'tradeable',
  },
  {
    type: 'bond',
    title: 'Bonds',
    description: 'Fixed income securities',
    icon: 'security',
    category: 'tradeable',
  },
  {
    type: 'crypto',
    title: 'Cryptocurrency',
    description: 'Digital currencies',
    icon: 'currency-bitcoin',
    category: 'tradeable',
  },
  {
    type: 'gold',
    title: 'Gold',
    description: 'Physical gold holdings',
    icon: 'star',
    category: 'physical',
  },
  {
    type: 'silver',
    title: 'Silver',
    description: 'Physical silver holdings',
    icon: 'star-border',
    category: 'physical',
  },
  {
    type: 'commodity',
    title: 'Commodities',
    description: 'Other physical assets',
    icon: 'grain',
    category: 'physical',
  },
];

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  style,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'tradeable' | 'physical' | 'all'>('all');

  const filteredOptions = selectedCategory === 'all' 
    ? ASSET_TYPE_OPTIONS 
    : ASSET_TYPE_OPTIONS.filter(option => option.category === selectedCategory);

  const renderAssetTypeCard = (option: AssetTypeOption) => {
    const isSelected = selectedType === option.type;
    
    return (
      <TouchableOpacity
        key={option.type}
        style={[
          styles.assetTypeCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => onTypeSelect(option.type)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[
            styles.iconContainer,
            isSelected && styles.selectedIconContainer,
          ]}>
            <Icon
              name={option.icon}
              size={24}
              color={isSelected ? '#FFFFFF' : '#6B7280'}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[
              styles.cardTitle,
              isSelected && styles.selectedCardTitle,
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.cardDescription,
              isSelected && styles.selectedCardDescription,
            ]}>
              {option.description}
            </Text>
          </View>
          
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Icon name="check-circle" size={20} color="#10B981" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilterContainer}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'all' && styles.selectedCategoryButton,
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === 'all' && styles.selectedCategoryButtonText,
        ]}>
          All Assets
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'tradeable' && styles.selectedCategoryButton,
        ]}
        onPress={() => setSelectedCategory('tradeable')}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === 'tradeable' && styles.selectedCategoryButtonText,
        ]}>
          Tradeable
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'physical' && styles.selectedCategoryButton,
        ]}
        onPress={() => setSelectedCategory('physical')}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === 'physical' && styles.selectedCategoryButtonText,
        ]}>
          Physical
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Select Asset Type</Text>
      
      {renderCategoryFilter()}
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {filteredOptions.map(renderAssetTypeCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryButtonText: {
    color: '#1F2937',
  },
  scrollContainer: {
    flex: 1,
  },
  cardsContainer: {
    gap: 12,
  },
  assetTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: '#10B981',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedCardTitle: {
    color: '#065F46',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  selectedCardDescription: {
    color: '#047857',
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
});

export default AssetTypeSelector;