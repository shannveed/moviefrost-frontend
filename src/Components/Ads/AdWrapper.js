// AdWrapper.js - Updated with 3-minute delay and path checking
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AD_CONFIG } from './AdConfig';

// Global tracking for loaded scripts to prevent duplicates
const loadedScripts = new Set();
const scriptLoadPromises = new Map();

// Check if ads should be loaded based on path and delay
const useAdControl = () => {
  const location = useLocation();
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [globalAdsEnabled, setGlobalAdsEnabled] = useState(false);
  
  useEffect(() => {
    // Check if current path is in disabled paths
    const isDisabledPath = AD_CONFIG.global.disabledPaths.some(path => 
      location.pathname === path
    );
    
    if (isDisabledPath) {
      setAdsEnabled(false);
      return;
    }
    
    // Check if we've already waited the delay period in this session
    const adDelayExpiry = sessionStorage.getItem('adDelayExpiry');
    const currentTime = Date.now();
    
    if (adDelayExpiry && currentTime >= parseInt(adDelayExpiry)) {
      setAdsEnabled(true);
      setGlobalAdsEnabled(true);
    } else if (!adDelayExpiry) {
      // First visit - set the delay
      const delayMs = AD_CONFIG.global.delayMinutes * 60 * 1000;
      const expiryTime = currentTime + delayMs;
      sessionStorage.setItem('adDelayExpiry', expiryTime.toString());
      
      // Set timeout to enable ads after delay
      const timeoutId = setTimeout(() => {
        setAdsEnabled(true);
        setGlobalAdsEnabled(true);
      }, delayMs);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Still within delay period
      const remainingTime = parseInt(adDelayExpiry) - currentTime;
      const timeoutId = setTimeout(() => {
        setAdsEnabled(true);
        setGlobalAdsEnabled(true);
      }, remainingTime);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);
  
  return { adsEnabled, globalAdsEnabled };
};

// Safe script loader with deduplication
const loadScript = (src, onLoad, onError) => {
  // Check if script is already loaded or loading
  if (loadedScripts.has(src)) {
    console.log('Script already loaded:', src);
    if (onLoad) onLoad();
    return null;
  }

  // Check if script is currently loading
  if (scriptLoadPromises.has(src)) {
    scriptLoadPromises.get(src).then(onLoad).catch(onError);
    return null;
  }

  // Create promise for this script load
  const loadPromise = new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      
      script.onload = () => {
        console.log('Script loaded successfully:', src);
        loadedScripts.add(src);
        scriptLoadPromises.delete(src);
        resolve();
      };
      
      script.onerror = (error) => {
        console.warn('Script failed to load:', src, error);
        scriptLoadPromises.delete(src);
        reject(error);
      };
      
      document.body.appendChild(script);
      return script;
    } catch (error) {
      console.warn('Error creating script:', error);
      scriptLoadPromises.delete(src);
      reject(error);
    }
  });

  scriptLoadPromises.set(src, loadPromise);
  loadPromise.then(onLoad).catch(onError);

  return loadPromise;
};

// Adsterra Banner Component
export const AdsterraBanner = ({ atOptions, width = 728, height = 90 }) => {
  const { adsEnabled } = useAdControl();
  const bannerRef = useRef(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const containerIdRef = useRef(`banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!adsEnabled || !atOptions || isAdLoaded || !bannerRef.current || !showAd) return;

    const loadAd = async () => {
      try {
        // Create container with unique ID
        const container = document.createElement('div');
        container.id = containerIdRef.current;
        
        if (bannerRef.current && !bannerRef.current.querySelector(`#${containerIdRef.current}`)) {
          bannerRef.current.appendChild(container);
          
          // Wait a bit before loading script to ensure DOM is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          await loadScript(
            `//pl27041508.profitableratecpm.com/${atOptions.key}/invoke.js`,
            () => setIsAdLoaded(true),
            () => {
              setShowAd(false);
              console.warn('Adsterra banner failed to load, hiding ad container');
            }
          );
        }
      } catch (error) {
        console.warn('Error loading Adsterra banner:', error);
        setShowAd(false);
      }
    };

    loadAd();

    return () => {
      const currentBannerRef = bannerRef.current;
      const currentContainerId = containerIdRef.current;
      
      if (currentBannerRef) {
        const container = currentBannerRef.querySelector(`#${currentContainerId}`);
        if (container) {
          container.remove();
        }
      }
    };
  }, [atOptions, isAdLoaded, showAd, adsEnabled]);

  if (!showAd || !adsEnabled) return null;

  return (
    <div 
      ref={bannerRef} 
      className="flex justify-center items-center my-4"
      style={{ minHeight: `${height}px`, width: '100%' }}
    />
  );
};

