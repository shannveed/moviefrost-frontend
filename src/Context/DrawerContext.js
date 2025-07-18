// DrawerContext.js
import React, { createContext, useState } from "react";

// We'll call our context "SidebarContext" so we can export it by name
export const SidebarContext = createContext();

export default function DrawerContext({ children }) {
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const toggleDrawer = () => {
    setMobileDrawer((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ mobileDrawer, toggleDrawer }}>
      {children}
    </SidebarContext.Provider>
  );
}
