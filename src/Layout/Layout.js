// Layout.js - Updated to include PopAds and Monetag
import React, { useRef, useEffect } from 'react';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { AdsterraSocialBar, AdsterraPopunder, MonetagPopunder, MonetagBanner, PopAdsPopunder } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';
import { useLocation } from 'react-router-dom'; // NEW: Import useLocation

function Layout({ children }) {
  const adsLoadedRef = useRef(false);
  const location = useLocation(); // NEW: Get current location
  
  // NEW: Define paths where ads should NOT load
  const noAdsPaths = ['/login', '/register'];
  
  // NEW: Check if current path should show ads
  const showAds = !noAdsPaths.includes(location.pathname);
  
  useEffect(() => {
    // Ensure ads are only loaded once per layout mount
    adsLoadedRef.current = true;
    
    return () => {
      adsLoadedRef.current = false;
    };
  }, []);
  
  return (
    <div className="bg-main text-white">
      <ScrollOnTop>
        <NavBar />
        <div className="mobile:pt-4">
          {children}
        </div>
        <Footer />
        <MobileFooter />
        
        {/* Only render ads if showAds is true and not already loaded */}
        {showAds && adsLoadedRef.current && (
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

