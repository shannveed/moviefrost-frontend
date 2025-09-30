export const AD_CONFIG = {
  // Adsterra Ad Configuration - ALL DISABLED
  adsterra: {
    /* === ALL ADSTERRA UNUSED RIGHT NOW === */
    banner: { 
      desktop: {}, 
      mobile: {} 
    },
    native: {},
    socialBar: {},
    popunder: {},
    directLink: ''
  },
  
  // PopAds Configuration - DISABLED
  popAds: {
    enabled: false,  // Changed from true to false
    websiteId: 5214524,
    popundersPerIP: '5',
    delayBetween: 0,
    minBid: 0.001,
    frequency: 1,
  },
  
  // Monetag Configuration - DISABLED
  monetag: {
    enabled: false,  // Changed to false
    siteId: process.env.REACT_APP_MONETAG_SITE_ID,
    popunder: {
      enabled: false,  // Changed from true to false
      frequencyCap: 10
    },
    banner: {
      enabled: false,  // Remains false
      zoneId: process.env.REACT_APP_MONETAG_ZONE_ID
    }
  }
};