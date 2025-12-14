#!/bin/bash
# Script to restore files using git plumbing commands

cd /Users/ronellbradley/Desktop/kaden-adelynn-space-adventures

echo "Restoring files using git update-index..."

# Add files one at a time using update-index
for file in README.md package.json package-lock.json vite.config.js eslint.config.js index.html firebase.json .firebaserc .gitignore; do
    if [ -f "$file" ]; then
        echo "Adding $file..."
        git update-index --add -- "$file" 2>&1 || echo "Failed: $file"
    fi
done

# Add src directory files
find src -type f | while read file; do
    echo "Adding $file..."
    git update-index --add -- "$file" 2>&1 || echo "Failed: $file"
done

# Add public directory files  
find public -type f | while read file; do
    echo "Adding $file..."
    git update-index --add -- "$file" 2>&1 || echo "Failed: $file"
done

# Add other important files
for file in scripts/*.js tests/*.js *.md *.sh *.cjs .prettierrc .env.example; do
    if [ -f "$file" ]; then
        echo "Adding $file..."
        git update-index --add -- "$file" 2>&1 || echo "Failed: $file"
    fi
done

echo "Writing index..."
git write-tree 2>&1

echo "Done!"

