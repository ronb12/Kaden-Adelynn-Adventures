#!/bin/bash

# Script to navigate app and take screenshots
# Uses UI automation via xcrun simctl

DEVICE_UDID="$1"
SCREENSHOT_DIR="$2"

if [ -z "$DEVICE_UDID" ] || [ -z "$SCREENSHOT_DIR" ]; then
    echo "Usage: $0 <device_udid> <screenshot_dir>"
    exit 1
fi

# Function to tap at coordinates
tap_at() {
    local x=$1
    local y=$2
    xcrun simctl io "$DEVICE_UDID" tap "$x" "$y"
    sleep 1
}

# Function to take screenshot
take_screenshot() {
    local name=$1
    xcrun simctl io "$DEVICE_UDID" screenshot "$SCREENSHOT_DIR/$name.png"
    echo "✓ Captured: $name.png"
    sleep 1
}

# Main Menu is already captured, navigate to Character Select
# Try tapping in the area where Character Select button might be
# (typically around middle-left of screen for 6.5" iPhone: ~300x800)
echo "Navigating to Character Select..."
tap_at 300 800
sleep 2
take_screenshot "02-character-select"

# Navigate to Ship Select (if available)
echo "Navigating to Ship Select..."
tap_at 400 900
sleep 2
take_screenshot "03-ship-select"

# Go back and navigate to Customization
echo "Going back..."
tap_at 50 100  # Back button area
sleep 1
tap_at 50 100
sleep 1

echo "Navigating to Customization..."
tap_at 350 1000
sleep 2
take_screenshot "05-customization"

# Go back and navigate to Store
echo "Going back..."
tap_at 50 100
sleep 1

echo "Navigating to Store..."
tap_at 300 900
sleep 2
take_screenshot "06-store"

# Go back and start gameplay
echo "Going back..."
tap_at 50 100
sleep 1

echo "Starting gameplay..."
tap_at 400 800  # Play button area
sleep 3
take_screenshot "04-gameplay"

echo "✅ All screenshots captured!"

