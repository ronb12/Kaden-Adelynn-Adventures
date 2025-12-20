#!/bin/bash
# Start development server script

cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

echo "Starting Vite dev server..."
echo "Project directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

# Check if vite is available
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "⚠️  Vite not found. Installing..."
    npm install vite @vitejs/plugin-react
fi

# Kill any existing vite processes
pkill -f vite 2>/dev/null
sleep 1

# Start the server
echo "🚀 Starting dev server on http://localhost:3001"
npm run dev

