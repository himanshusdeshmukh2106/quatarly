import { PermissionsAndroid, Alert, AppState } from 'react-native';
import SmsListener from '@ernestbies/react-native-android-sms-listener';
import { sendSmsMessage } from './api';

interface SmsMessage {
  originatingAddress: string;
  body: string;
  timestamp: number;
}

// Financial keywords to heuristically detect transaction related messages
const financialKeywords = [
  'debited',
  'credited',
  'spent',
  'received',
  'inr',
  'rs',
  'transaction',
  'payment',
  'salary',
  'paid',
  'due',
  'balance',
  'withdrawal',
  'deposit',
];

let smsSubscription: any = null;

/**
 * Starts listening for incoming SMS messages that could represent financial
 * transactions. When a relevant SMS is detected we forward it to the backend.
 *
 * The function requests RECEIVE_SMS permission at runtime (Android only). If
 * the user declines the permission we simply return `false` and the caller can
 * decide what to do.
 *
 * Returns `true` if tracking is enabled, `false` otherwise.
 */
export const startExpenseTracking = async (): Promise<boolean> => {
  try {
    // Avoid duplicate listeners
    if (smsSubscription) {
      return true;
    }

    // Ensure the app is in foreground – avoid unexpected permission prompts
    if (AppState.currentState !== 'active') {
      return false;
    }

    // Ask for SMS receive permission
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      {
        title: 'Receive SMS Permission',
        message:
          'C9FR needs access to your SMS messages to automatically track expenses.',
        buttonPositive: 'OK',
      },
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert(
        'Permission Denied',
        'You can enable automatic expense tracking later from the Expenses screen.',
      );
      return false;
    }

    smsSubscription = SmsListener.addListener(async (message: SmsMessage) => {
      const { body, originatingAddress: sender, timestamp } = message;

      const isFinancial = financialKeywords.some(keyword =>
        body.toLowerCase().includes(keyword),
      );

      if (!isFinancial) return;

      try {
        await sendSmsMessage({
          body,
          sender,
          timestamp: new Date(timestamp).toISOString(),
        });
      } catch (error) {
        console.error('Failed to forward SMS to backend:', error);
      }
    });

    Alert.alert(
      'Automatic Tracking Enabled',
      'New expenses detected in SMS messages will be tracked automatically.',
    );
    return true;
  } catch (error) {
    console.warn('Failed to start expense tracking:', error);
    return false;
  }
};

/**
 * Stops listening for SMS based expense tracking.
 */
export const stopExpenseTracking = () => {
  if (smsSubscription) {
    smsSubscription.remove();
    smsSubscription = null;
    Alert.alert(
      'Tracking Disabled',
      'Automatic expense tracking has been turned off.',
    );
  }
};

/**
 * Helper to know if tracking is currently active.
 */
export const isExpenseTrackingActive = (): boolean => !!smsSubscription; 