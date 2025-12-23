#!/bin/bash
# Script to fix Firebase package linking and build the app

set -e

echo "🔧 Fixing Firebase Package Linking..."
cd "$(dirname "$0")"

# Clean everything
echo "🧹 Cleaning caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf DerivedData

# Resolve packages
echo "📦 Resolving packages..."
xcodebuild -resolvePackageDependencies -project KadenAdelynnSpaceAdventures.xcodeproj

echo ""
echo "⚠️  IMPORTANT: The packages are resolved, but Xcode needs to properly link them."
echo ""
echo "Please do the following in Xcode:"
echo "1. Open KadenAdelynnSpaceAdventures.xcodeproj in Xcode"
echo "2. Wait for packages to finish resolving (watch top-right corner)"
echo "3. Go to: Project > Target > General > Frameworks, Libraries, and Embedded Content"
echo "4. Click '+' and add:"
echo "   - FirebaseCore"
echo "   - FirebaseAuth"
echo "   - FirebaseFirestore"
echo "   - FirebaseFunctions"
echo "5. Set each to 'Do Not Embed'"
echo "6. Product > Clean Build Folder (Shift+Cmd+K)"
echo "7. Product > Build (Cmd+B)"
echo ""
echo "After that, you can build from terminal with:"
echo "  xcodebuild -project KadenAdelynnSpaceAdventures.xcodeproj -scheme KadenAdelynnSpaceAdventures -sdk iphonesimulator -destination 'platform=iOS Simulator,id=EC9A1205-39F5-44DA-873A-444E63DEC805' build"
echo ""

