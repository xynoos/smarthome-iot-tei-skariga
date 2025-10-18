/**
 * SmartHome Skariga App
 * React Native Application for IoT Smart Home Control
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import WebSafeAreaProvider from './src/components/WebSafeSafeAreaProvider';
import { AuthProvider } from './src/context/AuthContext';
import { MqttProvider } from './src/context/MqttContext';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';
import AppCenter from 'appcenter';
import Analytics from 'appcenter-analytics';
import Crashes from 'appcenter-crashes';

function App() {
  useEffect(() => {
    // Track app start
    try {
      Analytics.trackEvent('App Started');
    } catch (e) {
      // swallow - analytics may not be available in dev
      // console.warn('AppCenter Analytics unavailable', e);
    }

    // Log if the app crashed in the last session
    Crashes.hasCrashedInLastSession().then(didCrash => {
      if (didCrash) {
        console.log('App crashed in the last session.');
      }
    }).catch(() => {});
  }, []);

  return (
    <WebSafeAreaProvider>
      <AuthProvider>
        <MqttProvider>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          <AppNavigator />
        </MqttProvider>
      </AuthProvider>
    </WebSafeAreaProvider>
  );
}

export default App;
