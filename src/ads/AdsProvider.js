// Frontend/src/ads/AdsProvider.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PopAds from './PopAds';
import AdAstra from './AdAstra';

const envBool = (val, fallback = false) => {
  if (val === undefined || val === null) return fallback;
  const v = String(val).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
};

const getDelayMs = () => {
  const raw = process.env.REACT_APP_ADS_DELAY_MS;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) return n;
  return 15000; // default 15 seconds
};

export default function AdsProvider() {
  const { userInfo } = useSelector((state) => state.userLogin || {});

  const ADS_ENABLED = envBool(process.env.REACT_APP_ADS_ENABLED, false);

  // Optional: prevent ads for admin accounts (default: false = admins don't see ads)
  const SHOW_FOR_ADMIN = envBool(process.env.REACT_APP_ADS_SHOW_FOR_ADMIN, false);

  const shouldLoadAds = ADS_ENABLED && (!userInfo?.isAdmin || SHOW_FOR_ADMIN);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!shouldLoadAds) return;

    const delayMs = getDelayMs();
    const t = setTimeout(() => setReady(true), delayMs);

    return () => clearTimeout(t);
  }, [shouldLoadAds]);

  // After delay, mount both loaders
  if (!ready) return null;

  return (
    <>
      <PopAds />
      <AdAstra />
    </>
  );
}