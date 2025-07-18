// AdWrapper.js - Fixed version with proper ad script handling
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

// Adsterra Banner Component - Fixed
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
      // Cleanup specific to this instance
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

// Adsterra Native Banner - Fixed
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

// PopAds Integration - Updated
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

// Ezoic Placeholder Component - Updated
export const EzoicPlaceholder = ({ id, className = "" }) => {
  const [showAd, setShowAd] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isIOS() || isSafari()) {
      setShowAd(false);
      return;
    }

    if (!isInitialized && window.ezstandalone && window.ezstandalone.cmd) {
      try {
        window.ezstandalone.cmd.push(function() {
          if (window.ezstandalone.define) {
            window.ezstandalone.define(id);
          }
          if (window.ezstandalone.refresh) {
            window.ezstandalone.refresh();
          }
        });
        setIsInitialized(true);
      } catch (error) {
        console.warn('Ezoic error:', error);
        setShowAd(false);
      }
    }
  }, [id, isInitialized]);

  if (!showAd) return null;
  
  return <div id={id} className={`ezoic-ad ${className}`} />;
};

// Sticky Video Ad Component
export const StickyVideoAd = ({ position = 'bottom-right' }) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };

  // Don't show on mobile/iOS
  if (isIOS() || window.innerWidth < 1024) {
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-40 hidden lg:block`}>
      <div className="relative">
        <EzoicPlaceholder id="ezoic-pub-video-placeholder-101" />
      </div>
    </div>
  );
};