// Adsterra Native Banner
export const AdsterraNative = ({ atOptions }) => {
  const { adsEnabled } = useAdControl();
  const nativeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const containerIdRef = useRef(`native-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!adsEnabled || !atOptions || isLoaded || !nativeRef.current || !showAd) return;

    const loadAd = async () => {
      try {
        const container = document.createElement('div');
        container.id = containerIdRef.current;
        
        if (nativeRef.current && !nativeRef.current.querySelector(`#${containerIdRef.current}`)) {
          nativeRef.current.appendChild(container);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          await loadScript(
            `//pl27041508.profitableratecpm.com/${atOptions.key}/invoke.js`,
            () => setIsLoaded(true),
            () => {
              setShowAd(false);
              console.warn('Adsterra native failed to load');
            }
          );
        }
      } catch (error) {
        console.warn('Error loading Adsterra native:', error);
        setShowAd(false);
      }
    };

    loadAd();

    return () => {
      const currentNativeRef = nativeRef.current;
      const currentContainerId = containerIdRef.current;
      
      if (currentNativeRef) {
        const container = currentNativeRef.querySelector(`#${currentContainerId}`);
        if (container) {
          container.remove();
        }
      }
    };
  }, [atOptions, isLoaded, showAd, adsEnabled]);

  if (!showAd || !adsEnabled) return null;

  return <div ref={nativeRef} className="my-4" />;
};

// Adsterra Social Bar - Fixed with singleton pattern
let socialBarLoaded = false;

export const AdsterraSocialBar = ({ atOptions }) => {
  const { adsEnabled } = useAdControl();
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!adsEnabled || !atOptions || socialBarLoaded || !showAd) return;

    const loadAd = async () => {
      try {
        await loadScript(
          `//pl27010677.profitableratecpm.com/${atOptions.key}/invoke.js`,
          () => {
            socialBarLoaded = true;
          },
          () => {
            setShowAd(false);
            console.warn('Adsterra social bar failed to load');
          }
        );
      } catch (error) {
        console.warn('Error loading Adsterra social bar:', error);
        setShowAd(false);
      }
    };

    loadAd();

    return () => {
      // Don't reset socialBarLoaded on unmount to prevent reloading
    };
  }, [atOptions, showAd, adsEnabled]);

  if (!showAd || !adsEnabled) return null;
  return null;
};

// Adsterra Popunder - Fixed with singleton pattern
let popunderLoaded = false;

export const AdsterraPopunder = ({ atOptions }) => {
  const { adsEnabled } = useAdControl();
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!adsEnabled || !atOptions || popunderLoaded || !showAd) return;

    // Delay popunder to avoid immediate blocking
    const timer = setTimeout(async () => {
      try {
        await loadScript(
          `//pl27010453.profitableratecpm.com/${atOptions.key}/invoke.js`,
          () => {
            popunderLoaded = true;
          },
          () => {
            setShowAd(false);
            console.warn('Adsterra popunder failed to load');
          }
        );
      } catch (error) {
        console.warn('Error loading Adsterra popunder:', error);
        setShowAd(false);
      }
    }, 5000); // Increased delay to 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [atOptions, showAd, adsEnabled]);

  if (!showAd || !adsEnabled) return null;
  return null;
};

