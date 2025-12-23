#!/bin/bash
# Script to integrate Blender-generated character portraits into iOS app

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXPORT_DIR="${PROJECT_ROOT}/export"
IOS_ASSETS_DIR="${PROJECT_ROOT}/ios-swift/KadenAdelynnSpaceAdventures/Assets.xcassets"

echo "Integrating character portraits into iOS app..."
echo "Export directory: $EXPORT_DIR"
echo "iOS Assets directory: $IOS_ASSETS_DIR"
echo ""

# Ensure iOS assets directory exists
if [ ! -d "$IOS_ASSETS_DIR" ]; then
    echo "⚠ iOS Assets.xcassets directory not found at: $IOS_ASSETS_DIR"
    echo "Creating directory..."
    mkdir -p "$IOS_ASSETS_DIR"
fi

# Create character image sets in Assets.xcassets
for char_id in kaden adelynn hero3 hero4 hero5 hero6 hero7 hero8 hero9 hero10; do
    char_dir="${IOS_ASSETS_DIR}/${char_id}_character.imageset"
    mkdir -p "$char_dir"
    
    # Copy portrait if it exists
    portrait_src="${EXPORT_DIR}/${char_id}/${char_id}_portrait.png"
    if [ -f "$portrait_src" ]; then
        cp "$portrait_src" "$char_dir/${char_id}_portrait.png"
        echo "✓ Copied portrait for $char_id"
        
        # Create Contents.json
        cat > "$char_dir/Contents.json" <<EOF
{
  "images" : [
    {
      "filename" : "${char_id}_portrait.png",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF
    else
        echo "⚠ Portrait not found for $char_id: $portrait_src"
    fi
done

echo ""
echo "Portrait integration complete!"
echo "Update CharacterSelectView.swift to use Image(\"${char_id}_character\") etc."

