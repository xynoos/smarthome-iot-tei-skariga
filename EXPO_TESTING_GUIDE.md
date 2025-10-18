# 📱 Testing di Codespaces dengan Expo Go

## ✅ SUKSES! Expo Sudah Running!

Kamu sekarang bisa **test aplikasi di HP kamu** tanpa perlu Android Studio! 🎉

---

## 🎯 Cara Testing (3 Langkah Mudah)

### **STEP 1: Download Expo Go di HP**

**Android:**
- Buka **Google Play Store**
- Search: **"Expo Go"**
- Install aplikasi **Expo Go**
- Buka aplikasi

**iOS:**
- Buka **App Store**
- Search: **"Expo Go"**
- Install aplikasi **Expo Go**
- Buka aplikasi

---

### **STEP 2: Start Expo Server di Codespaces**

Di terminal Codespaces, jalankan:

```bash
cd /workspaces/smarthome-iot-tei-skariga/SmartHomeSkarigaApp
npx expo start --tunnel
```

**Tunggu sampai muncul:**
- ✅ "Tunnel ready"
- ✅ QR Code (kotak-kotak hitam putih)
- ✅ "Metro waiting on exp://..."

---

### **STEP 3: Scan QR Code dengan HP**

**Android:**
1. Buka aplikasi **Expo Go** di HP
2. Tap tombol **"Scan QR Code"**
3. Scan QR code yang muncul di terminal
4. Tunggu aplikasi loading...
5. **DONE!** Aplikasi akan buka di HP kamu! 🚀

**iOS:**
1. Buka aplikasi **Camera** (default camera HP)
2. Arahkan ke QR code di terminal
3. Tap notifikasi "Open in Expo Go"
4. Tunggu aplikasi loading...
5. **DONE!** Aplikasi akan buka di HP kamu! 🚀

---

## 🔗 Link Alternatif

Jika scan QR code tidak work, kamu bisa:

1. **Copy URL dari terminal:**
   ```
   exp://hscyc-i-anonymous-8081.exp.direct
   ```

2. **Paste di Expo Go:**
   - Buka Expo Go
   - Tap "Enter URL manually"
   - Paste URL
   - Tap "Connect"

---

## 🧪 Testing Checklist

Setelah aplikasi buka di HP, test ini:

### ✅ **1. Login Screen**
- [ ] Form email & password muncul?
- [ ] Bisa ketik email & password?
- [ ] Button "Masuk" berfungsi?
- [ ] Error message muncul kalau salah?

**Test Credentials:**
```
Email: user@test.com
Password: password123
```

### ✅ **2. Dashboard Screen**
- [ ] Welcome message muncul?
- [ ] Nama user benar?
- [ ] Button "Control Devices" work?
- [ ] Button "Voice Control" work?
- [ ] Button "Monitor" work?
- [ ] Hamburger menu (☰) bisa dibuka?

### ✅ **3. Control Screen**
- [ ] 4 device cards muncul? (Lampu 1, Lampu 2, Stopkontak 1, Stopkontak 2)
- [ ] Toggle switch bisa di-tap?
- [ ] Status "Online/Offline" muncul?
- [ ] Switch berubah warna saat di-toggle?

### ✅ **4. Voice Control Screen**
- [ ] Button "Start Voice Command" ada?
- [ ] Tap button, minta permission microphone?
- [ ] Izinkan microphone
- [ ] Coba bilang: **"Nyalakan lampu satu"**
- [ ] Activity log muncul?
- [ ] Command terdeteksi?

**Perintah Voice yang Bisa Dicoba:**
```
✅ "Nyalakan lampu satu"
✅ "Matikan lampu dua"
✅ "Hidupkan stopkontak satu"
✅ "Matikan stopkontak dua"
✅ "Nyalakan semua"
✅ "Matikan semua"
```

### ✅ **5. Monitor Screen**
- [ ] MQTT connection status muncul?
- [ ] Device summary grid ada?
- [ ] Recent messages list muncul?
- [ ] Real-time updates work?

### ✅ **6. Navigation (Hamburger Menu)**
- [ ] Tap hamburger icon (☰)
- [ ] Menu drawer slide dari kiri?
- [ ] Menu items: Home, Control, Voice Control, Monitor
- [ ] Tap "Home" → Dashboard screen
- [ ] Tap "Control" → Control screen
- [ ] Tap "Voice Control" → Voice screen
- [ ] Tap "Monitor" → Monitor screen
- [ ] Tap "Logout" → Kembali ke Login

---

## 🚨 Troubleshooting

### **Problem: QR Code Tidak Muncul**
**Solution:**
```bash
# Stop expo (Ctrl+C)
# Restart dengan:
cd /workspaces/smarthome-iot-tei-skariga/SmartHomeSkarigaApp
npx expo start --tunnel --clear
```

### **Problem: "Network Error" di HP**
**Solution:**
- Pastikan HP dan Codespaces connect ke internet
- Coba restart Expo Go app
- Coba scan QR code lagi

### **Problem: "Unable to Connect to Metro"**
**Solution:**
```bash
# Restart expo dengan clear cache:
npx expo start --tunnel --clear
```

### **Problem: Aplikasi Crash/Blank Screen**
**Solution:**
1. Shake HP untuk buka Dev Menu
2. Tap "Reload"
3. Atau tap "r" di terminal untuk reload

### **Problem: Voice Control Tidak Work**
**Solution:**
- Pastikan sudah izinkan microphone permission
- Coba restart aplikasi (reload)
- Check internet connection
- Coba perintah yang lebih jelas

