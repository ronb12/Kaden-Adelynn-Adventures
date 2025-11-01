# ⚡ 10x Speed Workflow Guide

## Quick Deploy Commands

### Single Command - Build + Deploy

```bash
# Build and deploy to Firebase in one go
npm run build && firebase deploy --only hosting

# Or use the automated script
./deploy.sh
```

### Fast Iteration Cycle

```bash
# 1. Make your changes
# 2. Deploy instantly
./deploy.sh

# Total time: ~15 seconds
```

## Essential Commands

### Development

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Test production build locally
```

### Deployment

```bash
firebase deploy --only hosting    # Deploy to Firebase
git add -A                         # Stage all changes
git commit -m "message"             # Commit changes
git push origin main                # Push to GitHub
```

## Keyboard Shortcuts & Tips

### VS Code / Cursor

- `Cmd+Shift+P` → "Format Document" (auto-format code)
- `Cmd+D` → Select next occurrence (rename quickly)
- `Cmd+K, Cmd+W` → Close all files
- `Cmd+P` → Quick file switcher
- `Ctrl+Shift+F` → Search across all files

### Terminal (zsh)

- `Ctrl+R` → Search command history
- `!!` → Repeat last command
- `cd` → Go to workspace (aliases recommended)

## Automation Scripts

### Auto-Deploy Script (deploy.sh)

Already created! Just run:

```bash
./deploy.sh
```

This automatically:

1. Builds the project
2. Commits changes
3. Pushes to GitHub
4. Deploys to Firebase

### Quick File Edits

```bash
# Edit and save quickly
code src/components/MainMenu.css    # Edit file
# Save (Cmd+S)
# Deploy immediately
./deploy.sh
```

## Common Tasks

### Fix CSS Issue

```bash
# 1. Edit CSS file
code src/components/[Component].css

# 2. Save changes

# 3. Deploy (one command)
./deploy.sh
```

### Update Game Logic

```bash
# 1. Edit JavaScript/JSX
code src/components/Game.jsx

# 2. Test locally
npm run dev

# 3. Deploy when ready
./deploy.sh
```

### Add New Features

```bash
# 1. Create/Edit component
code src/components/NewComponent.jsx

# 2. Build and test
npm run build && npm run preview

# 3. Deploy
./deploy.sh
```

## Speed Tips

### 1. Use the deploy.sh Script

The fastest way - one command does everything:

```bash
./deploy.sh  # Build, commit, push, deploy
```

### 2. Test Locally First

```bash
npm run dev    # Start dev server
# Make changes, see live updates
# When happy, deploy
./deploy.sh
```

### 3. Multi-File Editing

Use VS Code split editor (Cmd+\):

- Edit CSS and JSX side-by-side
- Make multiple changes at once
- Deploy once

### 4. Quick Git Commands

```bash
# Stage and commit quickly
git add -A && git commit -m "fix" && git push

# Or just use deploy.sh which handles git too
```

### 5. Batch Changes

Make multiple file edits:

1. Open all files you need to change
2. Make all edits
3. Deploy once with `./deploy.sh`

## Deployment Checklist

### Before Deploying

- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] PWA features work (service worker)

### Quick Test

```bash
# Build and preview locally first
npm run build && npm run preview
# If it looks good, deploy
./deploy.sh
```

## File Structure Reference

```
src/
├── App.jsx              # Main app logic
├── components/
│   ├── MainMenu.jsx     # Menu component
│   ├── MainMenu.css     # Menu styling
│   ├── Game.jsx         # Game logic (huge file)
│   └── Game.css         # Game styling
└── utils/               # Game utilities

public/                   # Static assets
├── sw.js                # Service worker
├── manifest.json        # PWA manifest
└── icons/              # App icons

dist/                    # Build output (auto-generated)
```

## Common Issues & Quick Fixes

### Issue: CSS not updating

```bash
# Clear cache and rebuild
npm run build
firebase deploy --only hosting
```

### Issue: Service worker cache

- Hard refresh: `Cmd+Shift+R` (Chrome/Edge)
- Or: DevTools → Application → Clear Storage

### Issue: Build failing

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

## Time-Saving Strategies

### 1. Make Multiple Changes at Once

Don't deploy after every single line change. Make all your edits, then deploy once.

### 2. Use Automated Scripts

Always use `./deploy.sh` instead of manual commands - it's faster and prevents errors.

### 3. Test Locally First

Use `npm run dev` to see changes instantly without deploying.

### 4. Batch Edit Files

Open multiple files in split editor, make all changes, deploy once.

### 5. Keep Deploy.sh Running

No need to wait for each step - the script handles everything in sequence.

## Workflow Example

### Making a Design Change

```
1. code src/components/MainMenu.css       # 2 seconds
2. Edit the CSS                            # 30 seconds
3. Save (Cmd+S)                            # Instant
4. ./deploy.sh                            # 15 seconds
   ├─ Builds project
   ├─ Commits changes
   ├─ Pushes to GitHub
   └─ Deploys to Firebase
5. Done! Live in under 1 minute
```

## Emergency Quick Fixes

### Hot Fix in Production

```bash
# Edit the file
code src/components/[File].jsx

# Deploy immediately (no dev server)
npm run build && firebase deploy --only hosting
# ~20 seconds
```

### Revert Bad Deploy

```bash
git log                    # Find previous commit
git checkout [hash]        # Go back
./deploy.sh                # Deploy old version
```

## Remember

- **One command**: `./deploy.sh` does everything
- **Test locally**: Use `npm run dev` before deploying
- **Batch changes**: Make multiple edits, deploy once
- **Build cache**: Vite caches builds, so subsequent builds are faster
- **Auto-deploy**: Push to main auto-triggers Firebase (if GitHub Actions enabled)

## Pro Tip

Set up aliases in your `~/.zshrc`:

```bash
alias deploy='./deploy.sh'
alias build='npm run build'
alias serve='npm run dev'
alias fix='npm run build && firebase deploy --only hosting'
```

Then just type:

```bash
deploy    # Instead of ./deploy.sh
fix       # Quick fix and deploy
```

---

**Time to deploy**: ~15 seconds with `./deploy.sh`
**Time to make changes**: As fast as you can type! 🚀
