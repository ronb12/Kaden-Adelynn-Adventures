#!/bin/bash
# Force package linking by rebuilding with explicit package resolution

set -e

echo "🔧 Forcing Package Link Resolution..."
cd "$(dirname "$0")"

PROJECT="KadenAdelynnSpaceAdventures.xcodeproj"
SCHEME="KadenAdelynnSpaceAdventures"
DESTINATION="platform=iOS Simulator,id=EC9A1205-39F5-44DA-873A-444E63DEC805"

# Clean everything
echo "🧹 Cleaning all caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf DerivedData

# Resolve packages explicitly
echo "📦 Step 1: Resolving packages..."
xcodebuild -resolvePackageDependencies -project "$PROJECT" 2>&1 | grep -E "(Firebase|resolved)" | tail -5

# Try building with explicit package product dependencies
echo ""
echo "🔨 Step 2: Building with explicit package resolution..."
echo "   (This will fail, but it helps Xcode understand package dependencies)"

# Build and capture errors
xcodebuild -project "$PROJECT" \
  -scheme "$SCHEME" \
  -sdk iphonesimulator \
  -destination "$DESTINATION" \
  -derivedDataPath ./DerivedData \
  build 2>&1 | tee /tmp/xcodebuild.log | grep -E "(error|warning|BUILD)" | tail -20 || true

echo ""
echo "📋 Analysis:"
if grep -q "Unable to find module dependency" /tmp/xcodebuild.log; then
    echo "❌ Modules still not found"
    echo ""
    echo "This confirms the issue: packages are resolved but not linked."
    echo ""
    echo "🔧 SOLUTION: You MUST complete this in Xcode UI:"
    echo ""
    echo "1. Open Xcode (project should already be open)"
    echo "2. Wait for packages to finish resolving (top-right corner)"
    echo "3. Go to: Project (blue icon) > Package Dependencies tab"
    echo "4. Click on 'firebase-ios-sdk'"
    echo "5. In the right panel, you should see product checkboxes"
    echo "6. Make sure ALL 4 are checked for 'KadenAdelynnSpaceAdventures' target:"
    echo "   ☑️ FirebaseCore"
    echo "   ☑️ FirebaseAuth"
    echo "   ☑️ FirebaseFirestore"
    echo "   ☑️ FirebaseFunctions"
    echo "7. If any are unchecked, check them now"
    echo "8. Wait for Xcode to update (may take 10-30 seconds)"
    echo "9. Then build again"
    echo ""
    echo "The packages ARE in the project file, but Xcode's UI needs"
    echo "to properly link them to the target's build system."
else
    echo "✅ Build may have succeeded or different error occurred"
    echo "   Check /tmp/xcodebuild.log for full details"
fi

