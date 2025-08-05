// useAdManager.js
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AD_CONFIG } from '../Ads/AdConfig';

export const useAdManager = () => {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
    // Check if current path is in disabled paths
    const isDisabledPath = AD_CONFIG.global.disabledPaths.some(path => 
      location.pathname.toLowerCase() === path.toLowerCase()
    );
    
    if (isDisabledPath) {
      setAdsEnabled(false);
      return;
    }
    
    // Check if ads are enabled in environment
    if (process.env.REACT_APP_ADS_ENABLED === 'false') {
      setAdsEnabled(false);
      return;
    }
    
    // Get or set first visit timestamp
    const firstVisitKey = 'moviefrost_first_visit';
    const storedFirstVisit = localStorage.getItem(firstVisitKey);
    const now = Date.now();
    
    if (!storedFirstVisit) {
      localStorage.setItem(firstVisitKey, now.toString());
      setTimeRemaining(AD_CONFIG.global.initialDelayMinutes * 60);
    } else {
      const firstVisitTime = parseInt(storedFirstVisit);
      const elapsedSeconds = Math.floor((now - firstVisitTime) / 1000);
      const delaySeconds = AD_CONFIG.global.initialDelayMinutes * 60;
      
      if (elapsedSeconds >= delaySeconds) {
        setAdsEnabled(true);
        setTimeRemaining(0);
      } else {
        const remaining = delaySeconds - elapsedSeconds;
        setTimeRemaining(remaining);
      }
    }
  }, [location.pathname]);
  
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setAdsEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  return { 
    adsEnabled, 
    timeRemaining,
    isAdBlockedPath: AD_CONFIG.global.disabledPaths.includes(location.pathname.toLowerCase())
  };
};
