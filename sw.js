const CACHE_NAME = 'gamskillhub-v1';
const ASSETS_TO_CACHE = [
  '/SKILLHUB/',
  '/SKILLHUB/index.html',
  '/SKILLHUB/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Cache addAll error:', err);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if available
      if (response) {
        return response;
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful API responses and assets
          if (event.request.url.includes('/api/') || 
              event.request.url.includes('.js') ||
              event.request.url.includes('.css') ||
              event.request.url.includes('.json')) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline page or cached response
          return caches.match('/SKILLHUB/index.html');
        });
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  try {
    const db = await openIndexedDB();
    const pendingOrders = await getPendingOrders(db);
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/SKILLHUB/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await removePendingOrder(db, order.id);
        }
      } catch (err) {
        console.error('Failed to sync order:', err);
      }
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GamSkillHub', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending_orders')) {
        db.createObjectStore('pending_orders', { keyPath: 'id' });
      }
    };
  });
}

function getPendingOrders(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending_orders', 'readonly');
    const store = transaction.objectStore('pending_orders');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingOrder(db, orderId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending_orders', 'readwrite');
    const store = transaction.objectStore('pending_orders');
    const request = store.delete(orderId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
