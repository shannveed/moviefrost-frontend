// src/hooks/useAdsAllowed.js
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ADS_DELAY = 180_000; // 3 minutes → 180,000 ms
const STORE_KEY = 'mf_first_visit'; // sessionStorage key
const DISABLED_ROUTES = ['/login', '/register'];

export default function useAdsAllowed() {
  const { pathname } = useLocation();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    /* 1. Keep the two "clean" pages 100% ad-free */
    if (DISABLED_ROUTES.includes(pathname)) {
      setAllowed(false);
      return;
    }

    /* 2. Read/initialize first visit time (per-TAB/per-SESSION) */
    const first = Number(sessionStorage.getItem(STORE_KEY)) || Date.now();
    sessionStorage.setItem(STORE_KEY, first);

    /* 3. Work out remaining delay */
    const diff = Date.now() - first;
    const timeLeft = Math.max(ADS_DELAY - diff, 0);

    if (timeLeft === 0) {
      setAllowed(true);
    } else {
      const t = setTimeout(() => setAllowed(true), timeLeft);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  /* 4. Honour the global .env switch as before */
  return (
    allowed &&
    process.env.REACT_APP_ADS_ENABLED !== 'false' // keeps the original env flag
  );
}
