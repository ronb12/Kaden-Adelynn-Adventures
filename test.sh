#!/bin/bash

# Kaden & Adelynn Space Adventures - Auto Test Script
# This script tests the app and checks for errors

set -e  # Exit on error

echo "🔍 Starting automated testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

ERRORS=0

# Function to check errors
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ PASSED${NC}"
  fi
}

# Test 1: Check if package.json exists
echo "📦 Test 1: Checking package.json..."
test -f package.json && echo "package.json found" || { echo "package.json missing!"; exit 1; }
check_error

# Test 2: Check if node_modules exists
echo "📦 Test 2: Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
check_error

# Test 3: Run build
echo "🔨 Test 3: Building project..."
npm run build 2>&1 | tee /tmp/build.log
BUILD_ERRORS=$(grep -i "error" /tmp/build.log | wc -l || echo "0")
if [ "$BUILD_ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ Build completed with errors${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Build successful${NC}"
fi

# Test 4: Check build output exists
echo "📁 Test 4: Checking build output..."
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Dist folder not found${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo "dist folder found"
  if [ -f "dist/index.html" ]; then
    echo "index.html created"
  else
    echo -e "${RED}❌ index.html not found${NC}"
    ERRORS=$((ERRORS + 1))
  fi
  check_error
fi

# Test 5: Check main files exist
echo "📄 Test 5: Checking source files..."
SOURCES=(
  "src/App.jsx"
  "src/components/MainMenu.jsx"
  "src/components/Game.jsx"
  "src/components/MainMenu.css"
  "src/components/Game.css"
)

for file in "${SOURCES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Missing: $file${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All source files found${NC}"
fi

# Test 6: Check for console.log statements (should be minimal)
echo "🔍 Test 6: Checking for excessive console.log..."
CONSOLE_COUNT=$(grep -r "console.log" src/ --include="*.jsx" --include="*.js" 2>/dev/null | wc -l || echo "0")
if [ "$CONSOLE_COUNT" -gt 10 ]; then
  echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements${NC}"
else
  echo -e "${GREEN}✅ Acceptable number of console.log statements${NC}"
fi

# Test 7: Check bundle size
echo "📊 Test 7: Checking bundle sizes..."
if [ -d "dist/assets" ]; then
  cd dist/assets
  for file in *.js; do
    if [ -f "$file" ]; then
      SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
      SIZE_MB=$(echo "scale=2; $SIZE / 1024 / 1024" | bc)
      if (( $(echo "$SIZE_MB > 1.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Large bundle: $file (${SIZE_MB}MB)${NC}"
      else
        echo -e "${GREEN}✅ Bundle size OK: $file (${SIZE_MB}MB)${NC}"
      fi
    fi
  done
  cd "$PROJECT_DIR"
fi

# Test 8: Check for common errors in code
echo "🔍 Test 8: Checking for common code issues..."
ISSUES=0

# Check for missing key props in lists (basic check)
if grep -r "\.map(" src/components/*.jsx 2>/dev/null | grep -v "key=" > /dev/null; then
  echo -e "${YELLOW}⚠️  Possible missing key props in map functions${NC}"
  ISSUES=$((ISSUES + 1))
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO" src/ 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO comments${NC}"
fi

# Test 9: Check Firebase configuration
echo "🔥 Test 9: Checking Firebase configuration..."
if [ -f "firebase.json" ]; then
  echo -e "${GREEN}✅ firebase.json found${NC}"
else
  echo -e "${YELLOW}⚠️  firebase.json not found${NC}"
fi

# Test 10: Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo "✅ Build successful"
  echo "✅ Files in place"
  echo "✅ Ready to deploy"
  echo ""
  echo "Next steps:"
  echo "1. Test locally: npm run dev"
  echo "2. Deploy: ./deploy.sh"
  exit 0
else
  echo -e "${RED}❌ Tests failed with $ERRORS error(s)${NC}"
  echo ""
  echo "Please fix the errors above before deploying."
  exit 1
fi

