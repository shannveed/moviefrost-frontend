// Layout.js - Global Ads Gate (30s delay) + No ads on /login and /register
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import {
  AdsterraSocialBar,
  AdsterraPopunder,
  MonetagPopunder,
  MonetagBanner,
  PopAdsPopunder
} from '../Ads/AdWrapper';
import { AD_CONFIG } from '../Ads/AdConfig';
import { AdsProvider } from '../Ads/AdsContext';

const ADS_DELAY_MS = 40000; // 30 seconds

function Layout({ children }) {
  const location = useLocation();
  const [timerAllowed, setTimerAllowed] = useState(false);

  // Determine if this route is an auth route where ads should be completely disabled
  const isAuthRoute = useMemo(() => {
    const p = location.pathname.toLowerCase();
    return p === '/login' || p === '/register';
  }, [location.pathname]);

  // Respect env toggle as well (REACT_APP_ADS_ENABLED !== 'false' means enabled)
  const envEnabled = process.env.REACT_APP_ADS_ENABLED !== 'false';

  // One-time 30s gate per tab/session
  useEffect(() => {
    // Use sessionStorage to keep a consistent gate per tab
    const key = '__ads_allow_at';
    let allowAt = sessionStorage.getItem(key);

    const now = Date.now();

    if (!allowAt) {
      allowAt = String(now + ADS_DELAY_MS);
      sessionStorage.setItem(key, allowAt);
    }

    const allowTime = parseInt(allowAt, 10);
    if (Number.isFinite(allowTime) && now >= allowTime) {
      setTimerAllowed(true);
      window.__ADS_ALLOWED = true;
    } else {
      const remaining = Math.max(0, allowTime - now);
      const t = setTimeout(() => {
        setTimerAllowed(true);
        window.__ADS_ALLOWED = true;
      }, remaining);
      return () => clearTimeout(t);
    }
  }, []);

  // Final allowed flag
  const adsAllowed = envEnabled && timerAllowed && !isAuthRoute;

  // Also expose to window (if any 3rd-party loader checks it)
  useEffect(() => {
    window.__ADS_ALLOWED = adsAllowed;
  }, [adsAllowed]);

  return (
    <AdsProvider value={{ allowed: adsAllowed }}>
      <div className="bg-main text-white">
        <ScrollOnTop>
          <NavBar />

          <div className="mobile:pt-4">
            {children}
          </div>

          <Footer />
          <MobileFooter />

          {/* Render all ad scripts/components ONLY when allowed */}
          {adsAllowed && (
            <>
              {/* Adsterra Social Bar */}
              <AdsterraSocialBar atOptions={AD_CONFIG.adsterra.socialBar} />

              {/* Adsterra Popunder */}
              <AdsterraPopunder atOptions={AD_CONFIG.adsterra.popunder} />

              {/* Monetag Popunder */}
              {AD_CONFIG.monetag.popunder.enabled && (
                <MonetagPopunder frequencyCap={AD_CONFIG.monetag.popunder.frequencyCap} />
              )}

              {/* Optional Monetag 728x90 banner above footer */}
              {AD_CONFIG.monetag.banner.enabled && (
                <div className="container mx-auto px-4 mb-8">
                  <MonetagBanner
                    zoneId={AD_CONFIG.monetag.banner.zoneId}
                    width={728}
                    height={90}
                  />
                </div>
              )}

              {/* PopAds Popunder */}
              {AD_CONFIG.popAds.enabled && (
                <PopAdsPopunder
                  enabled={AD_CONFIG.popAds.enabled}
                  websiteId={AD_CONFIG.popAds.websiteId}
                  popundersIP={AD_CONFIG.popAds.popundersPerIP}
                  delay={AD_CONFIG.popAds.delayBetween}
                  minBid={AD_CONFIG.popAds.minBid}
                />
              )}
            </>
          )}
        </ScrollOnTop>
      </div>
    </AdsProvider>
  );
}

export default Layout;
