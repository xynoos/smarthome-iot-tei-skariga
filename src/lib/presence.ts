// SmartHomeSkarigaApp/src/lib/presence.ts

export const PRESENCE_TOPIC = 'smarthome/device/presence';

export type PresenceState = 'online' | 'offline' | 'unknown';

export interface PresenceModel {
  state: PresenceState;
  lastSeen: number | null;
  lastPayload?: string | null;
  source?: 'mqtt' | 'lwt' | 'status';
  reason?: string;
}

export function presenceFromPayload(payload: string): { state: PresenceState; source: 'mqtt' | 'lwt' } {
  const lower = String(payload).toLowerCase().trim();

  // Accept a few common variants used by devices or broker retained messages
  if (lower === 'online' || lower === '1' || lower === 'true' || lower === 'connected') {
    return { state: 'online', source: 'mqtt' };
  }

  if (lower === 'offline' || lower === '0' || lower === 'false' || lower === 'disconnected') {
    return { state: 'offline', source: 'lwt' };
  }

  // Default to unknown but treat some other textual hints
  if (lower.includes('online')) return { state: 'online', source: 'mqtt' };
  if (lower.includes('offline') || lower.includes('disconnected')) return { state: 'offline', source: 'lwt' };

  return { state: 'unknown', source: 'mqtt' };
}

// Shorten timeout for presence evaluation so UI flips faster when device goes silent
const PRESENCE_TIMEOUT_MS = 20000; // 20 seconds

export function evaluateTimeout(p: PresenceModel): PresenceModel {
  if (p.state === 'offline') return p;
  if (!p.lastSeen) return p;
  
  const now = Date.now();
  const elapsed = now - p.lastSeen;
  
  if (elapsed > PRESENCE_TIMEOUT_MS && p.state === 'online') {
    return {
      ...p,
      state: 'offline',
      reason: `Timeout: no message for ${Math.floor(elapsed / 1000)}s`,
      source: 'status'
    };
  }
  
  return p;
}
