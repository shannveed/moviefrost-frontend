// Frontend/src/Context/DrawerContext.js
import React, { createContext, useState } from "react";

// We'll call our context "SidebarContext" so we can export it by name
export const SidebarContext = createContext();

export default function DrawerContext({ children }) {
  const [mobileDrawer, setMobileDrawer] = useState(false);

  // Mobile main tabs: 'home', 'browseBy', 'movies', 'menu'
  const [activeMobileTab, setActiveMobileTab] = useState('home');

  // ✅ NEW: Mobile Home sub-tab: 'latestNew' (Trending) | 'latestMovies'
  const [activeMobileHomeTab, setActiveMobileHomeTab] = useState('latestNew');

  const toggleDrawer = () => {
    setMobileDrawer((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        mobileDrawer,
        toggleDrawer,
        activeMobileTab,
        setActiveMobileTab,

        // ✅ expose Home sub-tab controls
        activeMobileHomeTab,
        setActiveMobileHomeTab,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
