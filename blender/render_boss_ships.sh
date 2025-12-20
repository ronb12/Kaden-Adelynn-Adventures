#!/bin/bash
# Helper script to render boss ships using Blender
# Usage: ./blender/render_boss_ships.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Find Blender executable
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - try common locations
    BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
    if [ ! -f "$BLENDER" ]; then
        BLENDER="/Applications/Blender.app/Contents/MacOS/blender"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    BLENDER="blender"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    BLENDER="blender.exe"
else
    BLENDER="blender"
fi

# Check if Blender exists
if ! command -v "$BLENDER" &> /dev/null && [ ! -f "$BLENDER" ]; then
    echo "Error: Blender not found!"
    echo "Please install Blender or update the BLENDER path in this script."
    echo "On macOS, Blender is usually at: /Applications/Blender.app"
    exit 1
fi

echo "Using Blender: $BLENDER"
echo "Rendering boss ships..."
echo ""

# Run Blender script
"$BLENDER" --background --python "$SCRIPT_DIR/create_boss_ships.py"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Boss ships rendered successfully!"
    echo "Check public/boss-ships/ for the generated images."
else
    echo ""
    echo "❌ Error rendering boss ships. Check the output above for details."
    exit 1
fi
