/**
 * Global polyfills for Expo compatibility
 */

// Polyfill for 'require' in global scope
if (typeof global !== 'undefined' && !global.require) {
  global.require = require;
}

// Ensure process is defined
if (typeof global !== 'undefined' && !global.process) {
  global.process = require('process');
}

// Export empty to make this a module
export {};
