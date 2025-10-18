// SmartHomeSkarigaApp/src/navigation/AppNavigator.tsx

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ControlScreen from '../screens/ControlScreen';
import VoiceControlScreen from '../screens/VoiceControlScreen';
import MonitorScreen from '../screens/MonitorScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

function AuthenticatedDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#FCD34D',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#1F2937',
        },
        drawerActiveTintColor: '#FCD34D',
        drawerInactiveTintColor: '#9CA3AF',
        drawerLabelStyle: {
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerLabel: 'Home',
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="Control"
        component={ControlScreen}
        options={{
          drawerLabel: 'Control',
          title: 'Device Control',
        }}
      />
      <Drawer.Screen
        name="VoiceControl"
        component={VoiceControlScreen}
        options={{
          drawerLabel: 'Voice Control',
          title: 'Voice Control',
        }}
      />
      <Drawer.Screen
        name="Monitor"
        component={MonitorScreen}
        options={{
          drawerLabel: 'Monitor',
          title: 'Monitor',
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FCD34D" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AuthenticatedDrawer /> : <LoginScreen />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
