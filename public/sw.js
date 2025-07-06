
const CACHE_NAME = 'uradio-v1.0.2';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Uradio SW: Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Uradio SW: Caching essential assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Uradio SW: Installation successful');
      })
      .catch((error) => {
        console.error('Uradio SW: Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Uradio SW: Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Uradio SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Uradio SW: Service worker activated and ready');
      return self.clients.claim();
    })
  );
});

// Enhanced fetch event handling for mobile PWA
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests, audio streams, and non-GET requests
  if (!request.url.startsWith(self.location.origin) || 
      request.url.includes('audio') ||
      request.url.includes('stream') ||
      request.url.includes('.m3u8') ||
      request.url.includes('api/') ||
      request.method !== 'GET') {
    return;
  }

  // Handle navigation requests with better mobile support
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/').then(cachedResponse => {
            return cachedResponse || new Response('Offline - Please check your connection', { 
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        })
    );
    return;
  }

  // Handle static assets - cache first for better mobile performance
  if (STATIC_CACHE_URLS.includes(url.pathname) || url.pathname.includes('lovable-uploads')) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request).then(fetchResponse => {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
            return fetchResponse;
          });
        })
        .catch(() => {
          // Fallback for offline mode
          if (url.pathname.includes('lovable-uploads')) {
            return new Response('', { status: 404 });
          }
          return caches.match('/');
        })
    );
  }
});

// Background sync for mobile
self.addEventListener('sync', (event) => {
  console.log('Uradio SW: Background sync triggered:', event.tag);
});

// Enhanced push notifications for mobile
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png',
      badge: '/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'open',
          title: 'Open Uradio'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Uradio', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
