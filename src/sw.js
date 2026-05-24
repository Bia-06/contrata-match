// src/sw.js
// Service worker unificado: cache do PWA + push notifications

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// ════ PWA: Precache de assets gerados pelo Vite ════
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Cache de fontes do Google
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365
      })
    ]
  })
)

// Supabase: sempre network (não cachear dados dinâmicos)
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co'),
  new NetworkOnly()
)

// Skip waiting + claim clients (ativa o SW imediatamente)
self.skipWaiting()
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})


// ════ PUSH NOTIFICATIONS ════
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = { title: 'ContrataMatch', body: event.data.text() }
  }

  const title = data.title || 'ContrataMatch'
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
      { action: 'open', title: 'Ver candidato' },
      { action: 'close', title: 'Fechar' }
    ],
    requireInteraction: false
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})