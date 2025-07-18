// Analytics utility functions for custom events
export const trackEvent = (eventName, parameters = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track movie views
export const trackMovieView = (movieName, movieId) => {
  trackEvent('view_movie', {
    movie_name: movieName,
    movie_id: movieId,
    user_status: localStorage.getItem('userInfo') ? 'logged_in' : 'guest'
  });
};

// Track video plays
export const trackVideoPlay = (movieName, movieId, episodeNumber = null) => {
  trackEvent('play_video', {
    movie_name: movieName,
    movie_id: movieId,
    episode_number: episodeNumber,
    user_status: localStorage.getItem('userInfo') ? 'logged_in' : 'guest'
  });
};

// Track user registrations
export const trackUserRegistration = (method) => {
  trackEvent('sign_up', {
    method: method,
  });
  
  // Also track as conversion
  trackEvent('conversion', {
    send_to: 'G-J06332VTF2/signup',
    value: 1.0,
    currency: 'USD'
  });
};

// Track searches
export const trackSearch = (searchTerm) => {
  trackEvent('search', {
    search_term: searchTerm,
    user_status: localStorage.getItem('userInfo') ? 'logged_in' : 'guest'
  });
};

// Track non-logged in user actions
export const trackGuestAction = (action, details = {}) => {
  trackEvent('guest_action', {
    action_type: action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Track login prompts shown
export const trackLoginPrompt = (trigger, location) => {
  trackEvent('login_prompt_shown', {
    trigger: trigger,
    page_location: location,
    timestamp: new Date().toISOString()
  });
};

// Track user type
export const trackUserType = (isLoggedIn) => {
  trackEvent('user_type', {
    user_status: isLoggedIn ? 'logged_in' : 'guest'
  });
  
  // Set user property
  if (window.gtag) {
    window.gtag('set', 'user_properties', {
      user_type: isLoggedIn ? 'registered' : 'guest'
    });
  }
};

// Track page exit for non-logged users
export const trackGuestExit = (pageLocation, timeSpent) => {
  trackEvent('guest_exit', {
    exit_page: pageLocation,
    time_on_page: timeSpent,
    timestamp: new Date().toISOString()
  });
};

// Track favorite attempt without login
export const trackGuestFavoriteAttempt = (movieName, movieId) => {
  trackEvent('guest_favorite_attempt', {
    movie_name: movieName,
    movie_id: movieId,
    timestamp: new Date().toISOString()
  });
};

// Track engagement score
export const trackEngagementScore = (score, actions) => {
  trackEvent('engagement_score', {
    score: score,
    total_actions: actions,
    user_status: localStorage.getItem('userInfo') ? 'logged_in' : 'guest'
  });
};
