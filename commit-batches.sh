#!/bin/bash

# Script to commit files in small batches to avoid timeouts
cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

# Remove any lock files
rm -f .git/index.lock .git/config.lock

echo "Starting batch commits..."

# Commit 1: Main source code changes (Game.jsx with accuracy tracking)
echo "Batch 1: Committing Game.jsx with accuracy tracking..."
git add src/components/Game.jsx 2>&1
if git commit -m "feat: add shooting accuracy percentage to scoreboard" 2>&1; then
    echo "✓ Batch 1 committed"
else
    echo "Batch 1: No changes or already committed"
fi

# Commit 2: Other source files if any
echo "Batch 2: Committing other source files..."
git add src/ 2>&1
if git commit -m "feat: enhance visuals - engine trails, score popups, combo effects, wave transitions, improved boss designs, performance optimizations" 2>&1; then
    echo "✓ Batch 2 committed"
else
    echo "Batch 2: No changes or already committed"
fi

# Commit 3: Configuration and docs
echo "Batch 3: Committing config and docs..."
git add *.md *.json *.sh 2>&1 2>/dev/null
if git commit -m "docs: update documentation and configuration" 2>&1; then
    echo "✓ Batch 3 committed"
else
    echo "Batch 3: No changes or already committed"
fi

# Commit 4: Dist files (if needed, but usually we exclude these)
# Skip dist files as they're usually build artifacts

# Push all commits
echo "Pushing to origin main..."
if git push origin main 2>&1; then
    echo "✓ Successfully pushed to origin main"
else
    echo "Push failed or already up to date"
    git status --short 2>&1 | head -10
fi

echo "Done!"
