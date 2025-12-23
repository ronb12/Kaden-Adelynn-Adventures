#!/usr/bin/env python3
"""
Script to commit changes in small batches to avoid timeouts
"""
import subprocess
import os
import sys
import time

REPO_DIR = "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures"

def run_cmd(cmd, check=False):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=REPO_DIR,
            capture_output=True,
            text=True,
            timeout=30
        )
        if check and result.returncode != 0:
            print(f"Error running: {cmd}")
            print(result.stderr)
        return result
    except subprocess.TimeoutExpired:
        print(f"Timeout running: {cmd}")
        return None
    except Exception as e:
        print(f"Exception running {cmd}: {e}")
        return None

def main():
    os.chdir(REPO_DIR)
    
    # Remove lock files
    print("Removing lock files...")
    run_cmd("rm -f .git/index.lock .git/config.lock")
    time.sleep(0.5)
    
    # Get list of changed files
    print("Checking for changes...")
    result = run_cmd("git status --porcelain")
    if not result or not result.stdout.strip():
        print("No changes detected")
        return
    
    lines = result.stdout.strip().split('\n')
    files = [line.split()[-1] for line in lines if line.strip()]
    
    print(f"Found {len(files)} changed files")
    
    # Commit Game.jsx first (our main change)
    if 'src/components/Game.jsx' in files:
        print("\nCommitting Game.jsx...")
        run_cmd("rm -f .git/index.lock")
        time.sleep(0.5)
        result = run_cmd("git add src/components/Game.jsx")
        if result and result.returncode == 0:
            time.sleep(0.5)
            run_cmd("rm -f .git/index.lock")
            time.sleep(0.5)
            result = run_cmd('git commit -m "feat: add shooting accuracy percentage to scoreboard"')
            if result and result.returncode == 0:
                print("✓ Game.jsx committed")
            else:
                print("Game.jsx commit: no changes or error")
        files.remove('src/components/Game.jsx')
    
    # Commit remaining files in small batches
    batch_size = 3
    batch_num = 1
    
    for i in range(0, len(files), batch_size):
        batch = files[i:i+batch_size]
        if not batch:
            break
            
        print(f"\nCommitting batch {batch_num} ({len(batch)} files)...")
        run_cmd("rm -f .git/index.lock")
        time.sleep(0.5)
        
        # Add files
        for f in batch:
            if os.path.exists(f):
                run_cmd(f'git add "{f}"')
                time.sleep(0.2)
        
        # Commit
        run_cmd("rm -f .git/index.lock")
        time.sleep(0.5)
        result = run_cmd(f'git commit -m "feat: enhance visuals - batch {batch_num}"')
        if result and result.returncode == 0:
            print(f"✓ Batch {batch_num} committed")
        else:
            print(f"Batch {batch_num}: no changes or error")
        
        batch_num += 1
        time.sleep(1)
    
    # Push all commits
    print("\nPushing to origin main...")
    run_cmd("rm -f .git/index.lock")
    time.sleep(0.5)
    result = run_cmd("git push origin main")
    if result:
        if result.returncode == 0:
            print("✓ Successfully pushed to origin main")
        else:
            print(f"Push result: {result.stdout}")
            print(f"Push error: {result.stderr}")
    
    print("\nDone!")

if __name__ == "__main__":
    main()


