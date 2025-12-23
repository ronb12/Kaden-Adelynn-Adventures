#!/bin/bash
# Script to force download all Swift files from iCloud Drive

echo "🔄 Forcing download of all source files from iCloud..."

# Find all Swift and plist files and touch them to trigger iCloud sync
find KadenAdelynnSpaceAdventures -name "*.swift" -o -name "*.plist" | while read file; do
    if [ -f "$file" ]; then
        # Try to read the file to force download
        cat "$file" > /dev/null 2>&1
        touch "$file" 2>&1
    fi
done

echo "✅ File download triggered"
echo ""
echo "📝 Waiting for iCloud sync..."
sleep 3

# Verify files are accessible
echo "🔍 Verifying file access..."
failed=0
find KadenAdelynnSpaceAdventures -name "*.swift" -o -name "*.plist" | while read file; do
    if [ -f "$file" ]; then
        if ! cat "$file" > /dev/null 2>&1; then
            echo "❌ Still not accessible: $file"
            failed=$((failed + 1))
        fi
    fi
done

if [ $failed -eq 0 ]; then
    echo "✅ All files are accessible!"
else
    echo "⚠️  Some files may still be syncing. Try again in a moment."
fi
