const CACHE_NAME = 'space-adventures-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/game-engine.js',
  '/js/firebase-config.js',
  '/js/sprite-manager.js',
  '/js/pwa-updates.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated and old caches cleaned');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle background sync for updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-update') {
    event.waitUntil(doBackgroundUpdate());
  }
});

// Check for updates
async function doBackgroundUpdate() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await Promise.all(urlsToCache.map(url => fetch(url)));
    
    // Update cache with new versions
    for (let i = 0; i < urlsToCache.length; i++) {
      const response = requests[i];
      if (response.ok) {
        await cache.put(urlsToCache[i], response.clone());
      }
    }
    
    console.log('Background update completed');
    
    // Notify all clients about the update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        cacheName: CACHE_NAME
      });
    });
  } catch (error) {
    console.error('Background update failed:', error);
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.waitUntil(checkForUpdate());
  }
});

// Check for updates in the background
async function checkForUpdate() {
  try {
    const response = await fetch('/sw.js', { cache: 'no-cache' });
    const newContent = await response.text();
    
    // Simple hash check (in production, you'd want a more sophisticated approach)
    const newHash = await hashString(newContent);
    const oldHash = await getCurrentHash();
    
    if (newHash !== oldHash) {
      // Update is available
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          cacheName: CACHE_NAME
        });
      });
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
}

// Simple hash function (for demo purposes)
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get current hash from cache
async function getCurrentHash() {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match('/sw.js');
  if (response) {
    const content = await response.text();
    return await hashString(content);
  }
  return '';
}
