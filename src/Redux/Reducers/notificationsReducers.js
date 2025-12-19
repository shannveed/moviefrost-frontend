import * as C from '../Constants/notificationsConstants';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isError: null,
};

export const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case C.NOTIFICATIONS_LIST_REQUEST:
      return { ...state, isLoading: true, isError: null };

    case C.NOTIFICATIONS_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        notifications: action.payload.notifications || [],
        unreadCount: action.payload.unreadCount || 0,
      };

    case C.NOTIFICATIONS_LIST_FAIL:
      return { ...state, isLoading: false, isError: action.payload };

    case C.NOTIFICATION_MARK_READ_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n._id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount - (state.notifications.find((n) => n._id === action.payload && !n.read) ? 1 : 0)
        ),
      };

    case C.NOTIFICATION_DELETE_SUCCESS: {
      const removed = state.notifications.find((n) => n._id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter((n) => n._id !== action.payload),
        unreadCount: removed && !removed.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }

    case C.NOTIFICATIONS_CLEAR_SUCCESS:
      return { ...state, notifications: [], unreadCount: 0 };

    case C.NOTIFICATIONS_RESET:
      return { ...initialState };

    default:
      return state;
  }
};
