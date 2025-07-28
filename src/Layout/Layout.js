// Layout.js - Updated to include PopAds, Monetag, and Hilltop-Ads
import React, { useRef, useEffect } from 'react';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { AdsterraSocialBar, AdsterraPopunder, MonetagPopunder, MonetagBanner, PopAdsPopunder, HilltopVastTag } from '../Components/Ads/AdWrapper';
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
            
            {/* Hilltop-Ads VAST tag – one global invisible 1×1 iframe */}
            {AD_CONFIG.hilltop.enabled && (
              <HilltopVastTag
                enabled={AD_CONFIG.hilltop.enabled}
                vastUrl={AD_CONFIG.hilltop.vastUrl}
                width={AD_CONFIG.hilltop.width}
                height={AD_CONFIG.hilltop.height}
              />
            )}
          </>
        )}
      </ScrollOnTop>
    </div>
  );
}

export default Layout;
