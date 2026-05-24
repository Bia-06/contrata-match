// src/services/pushService.js
import { supabase } from '../lib/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

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

  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

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

  async subscribe(user, companyId) {
    if (!this.isSupported()) {
      throw new Error('Push notifications não suportadas neste navegador');
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID_PUBLIC_KEY não configurada no .env');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão de notificação negada');
    }

    // Usa o SW que já está registrado pelo vite-plugin-pwa
    // (não tenta registrar um novo)
    const registration = await navigator.serviceWorker.ready;

    if (!registration) {
      throw new Error('Service worker não disponível. Recarregue a página e tente novamente.');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const json = subscription.toJSON();
    const p256dh = json.keys.p256dh;
    const auth = json.keys.auth;

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
      await subscription.unsubscribe();
      throw error;
    }

    return subscription;
  },

  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subscription.endpoint);

    await subscription.unsubscribe();
  },

  async sendTestNotification(userId) {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: { test: true, user_id: userId }
    });
    if (error) throw error;
    return data;
  }
}