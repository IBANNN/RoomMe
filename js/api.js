// API Client — wraps all fetch() calls to the backend
window.API_BASE = '/api';

const API = {
  getToken: () => localStorage.getItem('roomme_token'),
  setToken: (t) => localStorage.setItem('roomme_token', t),
  clearToken: () => localStorage.removeItem('roomme_token'),

  _headers(isForm) {
    const h = {};
    const token = this.getToken();
    if (token) h['Authorization'] = 'Bearer ' + token;
    if (!isForm) h['Content-Type'] = 'application/json';
    return h;
  },

  async _request(method, path, body, isForm) {
    const opts = { method, headers: this._headers(isForm) };
    if (body) opts.body = isForm ? body : JSON.stringify(body);
    try {
      const res = await fetch(API_BASE + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (e) {
      console.error(`[API] ${method} ${path} failed:`, e.message);
      throw e;
    }
  },

  get: (path) => API._request('GET', path),
  post: (path, body) => API._request('POST', path, body),
  put: (path, body) => API._request('PUT', path, body),
  delete: (path) => API._request('DELETE', path),
  upload: (path, formData) => API._request('POST', path, formData, true),
  uploadPut: (path, formData) => API._request('PUT', path, formData, true),
};
