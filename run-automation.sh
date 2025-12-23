#!/bin/bash
# Main automation script to fix Firebase packages

set -e

echo "🚀 Starting Xcode Package Automation..."
echo ""

# Close Xcode if running (optional - comment out if you want to keep it open)
if pgrep -x "Xcode" > /dev/null; then
    echo "⚠️  Xcode is running. The script will work with the existing instance."
    echo "   If you prefer, close Xcode first for a clean start."
    echo ""
fi

# Clean caches
echo "🧹 Step 1: Cleaning package caches..."
rm -rf ~/Library/Caches/org.swift.swiftpm 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
echo "✅ Caches cleaned"
echo ""

# Run the automation script
echo "📦 Step 2: Opening Xcode and resolving packages..."
echo "   (This will open Xcode and start package resolution)"
echo ""

osascript "$(dirname "$0")/automate-package-linking.applescript"

echo ""
echo "⏳ Step 3: Waiting for package resolution..."
echo "   This typically takes 1-2 minutes."
echo "   Watch Xcode's top-right corner for the progress indicator."
echo ""
echo "📋 Step 4: After packages resolve, verify in Xcode:"
echo ""
echo "   A. Check Package Dependencies:"
echo "      1. Click project in navigator (top item)"
echo "      2. Select PROJECT (blue icon), not target"
echo "      3. Go to 'Package Dependencies' tab"
echo "      4. Click 'firebase-ios-sdk'"
echo "      5. Verify these are checked for 'KadenAdelynnSpaceAdventures':"
echo "         • FirebaseCore"
echo "         • FirebaseAuth"
echo "         • FirebaseFirestore"
echo "         • FirebaseFunctions"
echo ""
echo "   B. Check Frameworks:"
echo "      1. Select 'KadenAdelynnSpaceAdventures' TARGET"
echo "      2. Go to 'General' tab"
echo "      3. Scroll to 'Frameworks, Libraries, and Embedded Content'"
echo "      4. Firebase packages should appear automatically"
echo "      5. Set each to 'Do Not Embed'"
echo ""
echo "   C. Build:"
echo "      Product > Clean Build Folder (Shift+Cmd+K)"
echo "      Product > Build (Cmd+B)"
echo ""
echo "✅ Automation complete! Follow the steps above to verify."

