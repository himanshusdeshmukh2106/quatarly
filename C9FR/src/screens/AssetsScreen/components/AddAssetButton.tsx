/**
 * AddAssetButton Component
 * 
 * Button with dropdown for adding assets manually or via PDF/Doc
 * Extracted from AssetsScreen to improve code organization
 */

import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../../context/ThemeContext';

export interface AddAssetButtonProps {
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onAddManually: () => void;
}

export const AddAssetButton: React.FC<AddAssetButtonProps> = React.memo(({
  showDropdown,
  onToggleDropdown,
  onAddManually,
}) => {
  const { theme } = useContext(ThemeContext);

  const handleAddByPDF = () => {
    Alert.alert('Coming Soon', 'PDF/Document import feature will be available soon!');
  };

  return (
    <View style={styles.addInvestmentContainer}>
      <TouchableOpacity 
        style={[styles.addInvestmentButton, { backgroundColor: '#000000' }]}
        onPress={onToggleDropdown}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add Investment"
        accessibilityHint="Opens menu to add investment manually or via document"
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addInvestmentButtonText}>Add Investment</Text>
        <Icon 
          name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={20} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>

      {/* Dropdown Options */}
      {showDropdown && (
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
            onPress={onAddManually}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add Manually"
          >
            <Icon name="edit" size={20} color={theme.text} />
            <Text style={[styles.dropdownOptionText, { color: theme.text }]}>
              Add Manually
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.dropdownSeparator, { backgroundColor: theme.border }]} />
          
          <TouchableOpacity 
            style={styles.dropdownOption}
            onPress={handleAddByPDF}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add by PDF or Document"
          >
            <Icon name="description" size={20} color={theme.text} />
            <Text style={[styles.dropdownOptionText, { color: theme.text }]}>
              Add by PDF/Doc
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

AddAssetButton.displayName = 'AddAssetButton';

const styles = StyleSheet.create({
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
});
