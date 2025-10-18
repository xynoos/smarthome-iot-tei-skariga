// Minimal Buffer shim / helper for converting strings to Uint8Array across platforms
export function toBinary(input: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  // TextEncoder is available in modern RN and browsers
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(input);
  }
  // fallback: simple char code conversion
  const arr = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) arr[i] = Math.min(255, input.charCodeAt(i));
  return arr;
}

// Optionally expose a global Buffer-like object for libraries expecting Buffer
export function ensureBufferGlobal() {
  if (typeof (global as any).Buffer === 'undefined') {
    try {
      // Minimal Buffer polyfill using Uint8Array
      (global as any).Buffer = {
        from: (v: any) => toBinary(v),
      };
    } catch {
      // ignore
    }
  }
}
