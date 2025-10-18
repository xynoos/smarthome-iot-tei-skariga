# 🚀 Deployment Guide - SmartHome Skariga Mobile App

## Overview

Panduan untuk build dan deploy aplikasi SmartHome Skariga ke production.

---

## 📋 Pre-Deployment Checklist

### Code & Configuration
- [ ] Semua fitur tested dan working
- [ ] No TypeScript errors (`npm run lint`)
- [ ] No console.log di production code
- [ ] Environment variables configured correctly
- [ ] Appwrite credentials correct
- [ ] MQTT broker URL correct
- [ ] Version number updated di `package.json` dan `app.json`

### Dependencies
- [ ] All dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Unused dependencies removed
- [ ] Package-lock.json committed

### Testing
- [ ] All features tested on real device
- [ ] Tested on multiple Android versions
- [ ] Voice control tested
- [ ] MQTT connectivity tested
- [ ] Login/logout tested
- [ ] No crashes or freezes

---

## 📱 Android Build Process

### 1. Prepare Environment

```bash
cd SmartHomeSkarigaApp
npm install
cd android
./gradlew clean
cd ..
```

### 2. Update Version

Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 2           // Increment ini setiap build
        versionName "1.1.0"     // Update sesuai semantic versioning
    }
}
```

Edit `package.json`:
```json
{
  "version": "1.1.0"
}
```

### 3. Generate Signing Key (First Time Only)

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore smartHome-release-key.keystore -alias smarthome-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Simpan informasi ini dengan aman:**
- Keystore password: `[YOUR_PASSWORD]`
- Key password: `[YOUR_KEY_PASSWORD]`
- Alias: `smarthome-key-alias`

### 4. Configure Gradle for Signing

Create/edit `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=smartHome-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=smarthome-key-alias
MYAPP_RELEASE_STORE_PASSWORD=[YOUR_PASSWORD]
MYAPP_RELEASE_KEY_PASSWORD=[YOUR_KEY_PASSWORD]
```

**⚠️ JANGAN commit file ini ke Git! Add ke .gitignore**

Edit `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}
```

### 5. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

**Output:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### 6. Build AAB (For Google Play Store)

```bash
cd android
./gradlew bundleRelease
```

**Output:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🍎 iOS Build Process (macOS Only)

### 1. Install Dependencies

```bash
cd ios
pod install
cd ..
```

### 2. Open Xcode

```bash
open ios/SmartHomeSkarigaApp.xcworkspace
```

### 3. Configure Signing

1. Select project in Xcode
2. Go to "Signing & Capabilities"
3. Select your Team
4. Set Bundle Identifier (unique)
5. Enable "Automatically manage signing"

### 4. Update Version

In Xcode:
- Select project → General
- Update Version: `1.1.0`
- Update Build: `2`

### 5. Build Archive

1. Product → Scheme → Edit Scheme
2. Set Build Configuration to "Release"
3. Product → Archive
4. Wait for build to complete
5. Organizer window will open

### 6. Distribute

1. Click "Distribute App"
2. Choose distribution method:
   - App Store Connect (for TestFlight/App Store)
   - Ad Hoc (for limited devices)
   - Enterprise (if applicable)
3. Follow the wizard

---

## 🔧 Build Optimization

### Enable ProGuard (Android)

Already configured in release build:
- Removes unused code
- Obfuscates code
- Reduces APK size

### Bundle Size Optimization

```bash
# Analyze bundle size
cd android
./gradlew assembleRelease --scan

# Enable APK splitting by ABI
# In android/app/build.gradle:
splits {
    abi {
        enable true
        reset()
        include "armeabi-v7a", "arm64-v8a"
        universalApk false
    }
}
```

### Hermes Engine (Already Enabled)

Hermes is enabled by default in React Native 0.82:
- Faster app start
- Reduced memory usage
- Smaller APK size

---

## 📦 Distribution Methods

### 1. Direct APK Distribution

**Pros:**
- Quick and easy
- No store approval needed
- Good for internal testing

**Steps:**
1. Build APK (see above)
2. Upload to file sharing service
3. Share link with users
4. Users enable "Install from Unknown Sources"
5. Users download and install

### 2. Google Play Store

**Pros:**
- Official distribution
- Automatic updates
- User trust

**Steps:**
1. Create Google Play Developer account ($25 one-time)
2. Build AAB (see above)
3. Create app in Play Console
4. Upload AAB
5. Fill app details, screenshots, etc.
6. Submit for review

**Required Assets:**
- App icon (512x512 PNG)
- Feature graphic (1024x500)
- Screenshots (min 2)
- Privacy policy URL
- App description

### 3. TestFlight (iOS)

**Steps:**
1. Build archive in Xcode
2. Upload to App Store Connect
3. Add testers
4. Send invites
5. Testers download TestFlight app
6. Install beta app

### 4. Firebase App Distribution

**Pros:**
- Easy beta testing
- Works for Android & iOS
- Track crashes
- Analytics

**Steps:**
1. Create Firebase project
2. Install Firebase CLI
3. Build app
4. Upload: `firebase appdistribution:distribute app-release.apk --app [APP_ID] --groups testers`

---

## 🔒 Security Considerations

### Production Checklist
- [ ] Remove all `console.log` statements
- [ ] No hardcoded credentials
- [ ] Use environment variables
- [ ] Enable code obfuscation
- [ ] SSL pinning for MQTT (if required)
- [ ] Validate all user inputs
- [ ] Secure AsyncStorage data

### Environment Variables

For production, update `src/lib/appwrite.ts`:
```typescript
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
// etc...
```

Use `.env` files (not committed):
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=6797a2230007e61f44eb
# etc...
```

