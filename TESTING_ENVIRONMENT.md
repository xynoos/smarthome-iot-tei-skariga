# 🔧 TESTING GUIDE - SmartHome Skariga Mobile App

## ⚠️ PENTING: Environment Codespaces

Anda saat ini berada di **GitHub Codespaces** yang tidak memiliki Android SDK/Emulator. 

Untuk testing aplikasi React Native, ada beberapa opsi:

---

## 🎯 OPSI TESTING

### **OPSI 1: Testing di Local Machine (RECOMMENDED)**

#### Requirements:
- Computer dengan Android Studio terinstall
- Physical Android device ATAU Android Emulator

#### Steps:

1. **Clone repository ke local machine:**
   ```bash
   git clone https://github.com/samuelindra123/smarthome-iot-tei-skariga.git
   cd smarthome-iot-tei-skariga/SmartHomeSkarigaApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup Android SDK:**
   - Install Android Studio
   - Install Android SDK (API 21 atau lebih tinggi)
   - Setup environment variables:
     ```bash
     export ANDROID_HOME=$HOME/Android/Sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```

4. **Run aplikasi:**
   ```bash
   # Start Metro bundler
   npm start

   # Di terminal baru, jalankan:
   npm run android
   ```

---

### **OPSI 2: Expo Go (Quick Testing)**

Jika Anda ingin testing cepat tanpa setup Android Studio:

#### Steps:

1. **Convert project ke Expo (optional):**
   ```bash
   npx expo init SmartHomeExpo --template blank-typescript
   # Copy semua source code ke project Expo
   ```

2. **Install Expo Go di smartphone:**
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

3. **Run dengan Expo:**
   ```bash
   npx expo start
   # Scan QR code dengan Expo Go app
   ```

---

### **OPSI 3: Web Preview (Limited Testing)**

Untuk testing dasar UI/logic tanpa device:

#### Steps:

1. **Install React Native Web:**
   ```bash
   npm install react-native-web react-dom
   npm install --save-dev @babel/plugin-proposal-class-properties
   ```

2. **Create web preview:**
   ```bash
   # Buat file index.html dan setup webpack
   # Testing di browser (beberapa fitur seperti Voice mungkin tidak bekerja)
   ```

---

### **OPSI 4: Online React Native Playground**

Untuk testing cepat tanpa install apapun:

#### Platforms:
- **Snack by Expo**: https://snack.expo.dev/
  - Copy paste code Anda
  - Test langsung di browser atau via Expo Go

- **CodeSandbox**: https://codesandbox.io/
  - Support React Native
  - Test di browser

---

## 🚀 RECOMMENDED WORKFLOW untuk Production

### 1. **Development (Local Machine)**
```bash
# Di laptop/PC dengan Android Studio
git clone [repo]
npm install
npm run android
# Develop & test di emulator/device
```

### 2. **Code Review (Codespaces)**
```bash
# Review code, edit files
# Commit & push changes
```

### 3. **Testing (Local Machine)**
```bash
git pull
npm install
npm run android
# Test changes
```

### 4. **Build & Deploy**
```bash
# Build APK/AAB
cd android
./gradlew assembleRelease
# Deploy to testers/store
```

---

## 📱 ALTERNATIVE: Test Langsung di Physical Device

Jika Anda punya Android device dan kabel USB:

### Steps:

1. **Enable Developer Mode di Android:**
   - Settings → About Phone → Tap "Build Number" 7x
   - Settings → Developer Options → Enable USB Debugging

2. **Connect ke Codespaces (Advanced):**
   - Tidak langsung mungkin, butuh USB forwarding
   - Lebih baik gunakan local machine

3. **Atau gunakan Wireless Debugging (Android 11+):**
   - Enable Wireless Debugging di Developer Options
   - Connect via `adb connect [IP]:[PORT]`
   - Butuh adb di Codespaces (perlu install manual)

---

## 🔨 Install Android SDK di Codespaces (Advanced)

Jika Anda tetap ingin test di Codespaces:

```bash
# Install Android SDK command line tools
cd ~
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
mkdir -p ~/Android/cmdline-tools
unzip commandlinetools-linux-*_latest.zip -d ~/Android/cmdline-tools
mv ~/Android/cmdline-tools/cmdline-tools ~/Android/cmdline-tools/latest

# Setup environment
export ANDROID_HOME=$HOME/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install platform tools
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Update local.properties
echo "sdk.dir=$HOME/Android" > android/local.properties
```

**⚠️ Note:** Tetap tidak bisa run emulator di Codespaces karena tidak support virtualization.

---

## ✅ TESTING CHECKLIST (Tanpa Running)

Anda masih bisa melakukan testing berikut di Codespaces:

### Code Quality
- [x] TypeScript compilation: `npx tsc --noEmit`
- [x] Linting: `npm run lint`
- [x] Format check: `npx prettier --check "src/**/*.{ts,tsx}"`

### Static Analysis
- [x] Check imports
- [x] Check type errors
- [x] Review component structure
- [x] Review navigation logic

### Documentation Review
- [x] README complete
- [x] Code comments
- [x] API documentation
- [x] User guides

---

## 🎓 RECOMMENDATION

**Untuk testing aplikasi React Native secara proper:**

1. ✅ **Clone ke local machine** dengan Android Studio
2. ✅ **Setup emulator atau physical device**
3. ✅ **Run `npm run android`**
4. ✅ **Test semua fitur** sesuai TESTING_CHECKLIST.md

**Gunakan Codespaces untuk:**
- ✅ Code editing
- ✅ Code review
- ✅ Documentation
- ✅ Static analysis
- ✅ Collaboration

---

## 📞 Support

Jika Anda butuh bantuan setup:

1. Lihat dokumentasi lengkap di README_APP.md
2. Follow tutorial Android Studio setup
3. Check React Native environment setup guide
4. Contact team untuk onboarding session

---

## 🌐 Online Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Download](https://developer.android.com/studio)
- [Expo Documentation](https://docs.expo.dev/)
- [Snack by Expo](https://snack.expo.dev/)

---

**Status: Aplikasi sudah siap, tinggal setup environment untuk testing! 🚀**
