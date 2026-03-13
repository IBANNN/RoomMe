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
    Modal.show('Reset Password', `
      <div style="text-align:center;padding:var(--space-4)">
        <div style="font-size:3rem;margin-bottom:var(--space-4)">🔒</div>
        <h3 style="margin-bottom:var(--space-3)">Need to Reset Your Password?</h3>
        <p style="color:var(--text-secondary);font-size:var(--font-sm);margin-bottom:var(--space-5)">
          For security reasons, password resets are handled by an administrator.<br><br>
          Please contact admin to reset your password:
        </p>
        <div style="background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4)">
          <div style="font-size:var(--font-lg);font-weight:700;">admin@roomme.com</div>
          <div style="font-size:var(--font-sm);color:var(--text-muted);margin-top:var(--space-1)">RoomMe Administrator</div>
        </div>
        <button class="btn btn-primary w-full" onclick="Modal.close()">Got It</button>
      </div>
    `);
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
