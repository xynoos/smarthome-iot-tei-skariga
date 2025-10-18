// SmartHomeSkarigaApp/src/context/MqttContext.tsx

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { toBinary, ensureBufferGlobal } from '../lib/bufferShim';
import { PRESENCE_TOPIC } from '../lib/presence';

const MQTT_BROKER_URL = 'wss://mqtt.tecnoverse.app:8081';

type MqttCtx = {
  client: MqttClient | null;
  connected: boolean;
  reconnecting: boolean;
  publish: (topic: string, payload: string | Buffer) => void;
  subscribe: (topics: string | string[], cb?: (err?: Error) => void) => void;
  onMessage: (handler: (topic: string, payload: Buffer) => void) => () => void;
  presence: {
    state: 'online' | 'offline' | 'unknown';
    lastSeen: number | null;
    source?: 'mqtt' | 'lwt' | 'status';
    reason?: string;
  };
};

const Context = createContext<MqttCtx | null>(null);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);
  const handlerRef = useRef<((topic: string, payload: Buffer) => void)[]>([]);
  // track last status message to derive presence when explicit presence topic is not used
  const lastStatusSeenRef = useRef<number | null>(null);
  const [presenceState, setPresenceState] = useState<{
    state: 'online' | 'offline' | 'unknown';
    lastSeen: number | null;
    source?: 'mqtt' | 'lwt' | 'status';
    reason?: string;
  }>({ state: 'unknown', lastSeen: null });

  const pendingRef = useRef<Array<{ topic: string; payload: string | Buffer }>>([]);
  const pendingSubs = useRef<Array<{ topics: string | string[]; cb?: (err?: Error) => void }>>([]);

  useEffect(() => {
    // ensure Buffer polyfill for environments that expect Buffer
    try { ensureBufferGlobal(); } catch {}
    if (!MQTT_BROKER_URL) {
      console.info('[mqtt] MQTT_BROKER_URL not set - skipping MQTT connect');
      return;
    }

    let triedFallback = false;
    let currentUrl = MQTT_BROKER_URL;

    const connectClient = (url: string) => {
      console.info('[mqtt] connecting to', url);
      return mqtt.connect(url, {
        reconnectPeriod: 2000,
        clean: true,
        connectTimeout: 10000,
        queueQoSZero: true,
        resubscribe: true,
      });
    };

    const attachClient = (c: MqttClient) => {
      setClient(c);
      clientRef.current = c;

      const onConnect = () => {
        setConnected(true); 
        setReconnecting(false);
        const items = pendingRef.current.splice(0, pendingRef.current.length);
        for (const it of items) {
          try { c.publish(it.topic, it.payload); } catch {}
        }
        const subs = pendingSubs.current.splice(0, pendingSubs.current.length);
        for (const s of subs) {
          try {
            c.subscribe(s.topics, (err) => s.cb?.(err || undefined));
          } catch (e: unknown) {
            s.cb?.(e instanceof Error ? e : new Error(String(e)));
          }
        }
        // Also auto-subscribe to common presence/status wildcard topics so we
        // receive retained and realtime messages for any device under 'smarthome'
        try {
          c.subscribe(['smarthome/+/status', 'smarthome/+/presence'], (err) => {
            if (err) console.warn('[mqtt] subscribe wildcard failed', err);
          });
        } catch (e) {
          console.warn('[mqtt] subscribe wildcard exception', e);
        }
      };

      const onReconnect = () => { setReconnecting(true); setConnected(false); };
      const onClose = () => { setConnected(false); };
      const normalizePayload = (p: any) => {
        try {
          if (!p) return { toString: () => '' };
          if (typeof p === 'string') return { toString: () => p };
          if (p instanceof Uint8Array || p instanceof ArrayBuffer || (p && typeof p.readUInt8 === 'function')) {
            const bytes = p instanceof ArrayBuffer ? new Uint8Array(p) : (p instanceof Uint8Array ? p : new Uint8Array(p));
            return { toString: () => (typeof TextDecoder !== 'undefined' ? new TextDecoder().decode(bytes) : String.fromCharCode(...Array.from(bytes))), bytes };
          }
          if (typeof p.toString === 'function') return p;
          return { toString: () => String(p) };
        } catch {
          return { toString: () => '' };
        }
      };

      const onMessage = (topic: string, payload: Buffer) => { 
        // notify regular subscribers with normalized payload (has toString())
        const norm = normalizePayload(payload);
        // run handlers asynchronously to avoid setState during mqtt internal processing
        const handlers = handlerRef.current.slice();
        setTimeout(() => { handlers.forEach(fn => { try { fn(topic, norm as any); } catch {} }); }, 0);

        // if we receive a device status topic (smarthome/<id>/status) treat that as presence signal
        try {
          const m = topic.match(/^smarthome\/[^/]+\/status$/);
          if (m) {
            lastStatusSeenRef.current = Date.now();
            // update derived presence state
            setPresenceState({ state: 'online', lastSeen: lastStatusSeenRef.current, source: 'status' });
            // also emit a synthetic presence message so existing screens listening to PRESENCE_TOPIC work
            const presenceBuf = toBinary('online');
            const wrapped = { toString: () => (typeof TextDecoder !== 'undefined' ? new TextDecoder().decode(presenceBuf) : ''), bytes: presenceBuf };
            const handlers2 = handlerRef.current.slice();
            setTimeout(() => { handlers2.forEach(fn => { try { fn(PRESENCE_TOPIC, wrapped as any); } catch {} }); }, 0);
          }
        } catch {
          // ignore detection errors
        }
      };

      c.on('connect', onConnect);
      c.on('reconnect', onReconnect);
      c.on('close', onClose);
      c.on('message', onMessage);
      c.on('error', (err: unknown) => {
        const msg = err && typeof err === 'object' && 'message' in err ? (err as Error).message : String(err);
        console.warn('[mqtt] connection issue:', msg);
        setConnected(false);

        if (!triedFallback && currentUrl.startsWith('wss://')) {
          triedFallback = true;
          const fallback = currentUrl.replace(/^wss:/, 'ws:');
          console.info('[mqtt] attempting fallback to', fallback);
          try { c.end(true); } catch {}
          try {
            currentUrl = fallback;
            const nc = connectClient(fallback);
            attachClient(nc);
          } catch (e) {
            console.warn('[mqtt] fallback connect failed', e);
          }
        }
      });
    };

    try {
      const c = connectClient(currentUrl);
      attachClient(c);
    } catch (e) {
      console.warn('[mqtt] initial connect failed', e);
    }

    // presence timeout removed: presence will be derived only from explicit messages (status/presence) and LWT
    const presenceChecker: any = null;

    return () => {
  try { if (clientRef.current) clientRef.current.end(true); } catch {};
  setClient(null);
  clientRef.current = null;
  handlerRef.current = [];
  if (presenceChecker) clearInterval(presenceChecker);
    };
  }, []);

  // no-op effect to ensure presenceState is available and stable; keep provider stable
  useEffect(() => {
    // presenceState is part of the provider value via state; nothing else needed here
  }, [presenceState]);

  const publish = useCallback((topic: string, payload: string | Buffer) => {
    const c = clientRef.current;
    if (!c) { pendingRef.current.push({ topic, payload }); return; }
    try { c.publish(topic, payload); } catch {}
  }, []);

  const subscribe = useCallback((topics: string | string[], cb?: (err?: Error) => void) => {
    const c = clientRef.current;
    if (!c) {
      pendingSubs.current.push({ topics, cb });
      return;
    }
    try { c.subscribe(topics, (err) => cb?.(err || undefined)); } catch (e: unknown) { cb?.(e instanceof Error ? e : new Error(String(e))); }
  }, []);

  const onMessage = useCallback((handler: (topic: string, payload: Buffer) => void) => {
    handlerRef.current.push(handler);
    return () => { handlerRef.current = handlerRef.current.filter(h => h !== handler); };
  }, []);

  const value = useMemo(() => ({ client, connected, reconnecting, publish, subscribe, onMessage }), [client, connected, reconnecting, publish, subscribe, onMessage]);
  const valueWithPresence = useMemo(() => ({ ...value, presence: presenceState }), [value, presenceState]);
  return <Context.Provider value={valueWithPresence}>{children}</Context.Provider>;
}

export function useMqtt() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useMqtt must be used within MqttProvider');
  return ctx;
}
