# Testing Checklist - SmartHome Skariga Mobile App

## ✅ Pre-Testing Setup

- [ ] Dependencies installed (`npm install`)
- [ ] Android device/emulator ready
- [ ] ESP32 device online & connected to MQTT
- [ ] MQTT broker running (`wss://mqtt.tecnoverse.app:8081`)
- [ ] User account exists in Appwrite database

## 🔐 Login Screen Testing

### Happy Path
- [ ] Open app shows login screen
- [ ] Enter valid email & password
- [ ] Click "Login" button
- [ ] Loading indicator appears
- [ ] Successfully redirects to Dashboard
- [ ] Welcome message shows correct user name/email

### Error Handling
- [ ] Empty email shows error message
- [ ] Empty password shows error message
- [ ] Invalid credentials shows error message
- [ ] Network error shows appropriate message
- [ ] Error message auto-dismisses or clearable

## 🏠 Dashboard Screen Testing

### UI Elements
- [ ] Title "Selamat Datang!" visible
- [ ] User name/email displayed correctly
- [ ] Dashboard card with description visible
- [ ] 3 menu items visible (Control, Voice Control, Monitor)
- [ ] Logout button visible and accessible

### Navigation
- [ ] Hamburger menu (☰) opens drawer
- [ ] Drawer shows all menu items (Home, Control, Voice Control, Monitor)
- [ ] Tapping Control navigates to Control screen
- [ ] Tapping Voice Control navigates to Voice Control screen
- [ ] Tapping Monitor navigates to Monitor screen
- [ ] Drawer closes after selection

### Logout
- [ ] Tap logout button
- [ ] Returns to Login screen
- [ ] Cannot go back to Dashboard without login
- [ ] Session cleared from AsyncStorage

## 🎛️ Control Screen Testing

### UI Elements
- [ ] Title "ESP32 Relay Control" visible
- [ ] Broker status badge visible (Connected/Disconnected)
- [ ] Device presence badge visible (Online/Offline/Unknown)
- [ ] 4 device cards visible:
  - [ ] Lampu Ruang Tamu
  - [ ] Lampu Teras
  - [ ] Stop Kontak TV
  - [ ] Charger Pojok

### Device Status Display
- [ ] Each device shows current status (ON/OFF/...)
- [ ] Status badge color correct (green=ON, red=OFF, gray=...)
- [ ] Device ID displayed correctly
- [ ] Active/Mati text matches status

### Toggle Control - Broker Connected & Device Online
- [ ] Toggle Lampu 1 ON → Status updates to ON
- [ ] Toggle Lampu 1 OFF → Status updates to OFF
- [ ] Toggle Lampu 2 ON → Status updates to ON
- [ ] Toggle Lampu 2 OFF → Status updates to OFF
- [ ] Toggle Stop Kontak 1 ON → Status updates to ON
- [ ] Toggle Stop Kontak 1 OFF → Status updates to OFF
- [ ] Toggle Stop Kontak 2 ON → Status updates to ON
- [ ] Toggle Stop Kontak 2 OFF → Status updates to OFF
- [ ] Physical ESP32 relay responds correctly
- [ ] Status update happens within 1-2 seconds

### Error Scenarios
- [ ] Device offline → Toggle disabled, warning shown
- [ ] Broker disconnected → Toggle disabled, warning shown
- [ ] Status not received → Toggle disabled, warning shown
- [ ] Warning message auto-dismisses after 3 seconds

### Real-time Updates
- [ ] Status changes from ESP32 reflected in UI
- [ ] Status changes from web reflected in UI
- [ ] Multiple devices can be controlled simultaneously
- [ ] No UI lag or freeze during operations

## 🎤 Voice Control Screen Testing

### UI Elements
- [ ] Title "Voice Control" visible
- [ ] Broker status badge visible
- [ ] Device presence badge visible
- [ ] Microphone button visible
- [ ] Transcript box visible
- [ ] Log section visible
- [ ] Device aliases section visible

### Permission Handling
- [ ] First time: Permission request dialog appears
- [ ] Permission granted: Voice recognition works
- [ ] Permission denied: Error message shown
- [ ] Can retry permission request

### Voice Recognition - Indonesian Commands
- [ ] Tap mic button → Button turns green/active
- [ ] Speak "nyalakan lampu teras" → Recognized correctly
- [ ] Speak "matikan lampu ruang tamu" → Recognized correctly
- [ ] Speak "hidupkan stop kontak TV" → Recognized correctly
- [ ] Speak "padam lampu dua" → Recognized correctly
- [ ] Transcript shows spoken text
- [ ] Log shows command parsing result

### Command Execution
- [ ] Valid command → MQTT message sent
- [ ] Valid command → Device responds correctly
- [ ] Valid command → Log shows success
- [ ] Invalid device → Warning in log
- [ ] Invalid action → Warning in log
- [ ] No device/action → Warning in log

### Voice Recognition Lifecycle
- [ ] Tap mic → Listening starts
- [ ] Speak command → Listening continues briefly
- [ ] Command complete → Listening stops automatically
- [ ] Tap mic again → Can stop manually
- [ ] Mic icon updates correctly (🎤 → 🔴)

### Log Display
- [ ] New entries appear at top
- [ ] Timestamp correct
- [ ] Different log types have different colors:
  - [ ] Info: gray/white
  - [ ] Command: green
  - [ ] Warning: yellow
  - [ ] Error: red
- [ ] Scrollable if many entries
- [ ] Empty state shows "Belum ada log"

### Device Aliases
- [ ] All 4 devices listed with aliases
- [ ] Aliases match expected patterns
- [ ] Aliases readable and clear

## 📊 Monitor Screen Testing

