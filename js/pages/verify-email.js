// Email Verification Page
const VerifyEmailPage = {
  _email: null,
  _otp: null,

  render(email) {
    // Email can be passed via Router or stored on the object
    if (email) this._email = email;
    if (!this._email) {
      // Check if stored in sessionStorage from register
      const stored = sessionStorage.getItem('pendingEmail');
      if (stored) this._email = stored;
    }

    if (!this._email) {
      return `
        <div class="auth-page page-transition">
          <div class="auth-card" style="text-align:center">
            <div class="auth-logo">✉️</div>
            <h2 class="auth-title">No Pending Verification</h2>
            <p class="auth-subtitle">Please sign up first.</p>
            <button class="btn btn-primary" onclick="Router.navigate('/register')">Sign Up</button>
          </div>
        </div>`;
    }

    const devOtp = sessionStorage.getItem('devOtp');

    return `
      <div class="auth-page page-transition">
        <div class="auth-card" style="max-width:440px;text-align:center">
          <div class="auth-header">
            <div class="auth-logo" style="font-size:3rem">✉️</div>
            <h1 class="auth-title">Check Your Email</h1>
            <p class="auth-subtitle">
              We sent a 6-digit verification code to<br>
              <strong style="color:var(--accent-primary)">${this._email}</strong>
            </p>
          </div>

          ${devOtp ? `
            <div style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-6);font-size:var(--font-sm);color:var(--text-secondary)">
              📌 <strong>Dev mode:</strong> Your OTP is <strong style="color:var(--accent-primary);font-size:var(--font-lg);letter-spacing:4px">${devOtp}</strong>
            </div>
          ` : ''}

          <form onsubmit="VerifyEmailPage.verifyOtp(event)" style="display:flex;flex-direction:column;gap:var(--space-4)">
            <div class="form-group">
              <label class="form-label">Enter Verification Code</label>
              <input 
                type="text" 
                class="form-input" 
                id="otp-input" 
                placeholder="000000" 
                maxlength="6" 
                style="text-align:center;font-size:var(--font-2xl);letter-spacing:8px;font-weight:700"
                required 
                autocomplete="one-time-code"
              />
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-full" id="verify-btn">Verify &amp; Activate Account</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="VerifyEmailPage.resendOtp()">Resend Code</button>
          </form>

          <div class="auth-footer" style="margin-top:var(--space-4)">
            Wrong email? <a onclick="Router.navigate('/register')">Go Back</a>
          </div>
        </div>
      </div>
    `;
  },

  async verifyOtp(e) {
    e.preventDefault();
    const btn = document.getElementById('verify-btn');
    const otp = document.getElementById('otp-input').value.trim();

    btn.disabled = true;
    btn.textContent = 'Verifying...';

    const result = await Auth.completeVerification(this._email, otp);
    if (result.success) {
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('devOtp');
      Toast.success('Email Verified! 🎉', `Welcome to RoomMe, ${result.user.fullName}!`);
      Router.navigate('/dashboard');
    } else {
      Toast.error('Invalid Code', result.message);
      btn.disabled = false;
      btn.textContent = 'Verify & Activate Account';
      const input = document.getElementById('otp-input');
      if (input) { input.style.borderColor = 'var(--accent-coral)'; input.value = ''; }
    }
  },

  async resendOtp() {
    if (!this._email) return;
    try {
      const data = await API.post('/auth/resend-otp', { email: this._email });
      if (data.otp) sessionStorage.setItem('devOtp', data.otp);
      Toast.success('Code Resent', `A new code has been sent to ${this._email}`);
      Router.navigate('/verify-email');
    } catch (e) {
      Toast.error('Error', e.message);
    }
  }
};
