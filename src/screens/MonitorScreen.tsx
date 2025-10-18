// SmartHomeSkarigaApp/src/screens/MonitorScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useMqtt } from '../context/MqttContext';
import { PRESENCE_TOPIC } from '../lib/presence';

interface DeviceStatusRec {
  topic: string;
  lastPayload: string | null;
  lastUpdated: number | null;
  retained?: boolean;
}

const STATUS_TOPICS = [
  'smarthome/lampu1/status',
  'smarthome/lampu2/status',
  'smarthome/stopkontak1/status',
  'smarthome/stopkontak2/status',
];

export default function MonitorScreen() {
  const { client, connected, presence, onMessage, subscribe } = useMqtt();
  const [statuses, setStatuses] = useState<Record<string, DeviceStatusRec>>(() => {
    const base: Record<string, DeviceStatusRec> = {};
    STATUS_TOPICS.forEach((t) => {
      base[t] = { topic: t, lastPayload: null, lastUpdated: null };
    });
    return base;
  });
  const [messages, setMessages] = useState<Array<{ topic: string; payload: string; ts: number; retained: boolean }>>([]);

  const summary = {
    lampu1: statuses['smarthome/lampu1/status']?.lastPayload || 'UNKNOWN',
    lampu2: statuses['smarthome/lampu2/status']?.lastPayload || 'UNKNOWN',
    stopkontak1: statuses['smarthome/stopkontak1/status']?.lastPayload || 'UNKNOWN',
    stopkontak2: statuses['smarthome/stopkontak2/status']?.lastPayload || 'UNKNOWN',
  };

  useEffect(() => {
    if (!client) return;

    subscribe([...STATUS_TOPICS, PRESENCE_TOPIC]);

    const unsubscribe = onMessage((topic, payloadBuf) => {
      const payload = payloadBuf.toString();
      const now = Date.now();

      if (STATUS_TOPICS.includes(topic)) {
        setStatuses((prev) => {
          const next = { ...prev };
          next[topic] = { topic, lastPayload: payload, lastUpdated: now, retained: false };
          return next;
        });
      }

      setMessages((m) => {
        const list = [...m, { topic, payload, ts: now, retained: false }];
        if (list.length > 150) list.shift();
        return list;
      });
    });

    return () => unsubscribe();
  }, [client, onMessage, subscribe]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ESP32 Monitor</Text>
          <Text style={styles.subtitle}>Memantau konektivitas dan status perangkat</Text>
        </View>

        <View style={styles.presenceCard}>
          <Text style={styles.cardTitle}>Konektivitas Perangkat</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dashboard → Broker:</Text>
            <Text style={[styles.infoValue, connected ? styles.online : styles.offline]}>
              {connected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Presence ESP32:</Text>
            <Text
              style={[
                styles.infoValue,
                presence.state === 'online'
                  ? styles.online
                  : presence.state === 'offline'
                  ? styles.offline
                  : styles.unknown,
              ]}
            >
              {presence.state.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Seen:</Text>
            <Text style={styles.infoValue}>
              {presence.lastSeen ? new Date(presence.lastSeen).toLocaleTimeString() : '—'}
            </Text>
          </View>
          {presence.source && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Source:</Text>
              <Text style={styles.infoValue}>{presence.source}</Text>
            </View>
          )}
          {presence.reason && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reason:</Text>
              <Text style={[styles.infoValue, styles.offline]}>{presence.reason}</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Ringkasan Status Channel</Text>
          <View style={styles.summaryGrid}>
            {Object.entries(summary).map(([k, v]) => (
              <View key={k} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{k.toUpperCase()}</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    v === 'ON' ? styles.online : v === 'OFF' ? styles.offline : styles.unknown,
                  ]}
                >
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.messagesCard}>
          <Text style={styles.cardTitle}>Pesan Status Terbaru</Text>
          <View style={styles.messagesList}>
            {messages
              .slice(-50)
              .reverse()
              .map((m, idx) => (
                <View key={m.ts + '-' + idx} style={styles.messageItem}>
                  <Text style={styles.messageTime}>{new Date(m.ts).toLocaleTimeString()}</Text>
                  <Text style={styles.messageTopic} numberOfLines={1}>
                    {m.topic}
                  </Text>
                  <Text
                    style={[
                      styles.messagePayload,
                      m.payload === 'ON' ? styles.online : m.payload === 'OFF' ? styles.offline : {},
                    ]}
                  >
                    {m.payload}
                  </Text>
                </View>
              ))}
            {messages.length === 0 && (
              <Text style={styles.emptyText}>Belum ada pesan status diterima.</Text>
            )}
          </View>
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
  presenceCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  online: {
    color: '#10B981',
  },
  offline: {
    color: '#EF4444',
  },
  unknown: {
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  messagesCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
  },
  messagesList: {
    maxHeight: 400,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    gap: 8,
  },
  messageTime: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'monospace',
    width: 80,
  },
  messageTopic: {
    fontSize: 10,
    color: '#FCD34D',
    fontFamily: 'monospace',
    flex: 1,
  },
  messagePayload: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D1D5DB',
    width: 60,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
