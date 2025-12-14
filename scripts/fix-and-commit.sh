#!/bin/bash
# Script to fix git issues and commit

cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

echo "Step 1: Cleaning up..."
rm -f .git/index.lock .git/config.lock
rm -f .git/index

echo "Step 2: Rebuilding git index..."
# Use git read-tree to rebuild index
git read-tree HEAD 2>&1 || echo "read-tree failed, continuing..."

echo "Step 3: Adding Game.jsx using git update-index (plumbing command)..."
# Use plumbing command instead of porcelain
git update-index --add src/components/Game.jsx 2>&1

echo "Step 4: Checking status..."
git status --short 2>&1 | head -5

echo "Step 5: Committing..."
git commit -m "feat: add shooting accuracy percentage to scoreboard" 2>&1

echo "Step 6: Pushing..."
git push origin main 2>&1

echo "Done!"

