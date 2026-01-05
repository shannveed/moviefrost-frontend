// Frontend/src/ads/PopAds.js
import { useEffect } from 'react';

const envBool = (val, fallback = false) => {
  if (val === undefined || val === null) return fallback;
  const v = String(val).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
};

const toHttps = (src) => {
  if (!src) return '';
  if (src.startsWith('//')) return `https:${src}`;
  return src;
};

export default function PopAds() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const ADS_ENABLED = envBool(process.env.REACT_APP_ADS_ENABLED, false);
    const POPADS_ENABLED = envBool(process.env.REACT_APP_POPADS_ENABLED, false);

    if (!ADS_ENABLED || !POPADS_ENABLED) return;

    // Support both names (you currently use REACT_APP_POPADS_WEBSITE_ID)
    const siteIdRaw =
      process.env.REACT_APP_POPADS_SITE_ID ||
      process.env.REACT_APP_POPADS_WEBSITE_ID;

    const siteId = Number(siteIdRaw);
    if (!Number.isFinite(siteId) || siteId <= 0) {
      console.warn('[PopAds] Missing/invalid site id. Set REACT_APP_POPADS_WEBSITE_ID.');
      return;
    }

    // Prevent duplicates
    if (document.getElementById('popads-js')) return;

    // PopAds config (keep it minimal; add more only if PopAds gives you options)
    window._pop = window._pop || [];
    window._pop.push(['siteId', siteId]);

    // Load PopAds script
    const s = document.createElement('script');
    s.id = 'popads-js';
    s.async = true;
    s.src = toHttps('//c1.popads.net/pop.js');
    s.onerror = () => console.warn('[PopAds] Script failed to load:', s.src);

    document.body.appendChild(s);
  }, []);

  return null;
}