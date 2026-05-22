// public/sw-push.js
// Service Worker para receber push notifications
// Este arquivo é registrado SEPARADAMENTE do service worker do PWA

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'ContrataMatch', body: event.data.text() };
  }

  const title = data.title || 'ContrataMatch';
  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'contratamatch-notification',
    data: {
      url: data.url || '/',
      application_id: data.application_id
    },
    actions: [
      {
        action: 'open',
        title: 'Ver candidato'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    requireInteraction: false
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já tem uma janela aberta, foca nela
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Senão, abre nova
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});