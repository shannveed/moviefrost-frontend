// Frontend/src/Redux/Actions/notificationsActions.js
import * as C from '../Constants/notificationsConstants';
import * as API from '../APIs/NotificationsServices';
import { ErrorsAction, tokenProtection } from '../Protection';

export const getNotificationsAction =
  (silent = false, limit = 50) =>
  async (dispatch, getState) => {
    try {
      if (!silent) dispatch({ type: C.NOTIFICATIONS_LIST_REQUEST });

      const token = tokenProtection(getState);
      if (!token) {
        dispatch({ type: C.NOTIFICATIONS_RESET });
        return;
      }

      const data = await API.getNotificationsService(token, limit);
      dispatch({ type: C.NOTIFICATIONS_LIST_SUCCESS, payload: data });
    } catch (error) {
      ErrorsAction(error, dispatch, C.NOTIFICATIONS_LIST_FAIL);
    }
  };

export const markNotificationAsRead = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.NOTIFICATION_MARK_READ_REQUEST, payload: id });

    const token = tokenProtection(getState);
    if (!token) {
      dispatch({ type: C.NOTIFICATIONS_RESET });
      return;
    }

    await API.markNotificationReadService(token, id);
    dispatch({ type: C.NOTIFICATION_MARK_READ_SUCCESS, payload: id });
  } catch (error) {
    ErrorsAction(error, dispatch, C.NOTIFICATION_MARK_READ_FAIL);
  }
};

export const removeNotification = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: C.NOTIFICATION_DELETE_REQUEST, payload: id });

    const token = tokenProtection(getState);
    if (!token) {
      dispatch({ type: C.NOTIFICATIONS_RESET });
      return;
    }

    await API.deleteNotificationService(token, id);
    dispatch({ type: C.NOTIFICATION_DELETE_SUCCESS, payload: id });
  } catch (error) {
    ErrorsAction(error, dispatch, C.NOTIFICATION_DELETE_FAIL);
  }
};

export const clearNotifications = () => async (dispatch, getState) => {
  try {
    dispatch({ type: C.NOTIFICATIONS_CLEAR_REQUEST });

    const token = tokenProtection(getState);
    if (!token) {
      dispatch({ type: C.NOTIFICATIONS_RESET });
      return;
    }

    await API.clearNotificationsService(token);
    dispatch({ type: C.NOTIFICATIONS_CLEAR_SUCCESS });
  } catch (error) {
    ErrorsAction(error, dispatch, C.NOTIFICATIONS_CLEAR_FAIL);
  }
};
