# SmartHome Skariga App - Project Structure

## 📁 Struktur Folder

```
SmartHomeSkarigaApp/
├── android/                    # Android native code
│   ├── app/
│   │   └── src/main/
│   │       └── AndroidManifest.xml  # Permissions & config
│   └── build.gradle
├── ios/                        # iOS native code (macOS only)
│   ├── Podfile
│   └── SmartHomeSkarigaApp.xcodeproj/
├── src/                        # Source code React Native
│   ├── context/               # React Context (State Management)
│   │   ├── AuthContext.tsx    # Authentication & user state
│   │   └── MqttContext.tsx    # MQTT connection & messaging
│   ├── lib/                   # Libraries & utilities
│   │   ├── appwrite.ts        # Appwrite configuration
│   │   └── presence.ts        # Device presence detection
│   ├── navigation/            # Navigation configuration
│   │   └── AppNavigator.tsx   # Drawer navigation setup
│   └── screens/               # Screen components
│       ├── LoginScreen.tsx        # 🔐 Login page
│       ├── DashboardScreen.tsx    # 🏠 Home/Welcome page
│       ├── ControlScreen.tsx      # 🎛️ Device control toggles
│       ├── VoiceControlScreen.tsx # 🎤 Voice commands
│       └── MonitorScreen.tsx      # 📊 Status monitoring
├── App.tsx                    # Root component dengan providers
├── index.js                   # Entry point
├── package.json               # Dependencies
├── babel.config.js            # Babel configuration
├── .env                       # Environment variables
├── README_APP.md              # Dokumentasi lengkap
├── QUICKSTART.md              # Quick start guide
└── STRUCTURE.md               # File ini

```

## 🎯 File Penting

### 1. Entry Points
- **index.js** - Entry point aplikasi, import gesture handler
- **App.tsx** - Root component, setup providers (Auth, MQTT, Navigation)

### 2. Context Providers
- **AuthContext.tsx** - Login, logout, user session management
  - Appwrite authentication
  - AsyncStorage untuk persist login
  - Auto-check session on app start
  
- **MqttContext.tsx** - MQTT connection & messaging
  - Auto-connect ke broker
  - Auto-reconnect on disconnect
  - Publish/subscribe helpers
  - Message queue saat offline

### 3. Screens

#### LoginScreen.tsx
- Email & password input
- Form validation
- Error handling
- Integration dengan Appwrite

#### DashboardScreen.tsx
- Welcome message dengan nama user
- Quick access buttons
- Navigation ke fitur lain
- Logout button

#### ControlScreen.tsx
- 4 device toggles (Switch component)
- Real-time status dari MQTT
- Device presence indicator
- Broker connection status
- Warning messages

#### VoiceControlScreen.tsx
- Microphone button
- Speech recognition (bahasa Indonesia)
- Real-time transcript display
- Command parsing & execution
- Activity log
- Device aliases list

#### MonitorScreen.tsx
- Connection status (broker & device)
- Presence monitoring
- Device status summary (ON/OFF)
- MQTT message history
- Timestamps

### 4. Libraries

#### appwrite.ts
```typescript
- Client configuration
- Account instance
- Databases instance
- Environment constants
```

#### presence.ts
```typescript
- Device presence detection
- Timeout evaluation
- Status parsing (online/offline/unknown)
```

### 5. Navigation

#### AppNavigator.tsx
```typescript
- Drawer Navigator setup
- Auth guard (show login if not logged in)
- Screen routing:
  - Dashboard (Home)
  - Control
  - Voice Control
  - Monitor
```

## 🔄 Data Flow

### Authentication Flow
```
User Input (email/password)
    ↓
AuthContext.login()
    ↓
Appwrite.createEmailPasswordSession()
    ↓
Save to AsyncStorage
    ↓
Update user state
    ↓
Navigator redirects to Dashboard
```

### MQTT Flow
```
App Start
    ↓
MqttContext connects to broker
    ↓
Subscribe to topics:
  - smarthome/+/status
  - smarthome/device/presence
    ↓
Receive messages → update state
    ↓
User action (toggle/voice)
    ↓
Publish to topic: smarthome/{device}/perintah
    ↓
ESP32 receives & executes
    ↓
ESP32 publishes status
    ↓
App receives & updates UI
```

