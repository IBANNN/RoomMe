// Maintenance Page
const MaintenancePage = {
  currentFilter: '',

  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';

    const isTenant = user.role === 'tenant';
    let requests;

    if (isTenant) {
      requests = MAINTENANCE_DATA.filter(m => m.tenantId === user.id);
    } else if (user.role === 'landlord') {
      requests = MAINTENANCE_DATA.filter(m => {
        const prop = PROPERTIES_DATA.find(p => p.id === m.propertyId);
        return prop && prop.landlordId === user.id;
      });
    } else {
      requests = [...MAINTENANCE_DATA];
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filtered = this.currentFilter
      ? requests.filter(r => r.status === this.currentFilter)
      : requests;

    return `
      <div class="maintenance-page page-transition">
        <div class="dashboard-page-header">
          <div>
            <h1 class="dashboard-page-title">${isTenant ? 'My Maintenance Requests' : 'Maintenance Requests'}</h1>
            <p class="dashboard-page-subtitle">${requests.length} total requests</p>
          </div>
          ${isTenant ? '<button class="btn btn-primary" onclick="MaintenancePage.showNewRequest()">+ New Request</button>' : ''}
        </div>

        <!-- Status Filter -->
        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-8);flex-wrap:wrap">
          <span class="filter-chip ${this.currentFilter === '' ? 'active' : ''}" onclick="MaintenancePage.filterBy('')">All (${requests.length})</span>
          <span class="filter-chip ${this.currentFilter === 'Pending' ? 'active' : ''}" onclick="MaintenancePage.filterBy('Pending')">⏳ Pending (${requests.filter(r=>r.status==='Pending').length})</span>
          <span class="filter-chip ${this.currentFilter === 'In Progress' ? 'active' : ''}" onclick="MaintenancePage.filterBy('In Progress')">🔧 In Progress (${requests.filter(r=>r.status==='In Progress').length})</span>
          <span class="filter-chip ${this.currentFilter === 'Completed' ? 'active' : ''}" onclick="MaintenancePage.filterBy('Completed')">✅ Completed (${requests.filter(r=>r.status==='Completed').length})</span>
        </div>

        <!-- Timeline -->
        <div class="maintenance-timeline">
          ${filtered.map(req => {
            const property = PROPERTIES_DATA.find(p => p.id === req.propertyId);
            const tenant = isTenant ? null : USERS_DATA.find(u => u.id === req.tenantId);
            return `
              <div class="maintenance-item" data-status="${req.status}">
                <div class="maintenance-item-dot ${req.status.toLowerCase().replace(' ', '-')}"></div>
                <div class="maintenance-item-card">
                  <div class="maintenance-item-header">
                    <div>
                      <div class="maintenance-item-title">${req.title}</div>
                      ${!isTenant && tenant ? `<div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:2px">by ${tenant.fullName}</div>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                      <span class="badge badge-${req.priority === 'High' ? 'coral' : req.priority === 'Medium' ? 'amber' : 'sky'}">${req.priority}</span>
                      <span class="badge badge-${req.status === 'Completed' ? 'primary' : req.status === 'Pending' ? 'amber' : 'sky'}">${req.status}</span>
                    </div>
                  </div>
                  <p class="maintenance-item-desc">${req.description}</p>
                  <div class="maintenance-item-footer">
                    <div style="font-size:var(--font-xs);color:var(--text-muted)">
                      📁 ${req.category} • 🏠 ${property ? property.title : 'Unknown'}<br>
                      📅 ${new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <div style="display:flex;gap:var(--space-2)">
                      <button class="btn btn-secondary btn-sm" onclick="MaintenancePage.viewPhotos('${req.id}')">📷 Photos${req.photos && req.photos.length > 0 ? ` (${req.photos.length})` : ''}</button>
                      ${!isTenant && req.status === 'Pending' ? `
                        <button class="btn btn-primary btn-sm" onclick="MaintenancePage.updateStatus('${req.id}', 'In Progress')">Start</button>
                      ` : ''}
                      ${!isTenant && req.status === 'In Progress' ? `
                        <button class="btn btn-primary btn-sm" onclick="MaintenancePage.updateStatus('${req.id}', 'Completed')">Resolve</button>
                      ` : ''}
                      <button class="btn btn-ghost btn-sm" onclick="MaintenancePage.showTimeline('${req.id}')">Timeline</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
          ${filtered.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">🔧</div>
              <h3>No ${this.currentFilter || ''} Requests</h3>
              <p>${isTenant ? 'Submit a request if you need something fixed.' : 'No requests matching this filter.'}</p>
              ${isTenant && !this.currentFilter ? '<button class="btn btn-primary" onclick="MaintenancePage.showNewRequest()">+ New Request</button>' : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  showNewRequest() {
    Modal.show('Submit Maintenance Request', `
      <form onsubmit="MaintenancePage.submitRequest(event)" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="maint-category" required>
            <option value="">Select category</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Internet</option>
            <option>Furniture</option>
            <option>Appliance</option>
            <option>Pest Control</option>
            <option>Air Conditioning</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Issue Title</label>
          <input type="text" class="form-input" id="maint-title" placeholder="Brief description of the issue" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="maint-desc" placeholder="Describe the issue in detail..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" id="maint-priority">
            <option>Low</option>
            <option>Medium</option>
            <option selected>High</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Photos (optional)</label>
          <div class="upload-zone" onclick="document.getElementById('maint-photo').click()" style="cursor:pointer">
            <input type="file" id="maint-photo" accept="image/*" multiple style="display:none" onchange="MaintenancePage.handlePhotoUpload(this)" />
            📷 Click to upload photos of the issue<br>
            <span id="maint-photo-names" style="color:var(--accent-primary);font-size:var(--font-xs);margin-top:4px;display:block"></span>
            <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();document.getElementById('maint-photo').click()">Choose Files</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-full">Submit Maintenance Request</button>
      </form>
    `);
  },

  handlePhotoUpload(input) {
    const span = document.getElementById('maint-photo-names');
    if (span && input.files.length > 0) {
      span.textContent = `✅ ${input.files.length} photo(s) selected`;
    }
  },

  async submitRequest(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();

    // Default to 'p1' for demo if they don't have an approved app
    const myApps = APPLICATIONS_DATA.filter(a => a.tenantId === user.id && a.status === 'Approved');
    const propertyId = myApps.length > 0 ? myApps[0].propertyId : 'p1';

    const fd = new FormData();
    fd.append('propertyId', propertyId);
    fd.append('category', document.getElementById('maint-category').value);
    fd.append('title', document.getElementById('maint-title').value);
    fd.append('description', document.getElementById('maint-desc').value);
    fd.append('priority', document.getElementById('maint-priority').value);
    
    const photoInput = document.getElementById('maint-photo');
    if (photoInput && photoInput.files.length > 0) {
      for (let i = 0; i < photoInput.files.length; i++) {
        fd.append('photos', photoInput.files[i]);
      }
    }

    try {
      await API.upload('/maintenance', fd);
      Modal.close();
      Toast.success('Request Submitted', 'Your maintenance request has been submitted');
      Router.refresh();
    } catch (error) {
      Toast.error('Submission Failed', error.message);
    }
  },

  async updateStatus(reqId, newStatus) {
    try {
      await API.put(`/maintenance/${reqId}`, { status: newStatus });
      Toast.success('Status Updated', `Request marked as ${newStatus}`);
      Router.refresh();
    } catch (e) {
      Toast.error('Update Failed', e.message);
    }
  },

  showTimeline(reqId) {
    const req = MAINTENANCE_DATA.find(m => m.id === reqId);
    if (!req) return;

    Modal.show(`Timeline: ${req.title}`, `
      <div style="display:flex;flex-direction:column;gap:var(--space-4)">
        ${req.timeline.map((t, i) => `
          <div style="display:flex;gap:var(--space-3);align-items:flex-start">
            <div style="width:12px;height:12px;border-radius:50%;background:${i === req.timeline.length - 1 ? 'var(--accent-primary)' : 'var(--text-muted)'};margin-top:4px;flex-shrink:0"></div>
            <div>
              <div style="font-size:var(--font-sm);font-weight:600">${t.action || t.status}</div>
              <div style="font-size:var(--font-xs);color:var(--text-muted)">${new Date(t.date).toLocaleString()}</div>
              <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-top:2px">${t.note}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `);
  },

  filterBy(status) {
    this.currentFilter = status;
    Router.refresh();
  },

  viewPhotos(reqId) {
    const req = MAINTENANCE_DATA.find(m => m.id === reqId);
    if (!req) return;

    const photosHtml = (req.photos && req.photos.length > 0)
      ? req.photos.map((url, i) => {
          const src = url.startsWith('data:') || url.startsWith('http') ? url : window.location.origin + url;
          return `<img src="${src}" style="width:100%;border-radius:var(--radius-md);margin-bottom:var(--space-3);object-fit:cover;max-height:280px;cursor:pointer;transition:opacity 0.2s" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1" onclick="window.open('${src}','_blank')" title="Click to open full size" />`;
        }).join('')
      : `<div style="text-align:center;padding:var(--space-6);color:var(--text-muted)">📷 No photos uploaded yet for this request.</div>`;

    const user = Auth.getCurrentUser();

    Modal.show(`📷 Photos: ${req.title}`, `
      <div style="max-height:60vh;overflow-y:auto;margin-bottom:var(--space-4)">
        ${photosHtml}
        ${req.photos && req.photos.length > 0 ? `<p style="font-size:var(--font-xs);color:var(--text-muted);text-align:center;margin-top:var(--space-2)">Click any photo to open full size ↗</p>` : ''}
      </div>
      <hr style="border-color:var(--border-color);margin-bottom:var(--space-4)" />
      <div>
        <div style="font-size:var(--font-sm);font-weight:600;margin-bottom:var(--space-3)">📎 Add Update Photos</div>
        <form onsubmit="MaintenancePage.uploadMorePhotos(event, '${req.id}')" style="display:flex;flex-direction:column;gap:var(--space-3)">
          <input type="file" id="maint-update-photos" accept="image/*" multiple class="form-input" style="padding:var(--space-2)" />
          <button type="submit" class="btn btn-primary btn-sm">Upload Photos</button>
        </form>
      </div>
    `);
  },

  async uploadMorePhotos(e, reqId) {
    e.preventDefault();
    const input = document.getElementById('maint-update-photos');
    if (!input || !input.files || input.files.length === 0) {
      Toast.warning('No Files', 'Please select at least one photo to upload.');
      return;
    }
    const fd = new FormData();
    for (let i = 0; i < input.files.length; i++) fd.append('photos', input.files[i]);

    try {
      await API.uploadPut(`/maintenance/${reqId}/photos`, fd);
      Toast.success('Photos Added', 'Your photos have been added to the request.');
      Modal.close();
      Router.refresh();
    } catch (err) {
      Toast.error('Upload Failed', err.message);
    }
  }
};
