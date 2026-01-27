// Service Worker for PWA offline support
// Version: 16 - Make UI more compact to maximize gameplay area
const CACHE_VERSION = 'v16'
const CACHE_NAME = `space-adventures-${CACHE_VERSION}`
const RUNTIME_CACHE = `runtime-cache-${CACHE_VERSION}`

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
]

// Install event - cache essential assets and skip waiting for immediate activation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching precache assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log('[SW] Service worker installed, skipping waiting')
        return self.skipWaiting() // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error)
      })
  )
})

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete all old caches that don't match current version
            return cacheName !== CACHE_NAME && 
                   cacheName !== RUNTIME_CACHE &&
                   cacheName.startsWith('space-adventures-') || 
                   cacheName.startsWith('runtime-cache-')
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
    .then(() => {
      console.log('[SW] Claiming clients')
      return self.clients.claim() // Take control of all pages immediately
    })
    .then(() => {
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          })
        })
      })
    })
  )
})

// Fetch event - network-first strategy for HTML/JS, cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  const url = new URL(event.request.url)
  const isHTML = event.request.headers.get('accept')?.includes('text/html')
  const isJS = url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs')
  const isCSS = url.pathname.endsWith('.css')
  const isManifest = url.pathname.endsWith('manifest.json')
  const isSW = url.pathname.endsWith('sw.js')

  // Always fetch service worker and manifest from network (no cache)
  if (isSW || isManifest) {
    event.respondWith(fetch(event.request))
    return
  }

  // Network-first strategy for HTML and JS (ensures updates)
  if (isHTML || isJS || isCSS) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
        })
    )
    return
  }

  // Cache-first strategy for other assets (images, audio, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        // Fetch from network and cache
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Listen for messages from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Force update check
    self.registration.update()
  }
})
