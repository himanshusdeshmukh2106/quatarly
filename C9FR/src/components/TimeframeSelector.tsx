/**
 * TimeframeSelector - Bottom sheet for selecting chart timeframes
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from './reusables';
import { perplexityColors, perplexitySpacing } from '../theme/perplexityTheme';

export type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

interface TimeframeOption {
  value: Timeframe;
  label: string;
}

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { value: '1D', label: '1 day' },
  { value: '5D', label: '5 day' },
  { value: '1M', label: '1 month' },
  { value: '6M', label: '6 month' },
  { value: 'YTD', label: 'Year to date' },
  { value: '1Y', label: '1 year' },
  { value: '5Y', label: '5 year' },
  { value: 'MAX', label: 'Max' },
];

interface TimeframeSelectorProps {
  visible: boolean;
  selectedTimeframe: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
  onClose: () => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  visible,
  selectedTimeframe,
  onSelect,
  onClose,
}) => {
  const handleSelect = (timeframe: Timeframe) => {
    onSelect(timeframe);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close timeframe selector"
          >
            <Icon name="close" size={24} color={perplexityColors.quiet} />
          </TouchableOpacity>

          {/* Timeframe options */}
          <View style={styles.optionsContainer}>
            {TIMEFRAME_OPTIONS.map((option) => {
              const isSelected = option.value === selectedTimeframe;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.option}
                  onPress={() => handleSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option.label} timeframe`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    variant="body"
                    color={isSelected ? 'super' : 'foreground'}
                    weight={isSelected ? '600' : '400'}
                    style={styles.optionText}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Icon name="check" size={20} color={perplexityColors.super} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#1f2121',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: perplexitySpacing.md,
    paddingBottom: perplexitySpacing.xl,
    paddingHorizontal: perplexitySpacing.lg,
    maxHeight: '50%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: perplexitySpacing.sm,
    marginBottom: perplexitySpacing.md,
  },
  optionsContainer: {
    gap: perplexitySpacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: perplexitySpacing.md,
    paddingHorizontal: perplexitySpacing.md,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
  },
});
