// Register Page
const RegisterPage = {
  selectedRole: 'tenant',

  render() {
    return `
  <div class="auth-page page-transition">
    <div class="auth-card" style="max-width:520px">
      <div class="auth-header">
        <div class="auth-logo">🏠</div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join RoomMe and find your perfect home</p>
      </div>
      <form class="auth-form" onsubmit="RegisterPage.handleSubmit(event)">
        <div class="form-group">
          <label class="form-label">I am a...</label>
          <div class="role-selector">
            <div class="role-option ${this.selectedRole === 'tenant' ? 'selected' : ''}" onclick="RegisterPage.selectRole('tenant')">
              <div class="role-option-icon">🎓</div>
              <div class="role-option-label">Student</div>
            </div>
            <div class="role-option ${this.selectedRole === 'landlord' ? 'selected' : ''}" onclick="RegisterPage.selectRole('landlord')">
              <div class="role-option-icon">🏠</div>
              <div class="role-option-label">Landlord</div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="reg-name" placeholder="Juan Dela Cruz" required />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" class="form-input" id="reg-phone" placeholder="+63 9XX XXX XXXX" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="reg-email" placeholder="you@university.edu" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="reg-password" placeholder="Min. 8 characters" required minlength="6" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-input" id="reg-confirm" placeholder="Confirm password" required />
          </div>
        </div>
        <div id="role-specific-fields">
          ${this.getRoleFields()}
        </div>
        <label style="display:flex;align-items:flex-start;gap:0.5rem;font-size:var(--font-sm);color:var(--text-secondary);cursor:pointer">
          <input type="checkbox" style="accent-color:var(--accent-primary);margin-top:3px" required />
          <span>I agree to the <a style="color:var(--accent-primary)">Terms of Service</a> and <a style="color:var(--accent-primary)">Privacy Policy</a></span>
        </label>
        <button type="submit" class="btn btn-primary btn-lg w-full">Create Account</button>
      </form>
      <div class="auth-footer">
        Already have an account? <a onclick="Router.navigate('/login')">Sign In</a>
      </div>
    </div>
  </div>
`;
  },

  getRoleFields() {
    if (this.selectedRole === 'tenant') {
      return `
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">University</label>
            <select class="form-select" id="reg-university">
              <option value="">Select University</option>
              <option>University of the Philippines</option>
              <option>Ateneo de Manila University</option>
              <option>De La Salle University</option>
              <option>University of Santo Tomas</option>
              <option>Far Eastern University</option>
              <option>Polytechnic University of the Philippines</option>
              <option>Mapúa University</option>
              <option>Adamson University</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Year Level</label>
            <select class="form-select" id="reg-year">
              <option value="">Select Year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>5th Year</option>
              <option>Graduate</option>
            </select>
          </div>
        </div>
      `;
    } else if (this.selectedRole === 'landlord') {
      return `
        <div class="form-group">
          <label class="form-label">Property Ownership Verification</label>
          <div class="upload-zone" id="ownership-upload-zone" onclick="document.getElementById('ownership-file').click()" style="cursor:pointer">
            <input type="file" id="ownership-file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="RegisterPage.handleFileUpload(this, 'ownership-preview')" />
            📄 Upload proof of ownership (PDF, JPG, PNG)<br>
            <span id="ownership-preview" style="color:var(--accent-primary);font-size:var(--font-xs);margin-top:4px;display:block"></span>
            <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem">Choose File</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ID Verification</label>
          <div class="upload-zone" id="id-upload-zone" onclick="document.getElementById('id-file').click()" style="cursor:pointer">
            <input type="file" id="id-file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="RegisterPage.handleFileUpload(this, 'id-preview')" />
            🪪 Upload valid government ID<br>
            <span id="id-preview" style="color:var(--accent-primary);font-size:var(--font-xs);margin-top:4px;display:block"></span>
            <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem">Choose File</button>
          </div>
        </div>
      `;
    }
    return '';
  },

  handleFileUpload(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0] && preview) {
      preview.textContent = `✅ ${input.files[0].name}`;
    }
  },

  selectRole(role) {
    this.selectedRole = role;
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('role-specific-fields').innerHTML = this.getRoleFields();
  },

  async handleSubmit(e) {
    e.preventDefault();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (password !== confirm) {
      Toast.error('Error', 'Passwords do not match');
      return;
    }

    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }

    const data = {
      fullName: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      phone: document.getElementById('reg-phone').value,
      password: password,
      role: this.selectedRole,
      university: document.getElementById('reg-university')?.value || '',
      yearLevel: document.getElementById('reg-year')?.value || ''
    };

    const result = await Auth.register(data);
    if (result.success && result.requiresVerification) {
      // Store email + dev OTP in sessionStorage for the verify-email page
      sessionStorage.setItem('pendingEmail', result.email);
      if (result.otp) sessionStorage.setItem('devOtp', result.otp);
      VerifyEmailPage._email = result.email;
      Router.navigate('/verify-email');
      setTimeout(() => {
        Toast.info('OTP Sent! ✉️', `Check your email for the verification code.${result.otp ? ' Dev OTP: ' + result.otp : ''}`);
      }, 300);
    } else if (!result.success) {
      Toast.error('Registration Failed', result.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    }
  }
};