// PopAds Integration Component
export const PopAdsPopunder = ({
  enabled = true,
  websiteId = process.env.REACT_APP_POPADS_WEBSITE_ID,
  popundersIP = '10:6,5:6',
  delay = 120,
  minBid = 0.001
}) => {
  const { adsEnabled } = useAdControl();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!adsEnabled || !enabled || loadedRef.current || !websiteId) return;

    // PopAds official snippet converted to React
    const popTag = document.createElement('script');
    popTag.setAttribute('data-cfasync', 'false');
    popTag.type = 'text/javascript';
    popTag.async = true;
    popTag.innerHTML = `
      var _pop = _pop || [];
      _pop.push(['siteId', ${websiteId}]);
      _pop.push(['minBid', ${minBid}]);
      _pop.push(['popundersPerIP', '${popundersIP}']);
      _pop.push(['delayBetween', ${delay}]);
      _pop.push(['default', false]);
      _pop.push(['defaultPerDay', 0]);
      _pop.push(['topmostLayer', 'auto']);
      (function() {
        var pa = document.createElement('script');
        pa.type = 'text/javascript'; 
        pa.async = true;
        pa.src = '//c1.popads.net/pop.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(pa, s);
      })();
    `;
    
    document.body.appendChild(popTag);
    loadedRef.current = true;

    console.log('PopAds script loaded with websiteId:', websiteId);

  }, [enabled, websiteId, popundersIP, delay, minBid, adsEnabled]);

  return null;
};

// PopAds Integration (Legacy compatibility)
export const PopAdsIntegration = ({ websiteId, enabled = true }) => {
  return <PopAdsPopunder enabled={enabled} websiteId={websiteId} />;
};

// Monetag Popunder
let monetagLoaded = false;

export const MonetagPopunder = ({
  zoneId = process.env.REACT_APP_MONETAG_ZONE_ID,
  frequencyCap = 10,
  enabled = true
}) => {
  const { adsEnabled } = useAdControl();
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!adsEnabled || !enabled || monetagLoaded || !zoneId) {
      return;
    }

    // Delay a bit
    const timer = setTimeout(() => {
      const pop = document.createElement('script');
      pop.setAttribute('data-cfasync', 'false');
      pop.async = true;
      pop.src = 'https://a.monetag.com/fp.js';
      pop.setAttribute('data-zone', zoneId);
      pop.setAttribute('data-frequency', String(frequencyCap));
      pop.onerror = () => {
        console.warn('Monetag popunder failed to load');
        setShowAd(false);
      };
      document.body.appendChild(pop);
      monetagLoaded = true;
    }, 3000);

    return () => clearTimeout(timer);
  }, [zoneId, enabled, frequencyCap, adsEnabled]);

  if (!showAd || !adsEnabled) return null;
  return null;
};

// Monetag banner (iframe)
export const MonetagBanner = ({
  zoneId,
  width = 300,
  height = 250,
  enabled = true,
  className = ''
}) => {
  const { adsEnabled } = useAdControl();
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!adsEnabled || !enabled || !zoneId || mounted) return;

    const html = `<iframe 
      src="https://a.monetag.com/f.php?z=${zoneId}" 
      width="${width}" 
      height="${height}" 
      frameborder="0"
      scrolling="no"
      style="border:0;">
    </iframe>`;
    
    if (containerRef.current) {
      containerRef.current.innerHTML = html;
      setMounted(true);
    }
  }, [zoneId, enabled, mounted, width, height, adsEnabled]);

  if (!enabled || !adsEnabled) return null;
  
  return <div ref={containerRef} className={`flex justify-center items-center my-4 ${className}`} />;
};

// Sticky Video Ad Component
export const StickyVideoAd = ({ position = 'bottom-right' }) => {
  return null;
};

// Export the hook for external use
export { useAdControl };
