const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorObj = {
          status: response.status,
          message: data.message || `HTTP Error ${response.status}`,
          code: data.code || 'API_ERROR',
          errors: data.errors || null,
          requestId: data.requestId,
        };

        // Emit custom session expired event if 401
        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('app:session-expired', { detail: errorObj }));
        }

        throw errorObj;
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw {
        status: 500,
        message: error.message || 'Network connection failed. Please verify server availability.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
