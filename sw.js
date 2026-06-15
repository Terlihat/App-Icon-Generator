const CACHE_NAME = 'iconify-web-v1.1.0';

// Daftar aset internal dan eksternal yang perlu disimpan di cache untuk penggunaan offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// 1. Event Install: Menyimpan semua aset ke dalam cache saat PWA pertama kali dipasang
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Menyiapkan cache dan menyimpan aset...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// 2. Event Activate: Membersihkan cache versi lama jika ada pembaruan kode aplikasi
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Menghapus cache versi lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Event Fetch: Mengambil aset dari cache terlebih dahulu saat offline (Cache-First Strategy)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Jika aset ada di cache, gunakan cache. Jika tidak, ambil dari jaringan internet.
            return cachedResponse || fetch(event.request);
        }).catch(() => {
            // Opsional: Penanganan fallback jika gagal mengambil dari internet maupun cache
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});