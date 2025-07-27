declare module '@ernestbies/react-native-android-sms-listener' {
  interface SmsMessage {
    originatingAddress: string;
    body: string;
    timestamp: number;
  }

  interface SmsListenerSubscription {
    remove: () => void;
  }

  const SmsListener: {
    addListener: (callback: (message: SmsMessage) => void) => SmsListenerSubscription;
  };

  export default SmsListener;
} 