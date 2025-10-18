# Quick Start Guide - SmartHome Skariga Mobile App

## 🚀 Quick Setup (5 menit)

### 1. Install Dependencies
```bash
cd SmartHomeSkarigaApp
npm install
```

### 2. Check Configuration
File sudah dikonfigurasi dengan benar di `src/lib/appwrite.ts`:
- ✅ Endpoint: `https://cloud.appwrite.io/v1`
- ✅ Project ID: `6797a2230007e61f44eb`
- ✅ Database ID: `6797a52d002e50cef6ba`
- ✅ Collection ID: `6797a567002d98d05fce`
- ✅ MQTT Broker: `wss://mqtt.tecnoverse.app:8081`

### 3. Run App

**Android:**
```bash
npm run android
```

**iOS (macOS only):**
```bash
cd ios
pod install
cd ..
npm run ios
```

## 📱 Fitur yang Sudah Terintegrasi

### ✅ Login System
- Sama dengan website
- Menggunakan Appwrite authentication
- Auto-redirect setelah login berhasil

### ✅ Dashboard
- Welcome screen dengan nama user
- Quick access ke semua fitur
- Drawer menu (hamburger) di pojok kiri atas

### ✅ Control Screen
- 4 perangkat dengan toggle switch:
  - 🏠 Lampu Ruang Tamu
  - 🏠 Lampu Teras
  - 🔌 Stop Kontak TV
  - 🔌 Charger Pojok
- Real-time status via MQTT
- Visual feedback (hijau = ON, merah = OFF)
- Auto-sync dengan device ESP32

### ✅ Voice Control
- Speech recognition bahasa Indonesia
- Perintah suara:
  - "Nyalakan lampu teras"
  - "Matikan lampu ruang tamu"
  - "Hidupkan stop kontak TV"
- Real-time log aktivitas
- Daftar alias perangkat

### ✅ Monitor
- Status koneksi broker (online/offline)
- Device presence (online/offline/unknown)
- Status semua perangkat (ON/OFF)
- Message history MQTT
- Timestamp setiap aktivitas

## 🎯 User Flow

```
1. Buka App → Login Screen
   ↓
2. Login dengan email & password (sama seperti web)
   ↓
3. Dashboard (Welcome Screen)
   ↓
4. Buka Drawer Menu (☰) → Pilih fitur:
   - Home (Dashboard)
   - Control (Toggle Perangkat)
   - Voice Control (Kontrol Suara)
   - Monitor (Status & Monitoring)
```

## 🔧 Sistem yang Sama dengan Web

| Fitur | Web | Mobile | Status |
|-------|-----|--------|--------|
| Login | ✅ | ✅ | Identik |
| Dashboard | ✅ | ✅ | Identik |
| Device Control | ✅ | ✅ | Identik |
| Voice Control | ✅ | ✅ | Identik |
| Monitor | ✅ | ✅ | Identik |
| MQTT Integration | ✅ | ✅ | Identik |
| Appwrite Auth | ✅ | ✅ | Identik |

## 🎤 Voice Control - Contoh Perintah

### Format Perintah:
`[Aksi] [Nama Perangkat]`

### Aksi yang Didukung:
- **ON**: nyalakan, nyala, hidup, hidupkan, aktif, aktifkan, on
- **OFF**: matikan, mati, nonaktif, nonaktifkan, padam, off

### Nama Perangkat:
- **Lampu 1**: lampu 1, lampu satu, lampu ruang tamu, lampu tamu
- **Lampu 2**: lampu 2, lampu dua, lampu teras, lampu depan
- **Stop Kontak 1**: stop kontak 1, stopkontak satu, colokan tv
- **Stop Kontak 2**: stop kontak 2, stopkontak dua, charger pojok

### Contoh Lengkap:
```
✅ "Nyalakan lampu teras"
✅ "Matikan lampu ruang tamu"
✅ "Hidupkan stop kontak TV"
✅ "Padam lampu dua"
✅ "Aktifkan charger pojok"
```

## 📊 MQTT Topics

### Subscribe (Menerima):
- `smarthome/+/status` → Status perangkat (ON/OFF)
- `smarthome/device/presence` → Device online/offline

### Publish (Mengirim):
- `smarthome/lampu1/perintah` → Kontrol lampu 1
- `smarthome/lampu2/perintah` → Kontrol lampu 2
- `smarthome/stopkontak1/perintah` → Kontrol stop kontak 1
- `smarthome/stopkontak2/perintah` → Kontrol stop kontak 2

## 🛠️ Troubleshooting

### Problem: Voice Control tidak bekerja
**Solution:**
1. Buka Settings → Apps → SmartHome
2. Pilih Permissions
3. Enable "Microphone"
4. Restart app

### Problem: MQTT tidak terkoneksi
**Solution:**
1. Cek koneksi internet
2. Pastikan WiFi/Mobile data aktif
3. Tunggu beberapa detik untuk auto-reconnect
4. Lihat status di bagian atas screen

### Problem: Login gagal
**Solution:**
1. Pastikan email & password benar
2. Cek koneksi internet
3. Gunakan kredensial yang sama dengan web
4. Hubungi admin jika perlu reset password

### Problem: Device tidak merespon
**Solution:**
1. Cek status "Device" di bagian atas (harus Online)
2. Pastikan ESP32 menyala dan terhubung WiFi
3. Cek broker status (harus Connected)
4. Buka Monitor untuk melihat detail

## 📱 Permissions yang Diperlukan

### Android:
- ✅ Internet (auto-granted)
- ✅ Record Audio (untuk voice control)
- ✅ Network State (untuk monitoring)

### iOS:
- ✅ Microphone (untuk voice control)
- ✅ Network (auto-granted)

## 🎨 UI/UX Features

### Dark Theme
- Background: Dark blue-gray (#0F172A)
- Accent: Yellow gold (#FCD34D)
- Status indicators: Green (online/ON), Red (offline/OFF)

### Real-time Indicators
- 🟢 Green badge: Device/Broker online
- 🔴 Red badge: Device/Broker offline
- 🟡 Yellow badge: Loading/Syncing
- ⚪ Gray badge: Unknown status

### Visual Feedback
- Toggle switches animasi smooth
- Status badge update real-time
- Toast/warning untuk error
- Log aktivitas dengan timestamp

## 🔐 Security

- ✅ Semua request melalui HTTPS/WSS
- ✅ Authentication dengan Appwrite
- ✅ Session management secure
- ✅ No hardcoded credentials in production

## 📝 Notes

- App ini untuk **user biasa** (bukan admin)
- Semua fitur identik dengan web version
- Real-time sync dengan ESP32 via MQTT
- Offline mode: command akan di-queue dan terkirim saat online

## 🆘 Support

Jika ada masalah atau pertanyaan:
1. Cek log di Monitor screen
2. Restart app
3. Hubungi admin sistem
4. Check dokumentasi lengkap di README_APP.md

---

**Happy Controlling! 🏠✨**
