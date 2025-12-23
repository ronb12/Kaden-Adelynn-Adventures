#!/bin/bash
cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

echo "Starting Vite dev server on port 3001..."
echo "Press Ctrl+C to stop"
echo ""

# Kill any existing processes
pkill -f vite 2>/dev/null
sleep 1

# Start the server in foreground so you can see output
npm run dev

