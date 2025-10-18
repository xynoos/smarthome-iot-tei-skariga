// SmartHomeSkarigaApp/src/screens/ControlScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useMqtt } from '../context/MqttContext';

interface Device {
  id: string;
  name: string;
}

type DeviceStatus = 'ON' | 'OFF' | '...';
type Command = 'ON' | 'OFF';

const devices: Device[] = [
  { id: 'lampu1', name: 'Lampu Ruang Tamu' },
  { id: 'lampu2', name: 'Lampu Teras' },
  { id: 'stopkontak1', name: 'Stop Kontak TV' },
  { id: 'stopkontak2', name: 'Charger Pojok' },
];

export default function ControlScreen() {
  const { client, connected, onMessage, subscribe, publish, presence } = useMqtt();
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>({
    lampu1: '...',
    lampu2: '...',
    stopkontak1: '...',
    stopkontak2: '...',
  });
  const [commandWarnings, setCommandWarnings] = useState<Record<string, string>>({});
  const pendingPublishRef = React.useRef<Record<string, number | null>>({});

  useEffect(() => {
    if (!client) return;

    subscribe(['smarthome/+/status']);

    const unsubscribe = onMessage((topic, message) => {
      const payload = message.toString();

      if (topic.startsWith('smarthome/') && topic.endsWith('/status')) {
        const deviceId = topic.split('/')[1];
        const newStatus = payload as DeviceStatus;
        setDeviceStatuses((prev) => ({ ...prev, [deviceId]: newStatus }));
      }
    });

    return () => unsubscribe();
  }, [client, onMessage, subscribe]);

  const handleControl = (deviceId: string, command: Command) => {
    if (!client || !connected) {
      setCommandWarnings((w) => ({ ...w, [deviceId]: 'Tidak terkoneksi ke broker' }));
      setTimeout(() => {
        setCommandWarnings((w) => {
          const copy = { ...w };
          delete copy[deviceId];
          return copy;
        });
      }, 3000);
      return;
    }

    if (presence.state !== 'online') {
      setCommandWarnings((w) => ({ ...w, [deviceId]: 'Device offline' }));
      setTimeout(() => {
        setCommandWarnings((w) => {
          const copy = { ...w };
          delete copy[deviceId];
          return copy;
        });
      }, 3000);
      return;
    }

    if (deviceStatuses[deviceId] === '...') {
      setCommandWarnings((w) => ({ ...w, [deviceId]: 'Status belum diterima' }));
      setTimeout(() => {
        setCommandWarnings((w) => {
          const copy = { ...w };
          delete copy[deviceId];
          return copy;
        });
      }, 3000);
      return;
    }

    const topic = `smarthome/${deviceId}/perintah`;
    // Optimistic UI: update status immediately for smoother UX
    setDeviceStatuses((prev) => ({ ...prev, [deviceId]: command }));

    // Debounce/pending: if user toggles repeatedly, only send after 100ms
    if (pendingPublishRef.current[deviceId]) {
      clearTimeout(pendingPublishRef.current[deviceId]!);
    }
    const timer = setTimeout(() => {
      try {
        publish(topic, command);
      } catch {
        // best-effort: show warning and request status refresh later
        setCommandWarnings((w) => ({ ...w, [deviceId]: 'Gagal mengirim perintah' }));
        setTimeout(() => {
          setCommandWarnings((w) => {
            const copy = { ...w };
            delete copy[deviceId];
            return copy;
          });
        }, 3000);
      } finally {
        pendingPublishRef.current[deviceId] = null;
      }
    }, 100);
    pendingPublishRef.current[deviceId] = timer as unknown as number;
  };

  const renderDeviceCard = (device: Device) => {
    const status = deviceStatuses[device.id];
    const warning = commandWarnings[device.id];
    const isOn = status === 'ON';

    return (
      <View key={device.id} style={[styles.deviceCard, isOn && styles.deviceCardOn]}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <View style={[styles.statusBadge, isOn ? styles.statusOn : styles.statusOff]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceId}>ID: {device.id}</Text>
          {status !== '...' && (
            <Text style={[styles.deviceState, isOn ? styles.stateOn : styles.stateOff]}>
              {isOn ? 'Aktif' : 'Mati'}
            </Text>
          )}
        </View>

        {warning && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        )}

        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Kontrol</Text>
          <Switch
            value={isOn}
            onValueChange={(value) => handleControl(device.id, value ? 'ON' : 'OFF')}
            disabled={!connected || presence.state !== 'online' || status === '...'}
            trackColor={{ false: '#374151', true: '#10B981' }}
            thumbColor={isOn ? '#FFF' : '#D1D5DB'}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ESP32 Relay Control</Text>
          <Text style={styles.subtitle}>
            Pengendalian realtime 4 kanal relay melalui MQTT
          </Text>
        </View>

        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Broker:</Text>
            <View style={[styles.badge, connected ? styles.badgeOnline : styles.badgeOffline]}>
              <Text style={styles.badgeText}>{connected ? 'Connected' : 'Disconnected'}</Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Device:</Text>
            <View
              style={[
                styles.badge,
                presence.state === 'online'
                  ? styles.badgeOnline
                  : presence.state === 'offline'
                  ? styles.badgeOffline
                  : styles.badgeUnknown,
              ]}
            >
              <Text style={styles.badgeText}>{presence.state.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {!connected && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>Tidak terkoneksi ke broker. Menunggu koneksi...</Text>
            <ActivityIndicator color="#FCD34D" />
          </View>
        )}

        <View style={styles.devicesGrid}>
          {devices.map((device) => renderDeviceCard(device))}
        </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FCD34D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statusBar: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 12,
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgeUnknown: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.4)',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  alertContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertText: {
    fontSize: 12,
    color: '#FCD34D',
    flex: 1,
  },
  devicesGrid: {
    gap: 16,
  },
  deviceCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
  },
  deviceCardOn: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusOff: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceId: {
    fontSize: 11,
    color: '#6B7280',
  },
  deviceState: {
    fontSize: 11,
    fontWeight: '600',
  },
  stateOn: {
    color: '#10B981',
  },
  stateOff: {
    color: '#EF4444',
  },
  warningContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 10,
    color: '#FCA5A5',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
