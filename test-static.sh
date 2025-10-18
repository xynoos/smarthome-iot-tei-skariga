#!/bin/bash

# Static Testing Script for SmartHome Skariga App
# Can run in Codespaces without Android SDK

echo "======================================================================"
echo "  🧪 STATIC TESTING - SmartHome Skariga Mobile App"
echo "======================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

echo "📋 Running static tests..."
echo ""

# Test 1: Check TypeScript compilation
echo -n "1. TypeScript Compilation Check... "
if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 2: Check if all required files exist
echo -n "2. Required Files Check... "
REQUIRED_FILES=(
    "src/screens/LoginScreen.tsx"
    "src/screens/DashboardScreen.tsx"
    "src/screens/ControlScreen.tsx"
    "src/screens/VoiceControlScreen.tsx"
    "src/screens/MonitorScreen.tsx"
    "src/context/AuthContext.tsx"
    "src/context/MqttContext.tsx"
    "src/lib/appwrite.ts"
    "src/lib/presence.ts"
    "src/navigation/AppNavigator.tsx"
    "App.tsx"
    "package.json"
)

ALL_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        ALL_EXIST=false
        break
    fi
done

if $ALL_EXIST; then
    echo -e "${GREEN}✅ PASSED${NC} (${#REQUIRED_FILES[@]} files)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 3: Check dependencies installed
echo -n "3. Dependencies Installation Check... "
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Run 'npm install' first"
    ((FAILED++))
fi

# Test 4: Check package.json structure
echo -n "4. Package.json Validation... "
if node -e "require('./package.json')" 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 5: Check for common React Native issues
echo -n "5. Common Issues Check... "
ISSUES_FOUND=false

# Check for console.log in source files
if grep -r "console.log" src/ 2>/dev/null | grep -v "//.*console.log" | grep -q "console.log"; then
    ISSUES_FOUND=true
fi

if $ISSUES_FOUND; then
    echo -e "${YELLOW}⚠️  WARNING${NC} - Found console.log statements"
else
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
fi

# Test 6: Check imports
echo -n "6. Import Statements Check... "
IMPORT_ERRORS=0

# Check for common import issues
for file in src/**/*.tsx src/**/*.ts; do
    if [ -f "$file" ]; then
        # Check for broken imports (simplified check)
        if grep -q "from '.*\.tsx'" "$file" 2>/dev/null; then
            ((IMPORT_ERRORS++))
        fi
    fi
done

if [ $IMPORT_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Found $IMPORT_ERRORS potential import issues"
fi

# Test 7: Check Android configuration
echo -n "7. Android Configuration Check... "
if [ -f "android/app/build.gradle" ] && [ -f "android/build.gradle" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 8: Check iOS configuration
echo -n "8. iOS Configuration Check... "
if [ -f "ios/Podfile" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 9: Documentation check
echo -n "9. Documentation Check... "
DOCS=(
    "README_APP.md"
    "QUICKSTART.md"
    "STRUCTURE.md"
    "TESTING_CHECKLIST.md"
    "DEPLOYMENT.md"
    "COMPLETED.md"
)

DOCS_EXIST=true
for doc in "${DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        DOCS_EXIST=false
        break
    fi
done

if $DOCS_EXIST; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 10: Code structure validation
echo -n "10. Code Structure Validation... "
STRUCTURE_OK=true

# Check if screens are properly structured
for screen in Login Dashboard Control VoiceControl Monitor; do
    if ! grep -q "export default function ${screen}Screen" "src/screens/${screen}Screen.tsx" 2>/dev/null; then
        STRUCTURE_OK=false
        break
    fi
done

if $STRUCTURE_OK; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Summary
echo ""
echo "======================================================================"
echo "  📊 TEST SUMMARY"
echo "======================================================================"
echo ""
echo "Total Tests: 10"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

PERCENTAGE=$((PASSED * 100 / 10))
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All static tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Clone repository to local machine with Android Studio"
    echo "2. Run 'npm install'"
    echo "3. Run 'npm run android' on physical device or emulator"
    echo "4. Follow TESTING_CHECKLIST.md for complete testing"
    echo ""
    echo "See TESTING_ENVIRONMENT.md for detailed setup instructions."
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed or have warnings${NC}"
    echo ""
    echo "Please review the failed tests above."
    echo "For testing on real device, see TESTING_ENVIRONMENT.md"
    exit 1
fi
