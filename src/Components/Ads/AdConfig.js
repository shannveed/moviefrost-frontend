// AdConfig.js - Updated with Monetag configuration
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
  
  // PopAds Configuration
  popAds: {
    websiteId: 'XXXXXXX', // Replace with your PopAds website ID
    frequency: 1,
  },
  
  // Monetag Configuration
  monetag: {
    popunder: {
      // zoneId is read from env at run-time so you don't leak it in the repo
      enabled: true,          // quick switch
      frequencyCap: 1         // impressions per session
    },
    banner: {
      enabled: false,         // enable if/when you have banner zone
      zoneId: '9607403'
    }
  }
};