### UI Elements
- [ ] Title "ESP32 Monitor" visible
- [ ] Connection status card visible
- [ ] Device status summary card visible
- [ ] Message history card visible

### Connection Status
- [ ] Dashboard → Broker status correct (Connected/Connecting)
- [ ] ESP32 presence status correct (Online/Offline/Unknown)
- [ ] Last seen timestamp updates
- [ ] Source information shown
- [ ] Reason shown when offline

### Device Status Summary
- [ ] All 4 devices shown in grid
- [ ] Status for each device correct (ON/OFF/UNKNOWN)
- [ ] Colors match status (green=ON, red=OFF, gray=UNKNOWN)
- [ ] Updates in real-time

### Message History
- [ ] Recent messages displayed
- [ ] Timestamp for each message
- [ ] Topic name shown
- [ ] Payload shown (ON/OFF/online/offline)
- [ ] Correct color coding
- [ ] Newest messages at top
- [ ] Scrollable if many messages
- [ ] Empty state if no messages

### Real-time Updates
- [ ] Status changes reflected immediately
- [ ] Presence changes reflected immediately
- [ ] New messages appear in history
- [ ] Timestamps accurate

## 🔄 Navigation Testing

### Drawer Menu
- [ ] Hamburger icon accessible from all screens
- [ ] Drawer opens smoothly
- [ ] All menu items visible:
  - [ ] Home (Dashboard)
  - [ ] Control
  - [ ] Voice Control
  - [ ] Monitor
- [ ] Current screen highlighted
- [ ] Tap menu item → Navigates correctly
- [ ] Drawer closes after selection

### Back Navigation
- [ ] Android back button works correctly
- [ ] Cannot go back from login screen
- [ ] Can navigate between screens using drawer
- [ ] App state preserved when navigating

## 🌐 MQTT Integration Testing

### Connection
- [ ] App connects to broker on start
- [ ] Reconnects automatically if connection lost
- [ ] Shows connection status in UI
- [ ] Queued messages sent when reconnected

### Topics
- [ ] Subscribes to `smarthome/+/status`
- [ ] Subscribes to `smarthome/device/presence`
- [ ] Publishes to `smarthome/{device}/perintah`
- [ ] Receives retained messages on subscribe

### Messages
- [ ] Control commands sent correctly
- [ ] Voice commands sent correctly
- [ ] Status updates received
- [ ] Presence updates received
- [ ] Message format correct (ON/OFF/online/offline)

## 🔐 Appwrite Integration Testing

### Authentication
- [ ] Login with valid credentials works
- [ ] Session persists after app restart
- [ ] Logout clears session
- [ ] User data fetched correctly
- [ ] Role fetched from database

### Error Handling
- [ ] Network error handled gracefully
- [ ] Invalid credentials error shown
- [ ] Session expired handled correctly
- [ ] Server error handled gracefully

## 📱 Device Features Testing

### Permissions
- [ ] Microphone permission requested when needed
- [ ] Permission dialog shown correctly
- [ ] Permission status checked on each use
- [ ] App handles permission denial gracefully

### Network
- [ ] Works on WiFi
- [ ] Works on mobile data
- [ ] Handles network disconnection
- [ ] Reconnects when network restored

### Performance
- [ ] App launches within 3 seconds
- [ ] UI responsive (no lag)
- [ ] Smooth scrolling
- [ ] Smooth animations
- [ ] No memory leaks (tested with long usage)

### Battery
- [ ] No excessive battery drain
- [ ] MQTT connection doesn't drain battery excessively
- [ ] App can run in background (if needed)

## 🎨 UI/UX Testing

### Visual Design
- [ ] Dark theme applied correctly
- [ ] Colors consistent throughout app
- [ ] Typography readable
- [ ] Icons clear and appropriate
- [ ] Spacing consistent

### Responsiveness
- [ ] Works on different screen sizes
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly (if supported)
- [ ] Elements don't overflow
- [ ] Touch targets adequate size (min 44x44px)

### Accessibility
- [ ] Text readable (sufficient contrast)
- [ ] Buttons clearly labeled
- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] Feedback for user actions

## 🐛 Edge Cases & Error Handling

### Network Issues
- [ ] No internet → Appropriate message shown
- [ ] Slow network → App still usable
- [ ] Network lost during operation → Graceful handling
- [ ] Network restored → Auto-reconnect works

### MQTT Issues
- [ ] Broker down → Error message shown
- [ ] Broker restart → Auto-reconnect works
- [ ] Message delivery failure → User notified
- [ ] Large message queue → No app crash

### Device Issues
- [ ] ESP32 offline → Cannot send commands
- [ ] ESP32 restart → Status syncs when back online
- [ ] Multiple commands quickly → All processed
- [ ] Conflicting commands → Last command wins

### App Lifecycle
- [ ] App minimized → MQTT stays connected
- [ ] App restored → UI updates correctly
- [ ] App killed → Login required on restart (if session expired)
- [ ] App crash → Can recover on restart

## ✅ Final Checks

### Code Quality
- [ ] No TypeScript errors
- [ ] No console warnings in production
- [ ] No deprecated API usage
- [ ] Code follows best practices

### Documentation
- [ ] README.md complete
- [ ] QUICKSTART.md helpful
- [ ] STRUCTURE.md accurate
- [ ] Comments in code where needed

### Build
- [ ] Debug build works
- [ ] Release build works
- [ ] APK size reasonable (<50MB)
- [ ] No unused dependencies

## 📊 Test Results Summary

Date: _______________

Tester: _______________

### Results
- Total Tests: _____
- Passed: _____
- Failed: _____
- Skipped: _____

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Notes
_______________________________________________
_______________________________________________
_______________________________________________

---

**Sign-off:**

Tested by: _______________ Date: _______________

Approved by: _______________ Date: _______________
