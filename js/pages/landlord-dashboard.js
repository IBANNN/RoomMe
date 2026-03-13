// Landlord Dashboard
const LandlordDashboard = {
  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';

    const myProperties = PROPERTIES_DATA.filter(p => p.landlordId === user.id);
    const occupiedRooms = myProperties.filter(p => p.availableSlots === 0).length;
    const myApplications = APPLICATIONS_DATA.filter(a => a.landlordId === user.id);
    const pendingApps = myApplications.filter(a => a.status === 'Pending');
    const myPayments = PAYMENTS_DATA.filter(p => p.landlordId === user.id);
    const pendingPaymentVerifs = myPayments.filter(p => p.status === 'Pending Verification');
    const totalRevenue = myPayments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const myMaintenance = MAINTENANCE_DATA.filter(m => {
      const prop = PROPERTIES_DATA.find(p => p.id === m.propertyId);
      return prop && prop.landlordId === user.id;
    });

    return `
      <div class="dashboard-layout">
        ${Sidebar.render('sidebar', 'landlord')}
        <div class="dashboard-main page-transition">

          <!-- CTA Banner for Add Listing -->
          <div style="background:var(--gradient-primary);border-radius:var(--radius-xl);padding:var(--space-6) var(--space-8);margin-bottom:var(--space-6);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
            <div>
              <h1 style="color:white;font-size:var(--font-2xl);font-weight:800;margin-bottom:var(--space-1)">🏠 Landlord Dashboard</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:var(--font-sm)">Manage your properties, tenants, and payments</p>
            </div>
            <button class="btn btn-lg" style="background:white;color:var(--accent-primary);font-weight:700;font-size:var(--font-base);padding:var(--space-3) var(--space-6);box-shadow:0 4px 20px rgba(0,0,0,0.2)" onclick="LandlordDashboard.showAddPropertyModal()">+ Add New Listing</button>
          </div>

          <!-- Stats -->
          <div class="stat-cards">
            <div class="stat-card animate-fade-in-up stagger-1">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(0,212,170,0.1)">🏠</div>
                <span class="stat-card-trend up">Active</span>
              </div>
              <div class="stat-card-value">${myProperties.length}</div>
              <div class="stat-card-label">Total Listings</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-2">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(99,102,241,0.1)">🛏️</div>
                <span class="stat-card-trend ${occupiedRooms > 0 ? 'up' : ''}">${occupiedRooms} full</span>
              </div>
              <div class="stat-card-value">${occupiedRooms}</div>
              <div class="stat-card-label">Occupied Rooms</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-3">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(245,158,11,0.1)">📋</div>
                ${pendingApps.length > 0 ? `<span class="stat-card-trend down">${pendingApps.length} new</span>` : ''}
              </div>
              <div class="stat-card-value">${pendingApps.length}</div>
              <div class="stat-card-label">Pending Applications</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-4">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(255,107,107,0.1)">🔧</div>
              </div>
              <div class="stat-card-value">${myMaintenance.filter(m => m.status !== 'Completed').length}</div>
              <div class="stat-card-label">Open Requests</div>
            </div>
          </div>

          <!-- Payment Verification Alert -->
          ${pendingPaymentVerifs.length > 0 ? `
            <div style="padding:var(--space-4);background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:var(--radius-lg);margin-bottom:var(--space-6);display:flex;align-items:center;justify-content:space-between;gap:var(--space-4)">
              <div>🔍 <strong>${pendingPaymentVerifs.length} payment(s)</strong> are awaiting your verification.</div>
              <button class="btn btn-primary btn-sm" onclick="Router.navigate('/payments')">Review Payments</button>
            </div>
          ` : ''}

          <div class="dashboard-panels">
            <!-- Pending Applications -->
            <div class="dashboard-panel">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">Pending Applications</h3>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/applications')">View All</button>
              </div>
              <div class="dashboard-panel-body" id="pending-apps-list">
                ${pendingApps.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--text-muted)">No pending applications</div>' : ''}
                ${pendingApps.map(app => {
                  const tenant = USERS_DATA.find(u => u.id === app.tenantId);
                  const property = PROPERTIES_DATA.find(p => p.id === app.propertyId);
                  return `
                    <div class="activity-item" id="app-card-${app.id}" style="flex-direction:column;align-items:flex-start;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-color);border-radius:var(--radius-lg);margin-bottom:var(--space-3)">
                      <div style="display:flex;gap:var(--space-3);align-items:center;width:100%">
                        <div class="activity-icon" style="background:var(--gradient-primary);color:white;font-size:12px;font-weight:700;flex-shrink:0">
                          ${tenant ? tenant.avatar : '??'}
                        </div>
                        <div style="flex:1">
                          <div style="font-weight:700">${tenant ? tenant.fullName : 'Unknown Applicant'}</div>
                          <div style="font-size:var(--font-xs);color:var(--text-muted)">
                            ${tenant && tenant.university ? tenant.university + (tenant.yearLevel ? ' • ' + tenant.yearLevel : '') : ''}
                          </div>
                          <div style="font-size:var(--font-sm);color:var(--text-secondary);margin-top:2px">For: <strong>${property ? property.title : 'Unknown'}</strong></div>
                        </div>
                        <div style="display:flex;gap:var(--space-2)">
                          <button class="btn btn-primary btn-sm" onclick="LandlordDashboard.handleApplication('${app.id}', 'Approved', '${app.tenantId}')">✔ Accept</button>
                          <button class="btn btn-ghost btn-sm" onclick="LandlordDashboard.handleApplication('${app.id}', 'Rejected', '${app.tenantId}')">✘ Reject</button>
                        </div>
                      </div>
                      ${app.message ? `<div style="padding:var(--space-3);background:var(--bg-glass);border-radius:var(--radius-md);font-size:var(--font-sm);color:var(--text-secondary);width:100%;box-sizing:border-box">💬 "${app.message}"</div>` : ''}
                      <div style="display:flex;gap:var(--space-2);width:100%">
                        <span style="font-size:var(--font-xs);color:var(--text-muted)">Applied ${new Date(app.submittedAt).toLocaleDateString()}</span>
                        <button class="btn btn-ghost btn-sm" style="margin-left:auto;font-size:var(--font-xs)" onclick="LandlordDashboard.messageApplicant('${app.tenantId}')">💬 Message</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Maintenance Requests -->
            <div class="dashboard-panel">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">Maintenance Requests</h3>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/maintenance')">View All</button>
              </div>
              <div class="dashboard-panel-body">
                ${myMaintenance.filter(m => m.status !== 'Completed').map(req => `
                  <div class="activity-item">
                    <div class="activity-icon" style="background:rgba(${req.status === 'Pending' ? '245,158,11' : '56,189,248'},0.1)">
                      ${req.status === 'Pending' ? '⏳' : '🔧'}
                    </div>
                    <div class="activity-content">
                      <div class="activity-text"><strong>${req.title}</strong></div>
                      <div class="activity-time">${req.category} • <span class="badge badge-${req.status === 'Pending' ? 'amber' : 'sky'}">${req.status}</span></div>
                    </div>
                  </div>
                `).join('')}
                ${myMaintenance.filter(m => m.status !== 'Completed').length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--text-muted)">No open requests</div>' : ''}
              </div>
            </div>
          </div>

          <!-- Revenue Chart -->
          <div class="dashboard-panel full-width" style="grid-column:1/-1;margin-top:var(--space-6)">
            <div class="dashboard-panel-header">
              <h3 class="dashboard-panel-title">Revenue Overview</h3>
              <div style="font-size:var(--font-2xl);font-weight:800;color:var(--accent-primary)">₱${totalRevenue.toLocaleString()}</div>
            </div>
            <div class="dashboard-panel-body">
              ${Charts.barChart([
                { label: 'Sep', value: 22000 },
                { label: 'Oct', value: 25500 },
                { label: 'Nov', value: 28000 },
                { label: 'Dec', value: 25500 },
                { label: 'Jan', value: 30000 },
                { label: 'Feb', value: 27500 },
              ])}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async handleApplication(appId, status, tenantId) {
    const card = document.getElementById(`app-card-${appId}`);
    // Immediately animate the card out
    if (card) {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '0';
      card.style.maxHeight = card.offsetHeight + 'px';
      setTimeout(() => {
        card.style.maxHeight = '0';
        card.style.padding = '0';
        card.style.margin = '0';
        card.style.overflow = 'hidden';
        setTimeout(() => card.remove(), 300);
      }, 200);
    }

    // Update APPLICATIONS_DATA in memory so statistic counter updates
    const app = APPLICATIONS_DATA.find(a => a.id === appId);
    if (app) app.status = status;

    try {
      // Persist to backend
      await API.put(`/applications/${appId}`, { status });
      Toast.success(`Application ${status}`, `Tenant has been notified by the system.`);

      // Offer to message the tenant
      if (tenantId) {
        setTimeout(() => {
          Modal.confirm(
            status === 'Approved' ? 'Application Approved' : 'Application Rejected',
            `Would you like to message the applicant ${status === 'Approved' ? 'to coordinate move-in details' : 'to explain your decision'}?`,
            () => LandlordDashboard.messageApplicant(tenantId)
          );
        }, 500);
      }
    } catch (e) {
      Toast.error('Update Failed', e.message);
      // Restore card if API failed
      if (card) { card.style.opacity = '1'; card.style.maxHeight = ''; }
    }
  },

  async messageApplicant(tenantId) {
    try {
      const res = await API.post('/messages/conversations', { otherUserId: tenantId });
      Router.navigate('/messages');
      setTimeout(() => {
        if (MessagesPage && MessagesPage.selectConversation) MessagesPage.selectConversation(res.conversationId);
      }, 400);
    } catch (e) {
      Toast.error('Error', 'Could not start conversation: ' + e.message);
    }
  },

  showAddPropertyModal() {
    Modal.show('Add New Listing', `
      <form onsubmit="LandlordDashboard.addProperty(event)" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-group">
          <label class="form-label">Property Title</label>
          <input type="text" class="form-input" id="new-prop-title" placeholder="e.g. Modern Studio near Campus" required />
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" class="form-input" id="new-prop-address" placeholder="Full address" required />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
          <div class="form-group">
            <label class="form-label">Monthly Price (₱)</label>
            <input type="number" class="form-input" id="new-prop-price" placeholder="8500" required />
          </div>
          <div class="form-group">
            <label class="form-label">Room Type</label>
            <select class="form-select" id="new-prop-type">
              <option>Studio</option>
              <option>Single Room</option>
              <option>Shared Room</option>
              <option>Bedspace</option>
              <option>1 Bedroom</option>
              <option>2 Bedroom</option>
              <option>Loft</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
          <div class="form-group">
            <label class="form-label">Capacity (persons)</label>
            <input type="number" class="form-input" id="new-prop-capacity" placeholder="1" min="1" required />
          </div>
          <div class="form-group">
            <label class="form-label">Available Slots</label>
            <input type="number" class="form-input" id="new-prop-slots" placeholder="1" min="0" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="new-prop-desc" placeholder="Describe your property..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Property Photos</label>
          <div class="upload-zone" onclick="document.getElementById('prop-photos').click()" style="cursor:pointer">
            <input type="file" id="prop-photos" accept="image/*" multiple style="display:none" onchange="LandlordDashboard.handlePhotoUpload(this)" />
            📷 Upload property photos<br>
            <span id="prop-photos-preview" style="color:var(--accent-primary);font-size:var(--font-xs);margin-top:4px;display:block"></span>
            <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();document.getElementById('prop-photos').click()">Choose Files</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-full">Submit Listing</button>
      </form>
    `);
  },

  handlePhotoUpload(input) {
    const preview = document.getElementById('prop-photos-preview');
    if (preview && input.files.length > 0) {
      preview.textContent = `✅ ${input.files.length} photo(s) selected`;
    }
  },

  async addProperty(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    const capacity = parseInt(document.getElementById('new-prop-capacity').value) || 1;
    const slots = parseInt(document.getElementById('new-prop-slots').value) || 1;
    const address = document.getElementById('new-prop-address').value;
    
    const fd = new FormData();
    fd.append('title', document.getElementById('new-prop-title').value);
    fd.append('address', address);
    fd.append('location', address.split(',').pop()?.trim() || 'Manila');
    fd.append('price', parseInt(document.getElementById('new-prop-price').value));
    fd.append('capacity', capacity);
    fd.append('availableSlots', Math.min(slots, capacity));
    fd.append('type', document.getElementById('new-prop-type').value);
    fd.append('description', document.getElementById('new-prop-desc').value);
    fd.append('amenities', 'WiFi'); // default

    const photoInput = document.getElementById('prop-photos');
    if (photoInput && photoInput.files) {
      for (let i = 0; i < photoInput.files.length; i++) {
        fd.append('photos', photoInput.files[i]);
      }
    }

    try {
      await API.upload('/properties', fd);
      Modal.close();
      Toast.success('Listing Created!', 'Your property listing has been submitted for admin review.');
      Router.refresh();
    } catch (err) {
      Toast.error('Submission Failed', err.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Listing'; }
    }
  }
};
