// Single clean voice adapter implementation
import { Platform } from 'react-native';

// A small, single-file voice adapter that provides a stable API
// for both web (Web Speech API) and native (@react-native-voice/voice).
// The adapter is intentionally defensive: it always returns an object
// with the same shape so callers never receive `null` or crash when
// assigning event handlers or calling start/stop.

type Handler = (e?: any) => void;

export type VoiceAdapter = {
  start: (locale?: string) => Promise<boolean> | boolean | void;
  stop: () => Promise<void> | void;
  destroy: () => Promise<void> | void;
  removeAllListeners: () => void;
  /**
   * Mengatur mode continuous.
   * Di Web: Mengatur properti 'continuous' pada SpeechRecognition.
   * Di Native: Akan otomatis me-restart 'start()' saat 'onSpeechEnd' terpicu.
   */
  setContinuous: (continuous: boolean) => void;
  // event handler slots that callers can assign
  onSpeechResults?: Handler | null;
  onSpeechPartialResults?: Handler | null; // Ditambahkan untuk "langsung detect"
  onSpeechError?: Handler | null;
  onSpeechEnd?: Handler | null;
  // alias used by some screens
  startSpeech?: (locale?: string) => Promise<boolean> | boolean | void;
};

let instance: VoiceAdapter | null = null;

function makeWebAdapter(): VoiceAdapter {
  const SpeechRecognition: any = (global as any).SpeechRecognition || (global as any).webkitSpeechRecognition;
  let rec: any = null;
  let isContinuous = false;

  const ensure = () => {
    if (rec || !SpeechRecognition) return;
    try {
      rec = new SpeechRecognition();
      rec.lang = 'id-ID';
      rec.interimResults = false; // Akan di-set true jika continuous
      rec.continuous = false; // Akan di-set true jika continuous
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Kirim hasil partial jika ada handler
        if (interimTranscript && adapter.onSpeechPartialResults) {
          adapter.onSpeechPartialResults({ value: [interimTranscript.trim()] });
        }

        // Kirim hasil final
        if (finalTranscript && adapter.onSpeechResults) {
          adapter.onSpeechResults({ value: [finalTranscript.trim()] });
        }
      };
      rec.onerror = (ev: any) => adapter.onSpeechError && adapter.onSpeechError(ev);
      rec.onend = () => adapter.onSpeechEnd && adapter.onSpeechEnd();
    } catch {
      // fail silently; adapter will remain a no-op
      rec = null;
    }
  };

  const adapter: VoiceAdapter = {
    onSpeechResults: null,
    onSpeechPartialResults: null,
    onSpeechError: null,
    onSpeechEnd: null,
    setContinuous: (continuous: boolean) => {
      isContinuous = continuous;
      ensure(); // Pastikan rec ada
      if (rec) {
        // "Langsung detect" membutuhkan interimResults dan continuous
        rec.interimResults = continuous;
        rec.continuous = continuous;
      }
    },
    start: (locale?: string) => {
      ensure();
      try {
        if (rec) {
          rec.lang = locale || 'id-ID';
          rec.start();
        }
      } catch {
        // ignore errors from browser API
      }
    },
    stop: () => {
      try {
        rec && rec.stop();
      } catch {}
    },
    destroy: () => {
      try {
        rec = null;
      } catch {}
    },
    removeAllListeners: () => {
      try {
        if (rec) {
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
        }
        // Hapus handler internal
        adapter.onSpeechResults = null;
        adapter.onSpeechPartialResults = null;
        adapter.onSpeechError = null;
        adapter.onSpeechEnd = null;
      } catch {}
    },
  };

  adapter.startSpeech = adapter.start;
  return adapter;
}

