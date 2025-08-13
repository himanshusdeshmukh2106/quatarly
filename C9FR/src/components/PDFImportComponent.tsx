import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,

  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from '@react-native-documents/picker';
import { PDFImportService } from '../services/PDFImportService';
import { ParsedAssetData, PDFParsingResult } from '../types';

interface PDFImportComponentProps {
  onAssetsImported: (assets: ParsedAssetData[]) => void;
  onCancel: () => void;
  style?: any;
}

interface ImportState {
  step: 'select' | 'password' | 'parsing' | 'preview' | 'error';
  selectedFile?: any;
  password?: string;
  parsingResult?: PDFParsingResult;
  error?: string;
}

export const PDFImportComponent: React.FC<PDFImportComponentProps> = ({
  onAssetsImported,
  onCancel,
  style,
}) => {
  const [importState, setImportState] = useState<ImportState>({
    step: 'select',
  });

  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      if (result) {
        setImportState({
          step: 'parsing',
          selectedFile: result,
        });

        // Check if password is required
        const isPasswordProtected = await PDFImportService.isPasswordProtected(result.fileCopyUri || result.uri);
        
        if (isPasswordProtected) {
          setImportState(prev => ({
            ...prev,
            step: 'password',
          }));
        } else {
          await processPDF(result.fileCopyUri || result.uri);
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
        return;
      }
      
      setImportState({
        step: 'error',
        error: 'Failed to select PDF file. Please try again.',
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (!importState.selectedFile || !importState.password) {
      Alert.alert('Error', 'Please enter the PDF password');
      return;
    }

    setImportState(prev => ({ ...prev, step: 'parsing' }));
    await processPDF(
      importState.selectedFile.fileCopyUri || importState.selectedFile.uri,
      importState.password
    );
  };

  const processPDF = async (fileUri: string, password?: string) => {
    try {
      const result = await PDFImportService.parsePDF(fileUri, password);
      
      if (result.success && result.assets.length > 0) {
        setImportState({
          step: 'preview',
          selectedFile: importState.selectedFile,
          parsingResult: result,
        });
      } else {
        setImportState({
          step: 'error',
          error: result.errors.length > 0 
            ? result.errors.join(', ')
            : 'No assets found in the PDF. Please check the file format.',
        });
      }
    } catch (error) {
      setImportState({
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to parse PDF',
      });
    }
  };

  const handleImportConfirm = () => {
    if (importState.parsingResult?.assets) {
      onAssetsImported(importState.parsingResult.assets);
    }
  };

  const handleRetry = () => {
    setImportState({ step: 'select' });
  };

  const renderFileSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="upload-file" size={48} color="#6B7280" />
      </View>
      
      <Text style={styles.stepTitle}>Import Portfolio Statement</Text>
      <Text style={styles.stepDescription}>
        Select a PDF file from your brokerage account to automatically import your holdings.
      </Text>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleFileSelection}
        activeOpacity={0.7}
      >
        <Icon name="folder-open" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.primaryButtonText}>Select PDF File</Text>
      </TouchableOpacity>
      
      <View style={styles.supportedFormats}>
        <Text style={styles.supportedTitle}>Supported Brokerages:</Text>
        <Text style={styles.supportedText}>
          Zerodha, Upstox, Groww, Angel Broking, ICICI Direct, HDFC Securities, and more
        </Text>
      </View>
    </View>
  );

  const renderPasswordInput = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="lock" size={48} color="#F59E0B" />
      </View>
      
      <Text style={styles.stepTitle}>PDF Password Required</Text>
      <Text style={styles.stepDescription}>
        This PDF is password protected. Please enter the password to continue.
      </Text>
      
      <TextInput
        style={styles.passwordInput}
        placeholder="Enter PDF password"
        secureTextEntry
        value={importState.password}
        onChangeText={(text) => setImportState(prev => ({ ...prev, password: text }))}
        autoFocus
      />
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePasswordSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderParsing = () => (
    <View style={styles.stepContainer}>
      <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
      
      <Text style={styles.stepTitle}>Processing PDF</Text>
      <Text style={styles.stepDescription}>
        Extracting asset information from your portfolio statement...
      </Text>
      
      <View style={styles.processingSteps}>
        <View style={styles.processingStep}>
          <Icon name="check-circle" size={16} color="#10B981" />
          <Text style={styles.processingStepText}>Reading PDF content</Text>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.processingStepText}>Identifying assets</Text>
        </View>
        <View style={styles.processingStep}>
          <Icon name="radio-button-unchecked" size={16} color="#D1D5DB" />
          <Text style={[styles.processingStepText, styles.pendingStep]}>Validating data</Text>
        </View>
      </View>
    </View>
  );

  const renderPreview = () => {
    const { parsingResult } = importState;
    if (!parsingResult) return null;

    return (
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <Icon name="preview" size={24} color="#10B981" />
          <Text style={styles.previewTitle}>Import Preview</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Found {parsingResult.totalAssetsFound} assets with {Math.round(parsingResult.parsingConfidence * 100)}% confidence
          </Text>
          
          {parsingResult.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              <Icon name="warning" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                {parsingResult.warnings.join(', ')}
              </Text>
            </View>
          )}
        </View>
        
        <ScrollView style={styles.assetsList} showsVerticalScrollIndicator={false}>
          {parsingResult.assets.map((asset, index) => (
            <View key={index} style={styles.assetPreviewCard}>
              <View style={styles.assetHeader}>
                <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                <View style={[
                  styles.confidenceBadge,
                  asset.confidence >= 0.8 ? styles.highConfidence : styles.lowConfidence
                ]}>
                  <Text style={styles.confidenceText}>
                    {Math.round(asset.confidence * 100)}%
                  </Text>
                </View>
              </View>
              
              <Text style={styles.assetName}>{asset.name}</Text>
              
              <View style={styles.assetDetails}>
                <Text style={styles.assetDetailText}>
                  Quantity: {asset.quantity.toLocaleString()}
                </Text>
                <Text style={styles.assetDetailText}>
                  Avg Price: ₹{asset.averagePurchasePrice.toLocaleString()}
                </Text>
                <Text style={styles.assetDetailText}>
                  Value: ₹{asset.currentValue?.toLocaleString() || 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleImportConfirm}
            activeOpacity={0.7}
          >
            <Icon name="check" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Import Assets</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="error" size={48} color="#EF4444" />
      </View>
      
      <Text style={styles.stepTitle}>Import Failed</Text>
      <Text style={styles.stepDescription}>
        {importState.error}
      </Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRetry}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (importState.step) {
      case 'select':
        return renderFileSelection();
      case 'password':
        return renderPasswordInput();
      case 'parsing':
        return renderParsing();
      case 'preview':
        return renderPreview();
      case 'error':
        return renderError();
      default:
        return renderFileSelection();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderCurrentStep()}
    </View>
  );
};

// const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  supportedFormats: {
    alignItems: 'center',
    marginTop: 24,
  },
  supportedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  supportedText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  passwordInput: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  loader: {
    marginBottom: 24,
  },
  processingSteps: {
    alignItems: 'flex-start',
    marginTop: 24,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingStepText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  pendingStep: {
    color: '#9CA3AF',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  warningsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#D97706',
    marginLeft: 8,
    flex: 1,
  },
  assetsList: {
    flex: 1,
    marginBottom: 20,
  },
  assetPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  confidenceBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  highConfidence: {
    backgroundColor: '#D1FAE5',
  },
  lowConfidence: {
    backgroundColor: '#FEF3C7',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  assetName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  assetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assetDetailText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});

export default PDFImportComponent;