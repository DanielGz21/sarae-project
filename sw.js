const CACHE_NAME = 'sarae-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.jsx',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:wght@300;400;600&family=Outfit:wght@100..900&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Cache Strategy: Stale-While-Revalidate for images, Network-First for others
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // If it's a Supabase Media URL, use Cache-First to save bandwidth
    if (url.href.includes('supabase.co/storage/v1/object/public')) {
        event.respondWith(
            caches.open('sarae-media').then((cache) => {
                return cache.match(event.request).then((response) => {
                    return response || fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // Default Strategy: Network-First for dynamic content
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
