#!/bin/bash

# Complete screenshot capture script using AppleScript for navigation

DEVICE_UDID="82308C85-438D-4CB1-9A06-FC99A9E7699D"
SCREENSHOT_DIR="/Users/ronellbradley/Library/Mobile Documents/com~apple~CloudDocs/Desktop/kaden-adelynn-space-adventures/ios/AppStoreAssets/screenshots/6.5-inch"

mkdir -p "$SCREENSHOT_DIR"

echo "📸 Capturing App Store Screenshots for 6.5\" iPhone"
echo "=========================================="
echo ""

# Function to take screenshot
take_screenshot() {
    local name=$1
    xcrun simctl io "$DEVICE_UDID" screenshot "$SCREENSHOT_DIR/$name.png"
    if [ -f "$SCREENSHOT_DIR/$name.png" ]; then
        echo "✅ Captured: $name.png"
    else
        echo "❌ Failed: $name.png"
    fi
    sleep 1
}

# Function to tap using AppleScript
tap_at() {
    local x=$1
    local y=$2
    osascript -e "tell application \"Simulator\" to activate" > /dev/null 2>&1
    osascript <<EOF
tell application "System Events"
    tell process "Simulator"
        set frontmost to true
        click at {$x, $y}
    end tell
end tell
EOF
    sleep 2
}

echo "1/6: Main Menu (already captured)"
take_screenshot "01-main-menu"

echo ""
echo "2/6: Character Select"
echo "   Please tap 'Choose Character' button in the simulator, then press Enter..."
read -r
take_screenshot "02-character-select"

echo ""
echo "3/6: Ship Select"  
echo "   Please tap 'Choose Ship' button, then press Enter..."
read -r
take_screenshot "03-ship-select"

echo ""
echo "4/6: Customization"
echo "   Please navigate back to main menu, then tap 'Customize' button, then press Enter..."
read -r
take_screenshot "05-customization"

echo ""
echo "5/6: Store"
echo "   Please navigate back to main menu, then tap 'Open Store' button, then press Enter..."
read -r
take_screenshot "06-store"

echo ""
echo "6/6: Gameplay"
echo "   Please navigate back to main menu, start a game, wait for enemies to appear, then press Enter..."
read -r
take_screenshot "04-gameplay"

echo ""
echo "✅ All screenshots captured!"
echo "📁 Location: $SCREENSHOT_DIR"
echo ""
echo "Screenshots:"
ls -lh "$SCREENSHOT_DIR"/*.png

