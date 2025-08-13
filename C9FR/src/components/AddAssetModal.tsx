import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CreateAssetRequest } from '../types';
import { ThemeContext } from '../context/ThemeContext';
import { simpleAssetService, AssetSuggestion } from '../services/simpleAssetService';

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onAssetCreate: (assetData: CreateAssetRequest) => void;
}

// AssetSuggestion interface is now imported from aiAssetService

interface ExchangeOption {
  code: string;
  name: string;
  country: string;
}

// Optimized exchange options - only load when needed
const EXCHANGE_OPTIONS: Record<string, ExchangeOption[]> = {
  stock: [
    { code: 'NSE', name: 'NSE', country: 'India' },
    { code: 'BSE', name: 'BSE', country: 'India' },
    { code: 'NASDAQ', name: 'NASDAQ', country: 'USA' },
    { code: 'NYSE', name: 'NYSE', country: 'USA' },
  ],
  crypto: [
    { code: 'BINANCE', name: 'Binance', country: 'Global' },
    { code: 'WAZIRX', name: 'WazirX', country: 'India' },
    { code: 'COINBASE', name: 'Coinbase', country: 'USA' },
  ],
  etf: [
    { code: 'NSE', name: 'NSE', country: 'India' },
    { code: 'BSE', name: 'BSE', country: 'India' },
    { code: 'NASDAQ', name: 'NASDAQ', country: 'USA' },
  ],
};

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  visible,
  onClose,
  onAssetCreate,
}) => {
  const { theme } = useContext(ThemeContext);
  
  // Form state - minimal initial state
  const [assetName, setAssetName] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetSuggestion | null>(null);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [exchange, setExchange] = useState('');
  
  // UI state - minimal for performance
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AssetSuggestion[]>([]);

  // Real-time search effect (instant with static data)
  useEffect(() => {
    const searchAssets = async () => {
      if (assetName.length < 2) {
        setAiSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const suggestions = await simpleAssetService.getAssetSuggestions(assetName);
        setAiSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setAiSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // Minimal debounce for smooth UX
    const timeoutId = setTimeout(searchAssets, 150);
    return () => clearTimeout(timeoutId);
  }, [assetName]);

  // Optimized handlers with useCallback
  const handleAssetNameChange = useCallback((text: string) => {
    setAssetName(text);
    setShowSuggestions(text.length >= 2);
    
    // Reset selection if user types something different
    if (selectedAsset && !selectedAsset.name.toLowerCase().includes(text.toLowerCase())) {
      setSelectedAsset(null);
      setExchange('');
      setQuantity('');
      setPurchasePrice('');
    }
  }, [selectedAsset]);

  const handleSuggestionSelect = useCallback(async (suggestion: AssetSuggestion) => {
    setAssetName(suggestion.name);
    setSelectedAsset(suggestion);
    setShowSuggestions(false);
    
    // Auto-fill based on asset type
    if (suggestion.exchange) {
      setExchange(suggestion.exchange);
    }
    
    // Optionally fetch current price (only when user selects)
    if (suggestion.currentPrice) {
      setPurchasePrice(suggestion.currentPrice.toString());
    } else if (suggestion.symbol) {
      setLoadingPrice(true);
      try {
        const currentPrice = await simpleAssetService.getCurrentPrice(suggestion.symbol);
        if (currentPrice) {
          setPurchasePrice(currentPrice.toString());
        }
      } catch (error) {
        console.log('Price not available, user can enter manually');
      } finally {
        setLoadingPrice(false);
      }
    }
    
    // Set smart default quantities
    if (suggestion.type === 'stock' || suggestion.type === 'etf') {
      setQuantity('10');
    } else if (suggestion.type === 'crypto') {
      setQuantity('0.1');
    } else if (suggestion.type === 'gold' || suggestion.type === 'silver') {
      setQuantity('10');
    } else {
      setQuantity('1');
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!assetName.trim()) {
      Alert.alert('Error', 'Please enter an asset name');
      return;
    }

    if (!selectedAsset) {
      Alert.alert('Error', 'Please select an asset from the suggestions');
      return;
    }

    if (!quantity || !purchasePrice) {
      Alert.alert('Error', 'Please fill in quantity and purchase price');
      return;
    }

    const assetData: CreateAssetRequest = {
      name: assetName,
      assetType: selectedAsset.type,
      symbol: selectedAsset.symbol || '',
      quantity: parseFloat(quantity) || 1,
      purchasePrice: parseFloat(purchasePrice) || 0,
      purchaseDate: purchaseDate,
      currency: 'INR',
      exchange: needsExchange(selectedAsset.type) ? exchange : '',
    };

    onAssetCreate(assetData);
    handleClose();
  }, [assetName, selectedAsset, quantity, purchasePrice, purchaseDate, exchange, onAssetCreate]);

  const handleClose = useCallback(() => {
    setAssetName('');
    setSelectedAsset(null);
    setQuantity('');
    setPurchasePrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setExchange('');
    setShowSuggestions(false);
    setShowExchangeDropdown(false);
    setLoadingSuggestions(false);
    setLoadingPrice(false);
    setAiSuggestions([]);
    onClose();
  }, [onClose]);

  // Helper function to determine if asset type needs exchange
  const needsExchange = useCallback((type: string) => {
    return ['stock', 'etf', 'crypto'].includes(type);
  }, []);

  // Clean suggestion item renderer
  const renderSuggestion = useCallback(({ item }: { item: AssetSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionName, { color: theme.text }]}>
          {item.name}
        </Text>
        <View style={styles.suggestionMeta}>
          {item.symbol && (
            <Text style={[styles.suggestionSymbol, { color: theme.textMuted }]}>
              {item.symbol}
            </Text>
          )}
          <View style={[styles.suggestionType, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.suggestionTypeText, { color: theme.primary }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          {item.exchange && (
            <Text style={[styles.suggestionExchange, { color: theme.textMuted }]}>
              {item.exchange}
            </Text>
          )}
          {item.country && (
            <Text style={[styles.suggestionCountry, { color: theme.textMuted }]}>
              {item.country}
            </Text>
          )}
        </View>
      </View>
      {item.currentPrice && (
        <Text style={[styles.suggestionPrice, { color: theme.textMuted }]}>
          ₹{item.currentPrice.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  ), [theme, handleSuggestionSelect]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackground} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Add New Asset</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Asset Name Input - Always visible */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>
              Asset Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Start typing asset name..."
                placeholderTextColor={theme.textMuted}
                value={assetName}
                onChangeText={handleAssetNameChange}
                onFocus={() => setShowSuggestions(assetName.length >= 2)}
                autoFocus
              />
              {loadingSuggestions ? (
                <ActivityIndicator size="small" color={theme.primary} style={styles.searchIcon} />
              ) : (
                <Icon name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
              )}
            </View>

            {/* Real-time Asset Suggestions */}
            {showSuggestions && (aiSuggestions.length > 0 || loadingSuggestions) && (
              <View style={[styles.suggestionsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {loadingSuggestions ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                      Searching...
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={aiSuggestions}
                    keyExtractor={(item) => `${item.name}-${item.symbol}-${item.exchange}`}
                    renderItem={renderSuggestion}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={8}
                    windowSize={5}
                  />
                )}
              </View>
            )}
          </View>

          {/* Dynamic Fields - Only show after asset selection */}
          {selectedAsset && (
            <>

              {/* Exchange Field - Only for stocks, ETFs, crypto */}
              {needsExchange(selectedAsset.type) && (
                <View style={styles.section}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Exchange <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setShowExchangeDropdown(!showExchangeDropdown)}
                  >
                    <Text style={[styles.dropdownText, { color: exchange ? theme.text : theme.textMuted }]}>
                      {exchange || 'Select Exchange'}
                    </Text>
                    <Icon name={showExchangeDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={theme.text} />
                  </TouchableOpacity>
                  
                  {showExchangeDropdown && EXCHANGE_OPTIONS[selectedAsset.type] && (
                    <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      {EXCHANGE_OPTIONS[selectedAsset.type].map((exchangeOption) => (
                        <TouchableOpacity
                          key={exchangeOption.code}
                          style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                          onPress={() => {
                            setExchange(exchangeOption.code);
                            setShowExchangeDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                            {exchangeOption.name}
                          </Text>
                          <Text style={[styles.dropdownItemSubtext, { color: theme.textMuted }]}>
                            {exchangeOption.country}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Quantity Field */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Quantity <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder={getQuantityPlaceholder(selectedAsset.type)}
                  placeholderTextColor={theme.textMuted}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>

              {/* Purchase Price Field */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Purchase Price <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter purchase price"
                  placeholderTextColor={theme.textMuted}
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  keyboardType="numeric"
                />
              </View>

              {/* Purchase Date Field */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.text }]}>Purchase Date</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* Footer - Only show when asset is selected */}
        {selectedAsset && (
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Add Asset</Text>
            </TouchableOpacity>
          </View>
        )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// Helper function for quantity placeholder
const getQuantityPlaceholder = (type: string): string => {
  switch (type) {
    case 'stock':
    case 'etf':
      return 'Number of shares';
    case 'crypto':
      return 'Amount (e.g., 0.1)';
    case 'gold':
    case 'silver':
      return 'Weight in grams';
    default:
      return 'Enter quantity';
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 60,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    height: 500,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 180,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionSymbol: {
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionType: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestionTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  suggestionExchange: {
    fontSize: 12,
  },
  suggestionCountry: {
    fontSize: 12,
  },
  suggestionPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },

  priceInputContainer: {
    position: 'relative',
  },
  priceLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});