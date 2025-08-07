// src/Components/Ads/AdsContext.js
import React, { createContext, useContext } from 'react';

export const AdsContext = createContext({ allowed: false });

export const AdsProvider = AdsContext.Provider;

export const useAdsAllowed = () => {
  const ctx = useContext(AdsContext);
  return !!ctx.allowed;
};
