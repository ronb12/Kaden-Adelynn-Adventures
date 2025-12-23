#!/bin/bash
# Script to ensure Info.plist is available before build
INFO_PLIST="KadenAdelynnSpaceAdventures/Info.plist"

# Touch the file to trigger iCloud sync if needed
if [ -f "$INFO_PLIST" ]; then
    # Try to read the file to ensure it's available
    cat "$INFO_PLIST" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Info.plist is available"
        exit 0
    else
        echo "⚠️  Info.plist not immediately available, waiting..."
        sleep 2
        cat "$INFO_PLIST" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Info.plist is now available"
            exit 0
        else
            echo "❌ Info.plist still not available after wait"
            exit 1
        fi
    fi
else
    echo "❌ Info.plist file not found"
    exit 1
fi
