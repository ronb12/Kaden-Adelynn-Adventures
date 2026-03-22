// Kaden & Adelynn Adventures — Service Worker
const CACHE_NAME = 'ka-adventures-v3'

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Network-first: try network, fall back to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (request.method === 'GET' && response.ok) {
          const ext = url.pathname.split('.').pop().toLowerCase()
          const cacheable = ['png','jpg','jpeg','webp','svg','ogg','mp3','js','css']
          if (cacheable.includes(ext)) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
