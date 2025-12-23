#!/bin/bash
# Quick commit script - run this manually in your terminal

cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

# Remove locks
rm -f .git/index.lock .git/config.lock

# Add and commit Game.jsx
git add src/components/Game.jsx
git commit -m "feat: add shooting accuracy percentage to scoreboard"

# Add and commit any other source files
git add src/
git commit -m "feat: enhance visuals - engine trails, score popups, combo effects, wave transitions, improved boss designs, performance optimizations" || true

# Push
git push origin main

echo "Done!"


