self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    const data = event.data?.json();
    if (data && typeof data === 'object') payload = data;
  } catch (error) {
    console.error('Unable to parse a Web Push notification:', error);
  }

  const title = typeof payload.title === 'string' ? payload.title : 'MalakInfo';
  const options = {
    body: typeof payload.body === 'string' ? payload.body : '',
    icon: typeof payload.icon === 'string' ? payload.icon : '/images/logo.png',
    badge: '/images/logo.png',
    tag: typeof payload.tag === 'string' ? payload.tag : 'malakinfo-notification',
    renotify: true,
    data: { url: typeof payload.url === 'string' ? payload.url : '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
          return client.focus().then((focused) => {
            if (focused && 'navigate' in focused) {
              return focused.navigate(targetUrl);
            }
            return focused;
          });
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});

self.addEventListener('message', (event) => {
  const payload = event.data;
  if (!payload || payload.type !== 'SHOW_PUBLICATION') return;

  const title = payload.title || 'MalakInfo';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/images/logo.png',
    badge: '/images/logo.png',
    tag: payload.tag || 'malakinfo-publication',
    renotify: true,
    data: { url: payload.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
