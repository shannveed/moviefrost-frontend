// AdConfig.js - Updated with proper Adsterra configuration
export const AD_CONFIG = {
  // Adsterra Ad Configuration with proper keys
  adsterra: {
    banner: {
      desktop: {
        key: '019a973cec8ffe0b4ea36cff849dc6cf',
        format: 'iframe',
        height: 90,
        width: 728,
      },
      mobile: {
        key: '019a973cec8ffe0b4ea36cff849dc6cf',
        format: 'iframe',
        height: 50,
        width: 320,
      }
    },
    native: {
      key: '019a973cec8ffe0b4ea36cff849dc6cf',
      format: 'native',
    },
    socialBar: {
      key: '254c52394940eb0b41c31d5535817eed',
      format: 'social_bar',
      position: 'bottom',
      mobilePosition: 'bottom',
    },
    popunder: {
      key: '62c8f34a5a4d1afbb8ec9a7b28896caa',
      format: 'popunder',
      frequency_cap: 1,
    },
    directLink: 'https://www.profitableratecpm.com/yhj6nn10?key=e6a0850d911a706749887b58b273f025'
  },
  
  // Ezoic Placeholder IDs
  ezoic: {
    home_after_banner: 'ezoic-pub-ad-placeholder-102',
    home_after_promo: 'ezoic-pub-ad-placeholder-103',
    single_after_rates: 'ezoic-pub-ad-placeholder-104',
    movies_grid_middle: 'ezoic-pub-ad-placeholder-105',
    watch_page_top: 'ezoic-pub-ad-placeholder-106',
    sticky_video: 'ezoic-pub-video-placeholder-101',
  },
  
  // PopAds Configuration
  popAds: {
    websiteId: 'XXXXXXX', // Replace with your PopAds website ID
    frequency: 1,
  }
};
