// Runtime environment config shim
// This module centralizes access to environment-like values for the app.
// It intentionally prefers process.env (for native or build-time injection)
// but falls back to the values present in the project .env for quick dev/testing.

export const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';

export const APPWRITE_PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || '68ed023d0003b9495c6d';

export const APPWRITE_DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || 'smarthome-db';

export const APPWRITE_USERS_COLLECTION_ID =
  process.env.APPWRITE_USERS_COLLECTION_ID || 'users';

export const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || 'wss://mqtt.tecnoverse.app:8081';

// For future: add prefixing or EXPO/REACT_APP handling if needed.

export default {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
  MQTT_BROKER_URL,
};
