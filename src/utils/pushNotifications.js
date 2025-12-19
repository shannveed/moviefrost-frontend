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

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  !!VAPID_PUBLIC_KEY;

export const ensurePushSubscription = async (token) => {
  if (!isPushSupported() || !token) return { supported: false, subscribed: false };

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await Axios.post('/push/subscribe', sub, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { supported: true, subscribed: true };
};

export const requestPermissionAndSubscribe = async (token) => {
  if (!isPushSupported()) return { supported: false, subscribed: false };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { supported: true, subscribed: false, permission };
  }

  return ensurePushSubscription(token);
};
