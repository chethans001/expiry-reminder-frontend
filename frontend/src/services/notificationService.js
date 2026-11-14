import api from './api';

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  async clearAll() {
    const res = await api.delete('/notifications/clear-all');
    return res.data;
  },

  async getPreferences() {
    const res = await api.get('/notifications/preferences');
    return res.data;
  },

  async updatePreferences(data) {
    const res = await api.put('/notifications/preferences', data);
    return res.data;
  },

  async triggerCheck() {
    const res = await api.post('/notifications/trigger-check');
    return res.data;
  }
};
