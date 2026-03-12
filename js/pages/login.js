// Login Page
const LoginPage = {
  render() {
    return `
      <div class="auth-page page-transition">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">🏠</div>
            <h1 class="auth-title">Welcome Back</h1>
            <p class="auth-subtitle">Sign in to your RoomMe account</p>
          </div>
          <form class="auth-form" onsubmit="LoginPage.handleSubmit(event)">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="login-email" placeholder="you@university.edu" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="login-password" placeholder="Enter your password" required />
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <label style="display:flex;align-items:center;gap:0.5rem;font-size:var(--font-sm);color:var(--text-secondary);cursor:pointer">
                <input type="checkbox" style="accent-color:var(--accent-primary)" /> Remember me
              </label>
              <a onclick="LoginPage.forgotPassword()" style="font-size:var(--font-sm);color:var(--accent-primary);cursor:pointer">Forgot password?</a>
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-full" id="login-btn">Sign In</button>
            <div class="auth-divider">or demo login</div>
            <div style="display:flex;gap:var(--space-3)">
              <button type="button" class="btn btn-secondary w-full" onclick="LoginPage.quickLogin('tenant')">
                🎓 Demo Student
              </button>
              <button type="button" class="btn btn-secondary w-full" onclick="LoginPage.quickLogin('landlord')">
                🏠 Demo Landlord
              </button>
            </div>
            <button type="button" class="btn btn-secondary w-full" onclick="LoginPage.quickLogin('admin')" style="margin-top:-8px">
              🛡️ Demo Admin
            </button>
          </form>
          <div class="auth-footer">
            Don't have an account? <a onclick="Router.navigate('/register')">Sign Up</a>
          </div>
        </div>
      </div>
    `;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    const result = await Auth.login(email, password);
    if (result.success) {
      Toast.success('Welcome Back!', `Signed in as ${result.user.fullName}`);
      Router.navigate('/dashboard');
    } else {
      Toast.error('Login Failed', result.message);
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  },

  forgotPassword() {
    Modal.show('Forgot Password', `
      <form onsubmit="LoginPage.submitForgotPassword(event)">
        <p style="color:var(--text-secondary);margin-bottom:1rem;font-size:var(--font-sm)">Enter your registered email address and we will send you an OTP to reset your password.</p>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="forgot-email" placeholder="you@example.com" required>
        </div>
        <button type="submit" class="btn btn-primary w-full">Send Reset Code</button>
      </form>
    `);
  },

  async submitForgotPassword(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    const email = document.getElementById('forgot-email').value;
    try {
      const result = await API.post('/auth/forgot-password', { email });
      if (result.success) {
        Modal.close();
        if (result.otp) {
          Toast.info('OTP Sent! ✉️', `Dev Mode: Your OTP is ${result.otp}`);
        } else {
          Toast.success('Email Sent', result.message);
        }
        
        // Open the reset form
        Modal.show('Reset Password', `
          <form onsubmit="LoginPage.submitResetPassword(event, '${email}')">
            <p style="color:var(--text-secondary);margin-bottom:1rem;font-size:var(--font-sm)">Enter the Code sent to your email and your new password.</p>
            <div class="form-group">
              <label class="form-label">Reset Code (OTP)</label>
              <input type="text" class="form-input" id="reset-otp" placeholder="6-digit code" required autocomplete="off">
            </div>
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input type="password" class="form-input" id="reset-new-pwd" placeholder="Min. 8 characters" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary w-full">Reset Password</button>
          </form>
        `);
      } else {
        Toast.error('Error', result.message || 'Failed to send reset email');
        btn.disabled = false;
        btn.textContent = 'Send Reset Code';
      }
    } catch (err) {
      Toast.error('Network Error', err.message);
      btn.disabled = false;
      btn.textContent = 'Send Reset Code';
    }
  },

  async submitResetPassword(e, email) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Resetting...';
    
    const otp = document.getElementById('reset-otp').value;
    const newPassword = document.getElementById('reset-new-pwd').value;
    
    try {
      const result = await API.post('/auth/reset-password', { email, otp, newPassword });
      if (result.success) {
        Modal.close();
        Toast.success('Success', 'Password reset successfully. You can now login.');
      } else {
        Toast.error('Reset Failed', result.error || result.message);
        btn.disabled = false;
        btn.textContent = 'Reset Password';
      }
    } catch (err) {
      Toast.error('Network Error', err.message);
      btn.disabled = false;
      btn.textContent = 'Reset Password';
    }
  },

  async quickLogin(role) {
    const demoUsers = {
      tenant:   { email: 'maria.santos@university.edu', password: 'password123' },
      landlord: { email: 'angela.cruz@email.com',       password: 'password123' },
      admin:    { email: 'admin@roomme.com',             password: 'admin123'    }
    };
    const creds = demoUsers[role];
    Toast.info('Logging in...', `Demo ${role} account`);
    const result = await Auth.login(creds.email, creds.password);
    if (result.success) {
      Toast.success('Welcome!', `Signed in as ${result.user.fullName} (${role})`);
      Router.navigate('/dashboard');
    } else {
      Toast.error('Demo Login Failed', result.message + ' — make sure the server is running!');
    }
  }
};
