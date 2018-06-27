const currenciesURL = 'https://free.currencyconverterapi.com/api/v5/currencies';
const staticCacheName = 'cc-static-v2';
const contentCurrCache = 'cc-currencies';
const allCaches = [
    staticCacheName,
    contentCurrCache
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            return cache.addAll([
                'index.html',
                'app.js',
                'main.css',
                'https://github.com/jakearchibald/idb/blob/master/lib/idb.js',
                'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css'
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('cc-') &&
                        !allCaches.includes(cacheName);
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/' || requestUrl.pathname === 'index.html') {
            event.respondWith(caches.match('index.html'));
            return;
        }
    }

    // TODO: respond to currency api url by responding with
    // the return value of serveCurrencies(event.request)
    if (requestUrl.href === currenciesURL) {
        event.respondWith(serveCurrencies(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

function serveCurrencies(request) {
    return caches.open(contentCurrCache).then(cache => {
        return cache.match(request).then(response => {
            const newFetch = fetch(request).then(networkResponse => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });

            return response || newFetch;
        });
    });
}