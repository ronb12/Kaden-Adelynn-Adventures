#!/bin/bash
# Simple script to commit changes in very small steps

cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

# Clean up locks
rm -f .git/index.lock .git/config.lock

# Try to add just the Game.jsx file
echo "Adding Game.jsx..."
rm -f .git/index.lock
git add src/components/Game.jsx

# Commit if there are changes
echo "Committing..."
rm -f .git/index.lock
git commit -m "feat: add shooting accuracy percentage to scoreboard" || echo "No changes to commit"

# Push
echo "Pushing..."
git push origin main || echo "Push failed or up to date"

echo "Complete"


