const SW_VERSION = 'mq-pwa-v2';
const STATIC_CACHE = `${SW_VERSION}-static`;
const API_CACHE = `${SW_VERSION}-api`;
const PAGE_CACHE = `${SW_VERSION}-pages`;
const OFFLINE_SYNC_TAG = 'moneyquest-offline-mutations';
const PRECACHE_URLS = ['/', '/dashboard', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => !key.startsWith(SW_VERSION))
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  if (isStaticAssetRequest(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
  }
});

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event);

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: {
        tag: payload.tag,
        url: payload.url,
      },
      icon: payload.icon,
      tag: payload.tag,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.notification.close();
  event.waitUntil(focusOrOpenClient(targetUrl));
});

self.addEventListener('sync', (event) => {
  if (event.tag !== OFFLINE_SYNC_TAG) {
    return;
  }

  event.waitUntil(notifyClients({ type: 'OFFLINE_SYNC_REQUEST', tag: OFFLINE_SYNC_TAG }));
});

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => undefined);
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

async function handleNavigationRequest(request) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const fallback = await caches.match('/dashboard');
    return fallback || Response.error();
  }
}

function isStaticAssetRequest(pathname) {
  return pathname.startsWith('/_next/static/') || pathname.startsWith('/icons/') || pathname.endsWith('.css') || pathname.endsWith('.js');
}

function parsePushPayload(event) {
  if (!event.data) {
    return {
      body: 'You have a new MoneyQuest update.',
      icon: '/icons/icon-192x192.svg',
      tag: 'moneyquest-generic',
      title: 'MoneyQuest',
      url: '/dashboard',
    };
  }

  try {
    const data = event.data.json();

    return {
      body: data.body || 'You have a new MoneyQuest update.',
      icon: data.icon || '/icons/icon-192x192.svg',
      tag: data.tag || 'moneyquest-generic',
      title: data.title || 'MoneyQuest',
      url: data.url || '/dashboard',
    };
  } catch {
    return {
      body: event.data.text() || 'You have a new MoneyQuest update.',
      icon: '/icons/icon-192x192.svg',
      tag: 'moneyquest-generic',
      title: 'MoneyQuest',
      url: '/dashboard',
    };
  }
}

async function focusOrOpenClient(targetUrl) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  const normalizedUrl = new URL(targetUrl, self.location.origin).toString();

  for (const client of allClients) {
    if (client.url === normalizedUrl && 'focus' in client) {
      return client.focus();
    }
  }

  if (self.clients.openWindow) {
    return self.clients.openWindow(targetUrl);
  }

  return undefined;
}

async function notifyClients(message) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });

  await Promise.all(allClients.map((client) => client.postMessage(message)));
}
