// notificationsReducers.js
import {
  ADD_NOTIFICATION,
  REMOVE_NOTIFICATION,
  CLEAR_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
} from "../Constants/notificationsConstants";

// Function to load notifications from local storage
const loadNotificationsFromStorage = () => {
  try {
    const serializedState = localStorage.getItem('notifications');
    if (serializedState === null) {
      return []; // Return empty array if nothing is in storage
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load notifications from local storage", err);
    return []; // Return empty array on error
  }
};

// Function to save notifications to local storage
const saveNotificationsToStorage = (notifications) => {
  try {
    const serializedState = JSON.stringify(notifications);
    localStorage.setItem('notifications', serializedState);
  } catch (err) {
    console.error("Could not save notifications to local storage", err);
  }
};


const initialState = {
  // Load initial state from local storage
  notifications: loadNotificationsFromStorage(),
};

export const notificationsReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case ADD_NOTIFICATION:
      newState = {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
      saveNotificationsToStorage(newState.notifications); // Save after adding
      return newState;

    case REMOVE_NOTIFICATION:
      newState = {
        ...state,
        // Filter out the notification with the matching ID
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
       saveNotificationsToStorage(newState.notifications); // Save after removing
      return newState;

    case CLEAR_NOTIFICATIONS:
      // payload is a boolean, e.g. true for admin, false for user
      newState = {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.forAdmin !== action.payload // Keep only those NOT matching the side to be cleared
        ),
      };
      saveNotificationsToStorage(newState.notifications); // Save after clearing
      return newState;

    case MARK_NOTIFICATION_AS_READ:
      newState = {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n // Find by ID and set read: true
        ),
      };
      saveNotificationsToStorage(newState.notifications); // Save after marking as read
      return newState;

    default:
      return state;
  }
};
