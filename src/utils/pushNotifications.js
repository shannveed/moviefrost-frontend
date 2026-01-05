// Frontend/src/utils/pushNotifications.js
import Axios from '../Redux/APIs/Axios';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
};

const getOrRegisterServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  // Try existing SW registration
  let reg = await navigator.serviceWorker.getRegistration();
  if (reg) return reg;

  // Register if missing (safe in production + localhost)
  try {
    reg = await navigator.serviceWorker.register('/service-worker.js');
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.warn('[push] service-worker registration failed:', err);
    return null;
  }
};

export const isPushSupported = () => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;

  if (!VAPID_PUBLIC_KEY) {
    console.warn(
      '[push] Missing REACT_APP_VAPID_PUBLIC_KEY in frontend env. Push is disabled.'
    );
    return false;
  }

  return true;
};

export const ensurePushSubscription = async (token) => {
  if (!token) return { supported: isPushSupported(), subscribed: false, reason: 'no_token' };
  if (!isPushSupported()) return { supported: false, subscribed: false, reason: 'not_supported' };

  const reg = await getOrRegisterServiceWorker();
  if (!reg) return { supported: false, subscribed: false, reason: 'no_service_worker' };

  // Must have permission granted
  if (Notification.permission !== 'granted') {
    return { supported: true, subscribed: false, permission: Notification.permission };
  }

  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Save/update subscription on backend (bound to this user)
  await Axios.post('/push/subscribe', sub, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { supported: true, subscribed: true, permission: Notification.permission };
};

export const requestPermissionAndSubscribe = async (token) => {
  if (!isPushSupported()) return { supported: false, subscribed: false, reason: 'not_supported' };

  // If already denied, browser won't show prompt again
  if (Notification.permission === 'denied') {
    return { supported: true, subscribed: false, permission: 'denied' };
  }

  // If already granted, just ensure subscription exists
  if (Notification.permission === 'granted') {
    return ensurePushSubscription(token);
  }

  // Ask permission (must be triggered by user gesture)
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { supported: true, subscribed: false, permission };
  }

  return ensurePushSubscription(token);
};
