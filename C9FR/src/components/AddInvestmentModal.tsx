import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Portal } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { ThemeContext } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CreateInvestmentRequest } from '../types';

interface AddInvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (investmentData: CreateInvestmentRequest) => Promise<void>;
  loading: boolean;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const { theme } = useContext(ThemeContext);
  
  const [formData, setFormData] = useState<CreateInvestmentRequest>({
    symbol: '',
    quantity: 0,
    purchase_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const resetForm = () => {
    setFormData({
      symbol: '',
      quantity: 0,
      purchase_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setSearchResults([]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.purchase_price <= 0) {
      newErrors.purchase_price = 'Purchase price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add investment:', error);
      Alert.alert(
        'Error',
        'Failed to add investment. Please check the symbol and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSymbolSearch = async (symbol: string) => {
    setFormData(prev => ({ ...prev, symbol: symbol.toUpperCase() }));
    
    if (symbol.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Mock search results - in real implementation, this would call an API
    setTimeout(() => {
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE' },
        { symbol: 'TCS.NS', name: 'Tata Consultancy Services Limited', exchange: 'NSE' },
      ].filter(item => 
        item.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
        item.name.toLowerCase().includes(symbol.toLowerCase())
      );
      
      setSearchResults(mockResults);
    }, 500);
  };

  const selectSymbol = (selectedSymbol: string) => {
    setFormData(prev => ({ ...prev, symbol: selectedSymbol }));
    setSearchResults([]);
    setErrors(prev => ({ ...prev, symbol: '' }));
  };

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        animationType="none"
        transparent
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <Animatable.View 
              animation="zoomIn" 
              duration={300} 
              style={[styles.modalContainer, { backgroundColor: theme.card }]}
            >
              <TouchableWithoutFeedback>
                <View>
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Add Investment</Text>
                    <TouchableOpacity 
                      onPress={handleClose} 
                      style={styles.closeButton}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                      accessibilityHint="Close add investment modal"
                    >
                      <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Symbol Input */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>Symbol *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.background,
                            borderColor: errors.symbol ? theme.error : theme.border,
                            color: theme.text,
                          },
                        ]}
                        value={formData.symbol}
                        onChangeText={handleSymbolSearch}
                        placeholder="e.g., AAPL, GOOGL, RELIANCE.NS"
                        placeholderTextColor={theme.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                      {errors.symbol && (
                        <Text style={[styles.errorText, { color: theme.error }]}>
                          {errors.symbol}
                        </Text>
                      )}
                      
                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <View style={[styles.searchResults, { backgroundColor: theme.background, borderColor: theme.border }]}>
                          {searchResults.map((result, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                              onPress={() => selectSymbol(result.symbol)}
                            >
                              <View>
                                <Text style={[styles.resultSymbol, { color: theme.text }]}>
                                  {result.symbol}
                                </Text>
                                <Text style={[styles.resultName, { color: theme.textMuted }]}>
                                  {result.name} • {result.exchange}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Quantity Input */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>Quantity *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.background,
                            borderColor: errors.quantity ? theme.error : theme.border,
                            color: theme.text,
                          },
                        ]}
                        value={formData.quantity.toString()}
                        onChangeText={(text) => {
                          const quantity = parseInt(text, 10) || 0;
                          setFormData(prev => ({ ...prev, quantity }));
                          setErrors(prev => ({ ...prev, quantity: '' }));
                        }}
                        placeholder="Number of shares"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numeric"
                      />
                      {errors.quantity && (
                        <Text style={[styles.errorText, { color: theme.error }]}>
                          {errors.quantity}
                        </Text>
                      )}
                    </View>

                    {/* Purchase Price Input */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>Purchase Price *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.background,
                            borderColor: errors.purchase_price ? theme.error : theme.border,
                            color: theme.text,
                          },
                        ]}
                        value={formData.purchase_price.toString()}
                        onChangeText={(text) => {
                          const price = parseFloat(text) || 0;
                          setFormData(prev => ({ ...prev, purchase_price: price }));
                          setErrors(prev => ({ ...prev, purchase_price: '' }));
                        }}
                        placeholder="Price per share"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="decimal-pad"
                      />
                      {errors.purchase_price && (
                        <Text style={[styles.errorText, { color: theme.error }]}>
                          {errors.purchase_price}
                        </Text>
                      )}
                    </View>

                    {/* Purchase Date Input */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.text }]}>Purchase Date</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.background,
                            borderColor: theme.border,
                            color: theme.text,
                          },
                        ]}
                        value={formData.purchase_date}
                        onChangeText={(text) => {
                          setFormData(prev => ({ ...prev, purchase_date: text }));
                        }}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    {/* Investment Summary */}
                    {formData.symbol && formData.quantity > 0 && formData.purchase_price > 0 && (
                      <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={[styles.summaryTitle, { color: theme.text }]}>Investment Summary</Text>
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Symbol:</Text>
                          <Text style={[styles.summaryValue, { color: theme.text }]}>
                            {formData.symbol}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Quantity:</Text>
                          <Text style={[styles.summaryValue, { color: theme.text }]}>
                            {formData.quantity.toLocaleString()} shares
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Investment:</Text>
                          <Text style={[styles.summaryValue, { color: theme.primary }]}>
                            ₹{(formData.quantity * formData.purchase_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                    )}
                  </ScrollView>

                  {/* Footer */}
                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={[styles.cancelButton, { borderColor: theme.border }]}
                      onPress={handleClose}
                      disabled={loading}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel"
                      accessibilityHint="Cancel adding investment"
                    >
                      <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        {
                          backgroundColor: theme.primary,
                          opacity: loading ? 0.6 : 1,
                        },
                      ]}
                      onPress={handleSubmit}
                      disabled={loading}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={loading ? "Adding Investment" : "Add Investment"}
                      accessibilityHint="Submit the investment details to add to portfolio"
                      accessibilityState={{ disabled: loading }}
                    >
                      {loading ? (
                        <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>Add Investment</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animatable.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  searchResults: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  resultSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultName: {
    fontSize: 14,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddInvestmentModal;