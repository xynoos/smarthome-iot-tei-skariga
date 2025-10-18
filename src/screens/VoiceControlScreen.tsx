// SmartHomeSkarigaApp/src/screens/VoiceControlScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  Switch, // <-- Ditambahkan
} from 'react-native';
import { useMqtt } from '../context/MqttContext';
import { getVoiceAdapter } from '../lib/voiceAdapter'; // <-- Pastikan ini mengarah ke file adapter yang baru
import { PRESENCE_TOPIC, presenceFromPayload } from '../lib/presence';

type Command = 'ON' | 'OFF';
type LogEntry = { ts: number; text: string; type: 'info' | 'cmd' | 'warn' | 'err' };

const deviceAliases: Record<string, string[]> = {
  lampu1: ['lampu 1', 'lampu satu', 'lampu ruang tamu', 'lampu tamu', 'lampu depan dalam'],
  lampu2: ['lampu 2', 'lampu dua', 'lampu teras', 'lampu depan luar', 'lampu teras depan'],
  stopkontak1: ['stop kontak 1', 'stopkontak 1', 'stop kontak satu', 'stopkontak satu', 'colokan tv', 'stop kontak tv'],
  stopkontak2: ['stop kontak 2', 'stopkontak 2', 'stop kontak dua', 'stopkontak dua', 'colokan charger', 'charger pojok'],
};

const prettyName: Record<string, string> = {
  lampu1: 'Lampu Ruang Tamu',
  lampu2: 'Lampu Teras',
  stopkontak1: 'Stop Kontak TV',
  stopkontak2: 'Charger Pojok',
};

export default function VoiceControlScreen() {
  const { client, connected, presence, onMessage, subscribe, publish } = useMqtt();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState(''); // <-- Ditambahkan untuk real-time feedback
  const [isContinuous, setIsContinuous] = useState(false); // <-- Ditambahkan untuk mode berkelanjutan
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Gunakan satu instance voice adapter yang stabil
  const voice = getVoiceAdapter();

  // Efek untuk mengkonfigurasi mode continuous pada adapter
  useEffect(() => {
    voice.setContinuous(isContinuous);
  }, [voice, isContinuous]);


  useEffect(() => {
    if (!client) return;
    subscribe(PRESENCE_TOPIC);
    const unsubscribe = onMessage((topic, msg) => {
      if (topic === PRESENCE_TOPIC) {
        const payload = msg.toString();
        const meta = presenceFromPayload(payload);
        setLogs((l) => [...l, { ts: Date.now(), text: `Presence: ${meta.state} (${meta.source})`, type: 'info' }]);
      }
    });
    if (connected) {
      setLogs((l) => [...l, { ts: Date.now(), text: 'Terhubung ke broker MQTT', type: 'info' }]);
    }
    return () => unsubscribe();
  }, [client, onMessage, subscribe, connected]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Izin Mikrofon',
            message: 'Aplikasi memerlukan akses ke mikrofon untuk voice control',
            buttonPositive: 'OK',
            buttonNegative: 'Batal',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startListening = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin mikrofon untuk voice control');
      return;
    }

    try {
      setTranscript('');
      setPartialTranscript(''); // <-- Reset partial transcript juga
      const ok = await (voice.start as any)('id-ID');
      if (ok) {
        setListening(true);
      } else {
        setListening(false);
        Alert.alert('Voice Error', 'Voice engine tidak tersedia saat ini.');
      }
    } catch (err: any) {
      console.error('Voice start failed', err);
      setListening(false);
      Alert.alert('Voice Error', err?.message || 'Tidak dapat memulai voice input.');
    }
  };

  const stopListening = async () => {
    try {
      await (voice.stop as any)();
      setListening(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Voice Error', err?.message || 'Gagal menghentikan voice input.');
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const normalize = useCallback((s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, ''), []);

  const resolveDevice = useCallback((speech: string): string | null => {
    const n = normalize(speech);
    for (const id of Object.keys(deviceAliases)) {
      for (const alias of deviceAliases[id]) {
        if (n.includes(normalize(alias))) return id;
      }
    }
    const hasLampu = /\blampu\b/.test(n);
    const hasStop = /\bstop ?kontak\b|\bstopkontak\b|\bcolokan\b/.test(n);
    const num2 = /\b(dua|2)\b/.test(n);
    const num1 = /\b(satu|1)\b/.test(n);
    if (hasLampu || hasStop) {
      if (num2) return hasLampu ? 'lampu2' : 'stopkontak2';
      if (num1) return hasLampu ? 'lampu1' : 'stopkontak1';
    }
    return null;
  }, [normalize]);

  const parseCommand = useCallback((speech: string): { deviceId: string | null; cmd: Command | null } => {
    const n = normalize(speech);
    const ON_RE = /\b(nyalakan|nyala|hidup(?:kan)?|aktif(?:kan)?|on)\b/;
    const OFF_RE = /\b(matikan|mati|nonaktif(?:kan)?|padam|off)\b/;
    const idxOn = n.search(ON_RE);
    const idxOff = n.search(OFF_RE);

    let cmd: Command | null = null;
    if (idxOn !== -1 && idxOff !== -1) {
      cmd = idxOff <= idxOn ? 'OFF' : 'ON';
    } else if (idxOff !== -1) {
      cmd = 'OFF';
    } else if (idxOn !== -1) {
      cmd = 'ON';
    }

    const deviceId = resolveDevice(n);
    return { deviceId, cmd };
  }, [normalize, resolveDevice]);

  const publishCommand = React.useCallback(
    (deviceId: string, cmd: Command) => {
      try {
        publish(`smarthome/${deviceId}/perintah`, cmd);
        setLogs((l) => [...l, { ts: Date.now(), text: `${connected ? 'Kirim' : 'Antri (offline)'}: ${cmd} -> ${prettyName[deviceId]}`, type: 'cmd' }]);
      } catch (e: unknown) {
        const _err = e as { message?: string };
        const msg = _err?.message || String(e);
        setLogs((l) => [...l, { ts: Date.now(), text: `Gagal publish: ${msg}`, type: 'err' }]);
        if (/auth|credential|permission|unauthor/i.test(msg)) {
          Alert.alert('Gagal Kirim', 'Permintaan tidak diizinkan. Periksa pengaturan akun.');
        }
      }
    },
    [publish, connected]
  );

  const handleSpeechCommand = useCallback(
    (speech: string) => {
      const { deviceId, cmd } = parseCommand(speech);
      if (!cmd) {
        setLogs((l) => [...l, { ts: Date.now(), text: `Perintah tidak dikenali: "${speech}"`, type: 'warn' }]);
        return;
      }
      if (!deviceId) {
        setLogs((l) => [...l, { ts: Date.now(), text: `Perangkat tidak dikenali: "${speech}"`, type: 'warn' }]);
        return;
      }
      publishCommand(deviceId, cmd);
    },
    [parseCommand, publishCommand]
  );

  // --- HANDLER BARU UNTUK VOICE ADAPTER ---

  const onSpeechResults = useCallback((e: any) => {
    if (e?.value && e.value.length > 0) {
      const text = e.value[0];
      setTranscript(text);
      setPartialTranscript(''); // Hapus partial result jika sudah ada hasil final
      handleSpeechCommand(text);
    }
  }, [handleSpeechCommand]);

  // Handler untuk partial results (real-time feedback)
  const onSpeechPartialResults = useCallback((e: any) => {
    if (e?.value && e.value.length > 0) {
      setPartialTranscript(e.value[0]);
    }
  }, []);

  const onSpeechError = useCallback((e: any) => {
    console.error(e);
    setLogs((l) => [...l, { ts: Date.now(), text: `Speech error: ${e?.error?.message || 'Unknown'}`, type: 'err' }]);
    setListening(false); // Pastikan berhenti jika ada error
  }, []);

  // Logika onSpeechEnd diperbarui untuk menangani mode continuous
  const onSpeechEnd = useCallback(() => {
    // HANYA set `listening` ke false jika TIDAK dalam mode continuous
    if (!isContinuous) {
      setListening(false);
    }
    // Jika continuous, adapter akan otomatis me-restart, jadi biarkan `listening` tetap true
  }, [isContinuous]);

  // attach callbacks to adapter
  useEffect(() => {
    voice.onSpeechResults = onSpeechResults;
    voice.onSpeechPartialResults = onSpeechPartialResults; // <-- Daftarkan handler baru
    voice.onSpeechError = onSpeechError;
    voice.onSpeechEnd = onSpeechEnd;

    return () => {
      // Cleanup
      try {
        voice.destroy?.();
      } catch {
        // ignore
      }
    };
  }, [voice, onSpeechResults, onSpeechPartialResults, onSpeechError, onSpeechEnd]);

  const presenceBadge = () => {
      // ... (fungsi ini tidak perlu diubah)
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Control</Text>
          <Text style={styles.subtitle}>Kontrol perangkat dengan perintah suara bahasa Indonesia</Text>
        </View>

        <View style={styles.statusBar}>
            {/* ... (bagian ini tidak perlu diubah) */}
        </View>

        <View style={styles.voiceCard}>
          <Text style={styles.cardTitle}>Perintah Suara</Text>
          
          {/* Tombol Toggle Continuous */}
          <View style={styles.continuousToggle}>
            <Text style={styles.continuousLabel}>Mode Berkelanjutan</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={isContinuous ? '#FCD34D' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsContinuous}
              value={isContinuous}
              disabled={listening} // Nonaktifkan saat sedang mendengarkan
            />
          </View>

          <TouchableOpacity style={[styles.micButton, listening && styles.micButtonActive]} onPress={toggleListening}>
            <Text style={styles.micIcon}>{listening ? '🔴' : '🎤'}</Text>
          </TouchableOpacity>
          <Text style={styles.listeningText}>
            {listening ? (isContinuous ? 'Mendengarkan terus-menerus...' : 'Mendengarkan...') : 'Ketuk tombol untuk mulai'}
          </Text>
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>
              {/* Tampilkan partial atau final transcript */}
              {partialTranscript || transcript || 'Ucapkan perintah...'}
            </Text>
          </View>
          <Text style={styles.exampleText}>
            Contoh: "nyalakan lampu ruang tamu", "matikan charger pojok"
          </Text>
        </View>

        <View style={styles.logCard}>
            {/* ... (bagian ini tidak perlu diubah) */}
        </View>

        <View style={styles.aliasCard}>
            {/* ... (bagian ini tidak perlu diubah) */}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (semua style lama tetap di sini)
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
  voiceCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
    alignSelf: 'flex-start' // Rata kiri
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micButtonActive: {
    backgroundColor: '#10B981',
  },
  micIcon: {
    fontSize: 48,
  },
  listeningText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  transcriptBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 12,
    marginBottom: 12,
    minHeight: 60,
    justifyContent: 'center'
  },
  transcriptText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: 'monospace',
  },
  exampleText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
    marginBottom: 20,
  },
  logBox: {
    maxHeight: 200,
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  logTime: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginRight: 12,
  },
  logText: {
    fontSize: 11,
    color: '#D1D5DB',
    flex: 1,
  },
  logCmd: {
    color: '#10B981',
  },
  logErr: {
    color: '#EF4444',
  },
  logWarn: {
    color: '#FCD34D',
  },
  emptyText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  aliasCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 20,
  },
  aliasItem: {
    marginBottom: 12,
  },
  aliasName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  aliasText: {
    fontSize: 12,
    color: '#D1D5DB',
  },

  // --- STYLE BARU UNTUK TOGGLE ---
  continuousToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  continuousLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});