const CACHE_NAME = 'perfumes-plug-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Enhanced fetch handler for mobile image loading
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle image requests with mobile optimizations
  if (request.destination === 'image' || url.pathname.includes('/media/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached version if available and not expired
          if (cachedResponse) {
            const cacheDate = new Date(cachedResponse.headers.get('date'));
            const now = new Date();
            const daysSinceCached = (now - cacheDate) / (1000 * 60 * 60 * 24);
            
            // Use cached version if less than 1 day old
            if (daysSinceCached < 1) {
              return cachedResponse;
            }
          }
          
          // Fetch with timeout for mobile networks
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), 15000);
          });
          
          const fetchPromise = fetch(request, {
            mode: 'cors',
            credentials: 'omit'
          }).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open('mobile-images-v1').then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
          
          return Promise.race([fetchPromise, timeoutPromise])
            .catch(() => {
              // Fallback to cached version or placeholder
              return cachedResponse || new Response('', { status: 404 });
            });
        })
    );
  }
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline orders or other background tasks
  return new Promise((resolve) => {
    // Implement background sync logic here
    resolve();
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Perfumes Plug',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Products',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Perfumes Plug', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});