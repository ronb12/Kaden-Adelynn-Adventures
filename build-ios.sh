#!/bin/bash

echo "🚀 Building Kaden & Adelynn Space Adventures for iOS TestFlight..."

# Build the web app
echo "📱 Building web assets..."
npm run build

# Sync with iOS project
echo "🔄 Syncing with iOS project..."
npx cap sync ios

# Open Xcode for final configuration
echo "🍎 Opening Xcode for iOS build..."
npx cap open ios

echo ""
echo "✅ iOS project ready for TestFlight!"
echo ""
echo "📋 Next steps in Xcode:"
echo "1. Configure Bundle ID and Team"
echo "2. Add App Icon (1024x1024)"
echo "3. Set Device Orientation to Landscape"
echo "4. Build and Archive"
echo "5. Upload to App Store Connect"
echo "6. Submit to TestFlight"
echo ""
echo "🎮 Your space adventure game is ready to blast off! 🚀"
