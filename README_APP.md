# SmartHome Skariga App - React Native

Aplikasi mobile React Native untuk kontrol Smart Home IoT dengan ESP32.

## Fitur Utama

### 🔐 Authentication
- Login dengan Appwrite (sama seperti web)
- Session management dengan AsyncStorage
- Auto-redirect setelah login

### 🏠 Dashboard
- Welcome screen dengan informasi user
- Quick access ke semua fitur
- Drawer navigation (hamburger menu)

### 🎛️ Device Control
- Toggle ON/OFF untuk 4 perangkat:
  - Lampu Ruang Tamu (lampu1)
  - Lampu Teras (lampu2)
  - Stop Kontak TV (stopkontak1)
  - Charger Pojok (stopkontak2)
- Real-time status update via MQTT
- Device presence detection
- Visual feedback untuk status perangkat

### 🎤 Voice Control
- Voice recognition bahasa Indonesia
- Perintah suara untuk kontrol perangkat
- Contoh perintah:
  - "Nyalakan lampu ruang tamu"
  - "Matikan lampu teras"
  - "Hidupkan stop kontak TV"
- Log aktivitas real-time
- Daftar alias perangkat

### 📊 Monitor
- Real-time device presence monitoring
- Status ON/OFF semua perangkat
- Message history
- Connection status (broker & device)
- Timestamp untuk setiap aktivitas

## Navigation

### Drawer Menu (Hamburger)
- Home (Dashboard)
- Control (Device Toggle)
- Voice Control
- Monitor

## Tech Stack

- **React Native 0.82.0**
- **React Navigation** (Drawer Navigator)
- **Appwrite** (Authentication & Database)
- **MQTT** (IoT Communication)
- **@react-native-voice/voice** (Speech Recognition)
- **AsyncStorage** (Local Storage)

## Instalasi

1. **Install dependencies:**
   ```bash
   cd SmartHomeSkarigaApp
   npm install
   ```

2. **Konfigurasi Appwrite:**
   Edit file `src/lib/appwrite.ts` dan sesuaikan:
   - `APPWRITE_ENDPOINT`
   - `APPWRITE_PROJECT_ID`
   - `APPWRITE_DATABASE_ID`
   - `APPWRITE_USERS_COLLECTION_ID`

3. **Setup Android:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

5. **Run on iOS (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   ```

## Permissions

Aplikasi memerlukan permission berikut (sudah dikonfigurasi di AndroidManifest.xml):
- `INTERNET` - Untuk koneksi MQTT dan Appwrite
- `RECORD_AUDIO` - Untuk voice control
- `ACCESS_NETWORK_STATE` - Untuk monitoring koneksi

## Konfigurasi MQTT

Broker URL default: `wss://mqtt.tecnoverse.app:8081`

Untuk mengubah broker URL, edit file `src/context/MqttContext.tsx`:
```typescript
const MQTT_BROKER_URL = 'wss://your-mqtt-broker:port';
```

## Topics MQTT

### Subscribe Topics:
- `smarthome/+/status` - Status perangkat (ON/OFF)
- `smarthome/device/presence` - Device online/offline status

### Publish Topics:
- `smarthome/{deviceId}/perintah` - Kirim perintah ke perangkat (ON/OFF)

Device IDs:
- `lampu1`
- `lampu2`
- `stopkontak1`
- `stopkontak2`

## User Flow

1. **Login**
   - User membuka app
   - Masukkan email dan password
   - Sistem verifikasi dengan Appwrite
   - Redirect ke Dashboard

2. **Dashboard**
   - Tampilan welcome message
   - Quick access buttons
   - Drawer menu untuk navigasi

3. **Control**
   - Toggle switches untuk setiap perangkat
   - Real-time status update
   - Visual feedback (warna hijau untuk ON, merah untuk OFF)
   - Warning jika device offline atau broker disconnected

4. **Voice Control**
   - Tap tombol mikrofon
   - Ucapkan perintah dalam bahasa Indonesia
   - Sistem mengenali perangkat dan perintah
   - Kirim command via MQTT
   - Log aktivitas ditampilkan

5. **Monitor**
   - Lihat status koneksi broker
   - Lihat presence status device
   - Monitor status ON/OFF semua perangkat
   - History message MQTT

## Troubleshooting

### Voice Control tidak bekerja
- Pastikan permission RECORD_AUDIO sudah diberikan
- Cek Settings > Apps > SmartHome > Permissions
- Pastikan mikrofon device berfungsi

### MQTT tidak terkoneksi
- Cek koneksi internet
- Pastikan broker URL benar
- Cek firewall/network settings

### Login gagal
- Pastikan konfigurasi Appwrite benar
- Cek endpoint dan project ID
- Pastikan user sudah terdaftar di database

## Development

### Debug Mode
```bash
npm start
# Kemudian di terminal baru:
npm run android
# atau
npm run ios
```

### Build Release (Android)
```bash
cd android
./gradlew assembleRelease
```

APK akan tersedia di: `android/app/build/outputs/apk/release/`

## Catatan Penting

- Aplikasi ini hanya untuk **user biasa**, bukan admin
- Semua sistem (login, control, voice, monitor) sama dengan web version
- Pastikan ESP32 device sudah running dan terhubung ke MQTT broker
- Voice control memerlukan koneksi internet untuk speech recognition

## Compatibility

- **Minimum Android:** API 21 (Android 5.0)
- **Minimum iOS:** iOS 13.0
- **Node.js:** >= 20

## Support

Untuk bantuan atau pertanyaan, hubungi tim developer atau admin sistem.
