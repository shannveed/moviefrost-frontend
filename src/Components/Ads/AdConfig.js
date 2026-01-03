export const AD_CONFIG = {
  adsterra: {
    banner: { 
      desktop: {}, 
      mobile: {} 
    },
    native: {
       id: '26941009'
    },
    socialBar: {
      id: '26910178'
    },
    popunder: {
      id: '26909954'
    },
    directLink: '26910123'
  },
  
  // PopAds Configuration - ENABLED
  popAds: {
    enabled: true,  // Changed from false to true
    websiteId: 5214524,
    popundersPerIP: '20',
    delayBetween: 300,
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