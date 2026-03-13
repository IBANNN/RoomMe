// Admin Dashboard
const AdminDashboard = {
  async render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';


    const totalUsers = USERS_DATA.length;
    const tenants = USERS_DATA.filter(u => u.role === 'tenant').length;
    const landlords = USERS_DATA.filter(u => u.role === 'landlord').length;
    const totalListings = PROPERTIES_DATA.length;
    const verifiedListings = PROPERTIES_DATA.filter(p => p.verified).length;
    const totalPayments = PAYMENTS_DATA.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const unverifiedUsers = USERS_DATA.filter(u => !u.verified && u.role !== 'admin');
    const unverifiedLandlords = USERS_DATA.filter(u => u.role === 'landlord' && !u.verificationBadge);
    const unverifiedListings = PROPERTIES_DATA.filter(p => !p.verified);
    const pendingPayments = PAYMENTS_DATA.filter(p => p.status === 'Pending Verification');

    return `
      <div class="dashboard-layout">
        ${Sidebar.render('sidebar', 'admin')}
        <div class="dashboard-main page-transition">
          <div class="dashboard-page-header">
            <div>
              <h1 class="dashboard-page-title">Admin Dashboard</h1>
              <p class="dashboard-page-subtitle">System overview and management</p>
            </div>
            <button class="btn btn-primary" onclick="AdminDashboard.generateReport()">📈 Generate Report</button>
          </div>

          <!-- Stats -->
          <div class="stat-cards">
            <div class="stat-card animate-fade-in-up stagger-1">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(0,212,170,0.1)">👥</div>
                <span class="stat-card-trend up">+${unverifiedUsers.length} unverified</span>
              </div>
              <div class="stat-card-value">${totalUsers}</div>
              <div class="stat-card-label">Total Users</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-2">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(99,102,241,0.1)">🏠</div>
                <span class="stat-card-trend up">${verifiedListings} verified</span>
              </div>
              <div class="stat-card-value">${totalListings}</div>
              <div class="stat-card-label">Total Listings</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-3">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(245,158,11,0.1)">💰</div>
                <span class="stat-card-trend up">+15%</span>
              </div>
              <div class="stat-card-value">₱${totalPayments.toLocaleString()}</div>
              <div class="stat-card-label">Total Revenue</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-4">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(255,107,107,0.1)">🛡️</div>
              </div>
              <div class="stat-card-value">${unverifiedLandlords.length}</div>
              <div class="stat-card-label">Pending Verifications</div>
            </div>
          </div>

          <!-- Payment Verification Queue -->
          ${pendingPayments.length > 0 ? `
            <div class="glass-card" style="margin-bottom:var(--space-6);border:1px solid rgba(99,102,241,0.3)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
                <h3 style="font-size:var(--font-lg);font-weight:700;color:var(--accent-lavender)">🔍 Payment Verification Queue (${pendingPayments.length})</h3>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/payments')">View All</button>
              </div>
              ${pendingPayments.slice(0, 3).map(p => {
                const tenant = USERS_DATA.find(u => u.id === p.tenantId);
                const property = PROPERTIES_DATA.find(pr => pr.id === p.propertyId);
                return `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-glass);border-radius:var(--radius-md);margin-bottom:var(--space-2)">
                    <div>
                      <div style="font-weight:600;font-size:var(--font-sm)">${tenant ? tenant.fullName : 'Unknown'} — ${p.month}</div>
                      <div style="font-size:var(--font-xs);color:var(--text-muted)">${property ? property.title : 'Property'} • Via ${p.method}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--space-2)">
                      <span style="font-weight:700;color:var(--accent-lavender)">₱${p.amount.toLocaleString()}</span>
                      ${p.proofUrl ? `<button class="btn btn-ghost btn-sm" onclick="PaymentsPage.viewProof('${p.id}')">🖼️</button>` : ''}
                      <button class="btn btn-primary btn-sm" onclick="PaymentsPage.adminApprove('${p.id}')">✓ Approve</button>
                      <button class="btn btn-danger btn-sm" onclick="PaymentsPage.adminReject('${p.id}')">✕</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <!-- New User Review Panel -->
          ${unverifiedUsers.length > 0 ? `
            <div class="glass-card" style="margin-bottom:var(--space-6);border:1px solid rgba(245,158,11,0.3)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
                <h3 style="font-size:var(--font-lg);font-weight:700;color:var(--accent-amber)">⚠️ New Users Awaiting Review (${unverifiedUsers.length})</h3>
              </div>
              ${unverifiedUsers.slice(0, 4).map(u => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-glass);border-radius:var(--radius-md);margin-bottom:var(--space-2)">
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:var(--font-xs)">${u.avatar}</div>
                    <div>
                      <div style="font-weight:600;font-size:var(--font-sm)">${u.fullName}</div>
                      <div style="font-size:var(--font-xs);color:var(--text-muted)">${u.email} • ${u.role} • Joined ${u.createdAt}</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:var(--space-2)">
                    <button class="btn btn-primary btn-sm" onclick="AdminDashboard.verifyUser('${u.id}')">✓ Approve</button>
                    <button class="btn btn-ghost btn-sm" onclick="AdminDashboard.viewDocs('${u.id}', '${u.fullName}')">📄 View Docs</button>
                    <button class="btn btn-danger btn-sm" onclick="AdminDashboard.removeUser('${u.id}')">✕ Reject</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="dashboard-panels">
            <!-- User Distribution -->
            <div class="dashboard-panel">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">User Distribution</h3>
              </div>
              <div class="dashboard-panel-body">
                ${Charts.donutChart([
                  { label: 'Students', value: tenants, color: '#00d4aa' },
                  { label: 'Landlords', value: landlords, color: '#6366f1' },
                  { label: 'Admins', value: 1, color: '#f59e0b' }
                ])}
              </div>
            </div>

            <!-- Landlord Verification Queue -->
            <div class="dashboard-panel">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">Landlord Verifications</h3>
              </div>
              <div class="dashboard-panel-body">
                ${unverifiedLandlords.map(u => `
                  <div class="verification-item">
                    <div class="user-table-avatar" style="background:var(--gradient-lavender)">${u.avatar}</div>
                    <div class="verification-info">
                      <div class="verification-name">${u.fullName}</div>
                      <div class="verification-detail">Landlord • ${u.propertiesOwned?.length || 0} properties</div>
                    </div>
                    <div class="verification-actions">
                      <button class="btn btn-primary btn-sm" onclick="AdminDashboard.verifyUser('${u.id}')">✓ Verify</button>
                      <button class="btn btn-ghost btn-sm" onclick="AdminDashboard.viewDocs('${u.id}', '${u.fullName}')">📄 View Docs</button>
                      <button class="btn btn-ghost btn-sm" onclick="AdminDashboard.removeUser('${u.id}')">✕</button>
                    </div>
                  </div>
                `).join('')}
                ${unverifiedLandlords.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--text-muted)">Queue is empty ✅</div>' : ''}
              </div>
            </div>
          </div>

          <!-- User Management Table -->
          <div class="dashboard-panel full-width" style="grid-column:1/-1;margin-top:var(--space-6)">
            <div class="dashboard-panel-header">
              <h3 class="dashboard-panel-title">User Management</h3>
              <div style="display:flex;gap:var(--space-3)">
                <input type="text" class="form-input" placeholder="Search users..." style="width:220px" oninput="AdminDashboard.filterUsers(this.value)" id="admin-user-search" />
              </div>
            </div>
            <div class="dashboard-panel-body" style="padding:0" id="admin-users-table">
              ${this.renderUsersTable(USERS_DATA)}
            </div>
          </div>

          <!-- Listing Approvals -->
          <div class="dashboard-panel full-width" style="grid-column:1/-1;margin-top:var(--space-6)">
            <div class="dashboard-panel-header">
              <h3 class="dashboard-panel-title">Unverified Listings</h3>
              <span class="badge badge-amber">${unverifiedListings.length} pending</span>
            </div>
            <div class="dashboard-panel-body" style="padding:0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Landlord</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${unverifiedListings.map(p => {
                    const landlord = USERS_DATA.find(u => u.id === p.landlordId);
                    return `
                      <tr>
                        <td><span style="color:var(--text-primary);font-weight:500">${p.title}</span></td>
                        <td>${landlord ? landlord.fullName : 'Unknown'}</td>
                        <td>₱${p.price.toLocaleString()}/mo</td>
                        <td><span class="badge badge-secondary">${p.type}</span></td>
                        <td>
                          <div class="user-table-actions">
                            <button class="btn btn-primary btn-sm" onclick="AdminDashboard.approveListing('${p.id}')">Approve</button>
                            <button class="btn btn-danger btn-sm" onclick="AdminDashboard.removeListing('${p.id}')">Remove</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${unverifiedListings.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted)">All listings verified ✅</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderUsersTable(users) {
    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.filter(u => u.role !== 'admin').map(u => `
            <tr>
              <td>
                <div class="user-table-user">
                  <div class="user-table-avatar" style="background:${u.role === 'tenant' ? 'var(--gradient-primary)' : 'var(--gradient-lavender)'}">${u.avatar || '??'}</div>
                  <div>
                    <div class="user-table-name">${u.fullName}</div>
                    <div class="user-table-email">${u.email}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge ${u.role === 'tenant' ? 'badge-primary' : 'badge-secondary'}">${u.role}</span></td>
              <td>${u.verified ? '<span class="badge badge-verified">Verified</span>' : '<span class="badge badge-amber">Unverified</span>'}</td>
              <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
              <td>
                <div class="user-table-actions">
                  ${!u.verified ? `<button class="btn btn-primary btn-sm" onclick="AdminDashboard.verifyUser('${u.id}')">Verify</button>` : ''}
                  <button class="btn btn-ghost btn-sm" onclick="AdminDashboard.viewDocs('${u.id}', '${u.fullName}')">📄 View Docs</button>
                  <button class="btn btn-ghost btn-sm" style="color:var(--accent-coral)" onclick="AdminDashboard.removeUser('${u.id}')">Remove</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  filterUsers(query) {
    const filtered = USERS_DATA.filter(u =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.role.toLowerCase().includes(query.toLowerCase())
    );
    document.getElementById('admin-users-table').innerHTML = this.renderUsersTable(filtered);
  },

  async verifyUser(userId) {
    try {
      await API.put(`/users/${userId}/verify`);
      Toast.success('User Verified', `User has been verified successfully`);
      Router.refresh();
    } catch (e) {
      Toast.error('Verification Failed', e.message);
    }
  },

  async viewDocs(userId, userName) {
    try {
      const docs = await API.get(`/users/${userId}/documents`);
      if (!docs || docs.length === 0) {
        Toast.warning('No Documents', `${userName} has not uploaded any verification documents yet.`);
        return;
      }
      
      const docsHtml = docs.map(d => {
        const isImage = d.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(d.fileUrl);
        const isPdf = d.fileUrl && /\.pdf$/i.test(d.fileUrl);
        const fullUrl = d.fileUrl ? (d.fileUrl.startsWith('http') ? d.fileUrl : window.location.origin + d.fileUrl) : '';
        return `
        <div style="margin-bottom: var(--space-4); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-3);">
          <div style="font-weight: 600; margin-bottom: var(--space-2); color: var(--accent-primary)">${d.type}</div>
          <div style="font-size: var(--font-sm); color: var(--text-secondary); margin-bottom: var(--space-2)">${d.fileName || 'Document'}</div>
          ${isImage ? `<img src="${fullUrl}" alt="${d.type}" style="width:100%;max-height:300px;object-fit:contain;border-radius:var(--radius-md);background:#111;margin-bottom:var(--space-2)" onerror="this.style.display='none';this.nextSibling.style.display='block'"><div style="display:none;padding:var(--space-3);background:rgba(255,107,107,0.1);border-radius:var(--radius-md);color:var(--text-secondary);font-size:var(--font-sm)">⚠️ Cannot preview this image. <a href="${fullUrl}" target="_blank" style="color:var(--accent-primary)">Open in new tab ↗</a></div>` : ''}
          ${isPdf ? `<div style="padding:var(--space-4);background:rgba(0,0,0,0.2);border-radius:var(--radius-md);text-align:center"><div style="font-size:2rem;margin-bottom:var(--space-2)">📄</div><div style="color:var(--text-secondary);font-size:var(--font-sm);margin-bottom:var(--space-3)">PDF Document</div><a href="${fullUrl}" target="_blank" class="btn btn-secondary btn-sm">Open PDF ↗</a></div>` : ''}
          ${!isImage && !isPdf ? `<a href="${fullUrl}" target="_blank" class="btn btn-secondary btn-sm">View Document ↗</a>` : ''}
        </div>
      `}).join('');

      Modal.show(`Documents for ${userName}`, `
        <div style="max-height: 400px; overflow-y: auto; padding-right: var(--space-2)">
          ${docsHtml}
        </div>
        <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3);">
          <button class="btn btn-primary w-full" onclick="AdminDashboard.verifyUser('${userId}'); Modal.close()">✓ Approve User</button>
        </div>
      `);
    } catch (e) {
      Toast.error('Error', 'Failed to fetch documents: ' + e.message);
    }
  },

  removeUser(userId) {
    Modal.confirm('Remove User', 'Are you sure you want to remove this user? This action cannot be undone.', async () => {
      try {
        await API.delete(`/users/${userId}`);
        Toast.success('User Removed', `User has been removed from the system`);
        Router.refresh();
      } catch (e) {
        Toast.error('Removal Failed', e.message);
      }
    });
  },

  async approveListing(propId) {
    try {
      await API.put(`/properties/${propId}`, { verified: 1 });
      Toast.success('Listing Approved', `Property is now verified`);
      Router.refresh();
    } catch (e) {
      Toast.error('Approval Failed', e.message);
    }
  },

  removeListing(propId) {
    Modal.confirm('Remove Listing', 'Are you sure you want to remove this listing?', async () => {
      try {
        await API.delete(`/properties/${propId}`);
        Toast.success('Listing Removed', `Property has been removed`);
        Router.refresh();
      } catch (e) {
        Toast.error('Removal Failed', e.message);
      }
    });
  },

  generateReport() {
    Toast.success('Report Generated', 'System report has been generated and is ready for download');
  }
};
