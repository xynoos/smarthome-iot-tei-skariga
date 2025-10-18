import React from 'react';
import { Platform } from 'react-native';

// A minimal SafeAreaProvider shim for web to avoid DOM removeChild issues
const WebSafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }
  // when running in native (expo/ios/android) the real SafeAreaProvider is used
  const { SafeAreaProvider } = require('react-native-safe-area-context');
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};

export default WebSafeAreaProvider;
