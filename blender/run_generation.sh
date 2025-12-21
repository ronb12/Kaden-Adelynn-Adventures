#!/bin/bash
# Script to run Blender character generation
# Automatically finds Blender installation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXPORT_DIR="$PROJECT_ROOT/export"

echo "Blender Character Pack Generator"
echo "================================="
echo ""

# Find Blender
BLENDER_PATH=""

# Check common locations (including external drives)
if [ -f "/Applications/Blender.app/Contents/MacOS/Blender" ]; then
    BLENDER_PATH="/Applications/Blender.app/Contents/MacOS/Blender"
elif [ -f "/Volumes/My Passport for Mac/Blender.app/Contents/MacOS/Blender" ]; then
    BLENDER_PATH="/Volumes/My Passport for Mac/Blender.app/Contents/MacOS/Blender"
elif [ -f "/usr/local/bin/blender" ]; then
    BLENDER_PATH="/usr/local/bin/blender"
elif command -v blender &> /dev/null; then
    BLENDER_PATH="blender"
else
    echo "❌ ERROR: Blender not found!"
    echo ""
    echo "Please install Blender 4.0+ from:"
    echo "  https://www.blender.org/download/"
    echo ""
    echo "Or install via Homebrew:"
    echo "  brew install --cask blender"
    echo ""
    echo "Or ensure external drive with Blender is mounted"
    echo ""
    exit 1
fi

echo "✓ Found Blender: $BLENDER_PATH"
echo ""

# Check Blender version
VERSION=$("$BLENDER_PATH" --version 2>&1 | head -1)
echo "Blender version: $VERSION"
echo ""

# Create export directory
mkdir -p "$EXPORT_DIR"
echo "Export directory: $EXPORT_DIR"
echo ""

# Parse arguments
BAKE_RES=${1:-1024}
VARIANTS=${2:-3}
ENGINE=${3:-cycles}

echo "Settings:"
echo "  Bake resolution: $BAKE_RES"
echo "  Color variants: $VARIANTS"
echo "  Render engine: $ENGINE"
echo ""
echo "Starting generation..."
echo "================================="
echo ""

# Run Blender script
"$BLENDER_PATH" -b \
    -P "$SCRIPT_DIR/generate_pack.py" \
    -- \
    --outdir "$EXPORT_DIR" \
    --bake "$BAKE_RES" \
    --variants "$VARIANTS" \
    --engine "$ENGINE"

echo ""
echo "================================="
echo "Generation complete!"
echo ""
echo "Check output in: $EXPORT_DIR"
echo ""

# List generated characters
if [ -d "$EXPORT_DIR" ]; then
    echo "Generated characters:"
    for char_dir in "$EXPORT_DIR"/*/; do
        if [ -d "$char_dir" ] && [ "$(basename "$char_dir")" != "_shared" ]; then
            char_name=$(basename "$char_dir")
            if [ -f "$char_dir/${char_name}_portrait.png" ]; then
                echo "  ✓ $char_name"
            else
                echo "  ⚠ $char_name (portrait missing)"
            fi
        fi
    done
    echo ""
fi

echo "To integrate portraits into iOS app:"
echo "  cd blender && ./integrate_portraits.sh"
echo ""

