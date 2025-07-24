// AdWrapper.js - Updated with PopAds integration and iOS support
import React, { useEffect, useRef, useState } from 'react';

// Modified detection functions - no longer blocking iOS/Safari
const isIOS = () => {
  return false; // Always return false to enable ads on iOS
};

const isSafari = () => {
  return false; // Always return false to enable ads on Safari
};

// Global tracking for loaded scripts to prevent duplicates
const loadedScripts = new Set();
const scriptLoadPromises = new Map();

// Safe script loader with deduplication
const loadScript = (src, onLoad, onError) => {
  // No longer skip loading on iOS/Safari
  
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
  const bannerRef = useRef(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const containerIdRef = useRef(`banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!atOptions || isAdLoaded || !bannerRef.current || !showAd) return;

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
  }, [atOptions, isAdLoaded, showAd]);

  if (!showAd) return null;

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
  const nativeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const containerIdRef = useRef(`native-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!atOptions || isLoaded || !nativeRef.current || !showAd) return;

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
  }, [atOptions, isLoaded, showAd]);

  if (!showAd) return null;

  return <div ref={nativeRef} className="my-4" />;
};

// Adsterra Social Bar - Fixed with singleton pattern
let socialBarLoaded = false;

export const AdsterraSocialBar = ({ atOptions }) => {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!atOptions || socialBarLoaded || !showAd) return;

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
  }, [atOptions, showAd]);

  if (!showAd) return null;
  return null;
};

// Adsterra Popunder - Fixed with singleton pattern
let popunderLoaded = false;

export const AdsterraPopunder = ({ atOptions }) => {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!atOptions || popunderLoaded || !showAd) return;

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
  }, [atOptions, showAd]);

  if (!showAd) return null;
  return null;
};

// NEW PopAds Integration Component
export const PopAdsPopunder = ({
  enabled = true,
  websiteId = process.env.REACT_APP_POPADS_WEBSITE_ID,
  popundersIP = '10:6,5:6',
  delay = 120,
  minBid = 0.001
}) => {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!enabled || loadedRef.current || !websiteId) return;

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

  }, [enabled, websiteId, popundersIP, delay, minBid]);

  return null;
};

// PopAds Integration (Legacy compatibility)
export const PopAdsIntegration = ({ websiteId, enabled = true }) => {
  // This is now just a wrapper around PopAdsPopunder for backward compatibility
  return <PopAdsPopunder enabled={enabled} websiteId={websiteId} />;
};

// Monetag Popunder
let monetagLoaded = false;

export const MonetagPopunder = ({
  zoneId = process.env.REACT_APP_MONETAG_ZONE_ID,
  frequencyCap = 1,
  enabled = true
}) => {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!enabled || monetagLoaded || !zoneId) {
      return;
    }

    // Delay a bit – avoids CLS and improves Core-Web-Vitals
    const timer = setTimeout(() => {
      loadScript(
        `https://cdn.monetag.com/geo/?zoneid=${zoneId}`,
        () => {
          monetagLoaded = true;
          // apply frequency cap if needed
          window.monetag = window.monetag || {};
          window.monetag.fcapFrequency = frequencyCap;
        },
        () => {
          console.warn('Monetag popunder failed to load');
          setShowAd(false);
        }
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [zoneId, enabled, frequencyCap]);

  if (!showAd) return null;
  return null;
};

/* Monetag banner (iframe) – optional */
export const MonetagBanner = ({
  zoneId,
  width = 300,
  height = 250,
  enabled = true
}) => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled || !zoneId || mounted) return;

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
  }, [zoneId, enabled, mounted, width, height]);

  if (!enabled) return null;
  
  return <div ref={containerRef} className="flex justify-center items-center my-4" />;
};

// Sticky Video Ad Component - Removed Ezoic
export const StickyVideoAd = ({ position = 'bottom-right' }) => {
  // This component can be removed or repurposed for other video ads
  return null;
};
