import { Alert } from 'react-native';
import { showToast } from '../toast';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('showToast', () => {
  const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('shows success alert with correct title and message', () => {
      const message = 'Goal created successfully!';
      
      showToast.success(message);
      
      expect(mockAlert).toHaveBeenCalledWith('Success', message);
    });
  });

  describe('error', () => {
    it('shows error alert with correct title and message', () => {
      const message = 'Failed to create goal';
      
      showToast.error(message);
      
      expect(mockAlert).toHaveBeenCalledWith('Error', message);
    });
  });

  describe('info', () => {
    it('shows info alert with correct title and message', () => {
      const message = 'Information message';
      
      showToast.info(message);
      
      expect(mockAlert).toHaveBeenCalledWith('Info', message);
    });
  });

  it('handles empty messages', () => {
    showToast.success('');
    showToast.error('');
    showToast.info('');
    
    expect(mockAlert).toHaveBeenCalledTimes(3);
    expect(mockAlert).toHaveBeenNthCalledWith(1, 'Success', '');
    expect(mockAlert).toHaveBeenNthCalledWith(2, 'Error', '');
    expect(mockAlert).toHaveBeenNthCalledWith(3, 'Info', '');
  });

  it('handles long messages', () => {
    const longMessage = 'This is a very long message that might be used in a toast notification to test how the system handles lengthy text content.';
    
    showToast.success(longMessage);
    
    expect(mockAlert).toHaveBeenCalledWith('Success', longMessage);
  });
});