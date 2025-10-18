import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMqtt } from '../context/MqttContext';
import { PRESENCE_TOPIC } from '../lib/presence';
import env from '../config/env';

export default function DebugOverlay() {
  const { client, connected, onMessage, subscribe } = useMqtt();
  const [messages, setMessages] = useState<Array<{ topic: string; payload: string; ts: number }>>([]);

  useEffect(() => {
    if (!client) return;
    subscribe(PRESENCE_TOPIC, undefined);
    const unsub = onMessage((topic, payload) => {
      const p = payload.toString();
      setMessages((m) => {
        const next = [{ topic, payload: p, ts: Date.now() }, ...m];
        return next.slice(0, 30);
      });
    });
    return () => unsub();
  }, [client, onMessage, subscribe]);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.box}>
        <Text style={styles.heading}>DEBUG</Text>
        <Text style={styles.line}>APPWRITE_ENDPOINT: {env.APPWRITE_ENDPOINT}</Text>
        <Text style={styles.line}>APPWRITE_PROJECT_ID: {env.APPWRITE_PROJECT_ID}</Text>
        <Text style={styles.line}>MQTT Broker: {env.MQTT_BROKER_URL}</Text>
        <Text style={styles.subheading}>Connected: {connected ? 'yes' : 'no'}</Text>
        <Text style={styles.subheading}>Latest presence messages:</Text>
        <ScrollView style={styles.msgList}>
          {messages.map((m) => (
            <Text key={m.ts + m.topic} style={styles.msgItem}>
              {new Date(m.ts).toLocaleTimeString()} · {m.topic} · {m.payload}
            </Text>
          ))}
          {messages.length === 0 && <Text style={styles.msgItem}>— none —</Text>}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 9999,
  },
  box: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: 8,
    borderRadius: 8,
    width: 340,
    maxHeight: 360,
    borderWidth: 1,
    borderColor: '#374151',
  },
  heading: { color: '#FCD34D', fontWeight: '700', marginBottom: 6 },
  subheading: { color: '#D1D5DB', fontSize: 12, marginTop: 6 },
  line: { color: '#9CA3AF', fontSize: 12 },
  msgList: { marginTop: 6, maxHeight: 220 },
  msgItem: { color: '#D1D5DB', fontSize: 12, marginBottom: 4 },
});
