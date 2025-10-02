import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'aos';
import 'aos/dist/aos.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './Redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';

// Register service worker with build stamp
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const swUrl = `/service-worker.js?ts=${process.env.REACT_APP_BUILD_STAMP || Date.now()}`;
    
    navigator.serviceWorker.register(swUrl).then(
      registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        
        // When a new sw is installed, reload the page once
        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (installing == null) {
            return;
          }
          
          installing.onstatechange = () => {
            if (installing.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available - reload the page
                console.log('New content is available; please refresh.');
                // Force reload to get the new version
                window.location.reload(true);
              } else {
                // Content is cached for offline use
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      },
      err => {
        console.error('ServiceWorker registration failed:', err);
      }
    );
  });
}

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error('Google Client ID is not set in environment variables');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <Provider store={store}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        </GoogleOAuthProvider>
      ) : (
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      )}
    </HelmetProvider>
  </React.StrictMode>
);
