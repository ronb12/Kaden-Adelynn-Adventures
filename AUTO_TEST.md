# 🔍 Automated Testing & Error Monitoring Guide

## Quick Start

### Run All Tests
```bash
# Automatically test, check errors, and fix issues
./test.sh

# Or manually
npm test
```

## Automated Testing Script

### What the test script does:

1. **Syntax Check**
   - Validates all JavaScript/JSX files
   - Checks for syntax errors
   - Verifies imports are correct

2. **Build Test**
   - Runs production build
   - Catches build-time errors
   - Verifies static assets

3. **Console Error Detection**
   - Monitors browser console
   - Detects JavaScript errors
   - Checks for React warnings

4. **Feature Testing**
   - Tests main menu loads
   - Verifies game initializes
   - Checks responsive design
   - Tests touch controls

5. **Auto-Fix Common Issues**
   - Fixes formatting issues
   - Corrects import paths
   - Removes console.logs
   - Optimizes bundle size

## Test Categories

### 1. Syntax & Compilation Tests

```bash
# Check for TypeScript errors
npm run build

# Lint code
npm run lint  # (if configured)
```

### 2. Runtime Tests

```bash
# Start dev server and check console
npm run dev
# Open browser DevTools Console
# Look for errors in red
```

### 3. Build Verification

```bash
# Build and check for errors
npm run build
# Should complete without errors
```

### 4. Manual Feature Testing

#### Main Menu
- [ ] Title displays fully
- [ ] Subtitle visible
- [ ] Ship selection works (Kaden/Adelynn)
- [ ] Difficulty selection works (Easy/Medium/Hard)
- [ ] Start button works
- [ ] Features list displays
- [ ] Responsive on mobile

#### Game Play
- [ ] Game canvas loads
- [ ] Ship visible and movable
- [ ] Shooting works (spacebar)
- [ ] Enemies spawn
- [ ] Collisions work
- [ ] Score increments
- [ ] Health displays
- [ ] Lives display
- [ ] UI elements visible

#### Touch Controls (Mobile)
- [ ] Touch to move ship
- [ ] Touch to shoot
- [ ] Responsive canvas size
- [ ] Game fits screen properly

## Console Error Monitoring

### Common Errors to Watch For

#### 1. Import Errors
```
Error: Cannot find module 'X'
```
**Fix:** Check import path, verify file exists

#### 2. React Errors
```
Warning: Each child in a list should have a unique key
```
**Fix:** Add `key` prop to mapped elements

#### 3. Canvas Errors
```
Failed to execute 'getContext' on 'HTMLCanvasElement'
```
**Fix:** Ensure canvas ref is initialized

#### 4. State Update Errors
```
Cannot read property 'X' of undefined
```
**Fix:** Add null checks, verify state initialization

#### 5. Audio Errors
```
The AudioContext was not allowed to start
```
**Fix:** User interaction required before audio

### Auto-Fix Script

```bash
# Run auto-fixer (checks and fixes common issues)
node scripts/auto-fix.js
```

## Automated Test Script

### Installation

Create a test script that:
1. Builds the project
2. Checks for console errors
3. Runs basic functionality tests
4. Reports results

### Manual Testing Checklist

Before deploying, manually test:

#### Desktop Testing
```bash
npm run dev
# Open http://localhost:3000
```

- [ ] Menu loads correctly
- [ ] Can select ship
- [ ] Can select difficulty
- [ ] Start game works
- [ ] Ship moves with WASD/Arrows
- [ ] Shooting works
- [ ] Enemies spawn and move
- [ ] Collisions work
- [ ] Game over works

#### Mobile Testing
- [ ] Open on mobile device
- [ ] Menu responsive
- [ ] Touch controls work
- [ ] Canvas fits screen
- [ ] Game playable on mobile

## Error Monitoring Tools

### 1. Browser DevTools
```bash
# Open DevTools (F12 or Cmd+Option+I)
# Check Console tab for errors
# Check Network tab for failed requests
# Check Application tab for service worker
```

### 2. Build Logs
```bash
# Check build output for warnings
npm run build 2>&1 | tee build.log
```

### 3. Console Monitoring
```javascript
// Add to your app for monitoring
window.addEventListener('error', (e) => {
  console.error('App Error:', e.error);
  // Send to error tracking service
});
```

## Pre-Deploy Checklist

Before deploying to production:

```bash
# 1. Run build
npm run build

# 2. Check for errors
# Should have no errors or warnings

# 3. Test locally
npm run preview

# 4. Check bundle size
ls -lh dist/assets/

# 5. Deploy
firebase deploy --only hosting
```

## Continuous Monitoring

### GitHub Actions (Automated)

The workflow at `.github/workflows/deploy.yml` includes:
- Build verification
- Automated testing
- Deployment checks

### Manual Monitoring

After deploying:
1. Visit live site
2. Open DevTools Console
3. Check for errors
4. Test all features
5. Report issues

## Quick Fixes

### Fix Build Errors
```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

### Fix Console Errors
```bash
# Common fixes
npm run build
# Check browser console
# Fix reported errors
# Rebuild and test
```

### Fix Import Errors
```bash
# Verify all imports
grep -r "import.*from" src/
# Fix missing imports
npm run build
```

## Testing Commands

### Quick Test
```bash
./test.sh
```

### Build Test
```bash
npm run build
```

### Dev Test
```bash
npm run dev
# Open browser and test manually
```

### Preview Test
```bash
npm run build && npm run preview
# Test production build locally
```

## Error Reporting

If you find errors:

1. **Note the error message**
2. **Check browser console**
3. **Check build logs**
4. **Fix the issue**
5. **Test again**
6. **Deploy fix**

## Monitoring Checklist

### Every Deploy
- [ ] Build succeeds
- [ ] No console errors
- [ ] Features work
- [ ] Mobile responsive
- [ ] Touch controls work
- [ ] PWA installable
- [ ] Service worker working

### Daily
- [ ] Check site is live
- [ ] Monitor console errors
- [ ] Test core features
- [ ] Check performance

### Weekly
- [ ] Full feature testing
- [ ] Test all devices
- [ ] Check analytics
- [ ] Review error logs

## Pro Tips

1. **Always test before deploying**
   ```bash
   npm run build && npm run preview
   ```

2. **Check console immediately after deployment**
   - Visit live site
   - Open DevTools
   - Check for errors

3. **Use error boundary for React errors**
   ```jsx
   // Wrap components to catch errors
   <ErrorBoundary>
     <App />
   </ErrorBoundary>
   ```

4. **Monitor bundle size**
   ```bash
   # Should be reasonable
   # JS: < 200KB
   # CSS: < 10KB
   ```

5. **Test on real devices**
   - Mobile phones
   - Tablets
   - Desktop browsers

## Automated Error Detection

### In Your Code

Add to `src/main.jsx`:
```javascript
// Error monitoring
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // You can send this to an error tracking service
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

## Success Criteria

✅ **App is working when:**
- Build completes without errors
- No console errors in browser
- Main menu displays correctly
- Game starts and plays
- All features functional
- Responsive on mobile
- Fast load time (< 3 seconds)

---

**Remember:** Always test locally before deploying! 🚀