function makeNativeAdapter(): VoiceAdapter {
  // State untuk continuous mode
  let isContinuous = false;
  let currentLocale: string | undefined = 'id-ID';
  let userOnSpeechEnd: Handler | null = null;

  // Provide a stable stub immediately, then try to wire in platform
  // implementation asynchronously so references stay stable.
  const stub: VoiceAdapter = {
    onSpeechResults: null,
    onSpeechPartialResults: null,
    onSpeechError: null,
    onSpeechEnd: null,
    setContinuous: (continuous: boolean) => {
      isContinuous = continuous;
    },
    start: () => {},
    stop: () => {},
    destroy: () => {},
    removeAllListeners: () => {},
  };

  // queue of pending starts invoked before native is ready
  // ** PERBAIKAN: Menghapus 'timer' **
  const pendingStarts: Array<{ args: any[]; resolve: (v?: boolean) => void }> = [];

  // replace start with a queuing implementation until the native module is ready
  stub.start = (...args: any[]) => {
    return new Promise<boolean>((resolve) => {
      // ** PERBAIKAN: Menghapus setTimeout. **
      // Cukup antrekan permintaan. Ini akan di-resolve saat modul
      // dimuat atau gagal dimuat, tanpa batas waktu.
      pendingStarts.push({ args, resolve });
    });
  };
  stub.startSpeech = stub.start;

  // lazy-load native module; if available, copy methods onto stub
  (async () => {
    let native: any = null;
    try {
      const mod = await import('@react-native-voice/voice');
      native = (mod && (mod as any).default) || mod;
    } catch {
      // Gagal import (misal: library tidak ter-install)
    }

    if (!native) {
      // if native module not present, resolve pending starts with false
      while (pendingStarts.length) {
        const p = pendingStarts.shift()!;
        // ** PERBAIKAN: Menghapus clearTimeout **
        try {
          stub.onSpeechError && stub.onSpeechError({ error: { message: 'Voice engine tidak dapat dimuat' } });
        } catch {}
        p.resolve(false);
      }
      return;
    }

    // --- Modul Native Berhasil Dimuat ---

    // Wrapper untuk onSpeechEnd agar bisa handle continuous mode
    const internalOnSpeechEnd = (e?: any) => {
      // Panggil handler asli dari user
      userOnSpeechEnd && userOnSpeechEnd(e);
      // Jika continuous, mulai lagi
      if (isContinuous) {
        try {
          // Gunakan locale terakhir yang dipakai
          stub.start(currentLocale);
        } catch (err) {
          if (typeof console?.debug === 'function') console.debug('Gagal auto-restart voice (suppressed)', err);
        }
      }
    };

    // copy runtime methods so callers keep stable references (only if present)
    try {
      if (typeof native.start === 'function') {
        // replace stub.start with a direct forwarder
        const callNativeStart = async (...a: any[]) => {
          currentLocale = a[0] || 'id-ID'; // Simpan locale untuk continuous
          let attempt = 0;
          while (attempt < 2) {
            try {
              const res = native.start(...a);
              if (res && typeof (res as any).then === 'function') {
                await res;
              }
              return true;
            } catch {
              attempt += 1;
              if (attempt >= 2) break;
              await new Promise((r) => setTimeout(r, 150));
            }
          }
          // notify listeners about the failure
          try {
            stub.onSpeechError && stub.onSpeechError({ error: { message: 'Gagal memulai voice engine' } });
          } catch {}
          return false;
        };

        stub.start = async (...args: any[]) => callNativeStart(...args);
        stub.startSpeech = stub.start; // Update alias juga

        // flush queued starts
        while (pendingStarts.length) {
          const p = pendingStarts.shift()!;
          // ** PERBAIKAN: Menghapus clearTimeout **
          callNativeStart(...p.args).then((ok) => p.resolve(Boolean(ok)));
        }
      }
    } catch {}
    try {
      if (typeof native.stop === 'function') {
        stub.stop = async (...args: any[]) => {
          try {
            const res = native.stop(...args);
            if (res && typeof (res as any).then === 'function') return await res;
            return res;
          } catch {
            if (typeof console?.debug === 'function') console.debug('native.stop failed (suppressed)');
            // jangan throw error saat stop
          }
        };
      }
    } catch {}
    try {
      if (typeof native.destroy === 'function') {
        stub.destroy = async (...args: any[]) => {
          try {
            const res = native.destroy(...args);
            if (res && typeof (res as any).then === 'function') return await res;
            return res;
          } catch {
            if (typeof console?.debug === 'function') console.debug('native.destroy failed (suppressed)');
            // don't throw during cleanup
          }
        };
      }
    } catch {}
    try {
      if (typeof native.removeAllListeners === 'function') {
        stub.removeAllListeners = () => {
          try {
            (native.removeAllListeners as Function)();
            // Hapus juga handler manual
            userOnSpeechEnd = null;
            native.onSpeechResults = null;
            native.onSpeechPartialResults = null;
            native.onSpeechError = null;
            native.onSpeechEnd = null;
          } catch {
            if (typeof console?.debug === 'function') console.debug('native.removeAllListeners failed (suppressed)');
          }
        };
      }
    } catch {}

    // wire event setters/getters so assignment like `adapter.onSpeechResults = fn`
    // attaches to the underlying native module
    Object.defineProperty(stub, 'onSpeechResults', {
      configurable: true,
      enumerable: true,
      set(fn: any) {
        try {
          if (native) native.onSpeechResults = fn;
        } catch {}
      },
      get() {
        try {
          return native && native.onSpeechResults;
        } catch {
          return null;
        }
      },
    });

    // ** BARU: Tambahkan onSpeechPartialResults **
    Object.defineProperty(stub, 'onSpeechPartialResults', {
      configurable: true,
      enumerable: true,
      set(fn: any) {
        try {
          if (native) native.onSpeechPartialResults = fn;
        } catch {}
      },
      get() {
        try {
          return native && native.onSpeechPartialResults;
        } catch {
          return null;
        }
      },
    });

    Object.defineProperty(stub, 'onSpeechError', {
      configurable: true,
      enumerable: true,
      set(fn: any) {
        try {
          if (native) native.onSpeechError = fn;
        } catch {}
      },
      get() {
        try {
          return native && native.onSpeechError;
        } catch {
          return null;
        }
      },
    });

    // ** PERBAIKAN: Gunakan wrapper untuk onSpeechEnd **
    Object.defineProperty(stub, 'onSpeechEnd', {
      configurable: true,
      enumerable: true,
      set(fn: any) {
        // Simpan referensi ke fungsi asli user
        userOnSpeechEnd = fn;
        try {
          // Attach wrapper internal kita ke native module
          if (native) native.onSpeechEnd = internalOnSpeechEnd;
        } catch {}
      },
      get() {
        // Kembalikan fungsi asli user saat di-get
        return userOnSpeechEnd;
      },
    });
  })();

  return stub;
}
export function getVoiceAdapter(): VoiceAdapter {
  if (instance) return instance;
  instance = Platform.OS === 'web' ? makeWebAdapter() : makeNativeAdapter();
  return instance;
}