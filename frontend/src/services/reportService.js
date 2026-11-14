import api from './api';

export const reportService = {
  async getDashboardOverview() {
    const res = await api.get('/reports/dashboard');
    return res.data;
  },

  async getReportData() {
    const res = await api.get('/reports/details');
    return res.data;
  },

  async downloadCSV() {
    const res = await api.get('/reports/export-csv', {
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_expiry_items_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};
