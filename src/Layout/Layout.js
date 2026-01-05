import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import MobileFooter from './Footer/MobileFooter';
import ScrollOnTop from '../ScrollOnTop';


function Layout({ children }) {
  const adsLoadedRef = useRef(false);
  const location = useLocation();
  const path = location.pathname;
  const isAuthRoute = path === '/login' || path === '/register';

  useEffect(() => {
    // Ensure ads are only loaded once per layout mount
    adsLoadedRef.current = true;
    return () => {
      adsLoadedRef.current = false;
    };
  }, []);

  return (
    <>
      <div className="bg-main text-white">
        <NavBar />
        {/* Add padding bottom on mobile to account for fixed footer */}
        <div className="min-h-screen pb-20 sm:pb-0">
          {children}
        </div>
        
        {/* Footer - Now visible on all screen sizes */}
        {/* On mobile, add extra bottom padding to account for MobileFooter */}
        <div className="mb-16 sm:mb-0">
          <Footer />
        </div>
        
        {/* Mobile Footer Navigation - Fixed at bottom */}
        <MobileFooter />

        
      </div>
    </>
  );
}

export default Layout;