### **Problem: MQTT Tidak Connect**
**Solution:**
- Check internet connection di HP
- Wait 5-10 detik (auto reconnect)
- Reload aplikasi
- Check di Monitor screen untuk status

---

## 🎨 Features di Expo Mode

### ✅ **Yang Work:**
- ✅ Login/Logout
- ✅ Navigation (Drawer menu)
- ✅ Device Control (Toggle switches)
- ✅ Voice Control (Indonesian)
- ✅ Real-time Monitoring
- ✅ MQTT Connection
- ✅ Session persistence
- ✅ Hot reload (auto refresh saat code berubah)

### ⚠️ **Limitations:**
- Performance mungkin lebih lambat dari native app
- Beberapa native features mungkin perlu config tambahan
- Build APK harus dari Expo (bukan standalone APK)

---

## 🔥 Hot Reload Feature

**Keuntungan Expo:**
Kalau kamu edit code di Codespaces, aplikasi di HP **otomatis reload**! 🎉

**Cara Test:**
1. Buka file: `src/screens/DashboardScreen.tsx`
2. Edit text: "Welcome to SmartHome!" → "Welcome to My App!"
3. Save file
4. **Lihat HP** → Otomatis reload dengan text baru!

---

## 📊 Testing Status

Setelah test, isi checklist ini:

```
[ ] Login berfungsi dengan baik
[ ] Dashboard tampil dengan benar
[ ] Control toggles work real-time
[ ] Voice commands terdeteksi
[ ] Monitor menampilkan data real-time
[ ] Navigation smooth dan responsif
[ ] MQTT connection stable
[ ] Logout berfungsi
[ ] UI/UX bagus di HP

Overall Rating: ___/10
Notes: _______________________
```

---

## 🚀 Commands Reference

### **Start Expo:**
```bash
cd /workspaces/smarthome-iot-tei-skariga/SmartHomeSkarigaApp
npx expo start --tunnel
```

### **Restart dengan Clear Cache:**
```bash
npx expo start --tunnel --clear
```

### **Stop Expo:**
```
Press Ctrl+C di terminal
```

### **Reload App di HP:**
```
Shake HP → Tap "Reload"
Atau press "r" di terminal
```

### **Open Dev Menu di HP:**
```
Shake HP
Atau press "m" di terminal
```

---

## 📱 Expected Output di Terminal

Kamu harus lihat ini:

```
✔ Tunnel connected.
✔ Tunnel ready.

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▄▄ ▀ ▄██ ▀▀██ ▄▄▄▄▄ █
█ █   █ ██▄▀ █ ▄█▄▀▀▄▄█ █   █ █
█ █▄▄▄█ ██▀▄ ▄▀▄█▄▀▄▄▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█ ▀▄█ ▀▄█▄█▄█▄█▄▄▄▄▄▄▄█
... (QR CODE) ...

› Metro waiting on exp://xxxxx.exp.direct
› Scan the QR code above with Expo Go
```

---

## 🎉 Success Indicators

Aplikasi berhasil kalau:

1. ✅ QR code muncul di terminal
2. ✅ "Metro waiting on exp://..." muncul
3. ✅ Scan QR → Expo Go loading
4. ✅ Aplikasi buka dengan Login screen
5. ✅ Bisa login
6. ✅ Dashboard muncul
7. ✅ Semua fitur work

---

## 💡 Tips & Tricks

### **Tip 1: Keep Terminal Open**
Jangan close terminal yang running Expo! Kalau close, aplikasi di HP akan disconnect.

### **Tip 2: Stable Internet**
Pastikan HP dan Codespaces connect ke internet yang stabil untuk tunnel mode.

### **Tip 3: Use Dev Menu**
Shake HP untuk buka Dev Menu:
- Reload aplikasi
- Toggle Performance Monitor
- Enable/Disable Fast Refresh
- Debug settings

### **Tip 4: Check Logs**
Lihat terminal untuk logs real-time:
- Error messages
- Console.log output
- Network requests
- MQTT messages

### **Tip 5: Test on Multiple Devices**
Scan QR code dengan **multiple HP** untuk test di berbagai device!

---

## 📞 Need Help?

### **Expo Not Starting?**
```bash
# Clear cache and restart:
rm -rf node_modules/.cache
npx expo start --tunnel --clear
```

### **QR Code Not Scanning?**
- Try using "Enter URL manually" in Expo Go
- Copy the `exp://...` URL from terminal
- Paste in Expo Go

### **Aplikasi Crash?**
- Check terminal for error messages
- Reload app (shake HP → reload)
- Restart Expo server

### **Voice Not Working?**
- Grant microphone permission
- Check internet connection
- Try simpler commands first

---

## 🎯 Next Steps After Testing

Setelah test di Expo Go, kamu bisa:

1. **Build Standalone APK** untuk distribusi
   ```bash
   eas build --platform android
   ```

2. **Deploy to Expo Updates** untuk OTA updates
   ```bash
   eas update --branch production
   ```

3. **Submit to Play Store** melalui Expo
   ```bash
   eas submit --platform android
   ```

Follow **DEPLOYMENT.md** untuk detail!

---

## 🎊 Conclusion

**Sekarang kamu bisa test aplikasi tanpa Android Studio!** 🚀

Steps:
1. ✅ Download Expo Go di HP
2. ✅ Run `npx expo start --tunnel`
3. ✅ Scan QR code
4. ✅ Test all features!

**Happy Testing!** 🎉

---

**Current Status:**
- ✅ Expo setup: COMPLETE
- ✅ Tunnel mode: ACTIVE
- ✅ QR Code: GENERATED
- 🎯 Ready for testing!

**Last Updated:** October 17, 2025
