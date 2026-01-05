// Frontend/src/ads/AdAstra.js
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

const parseCsv = (val) =>
  String(val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export default function AdAstra() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const ADS_ENABLED = envBool(process.env.REACT_APP_ADS_ENABLED, false);

    // You can keep this true/false separate from ADS_ENABLED if you want
    const ADASTRA_ENABLED = envBool(process.env.REACT_APP_ADASTRA_ENABLED, true);

    if (!ADS_ENABLED || !ADASTRA_ENABLED) return;

    // Script sources (support one or many)
    const srcs = [
      ...parseCsv(process.env.REACT_APP_ADASTRA_SCRIPT_SRCS),
      ...parseCsv(process.env.REACT_APP_ADASTRA_SCRIPT_SRC),
    ];

    if (!srcs.length) {
      console.warn(
        '[AdAstra] No script src provided. Set REACT_APP_ADASTRA_SCRIPT_SRC or REACT_APP_ADASTRA_SCRIPT_SRCS.'
      );
      return;
    }

    // Optional inline JS config if your network requires it
    // (only use if your ad network gives you an inline config snippet)
    const inlineJs = process.env.REACT_APP_ADASTRA_INLINE_JS;

    if (inlineJs && !document.getElementById('adastra-inline-js')) {
      const inline = document.createElement('script');
      inline.id = 'adastra-inline-js';
      inline.type = 'text/javascript';
      inline.text = inlineJs;
      document.body.appendChild(inline);
    }

    // Load each script once
    srcs.forEach((rawSrc, idx) => {
      const id = `adastra-js-${idx}`;
      if (document.getElementById(id)) return;

      const s = document.createElement('script');
      s.id = id;
      s.async = true;
      s.src = toHttps(rawSrc);
      s.onerror = () => console.warn('[AdAstra] Script failed to load:', s.src);

      document.body.appendChild(s);
    });
  }, []);

  return null;
}