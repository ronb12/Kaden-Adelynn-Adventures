#!/bin/bash
# This script resizes appicon.png into all required iOS icon sizes and places them in the AppIcon.appiconset folder.
# Requires ImageMagick: install with `brew install imagemagick` if not present.

ICON_SRC="appicon.png"
ICONSET_DIR="ios-swift/KadenAdelynnSpaceAdventures/Assets.xcassets/AppIcon.appiconset"

# Array of sizes and filenames (size@scale:filename)
ICONS=(
  "20x20@2x:AppIcon-20x20@2x.png"
  "20x20@3x:AppIcon-20x20@3x.png"
  "29x29@1x:AppIcon-29x29@1x.png"
  "29x29@2x:AppIcon-29x29@2x.png"
  "29x29@3x:AppIcon-29x29@3x.png"
  "40x40@1x:AppIcon-40x40@1x.png"
  "40x40@2x:AppIcon-40x40@2x.png"
  "40x40@3x:AppIcon-40x40@3x.png"
  "60x60@2x:AppIcon-60x60@2x.png"
  "60x60@3x:AppIcon-60x60@3x.png"
  "76x76@1x:AppIcon-76x76@1x.png"
  "76x76@2x:AppIcon-76x76@2x.png"
  "83.5x83.5@2x:AppIcon-83.5x83.5@2x.png"
  "1024x1024@1x:AppIcon-1024x1024@1x.png"
)

# Function to resize and copy icons
for entry in "${ICONS[@]}"; do
  IFS=":" read -r size filename <<< "$entry"
  base_size=$(echo $size | cut -d'@' -f1)
  scale=$(echo $size | cut -d'@' -f2 | sed 's/x//')
  width=$(echo $base_size | cut -dx -f1)
  height=$(echo $base_size | cut -dx -f2)
  out_width=$(echo "$width * $scale" | bc | awk '{print int($1+0.5)}')
  out_height=$(echo "$height * $scale" | bc | awk '{print int($1+0.5)}')
  convert "$ICON_SRC" -resize ${out_width}x${out_height} "$ICONSET_DIR/$filename"
  echo "Created $filename ($out_width x $out_height)"
done

echo "All icons generated in $ICONSET_DIR."
