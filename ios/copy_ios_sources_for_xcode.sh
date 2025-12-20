#!/bin/bash
# Script to copy all iOS source files into a new folder for Xcode import

set -e

SRC="$(pwd)/ios/KadenAdelynnAdventures/KadenAdelynnAdventures"
DEST="$(pwd)/ios/KadenAdelynnAdventures/AllSourceForXcodeImport"

mkdir -p "$DEST/Views" "$DEST/Models" "$DEST/Utilities" "$DEST/Audio"

cp -a "$SRC/Views/." "$DEST/Views/"
cp -a "$SRC/Models/." "$DEST/Models/"
cp -a "$SRC/Utilities/." "$DEST/Utilities/"
cp -a "$SRC/Audio/." "$DEST/Audio/" 2>/dev/null || true
cp -a "$SRC/KadenAdelynnAdventuresApp.swift" "$DEST/"
cp -a "$SRC/LaunchScreen.storyboard" "$DEST/" 2>/dev/null || true
cp -a "$SRC/PrivacyInfo.xcprivacy" "$DEST/" 2>/dev/null || true
cp -a "$SRC/Assets.xcassets" "$DEST/" 2>/dev/null || true

# Print result
echo "All source files copied to: $DEST"
echo "You can now add them to your new Xcode project via Xcode's 'Add Files' dialog."
