// notificationsActions.js
import {
  ADD_NOTIFICATION,
  REMOVE_NOTIFICATION,
  CLEAR_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
} from "../Constants/notificationsConstants";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

// Add new notification item
export const addNotification = (payload) => (dispatch) => {
  // payload example:
  // {
  //   message: 'User posted a new review: "Great movie!"',
  //   forAdmin: true,
  //   link: '/movie/123#review-456'
  // }
  dispatch({
    type: ADD_NOTIFICATION,
    payload: {
      ...payload,
      id: uuidv4(), // Add a unique ID
      read: false, // Add read status, default to false
      timestamp: Date.now(), // Optional: Add a timestamp
    },
  });
};

// Remove a specific notification by its unique ID
export const removeNotification = (id) => (dispatch) => {
  dispatch({
    type: REMOVE_NOTIFICATION,
    payload: id, // Pass the ID to remove
  });
};

// Clear all notifications for either admin or user
export const clearNotifications = (forAdminValue) => (dispatch) => {
  // forAdminValue is either true (admin) or false (regular user)
  dispatch({
    type: CLEAR_NOTIFICATIONS,
    payload: forAdminValue,
  });
};

// Mark a specific notification as read by its unique ID
export const markNotificationAsRead = (id) => (dispatch) => {
  dispatch({
    type: MARK_NOTIFICATION_AS_READ,
    payload: id, // Pass the ID to mark as read
  });
};