### Voice Control Flow
```
User taps mic button
    ↓
Request RECORD_AUDIO permission
    ↓
Start Voice recognition
    ↓
User speaks command
    ↓
Speech → Text conversion
    ↓
Parse command (device + action)
    ↓
Validate device & action
    ↓
Publish MQTT command
    ↓
Log activity
    ↓
Update UI with result
```

## 🎨 Components Hierarchy

```
App
├── SafeAreaProvider
├── AuthProvider
│   ├── MqttProvider
│   │   └── AppNavigator
│   │       ├── DrawerNavigator (if logged in)
│   │       │   ├── DashboardScreen
│   │       │   ├── ControlScreen
│   │       │   ├── VoiceControlScreen
│   │       │   └── MonitorScreen
│   │       └── LoginScreen (if not logged in)
```

## 🔌 Integrations

### Appwrite
- Endpoint: `https://cloud.appwrite.io/v1`
- Services used:
  - Account (authentication)
  - Databases (user roles)

### MQTT
- Broker: `wss://mqtt.tecnoverse.app:8081`
- Protocol: WebSocket Secure
- QoS: 0 (fire and forget)
- Clean session: true

### React Native Voice
- Library: `@react-native-voice/voice`
- Language: `id-ID` (Indonesian)
- Continuous: false
- Interim results: true

## 📦 Dependencies

### Core
- react-native: ^0.82.0
- react: ^19.1.1

### Navigation
- @react-navigation/native
- @react-navigation/drawer
- react-native-gesture-handler
- react-native-reanimated
- react-native-screens
- react-native-safe-area-context

### Backend Integration
- appwrite: ^21.2.1
- mqtt: ^4.3.7

### Features
- @react-native-voice/voice (speech recognition)
- @react-native-async-storage/async-storage (persistence)

## 🎯 State Management

### Global State (Context)
1. **AuthContext**
   - user (UserData | null)
   - isLoading (boolean)
   - login() function
   - logout() function

2. **MqttContext**
   - client (MqttClient | null)
   - connected (boolean)
   - reconnecting (boolean)
   - publish() function
   - subscribe() function
   - onMessage() function

### Local State (useState)
- Screen-specific states
- Form inputs
- UI states (loading, errors, etc)

## 🔐 Security Considerations

1. **Authentication**
   - Secure session with Appwrite
   - Token stored in AsyncStorage
   - Auto-logout on token expiry

2. **Communication**
   - WSS for MQTT (encrypted)
   - HTTPS for Appwrite (encrypted)

3. **Permissions**
   - RECORD_AUDIO requested at runtime
   - Internet access for functionality

## 🚀 Build & Deploy

### Development
```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS
```

### Production
```bash
cd android
./gradlew assembleRelease   # Build Android APK
```

### Debug
```bash
npx react-native log-android  # View Android logs
npx react-native log-ios      # View iOS logs
```

## 📝 Code Style

- TypeScript for type safety
- Functional components with hooks
- Context API for state management
- StyleSheet for styling (no external CSS)
- Async/await for asynchronous operations

## 🎨 Design System

### Colors
- Background: `#0F172A` (dark blue-gray)
- Primary: `#FCD34D` (yellow-gold)
- Success: `#10B981` (green)
- Error: `#EF4444` (red)
- Warning: `#FCD34D` (yellow)
- Text Primary: `#FFF` (white)
- Text Secondary: `#9CA3AF` (gray)

### Typography
- Title: 28-36px, bold
- Subtitle: 14-18px, regular
- Body: 12-14px, regular
- Label: 10-12px, medium

### Spacing
- Padding: 12, 16, 20, 24px
- Margin: 8, 12, 16, 20, 24px
- Gap: 8, 12, 16px

## 🔄 Updates & Maintenance

Untuk update aplikasi:
1. Update dependencies di package.json
2. Run `npm install`
3. Rebuild app
4. Test semua fitur
5. Deploy

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Appwrite Docs](https://appwrite.io/docs)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
- [React Native Voice](https://github.com/react-native-voice/voice)

---

**Semua sistem sudah terintegrasi dan siap digunakan! 🎉**
