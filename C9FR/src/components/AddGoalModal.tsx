import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CreateGoalRequest } from '../types';
import { showToast } from '../utils/toast';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (goalData: CreateGoalRequest) => Promise<void>;
  loading?: boolean;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { theme } = useContext(ThemeContext);
  
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    description: '',
    category: '',
  });
  
  const [errors, setErrors] = useState({
    title: '',
    target_amount: '',
  });

  const validateForm = () => {
    const newErrors = { title: '', target_amount: '' };
    let isValid = true;

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
      isValid = false;
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters long';
      isValid = false;
    }

    // Validate target amount
    const amount = parseFloat(formData.target_amount);
    if (!formData.target_amount.trim()) {
      newErrors.target_amount = 'Target amount is required';
      isValid = false;
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.target_amount = 'Please enter a valid amount greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const goalData: CreateGoalRequest = {
        title: formData.title.trim(),
        target_amount: parseFloat(formData.target_amount),
        description: formData.description.trim() || undefined,
        category: formData.category.trim() || undefined,
      };

      await onSubmit(goalData);
      
      // Reset form on success
      setFormData({
        title: '',
        target_amount: '',
        description: '',
        category: '',
      });
      setErrors({ title: '', target_amount: '' });
      onClose();
    } catch (error) {
      showToast.error('Failed to create goal. Please try again.');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      title: '',
      target_amount: '',
      description: '',
      category: '',
    });
    setErrors({ title: '', target_amount: '' });
    onClose();
  };

  const formatCurrency = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    return cleaned;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Add New Goal</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Goal Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Goal Title *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      borderColor: errors.title ? theme.error : theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={formData.title}
                  onChangeText={(text) => {
                    setFormData({ ...formData, title: text });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder="e.g., Emergency Fund, Dream Vacation"
                  placeholderTextColor={theme.textMuted}
                  maxLength={200}
                />
                {errors.title ? (
                  <Text style={styles.errorText}>{errors.title}</Text>
                ) : null}
              </View>

              {/* Target Amount */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Target Amount *</Text>
                <View style={styles.currencyInputContainer}>
                  <Text style={[styles.currencySymbol, { color: theme.text }]}>₹</Text>
                  <TextInput
                    style={[
                      styles.currencyInput,
                      {
                        backgroundColor: theme.background,
                        borderColor: errors.target_amount ? theme.error : theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={formData.target_amount}
                    onChangeText={(text) => {
                      const formatted = formatCurrency(text);
                      setFormData({ ...formData, target_amount: formatted });
                      if (errors.target_amount) setErrors({ ...errors, target_amount: '' });
                    }}
                    placeholder="50000"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                {errors.target_amount ? (
                  <Text style={styles.errorText}>{errors.target_amount}</Text>
                ) : null}
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                  placeholder="e.g., Vehicle, Electronics, Travel, Education, Real Estate, Emergency Fund"
                  placeholderTextColor={theme.textMuted}
                  maxLength={100}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Add details about your goal..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: theme.primary },
                  loading && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.submitButtonText}>Creating...</Text>
                ) : (
                  <Text style={styles.submitButtonText}>Create Goal</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '90%',
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
    padding: 4,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    color: '#ff6f61', // Using financial coral color for errors
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    // backgroundColor set dynamically
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddGoalModal;