/**
 * PerplexityHeader - Exact header from Perplexity Finance
 * With breadcrumb navigation and search bar
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text, Input } from './reusables';
import { PerplexityLogo } from './PerplexityLogo';
import { perplexityColors, perplexitySpacing } from '../theme/perplexityTheme';

interface PerplexityHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onMenuPress?: () => void;
  showMobileMenu?: boolean;
}

export const PerplexityHeader: React.FC<PerplexityHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onMenuPress,
  showMobileMenu = false,
}) => {
  return (
    <View style={styles.header}>
      {/* Breadcrumb Navigation - Desktop */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity activeOpacity={0.7}>
          <View style={styles.breadcrumbItem}>
            <Text variant="bodySmall" color="quiet" weight="500">
              Perplexity Finance
            </Text>
          </View>
        </TouchableOpacity>
        
        <Icon name="chevron-right" size={15} color={perplexityColors.quietest} />
        
        <TouchableOpacity activeOpacity={0.7}>
          <View style={styles.breadcrumbItem}>
            <Text variant="bodySmall" color="quiet" weight="500">
              India Markets
            </Text>
          </View>
        </TouchableOpacity>
        
        <Icon name="chevron-right" size={15} color={perplexityColors.quietest} />
        
        <Text variant="bodySmall" color="quiet" weight="500">
          Portfolio
        </Text>
      </View>

      {/* Mobile Menu Button & Logo */}
      {showMobileMenu && (
        <View style={styles.mobileHeader}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Icon name="menu" size={20} color={perplexityColors.quiet} />
          </TouchableOpacity>
          <PerplexityLogo size={24} />
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Enter Symbol"
          value={searchQuery}
          onChangeText={onSearchChange}
          icon={<Icon name="search" size={20} color={perplexityColors.quiet} />}
          iconPosition="left"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: perplexitySpacing.lg,
    paddingTop: perplexitySpacing.md,
    paddingBottom: perplexitySpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: perplexityColors.borderSubtlest,
    backgroundColor: perplexityColors.base,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: perplexitySpacing.md,
  },
  breadcrumbItem: {
    paddingHorizontal: perplexitySpacing.xs,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: perplexitySpacing.md,
  },
  menuButton: {
    marginRight: perplexitySpacing.md,
    padding: perplexitySpacing.xs,
  },
  searchContainer: {
    maxWidth: 400,
    width: '100%',
  },
});
