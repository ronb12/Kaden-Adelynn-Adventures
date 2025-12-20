# Clear Browser Cache and Service Worker

## Quick Fix for 404 Errors

If you're seeing 404 errors for `index-*.js` or `index-*.css` files:

### Method 1: Hard Refresh (Easiest)
1. **Chrome/Edge**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Firefox**: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. **Safari**: Press `Cmd+Option+R`

### Method 2: Clear Service Worker
1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Service Workers** in the left sidebar
4. Click **Unregister** for any registered service workers
5. Go to **Clear Storage** or **Storage**
6. Click **Clear site data** or **Clear All**
7. Refresh the page

### Method 3: Disable Service Worker in Dev
The service worker is already disabled for localhost in the code, but if you're accessing via IP:
1. Open Developer Tools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. Check **Bypass for network** or **Update on reload**

### Method 4: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select **Empty Cache and Hard Reload**

## For Development

The service worker should automatically be disabled on localhost. If you're still having issues:

1. Make sure you're accessing `http://localhost:3001` (not a cached IP address)
2. Stop the dev server: `pkill -f vite`
3. Clear the dist folder: `rm -rf dist/`
4. Restart: `npm run dev`
5. Hard refresh the browser

## Verify Dev Server is Running

Check if the server is running:
```bash
lsof -ti:3001
```

If it returns a process ID, the server is running.
If it returns nothing, start it with: `npm run dev`

