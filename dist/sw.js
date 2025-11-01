// Service Worker for PWA
const CACHE_NAME = 'kaden-adventures-v5'
const urlsToCache = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png']

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error)
      })
  )
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim())
  // Force refresh all open windows to pick up new assets
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        if (client && 'navigate' in client) {
          client.navigate(client.url)
        }
      })
    })
  )
})

// Fetch event with better mobile handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response
      }

      // Fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Cache successful responses
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
    })
  )
})

// Allow pages to request immediate activation of a waiting SW
self.addEventListener('message', (event) => {
  if (!event.data) return
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
