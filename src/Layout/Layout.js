// Layout.js - Updated with ad manager
import React, { useRef, useEffect } from 'react';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { AdsterraSocialBar, AdsterraPopunder, MonetagPopunder, MonetagBanner, PopAdsPopunder } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';
import { useAdManager } from '../Components/hooks/useAdManager';

function Layout({ children }) {
  const adsLoadedRef = useRef(false);
  const { adsEnabled, timeRemaining } = useAdManager();
  
  useEffect(() => {
    if (adsEnabled) {
      adsLoadedRef.current = true;
    }
    
    return () => {
      adsLoadedRef.current = false;
    };
  }, [adsEnabled]);
  
  return (
    <div className="bg-main text-white">
      <ScrollOnTop>
        <NavBar />
        
        {/* Ad countdown timer - only show if ads are delayed */}
        {!adsEnabled && timeRemaining > 0 && (
          <div className="fixed top-20 right-4 bg-dry border border-customPurple rounded-lg px-4 py-2 z-40 text-sm">
            Ad-free browsing: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </div>
        )}
        
        <div className="mobile:pt-4">
          {children}
        </div>
        <Footer />
        <MobileFooter />
        
        {/* Only render ads if enabled and loaded */}
        {adsEnabled && adsLoadedRef.current && (
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
  );
}

export default Layout;
