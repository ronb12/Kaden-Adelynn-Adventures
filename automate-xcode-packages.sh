#!/bin/bash
# Automated script to fix Firebase package linking in Xcode using AppleScript

set -e

PROJECT_PATH="/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift/KadenAdelynnSpaceAdventures.xcodeproj"
SCRIPT_PATH="$(dirname "$0")/fix-firebase-packages.applescript"

echo "🤖 Automating Xcode Package Resolution..."
echo ""

# Check if Xcode is running
if pgrep -x "Xcode" > /dev/null; then
    echo "⚠️  Xcode is already running. Please close it first, then run this script again."
    echo "   Or continue and the script will try to work with the existing Xcode instance."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clean caches first
echo "🧹 Cleaning package caches..."
rm -rf ~/Library/Caches/org.swift.swiftpm 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

# Run AppleScript
echo "📦 Opening Xcode and resolving packages..."
osascript "$SCRIPT_PATH"

echo ""
echo "⏳ Waiting for packages to resolve..."
echo "   This may take 1-2 minutes. Watch Xcode's top-right corner for progress."
echo ""
echo "📋 After packages resolve, please manually verify:"
echo "   1. Project > Package Dependencies tab"
echo "   2. Click on 'firebase-ios-sdk'"
echo "   3. Verify these products are checked for 'KadenAdelynnSpaceAdventures' target:"
echo "      - FirebaseCore"
echo "      - FirebaseAuth"
echo "      - FirebaseFirestore"
echo "      - FirebaseFunctions"
echo "   4. Go to Target > General > Frameworks, Libraries, and Embedded Content"
echo "   5. Firebase packages should appear automatically"
echo "   6. Set each to 'Do Not Embed'"
echo ""
echo "✅ Then build the project!"

