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

// Register service worker with cache busting
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const swUrl = `/service-worker.js?ts=${process.env.REACT_APP_BUILD_STAMP || Date.now()}`;
    
    navigator.serviceWorker.register(swUrl).then(
      registration => {
        console.log('ServiceWorker registration successful');
        
        // When a new sw is installed, reload the page once
        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (installing) {
            installing.onstatechange = () => {
              if (
                installing.state === 'installed' &&
                navigator.serviceWorker.controller // old one still controlling
              ) {
                console.log('New service worker installed, reloading page...');
                window.location.reload(true);
              }
            };
          }
        };
      },
      err => {
        console.log('ServiceWorker registration failed: ', err);
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
