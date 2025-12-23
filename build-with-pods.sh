#!/bin/bash
# Build script using CocoaPods workspace

set -e

cd "$(dirname "$0")"

echo "🔨 Building with CocoaPods..."
echo ""

# Make sure we're using the workspace, not the project
WORKSPACE="KadenAdelynnSpaceAdventures.xcworkspace"
SCHEME="KadenAdelynnSpaceAdventures"
DESTINATION="platform=iOS Simulator,id=EC9A1205-39F5-44DA-873A-444E63DEC805"

if [ ! -f "$WORKSPACE" ]; then
    echo "❌ Workspace not found: $WORKSPACE"
    echo "   Run: pod install"
    exit 1
fi

echo "📦 Using workspace: $WORKSPACE"
echo ""

# Clean first
echo "🧹 Cleaning..."
xcodebuild -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -sdk iphonesimulator \
  clean 2>&1 | grep -E "(Clean|SUCCEEDED|FAILED)" | tail -3 || true

echo ""
echo "🔨 Building..."
xcodebuild -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -sdk iphonesimulator \
  -destination "$DESTINATION" \
  build 2>&1 | tee /tmp/pods-build.log | grep -E "(error|warning|BUILD SUCCEEDED|BUILD FAILED|Unable to find)" | tail -20

if grep -q "BUILD SUCCEEDED" /tmp/pods-build.log; then
    echo ""
    echo "✅ Build succeeded!"
    echo ""
    echo "🚀 Launching app..."
    xcrun simctl boot EC9A1205-39F5-44DA-873A-444E63DEC805 2>/dev/null || true
    xcodebuild -workspace "$WORKSPACE" \
      -scheme "$SCHEME" \
      -sdk iphonesimulator \
      -destination "$DESTINATION" \
      -derivedDataPath ./DerivedData \
      build 2>&1 | grep -E "(BUILD SUCCEEDED)" && \
    xcrun simctl install EC9A1205-39F5-44DA-873A-444E63DEC805 ./DerivedData/Build/Products/Debug-iphonesimulator/KadenAdelynnSpaceAdventures.app 2>/dev/null && \
    xcrun simctl launch EC9A1205-39F5-44DA-873A-444E63DEC805 Kaden---Adelynn-Space-Adventures && \
    echo "✅ App launched!"
else
    echo ""
    echo "❌ Build failed. Check the errors above."
    echo ""
    echo "⚠️  IMPORTANT: Make sure you:"
    echo "   1. Close Xcode"
    echo "   2. Open KadenAdelynnSpaceAdventures.xcworkspace (NOT .xcodeproj)"
    echo "   3. Wait for indexing to complete"
    echo "   4. Build in Xcode"
fi

