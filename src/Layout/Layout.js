// Layout.js - Updated to include PopAds
import React, { useRef, useEffect } from 'react';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { AdsterraSocialBar, AdsterraPopunder, MonetagPopunder, PopAdsPopunder } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';

function Layout({ children }) {
  const adsLoadedRef = useRef(false);
  
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
        
        {/* Only render ads if not already loaded */}
        {adsLoadedRef.current && (
          <>
            {/* Adsterra Social Bar - Single instance */}
            <AdsterraSocialBar atOptions={AD_CONFIG.adsterra.socialBar} />
            
            {/* Adsterra Popunder - Single instance */}
            <AdsterraPopunder atOptions={AD_CONFIG.adsterra.popunder} />
            
            {/* Monetag Popunder */}
            {AD_CONFIG.monetag.popunder.enabled && (
              <MonetagPopunder 
                frequencyCap={AD_CONFIG.monetag.popunder.frequencyCap}
              />
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
