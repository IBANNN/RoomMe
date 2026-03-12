// Authentication System — uses the real backend via API
const Auth = {
  _currentUser: null,

  // Load cached user from localStorage on startup
  init() {
    const cached = localStorage.getItem('roomme_user_data');
    if (cached) {
      try { this._currentUser = JSON.parse(cached); } catch (e) { this._currentUser = null; }
    }
  },

  getCurrentUser() {
    return this._currentUser;
  },

  async login(email, password) {
    try {
      const data = await API.post('/auth/login', { email, password });
      API.setToken(data.token);
      this._currentUser = data.user;
      localStorage.setItem('roomme_user_data', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // Register: step 1 - sends OTP, returns {success, requiresVerification, email, otp}
  async register(formData) {
    try {
      const data = await API.post('/auth/register', formData);
      return { success: true, requiresVerification: true, email: data.email, otp: data.otp };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // Register: step 2 - verify OTP, returns logged-in user
  async completeVerification(email, otp) {
    try {
      const data = await API.post('/auth/verify-email', { email, otp });
      API.setToken(data.token);
      this._currentUser = data.user;
      localStorage.setItem('roomme_user_data', JSON.stringify(data.user));
      // Welcome notification handled server-side
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  logout() {
    API.clearToken();
    this._currentUser = null;
    localStorage.removeItem('roomme_user_data');
    // Force router to resolve the '/' route even if already there
    window.location.hash = '';
    Router.resolve();
    Toast.info('Signed Out', 'You have been signed out successfully');
  },

  isAuthenticated() {
    return !!this._currentUser && !!API.getToken();
  },

  hasRole(role) {
    return this._currentUser && this._currentUser.role === role;
  },

  // Refresh current user data from backend
  async refreshUser() {
    try {
      const user = await API.get('/users/me');
      this._currentUser = user;
      localStorage.setItem('roomme_user_data', JSON.stringify(user));
      return user;
    } catch (e) {
      // Token may be expired
      this.logout();
      return null;
    }
  }
};
