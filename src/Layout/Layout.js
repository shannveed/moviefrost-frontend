// Layout.js - Updated to prevent duplicate ad loading
import React, { useRef, useEffect } from 'react';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { StickyVideoAd, AdsterraSocialBar, AdsterraPopunder } from '../Components/Ads/AdWrapper';
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
            {/* Sticky Video Ad - Only on desktop */}
            <StickyVideoAd position="bottom-right" />
            
            {/* Adsterra Social Bar - Single instance */}
            <AdsterraSocialBar atOptions={AD_CONFIG.adsterra.socialBar} />
            
            {/* Adsterra Popunder - Single instance */}
            <AdsterraPopunder atOptions={AD_CONFIG.adsterra.popunder} />
          </>
        )}
      </ScrollOnTop>
    </div>
  );
}

export default Layout;
  