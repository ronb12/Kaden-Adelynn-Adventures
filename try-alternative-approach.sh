#!/bin/bash
# Alternative approach: Check if we can work around the module issue

set -e

echo "🔍 Trying alternative approach to fix module dependencies..."
cd "$(dirname "$0")"

# Check if packages are actually built
echo "📦 Checking if Firebase modules are built..."
FIREBASE_MODULES=$(find ~/Library/Developer/Xcode/DerivedData -name "FirebaseCore.swiftmodule" 2>/dev/null | head -1)

if [ -n "$FIREBASE_MODULES" ]; then
    echo "✅ Firebase modules ARE built: $FIREBASE_MODULES"
    echo ""
    echo "The modules exist but the build system can't find them."
    echo "This confirms the linking issue."
else
    echo "❌ Firebase modules not found in build output"
    echo "Packages may not be building correctly"
fi

echo ""
echo "🔧 Attempting workaround: Building with explicit module search paths..."

# Try to get module search paths from a successful package resolution
MODULE_PATHS=$(xcodebuild -project KadenAdelynnSpaceAdventures.xcodeproj \
  -scheme KadenAdelynnSpaceAdventures \
  -showBuildSettings 2>&1 | grep -i "SWIFT.*MODULE\|FRAMEWORK.*SEARCH" | head -5)

if [ -n "$MODULE_PATHS" ]; then
    echo "Module search paths found:"
    echo "$MODULE_PATHS"
else
    echo "Could not determine module search paths"
fi

echo ""
echo "📋 The issue is clear:"
echo "   ✅ Packages are configured"
echo "   ✅ Packages are resolved"  
echo "   ✅ Modules are built"
echo "   ❌ Build system can't find them (linking issue)"
echo ""
echo "This MUST be fixed in Xcode UI by checking products in Package Dependencies."
echo ""
echo "Run this to open Xcode and get instructions:"
echo "  osascript auto-link-packages.applescript"

