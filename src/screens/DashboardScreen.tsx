// SmartHomeSkarigaApp/src/screens/DashboardScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DrawerNavigationProp } from '@react-navigation/drawer';

type Props = {
  navigation: DrawerNavigationProp<any>;
};

export default function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>
            {user?.name || user?.email || 'User'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard Smart Home</Text>
          <Text style={styles.cardText}>
            Anda dapat mengakses berbagai fitur kontrol smart home melalui menu
            hamburger di pojok kiri atas.
          </Text>
        </View>

        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Control')}
          >
            <Text style={styles.menuIcon}>🎛️</Text>
            <Text style={styles.menuTitle}>Control</Text>
            <Text style={styles.menuDesc}>Toggle perangkat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('VoiceControl')}
          >
            <Text style={styles.menuIcon}>🎤</Text>
            <Text style={styles.menuTitle}>Voice Control</Text>
            <Text style={styles.menuDesc}>Kontrol suara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Monitor')}
          >
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuTitle}>Monitor</Text>
            <Text style={styles.menuDesc}>Status perangkat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FCD34D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  menuItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