---

## 📊 Post-Deployment

### Monitoring

**Crashes:**
- Use React Native's built-in crash reporting
- Consider adding Sentry or Bugsnag

**Analytics:**
- Firebase Analytics
- Mixpanel
- Amplitude

**Performance:**
- React Native Performance Monitor
- Firebase Performance

### User Feedback

**Collection Methods:**
- In-app feedback form
- Email support
- Play Store reviews
- TestFlight feedback (iOS)

**Response Plan:**
1. Monitor reviews daily
2. Respond to issues within 24 hours
3. Prioritize critical bugs
4. Plan updates based on feedback

---

## 🔄 Update Process

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `1.2.3`

### Release Cycle

1. **Development**
   - Feature development on `develop` branch
   - Regular commits and testing

2. **Testing**
   - Internal testing (development team)
   - Beta testing (selected users)
   - Bug fixes

3. **Release**
   - Merge to `main` branch
   - Tag release: `git tag v1.2.3`
   - Build production app
   - Deploy to stores

4. **Post-Release**
   - Monitor crashes/errors
   - Quick hotfix if needed
   - Plan next version

### Hotfix Process

For critical bugs:
1. Create hotfix branch from `main`
2. Fix bug
3. Test thoroughly
4. Bump PATCH version
5. Build and deploy immediately
6. Merge back to `main` and `develop`

---

## 📱 App Store Metadata

### Google Play Store

**Required:**
- App name: SmartHome Skariga
- Short description (80 chars)
- Full description (4000 chars)
- App category: Tools
- Content rating: Everyone
- Privacy policy URL

**Screenshots:**
- Min 2, max 8
- Sizes: 16:9 or 9:16
- Show key features

**Example Description:**
```
SmartHome Skariga - Kontrol IoT Smart Home Anda

Kendalikan perangkat smart home Anda dengan mudah:
• Login aman dengan Appwrite
• Kontrol 4 perangkat (lampu & stop kontak)
• Voice control bahasa Indonesia
• Real-time monitoring via MQTT
• Status perangkat online/offline

Fitur:
✅ Toggle ON/OFF perangkat
✅ Kontrol suara
✅ Dashboard monitoring
✅ Real-time sync

Kompatibel dengan ESP32 IoT devices.
```

### App Store (iOS)

Similar to Google Play, plus:
- App Store icon (1024x1024 PNG)
- App preview video (optional, recommended)
- Keywords (100 chars, comma-separated)

---

## 🆘 Troubleshooting Build Issues

### Android Build Fails

**Problem:** `Execution failed for task ':app:mergeReleaseResources'`
**Solution:**
```bash
cd android
./gradlew clean
rm -rf .gradle
cd ..
rm -rf node_modules
npm install
cd android
./gradlew assembleRelease
```

**Problem:** `Could not find com.android.tools.build:gradle:X.X.X`
**Solution:** Update Android Studio and Gradle

### iOS Build Fails

**Problem:** `Pods not found`
**Solution:**
```bash
cd ios
pod deintegrate
pod install
```

**Problem:** Signing errors
**Solution:** Check Bundle ID, Team, and Certificates in Xcode

### APK Size Too Large

**Solution:**
1. Enable ProGuard
2. Enable APK splitting
3. Remove unused dependencies
4. Optimize images (use WebP)
5. Enable Hermes

---

## ✅ Final Checklist

### Before Submission
- [ ] App tested on multiple devices
- [ ] No crashes or critical bugs
- [ ] All features working
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Version numbers updated
- [ ] Signing configured
- [ ] Build successful

### After Submission
- [ ] Monitor review status
- [ ] Prepare for questions from reviewers
- [ ] Plan marketing/announcement
- [ ] Prepare user support channels
- [ ] Monitor crash reports
- [ ] Track user feedback

---

## 📞 Support

**For deployment issues:**
- Check React Native documentation
- Check platform-specific guides (Android/iOS)
- Search Stack Overflow
- Contact team lead

**For app-specific issues:**
- Review code documentation
- Check TESTING_CHECKLIST.md
- Review logs and error messages

---

## 📚 Resources

- [React Native Docs - Publishing](https://reactnative.dev/docs/signed-apk-android)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)

---

**Good luck with your deployment! 🚀**
