import Axios from './Axios';

export const getNotificationsService = async (token) => {
  const { data } = await Axios.get('/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const markNotificationReadService = async (token, id) => {
  const { data } = await Axios.put(
    `/notifications/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const deleteNotificationService = async (token, id) => {
  const { data } = await Axios.delete(`/notifications/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const clearNotificationsService = async (token) => {
  const { data } = await Axios.delete('/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
