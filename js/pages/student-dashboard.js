// Student Dashboard
const StudentDashboard = {
  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '<div class="auth-page"><h2>Please log in</h2></div>';

    const myPayments = PAYMENTS_DATA.filter(p => p.tenantId === user.id);
    const pendingPayment = myPayments.find(p => p.status === 'Pending' || p.status === 'Overdue');
    const myMaintenance = MAINTENANCE_DATA.filter(m => m.tenantId === user.id);
    const activeMaintenance = myMaintenance.filter(m => m.status !== 'Completed');
    const myApps = APPLICATIONS_DATA.filter(a => a.tenantId === user.id);
    const myFavorites = typeof FavoritesPage !== 'undefined' ? FavoritesPage.getUserFavorites() : [];

    return `
      <div class="dashboard-layout">
        ${Sidebar.render('sidebar', 'tenant')}
        <div class="dashboard-main page-transition">
          <div class="dashboard-page-header">
            <div>
              <h1 class="dashboard-page-title">Welcome back, ${user.fullName.split(' ')[0]}! 👋</h1>
              <p class="dashboard-page-subtitle">Here's an overview of your rental activity</p>
            </div>
          </div>

          <!-- Verification reminder -->
          ${!user.emailVerified && !user.verified ? `
            <div style="padding:var(--space-4);background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-3)">
              ⚠️ <div><strong>Account not fully verified.</strong> Please upload your verification documents in <a onclick="Router.navigate('/profile')" style="color:var(--accent-amber);cursor:pointer">Settings</a> to activate all features.</div>
            </div>
          ` : ''}

          <!-- Stat Cards -->
          <div class="stat-cards">
            <div class="stat-card animate-fade-in-up stagger-1">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(0,212,170,0.1)">💳</div>
                <span class="stat-card-trend up">${pendingPayment ? 'Due ' + new Date(pendingPayment.dueDate).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : 'All paid'}</span>
              </div>
              <div class="stat-card-value">₱${pendingPayment ? pendingPayment.amount.toLocaleString() : '0'}</div>
              <div class="stat-card-label">Rent Due</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-2">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(255,107,107,0.1)">🔧</div>
              </div>
              <div class="stat-card-value">${activeMaintenance.length}</div>
              <div class="stat-card-label">Active Requests</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-3">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(99,102,241,0.1)">📋</div>
              </div>
              <div class="stat-card-value">${myApps.filter(a => a.status === 'Pending').length}</div>
              <div class="stat-card-label">Pending Applications</div>
            </div>
            <div class="stat-card animate-fade-in-up stagger-4">
              <div class="stat-card-header">
                <div class="stat-card-icon" style="background:rgba(245,158,11,0.1)">❤️</div>
              </div>
              <div class="stat-card-value">${myFavorites.length}</div>
              <div class="stat-card-label">Saved Properties</div>
            </div>
          </div>

          <!-- Panels -->
          <div class="dashboard-panels">
            <!-- Recent Activity -->
            <div class="dashboard-panel">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">Recent Activity</h3>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/applications')">View All</button>
              </div>
              <div class="dashboard-panel-body">
                ${myPayments.slice(0, 2).map(p => `
                  <div class="activity-item" onclick="Router.navigate('/payments')" style="cursor:pointer">
                    <div class="activity-icon" style="background:rgba(${p.status==='Paid'?'0,212,170':'245,158,11'},0.1)">${p.status==='Paid'?'✅':'💳'}</div>
                    <div class="activity-content">
                      <div class="activity-text">Payment of <strong>₱${p.amount.toLocaleString()}</strong> for ${p.month} — <span style="color:${p.status==='Paid'?'var(--accent-primary)':'var(--accent-amber)'}">${p.status}</span></div>
                      <div class="activity-time">${p.paidDate || p.dueDate}</div>
                    </div>
                  </div>
                `).join('')}
                ${activeMaintenance.slice(0, 1).map(m => `
                  <div class="activity-item" onclick="Router.navigate('/maintenance')" style="cursor:pointer">
                    <div class="activity-icon" style="background:rgba(56,189,248,0.1)">🔧</div>
                    <div class="activity-content">
                      <div class="activity-text">Maintenance request <strong>"${m.title}"</strong> — ${m.status}</div>
                      <div class="activity-time">${new Date(m.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                `).join('')}
                ${myApps.slice(0, 1).map(a => {
                  const prop = PROPERTIES_DATA.find(p => p.id === a.propertyId);
                  return `
                    <div class="activity-item" onclick="Router.navigate('/applications')" style="cursor:pointer">
                      <div class="activity-icon" style="background:rgba(99,102,241,0.1)">📋</div>
                      <div class="activity-content">
                        <div class="activity-text">Application for <strong>${prop ? prop.title : 'Property'}</strong> — <span class="badge badge-${a.status==='Approved'?'primary':a.status==='Rejected'?'coral':'amber'}" style="font-size:10px">${a.status}</span></div>
                        <div class="activity-time">${new Date(a.submittedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="dashboard-panel">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">Quick Actions</h3>
              </div>
              <div class="dashboard-panel-body">
                <div class="quick-actions">
                  <div class="quick-action-btn" onclick="Router.navigate('/payments')">
                    <div class="quick-action-btn-icon">💳</div>
                    Pay Rent
                  </div>
                  <div class="quick-action-btn" onclick="Router.navigate('/maintenance')">
                    <div class="quick-action-btn-icon">🔧</div>
                    Submit Request
                  </div>
                  <div class="quick-action-btn" onclick="Router.navigate('/properties')">
                    <div class="quick-action-btn-icon">🔍</div>
                    Browse Rooms
                  </div>
                  <div class="quick-action-btn" onclick="Router.navigate('/roommates')">
                    <div class="quick-action-btn-icon">👥</div>
                    Find Roommate
                  </div>
                  <div class="quick-action-btn" onclick="Router.navigate('/favorites')">
                    <div class="quick-action-btn-icon">❤️</div>
                    Favorites
                  </div>
                  <div class="quick-action-btn" onclick="Router.navigate('/messages')">
                    <div class="quick-action-btn-icon">💬</div>
                    Messages
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Saved Properties -->
          ${myFavorites.length > 0 ? `
            <div class="dashboard-panel full-width" style="grid-column: 1/-1;margin-top:var(--space-6)">
              <div class="dashboard-panel-header">
                <h3 class="dashboard-panel-title">❤️ Saved Properties</h3>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/favorites')">View All</button>
              </div>
              <div class="dashboard-panel-body">
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-4)">
                  ${myFavorites.slice(0, 3).map(p => `
                    <div style="background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:var(--space-4);cursor:pointer" onclick="Router.navigate('/property/${p.id}')">
                      <div style="font-size:2rem;margin-bottom:var(--space-2)">🏠</div>
                      <div style="font-weight:600;font-size:var(--font-sm);margin-bottom:2px">${p.title.substring(0,30)}…</div>
                      <div style="color:var(--accent-primary);font-weight:700">₱${p.price.toLocaleString()}/mo</div>
                      <div style="font-size:var(--font-xs);color:var(--text-muted)">📍 ${p.location}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Payment History Chart -->
          <div class="dashboard-panel full-width" style="grid-column: 1/-1;margin-top:var(--space-6)">
            <div class="dashboard-panel-header">
              <h3 class="dashboard-panel-title">Payment History</h3>
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/payments')">View All</button>
            </div>
            <div class="dashboard-panel-body">
              ${Charts.barChart([
                { label: 'Sep', value: 8500 },
                { label: 'Oct', value: 8500 },
                { label: 'Nov', value: 8500 },
                { label: 'Dec', value: 8500 },
                { label: 'Jan', value: 8500 },
                { label: 'Feb', value: 8500 },
              ])}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
