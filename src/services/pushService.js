// src/services/pushService.js
import { supabase } from '../lib/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Converte VAPID key de base64url para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushService = {

  // Verifica se o browser suporta push notifications
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  // Estado atual da permissão
  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  },

  // Verifica se já tem subscription ativa
  async isSubscribed() {
    if (!this.isSupported()) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      return !!sub;
    } catch {
      return false;
    }
  },

  // Registra o service worker de push (separado do PWA)
  async registerPushSW() {
    if (!this.isSupported()) throw new Error('Push notifications não suportadas neste navegador');
    return await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
  },

  // Pede permissão e cria subscription
  async subscribe(user, companyId) {
    if (!this.isSupported()) {
      throw new Error('Push notifications não suportadas neste navegador');
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID_PUBLIC_KEY não configurada no .env');
    }

    // Pede permissão
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão de notificação negada');
    }

    // Registra service worker
    const registration = await this.registerPushSW();

    // Cria subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Extrai chaves
    const json = subscription.toJSON();
    const p256dh = json.keys.p256dh;
    const auth = json.keys.auth;

    // Salva no Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        company_id: companyId,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent
      }, { onConflict: 'endpoint' });

    if (error) {
      // Se falhou no DB, desfaz a subscription
      await subscription.unsubscribe();
      throw error;
    }

    return subscription;
  },

  // Remove subscription
  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    // Remove do banco
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subscription.endpoint);

    // Remove do navegador
    await subscription.unsubscribe();
  },

  // Envia notificação de teste
  async sendTestNotification(userId) {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: { test: true, user_id: userId }
    });
    if (error) throw error;
    return data;
  }
};