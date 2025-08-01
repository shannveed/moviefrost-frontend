import React from 'react';
import { hydrate, createRoot } from 'react-dom/client';
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

// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      registration => {
        console.log('ServiceWorker registration successful');
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

const container = document.getElementById('root');
const app = (
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

// Use hydrate for react-snap pre-rendered content
if (container?.hasChildNodes()) {
  hydrate(app, container);
} else {
  const root = createRoot(container);
  root.render(app);
}
