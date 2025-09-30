import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';
import { AdsterraSocialBar, AdsterraPopunder, MonetagPopunder, MonetagBanner, PopAdsPopunder } from '../Components/Ads/AdWrapper';
import { AD_CONFIG } from '../Components/Ads/AdConfig';

function Layout({ children }) {
  const adsLoadedRef = useRef(false);
  const location = useLocation();
  const path = location.pathname;
  const isAuthRoute = path === '/login' || path === '/register';

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
        
        {/* ---- ALL AD-COMPONENTS TEMPORARILY DISABLED ----
        {adsLoadedRef.current && !isAuthRoute && (
          <>
            <AdsterraSocialBar atOptions={AD_CONFIG.adsterra.socialBar} />
            <AdsterraPopunder atOptions={AD_CONFIG.adsterra.popunder} />
            
            {AD_CONFIG.monetag.popunder.enabled && (
              <MonetagPopunder 
                frequencyCap={AD_CONFIG.monetag.popunder.frequencyCap}
              />
            )}
            
            {AD_CONFIG.monetag.banner.enabled && (
              <div className="container mx-auto px-4 mb-8">
                <MonetagBanner
                  zoneId={AD_CONFIG.monetag.banner.zoneId}
                  width={728}
                  height={90}
                />
              </div>
            )}
            
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
        */}
      </ScrollOnTop>
    </div>
  );
}

export default Layout;