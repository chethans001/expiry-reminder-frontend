import api from './api';

export const productService = {
  async getItems(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getItemById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async createItem(formData) {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async updateItem(id, formData) {
    const res = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async deleteItem(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  async restoreItem(id) {
    const res = await api.post(`/products/${id}/restore`);
    return res.data;
  },

  async permanentDeleteItem(id) {
    const res = await api.delete(`/products/${id}/permanent`);
    return res.data;
  },

  async toggleFavorite(id) {
    const res = await api.patch(`/products/${id}/favorite`);
    return res.data;
  },

  async useItem(id) {
    const res = await api.post(`/products/${id}/use`);
    return res.data;
  }
};
