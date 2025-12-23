#!/bin/bash
# Script to verify character portraits are properly set up

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSETS_DIR="${PROJECT_ROOT}/ios-swift/KadenAdelynnSpaceAdventures/Assets.xcassets"

echo "Verifying character portrait assets..."
echo ""

# Check if Assets.xcassets exists
if [ ! -d "$ASSETS_DIR" ]; then
    echo "❌ ERROR: Assets.xcassets directory not found!"
    exit 1
fi

echo "✓ Assets.xcassets directory found"
echo ""

# Check each character
for char_id in kaden adelynn hero3 hero4 hero5 hero6 hero7 hero8 hero9 hero10; do
    imageset_dir="${ASSETS_DIR}/${char_id}_character.imageset"
    portrait_file="${imageset_dir}/${char_id}_portrait.png"
    contents_file="${imageset_dir}/Contents.json"
    
    if [ -d "$imageset_dir" ]; then
        echo "✓ ${char_id}_character.imageset directory exists"
        
        if [ -f "$portrait_file" ]; then
            size=$(stat -f%z "$portrait_file" 2>/dev/null || stat -c%s "$portrait_file" 2>/dev/null)
            echo "  ✓ Portrait PNG: ${size} bytes"
        else
            echo "  ✗ Portrait PNG: MISSING"
        fi
        
        if [ -f "$contents_file" ]; then
            echo "  ✓ Contents.json: exists"
            
            # Verify Contents.json references the correct file
            if grep -q "${char_id}_portrait.png" "$contents_file"; then
                echo "  ✓ Contents.json: correctly references portrait"
            else
                echo "  ⚠ Contents.json: may not reference portrait correctly"
            fi
        else
            echo "  ✗ Contents.json: MISSING"
        fi
    else
        echo "✗ ${char_id}_character.imageset: MISSING"
    fi
    echo ""
done

echo "Verification complete!"
echo ""
echo "To use in SwiftUI:"
echo "  Image(\"kaden_character\")"
echo "  Image(\"adelynn_character\")"
echo "  etc."
echo ""
echo "To use in UIKit:"
echo "  UIImage(named: \"kaden_character\")"
echo "  UIImage(named: \"adelynn_character\")"
echo "  etc."


