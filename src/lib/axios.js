import { api } from '../services/api';

const axiosInstance = {
  get: async (url, config) => {
    try {
      const res = await api.get(url, config);
      return { data: res, status: 200, statusText: 'OK' };
    } catch (err) {
      return { data: null, status: err.status || 500, statusText: err.message || 'Error' };
    }
  },
  post: async (url, data, config) => {
    try {
      const res = await api.post(url, data, config);
      return { data: res, status: 200, statusText: 'OK' };
    } catch (err) {
      return { data: null, status: err.status || 500, statusText: err.message || 'Error' };
    }
  },
  put: async (url, data, config) => {
    try {
      const res = await api.put(url, data, config);
      return { data: res, status: 200, statusText: 'OK' };
    } catch (err) {
      return { data: null, status: err.status || 500, statusText: err.message || 'Error' };
    }
  },
  patch: async (url, data, config) => {
    try {
      const res = await api.patch(url, data, config);
      return { data: res, status: 200, statusText: 'OK' };
    } catch (err) {
      return { data: null, status: err.status || 500, statusText: err.message || 'Error' };
    }
  },
  delete: async (url, config) => {
    try {
      const res = await api.delete(url, config);
      return { data: res, status: 200, statusText: 'OK' };
    } catch (err) {
      return { data: null, status: err.status || 500, statusText: err.message || 'Error' };
    }
  },
};

export default axiosInstance;
export { axiosInstance as axios };
