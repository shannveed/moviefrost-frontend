// Layout.js - Updated with 3-minute ad delay and auth page exclusion
import React, { useRef, useEffect, useState } from 'react';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { AdsterraSocialBar, AdsterraPopunder, MonetagPopunder, MonetagBanner, PopAdsPopunder } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';
import { useLocation } from 'react-router-dom';

const AD_DELAY = 180000; // 3 minutes in ms

function Layout({ children }) {
  const adsLoadedRef = useRef(false);
  const timerRef = useRef(null);
  const location = useLocation();
  const [adsEnabled, setAdsEnabled] = useState(false);
  
  /* ----------------------------------------------------------
     Delay-initialiser (runs only once - 3-minute timer)
  ---------------------------------------------------------- */
  useEffect(() => {
    if (adsLoadedRef.current) return; // do this only once
    
    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        const path = window.location.pathname;
        const onAuth = path === '/login' || path === '/register';
        if (!onAuth) setAdsEnabled(true);
      }, AD_DELAY);
    };
    
    startTimer();
    
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);
  
  /* ----------------------------------------------------------
     Disable ads immediately whenever we arrive on auth pages
  ---------------------------------------------------------- */
  useEffect(() => {
    const onAuth = location.pathname === '/login' || location.pathname === '/register';
    if (onAuth) {
      setAdsEnabled(false); // hide / stop rendering
    } else if (!adsEnabled && adsLoadedRef.current) {
      // user left /login or /register AFTER the 3-min mark
      setAdsEnabled(true);
    }
  }, [location, adsEnabled]);
  
  /* remember once the components were injected - never do it again */
  useEffect(() => {
    if (adsEnabled) adsLoadedRef.current = true;
  }, [adsEnabled]);
  
  return (
    <div className="bg-main text-white">
      <ScrollOnTop>
        <NavBar />
        <div className="mobile:pt-4">
          {children}
        </div>
        <Footer />
        <MobileFooter />
        
        {/* Only render ads if adsEnabled is true */}
        {adsEnabled && (
          <>
            {/* Adsterra Social Bar - Single instance */}
            <AdsterraSocialBar atOptions={AD_CONFIG.adsterra.socialBar} />
            
            {/* Adsterra Popunder - Single instance */}
            <AdsterraPopunder atOptions={AD_CONFIG.adsterra.popunder} />
            
            {/* Monetag Popunder - one global instance */}
            {AD_CONFIG.monetag.popunder.enabled && (
              <MonetagPopunder 
                frequencyCap={AD_CONFIG.monetag.popunder.frequencyCap}
              />
            )}
            
            {/* Optional 728×90 banner right above the footer */}
            {AD_CONFIG.monetag.banner.enabled && (
              <div className="container mx-auto px-4 mb-8">
                <MonetagBanner
                  zoneId={AD_CONFIG.monetag.banner.zoneId}
                  width={728}
                  height={90}
                />
              </div>
            )}
            
            {/* PopAds Popunder - NEW (now also runs on iOS) */}
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
  );
}

export default Layout;
