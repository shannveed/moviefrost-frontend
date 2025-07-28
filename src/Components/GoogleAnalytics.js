import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      /* GA4 recommended: use an event, not a second config call */
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
