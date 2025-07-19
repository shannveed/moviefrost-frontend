// src/utils/devToolsDetection.js

export const initDevToolsDetection = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  let devtools = { open: false, orientation: null };
  const threshold = 160;
  const emitEvent = (state, orientation) => {
    if (state) {
      console.warn('DevTools detected');
      // You can add additional security measures here
      // For now, just log it
    }
  };

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devtools.open) {
        emitEvent(true, 'docked');
      }
      devtools.open = true;
      devtools.orientation = 'docked';
    } else {
      if (devtools.open) {
        emitEvent(false, null);
      }
      devtools.open = false;
      devtools.orientation = null;
    }
  }, 500);
};
