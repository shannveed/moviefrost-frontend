// AdWrapper.js - Updated with Monetag integration
import React, { useEffect, useRef, useState } from 'react';

// Detect if user is on iOS/Safari
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Global tracking for loaded scripts to prevent duplicates
const loadedScripts = new Set();
const scriptLoadPromises = new Map();

// Safe script loader with deduplication
const loadScript = (src, onLoad, onError) => {
  // Skip loading ads on iOS Safari to prevent errors
  if (isIOS() || isSafari()) {
    console.warn('Ad scripts disabled on iOS/Safari for better performance');
    if (onError) onError();
    return null;
  }

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
    // Don't show ads on iOS/Safari
    if (isIOS() || isSafari()) {
      setShowAd(false);
      return;
    }

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
      // Fix: Store refs in variables for cleanup
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
    if (isIOS() || isSafari()) {
      setShowAd(false);
      return;
    }

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
      // Fix: Store refs in variables for cleanup
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
    if (isIOS() || isSafari()) {
      setShowAd(false);
      return;
    }

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
    if (isIOS() || isSafari()) {
      setShowAd(false);
      return;
    }

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

// PopAds Integration
export const PopAdsIntegration = ({ websiteId, enabled = true }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Disable on iOS/Safari
    if (!enabled || !websiteId || isLoaded || isIOS() || isSafari()) return;

    const timer = setTimeout(() => {
      try {
        if (window.popAdsConfig) {
          return;
        }

        window.popAdsConfig = {
          website_id: websiteId,
          frequency_cap: 1,
          trigger_method: 2,
        };

        loadScript(
          'https://c1.popads.net/pop.js',
          () => {
            setIsLoaded(true);
            console.log('PopAds loaded successfully');
          },
          () => {
            console.warn('PopAds script blocked or failed to load');
          }
        );
      } catch (error) {
        console.warn('Error initializing PopAds:', error);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [websiteId, enabled, isLoaded]);

  return null;
};

// ---------------------------------------------------------------------------
//             M O N E T A G    (ex-PropellerAds)   –   NEW
// ---------------------------------------------------------------------------
let monetagLoaded = false;

export const MonetagPopunder = ({
  zoneId = process.env.REACT_APP_MONETAG_ZONE_ID,
  frequencyCap = 1,
  enabled = true
}) => {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!enabled || monetagLoaded || !zoneId || isIOS() || isSafari()) {
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

/* Example banner (iframe) – optional */
export const MonetagBanner = ({
  zoneId,
  width = 300,
  height = 250,
  enabled = true
}) => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled || !zoneId || mounted || isIOS() || isSafari()) return;

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
