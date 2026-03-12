// Profile Page
const ProfilePage = {
  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';

    return `
      <div class="profile-page page-transition">

        <!-- Profile Header -->
        <div class="profile-header-section">
          <div class="profile-photo-wrapper">
            <div class="profile-avatar-large" id="profile-avatar-display"
              style="${user.photo ? `background-image:url('${user.photo}');background-size:cover;background-position:center;font-size:0;` : ''}">
              ${!user.photo ? user.avatar : ''}
            </div>
            <label class="profile-photo-upload-btn" title="Change photo" onclick="document.getElementById('profile-photo-input').click()">📷</label>
            <input type="file" id="profile-photo-input" accept="image/*" style="display:none" onchange="ProfilePage.handlePhotoUpload(this)" />
          </div>
          <div class="profile-header-info">
            <h1>${user.fullName} ${user.verificationBadge ? '<span class="badge badge-verified">✓ Verified</span>' : '<span class="badge badge-amber">Unverified</span>'}</h1>
            <p>${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${user.university ? '• ' + user.university : ''} ${user.yearLevel ? '• ' + user.yearLevel : ''}</p>
            <p style="margin-top:var(--space-1)">📧 ${user.email} • 📱 ${user.phone || 'Not set'}</p>
          </div>
        </div>

        <!-- Personal Info -->
        <div class="profile-section">
          <h3>Personal Information</h3>
          <form class="profile-form" onsubmit="ProfilePage.save(event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="prof-name" value="${user.fullName}" />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="prof-email" value="${user.email}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-input" id="prof-phone" value="${user.phone || ''}" />
              </div>
              ${user.role === 'tenant' ? `
                <div class="form-group">
                  <label class="form-label">University</label>
                  <input type="text" class="form-input" id="prof-uni" value="${user.university || ''}" />
                </div>
              ` : '<div class="form-group"></div>'}
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </form>
        </div>

        <!-- Document Uploads -->
        <div class="profile-section">
          <h3>📁 Verification Documents</h3>
          <p style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-5)">
            Upload documents to get your account verified by our admin team.
            ${user.verified ? '<span style="color:var(--accent-primary);font-weight:600">✓ Your account is already verified!</span>' : '<span style="color:var(--accent-amber);">⚠️ Not yet verified — upload documents below.</span>'}
          </p>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-5)">

            <!-- Gov ID -->
            <div>
              <div class="form-label" style="margin-bottom:var(--space-2)">🪪 Government-Issued ID</div>
              <div class="upload-zone" id="govid-zone" onclick="document.getElementById('govid-input').click()" style="cursor:pointer">
                <input type="file" id="govid-input" accept="image/*,.pdf" style="display:none" onchange="ProfilePage.handleDocUpload(this,'govid-preview','govid-status')" />
                <div id="govid-status" style="font-size:1.5rem;margin-bottom:var(--space-2)">🪪</div>
                <div style="font-size:var(--font-sm)">Click to upload Government ID</div>
                <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:4px">JPG, PNG, or PDF</div>
                <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();document.getElementById('govid-input').click()">Choose File</button>
              </div>
              <div id="govid-preview" style="margin-top:var(--space-2);display:none">
                <img id="govid-img" style="max-width:100%;max-height:120px;border-radius:var(--radius-md);border:1px solid var(--border-color)" />
                <div style="font-size:var(--font-xs);color:var(--accent-primary);margin-top:4px" id="govid-name"></div>
              </div>
            </div>

            <!-- Proof of Enrollment / Ownership -->
            <div>
              <div class="form-label" style="margin-bottom:var(--space-2)">${user.role === 'tenant' ? '🎓 Proof of Enrollment / Student ID' : '🏠 Proof of Property Ownership'}</div>
              <div class="upload-zone" id="proof-zone" onclick="document.getElementById('proof-input').click()" style="cursor:pointer">
                <input type="file" id="proof-input" accept="image/*,.pdf" style="display:none" onchange="ProfilePage.handleDocUpload(this,'proof-preview','proof-status')" />
                <div id="proof-status" style="font-size:1.5rem;margin-bottom:var(--space-2)">${user.role === 'tenant' ? '🎓' : '🏠'}</div>
                <div style="font-size:var(--font-sm)">${user.role === 'tenant' ? 'Click to upload Student ID or COR' : 'Click to upload ownership documents'}</div>
                <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:4px">JPG, PNG, or PDF</div>
                <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();document.getElementById('proof-input').click()">Choose File</button>
              </div>
              <div id="proof-preview" style="margin-top:var(--space-2);display:none">
                <img id="proof-img" style="max-width:100%;max-height:120px;border-radius:var(--radius-md);border:1px solid var(--border-color)" />
                <div style="font-size:var(--font-xs);color:var(--accent-primary);margin-top:4px" id="proof-name"></div>
              </div>
            </div>

            <!-- Profile Photo Upload Card -->
            <div>
              <div class="form-label" style="margin-bottom:var(--space-2)">📸 Profile Photo</div>
              <div class="upload-zone" id="pfp-zone" onclick="document.getElementById('pfp-input').click()" style="cursor:pointer">
                <input type="file" id="pfp-input" accept="image/*" style="display:none" onchange="ProfilePage.handlePhotoUpload(this)" />
                <div style="margin:0 auto var(--space-2);width:64px;height:64px;border-radius:50%;overflow:hidden;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:white"
                  id="pfp-zone-preview">
                  ${user.photo ? `<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover" />` : user.avatar}
                </div>
                <div style="font-size:var(--font-sm)">Click to change profile photo</div>
                <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:4px">JPG or PNG</div>
                <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();document.getElementById('pfp-input').click()">Choose File</button>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="margin-top:var(--space-5)" onclick="ProfilePage.submitDocs()">📤 Submit Documents for Verification</button>
        </div>

        <!-- Lifestyle Preferences (tenant only) -->
        ${user.role === 'tenant' && user.lifestyle ? `
          <div class="profile-section">
            <h3>🏠 Lifestyle Preferences</h3>
            <p style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-4)">Used for roommate matching — be honest for the best results!</p>
            <form class="profile-form" onsubmit="ProfilePage.saveLifestyle(event)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">😴 Sleep Schedule</label>
                  <select class="form-select" id="pref-sleep">
                    <option ${user.lifestyle.sleepSchedule==='Early Bird'?'selected':''}>Early Bird</option>
                    <option ${user.lifestyle.sleepSchedule==='Night Owl'?'selected':''}>Night Owl</option>
                    <option ${user.lifestyle.sleepSchedule==='Flexible'?'selected':''}>Flexible</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">🧹 Cleanliness Level</label>
                  <select class="form-select" id="pref-clean">
                    <option ${user.lifestyle.cleanliness==='Very Tidy'?'selected':''}>Very Tidy</option>
                    <option ${user.lifestyle.cleanliness==='Moderate'?'selected':''}>Moderate</option>
                    <option ${user.lifestyle.cleanliness==='Relaxed'?'selected':''}>Relaxed</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">📚 Study Habits</label>
                  <select class="form-select" id="pref-study">
                    <option ${user.lifestyle.studyHabits==='Library Studier'?'selected':''}>Library Studier</option>
                    <option ${user.lifestyle.studyHabits==='Room Studier'?'selected':''}>Room Studier</option>
                    <option ${user.lifestyle.studyHabits==='Café Studier'?'selected':''}>Café Studier</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">🔊 Noise Tolerance</label>
                  <select class="form-select" id="pref-noise">
                    <option ${user.lifestyle.noiseTolerance==='Quiet'?'selected':''}>Quiet</option>
                    <option ${user.lifestyle.noiseTolerance==='Moderate'?'selected':''}>Moderate</option>
                    <option ${user.lifestyle.noiseTolerance==='High'?'selected':''}>High</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="max-width:300px">
                <label class="form-label">🚻 Roommate Gender Preference</label>
                <select class="form-select" id="pref-gender">
                  <option ${user.lifestyle.genderPreference==='Any'?'selected':''}>Any</option>
                  <option ${user.lifestyle.genderPreference==='Male'?'selected':''}>Male</option>
                  <option ${user.lifestyle.genderPreference==='Female'?'selected':''}>Female</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Update Preferences</button>
            </form>
          </div>
        ` : ''}

        <!-- Security -->
        <div class="profile-section">
          <h3>🔒 Security</h3>
          <form class="profile-form" onsubmit="ProfilePage.changePassword(event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" class="form-input" id="pwd-current" placeholder="Enter current password" />
              </div>
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" class="form-input" id="pwd-new" placeholder="Enter new password (min. 6 chars)" />
              </div>
            </div>
            <button type="submit" class="btn btn-secondary">Change Password</button>
          </form>
        </div>

      </div>
    `;
  },

  handlePhotoUpload(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Update in-memory user
      const user = Auth.getCurrentUser();
      if (user) {
        user.photo = dataUrl;
        // Persist if registered user
        if (user._registered) Auth._persistUsers();
        // Update the avatar displays
        const avatarDisplay = document.getElementById('profile-avatar-display');
        if (avatarDisplay) {
          avatarDisplay.style.backgroundImage = `url('${dataUrl}')`;
          avatarDisplay.style.backgroundSize = 'cover';
          avatarDisplay.style.backgroundPosition = 'center';
          avatarDisplay.style.fontSize = '0';
          avatarDisplay.textContent = '';
        }
        const pfpZonePreview = document.getElementById('pfp-zone-preview');
        if (pfpZonePreview) {
          pfpZonePreview.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover" />`;
        }
        // Re-render navbar to update top-right avatar
        Navbar.render();
      }
      Toast.success('Photo Updated!', 'Your profile photo has been saved');
    };
    reader.readAsDataURL(file);
  },

  handleDocUpload(input, previewId, statusId) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const statusEl = document.getElementById(statusId);
    const previewDiv = document.getElementById(previewId);

    if (statusEl) statusEl.textContent = '✅';

    if (file.type.startsWith('image/') && previewDiv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewDiv.style.display = '';
        const imgEl = previewDiv.querySelector('img');
        const nameEl = previewDiv.querySelector('[id$="-name"]');
        if (imgEl) imgEl.src = e.target.result;
        if (nameEl) nameEl.textContent = `✅ ${file.name}`;
      };
      reader.readAsDataURL(file);
    } else if (previewDiv) {
      previewDiv.style.display = '';
      const nameEl = previewDiv.querySelector('[id$="-name"]');
      if (nameEl) nameEl.textContent = `✅ ${file.name} (PDF)`;
    }

    Toast.info('Document Uploaded', `"${file.name}" is ready to be submitted`);
  },

  async submitDocs() {
    const govIdInput = document.getElementById('govid-input');
    const proofInput = document.getElementById('proof-input');
    const hasGovId = govIdInput && govIdInput.files && govIdInput.files.length > 0;
    const hasProof = proofInput && proofInput.files && proofInput.files.length > 0;

    if (!hasGovId && !hasProof) {
      Toast.warning('No Files', 'Please upload at least one document before submitting');
      return;
    }

    try {
      if (hasGovId) {
        const fd = new FormData();
        fd.append('document', govIdInput.files[0]);
        fd.append('type', 'Government ID');
        await API.upload('/users/me/documents', fd);
      }
      if (hasProof) {
        const fd = new FormData();
        fd.append('document', proofInput.files[0]);
        fd.append('type', 'Proof of Enrollment/Ownership');
        await API.upload('/users/me/documents', fd);
      }

      Toast.success('Documents Submitted! 🎉', 'The admin will review your documents and verify your account shortly.');
    } catch (e) {
      Toast.error('Upload Failed', 'There was a problem submitting your documents: ' + e.message);
    }
  },

  save(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    user.fullName = document.getElementById('prof-name').value;
    user.email = document.getElementById('prof-email').value;
    user.phone = document.getElementById('prof-phone').value;
    const uniEl = document.getElementById('prof-uni');
    if (uniEl) user.university = uniEl.value;
    user.avatar = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (user._registered) Auth._persistUsers();
    Toast.success('Profile Updated', 'Your information has been saved');
    Navbar.render();
    Router.navigate('/profile');
  },

  saveLifestyle(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    user.lifestyle = {
      sleepSchedule: document.getElementById('pref-sleep').value,
      cleanliness: document.getElementById('pref-clean').value,
      studyHabits: document.getElementById('pref-study').value,
      noiseTolerance: document.getElementById('pref-noise').value,
      genderPreference: document.getElementById('pref-gender').value
    };
    if (user._registered) Auth._persistUsers();
    Toast.success('Preferences Updated', 'Roommate matching will use your new preferences');
  },

  changePassword(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const current = document.getElementById('pwd-current').value;
    const newPwd = document.getElementById('pwd-new').value;
    if (current !== user.password) {
      Toast.error('Wrong Password', 'Your current password is incorrect');
      return;
    }
    if (newPwd.length < 6) {
      Toast.error('Too Short', 'Password must be at least 6 characters');
      return;
    }
    user.password = newPwd;
    if (user._registered) Auth._persistUsers();
    Toast.success('Password Changed', 'Your password has been updated');
    document.getElementById('pwd-current').value = '';
    document.getElementById('pwd-new').value = '';
  }
};
