// Applications Page
const ApplicationsPage = {
  currentFilter: 'All',

  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';
    const isTenant = user.role === 'tenant';
    let apps = isTenant
      ? APPLICATIONS_DATA.filter(a => a.tenantId === user.id)
      : APPLICATIONS_DATA.filter(a => a.landlordId === user.id);
    apps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const filtered = this.currentFilter === 'All' ? apps : apps.filter(a => a.status === this.currentFilter);

    const counts = {
      All: apps.length,
      Pending: apps.filter(a => a.status === 'Pending').length,
      Approved: apps.filter(a => a.status === 'Approved').length,
      Rejected: apps.filter(a => a.status === 'Rejected').length
    };

    return `
      <div class="applications-page page-transition">
        <div class="dashboard-page-header">
          <div>
            <h1 class="dashboard-page-title">${isTenant ? 'My Applications' : 'Tenant Applications'}</h1>
            <p class="dashboard-page-subtitle">${apps.length} total applications</p>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-6);flex-wrap:wrap">
          ${['All', 'Pending', 'Approved', 'Rejected'].map(f => `
            <span class="filter-chip ${this.currentFilter === f ? 'active' : ''}" 
              onclick="ApplicationsPage.filterBy('${f}')">
              ${f === 'All' ? '📋' : f === 'Pending' ? '⏳' : f === 'Approved' ? '✅' : '❌'} ${f} (${counts[f]})
            </span>
          `).join('')}
        </div>
        <div id="applications-list">
          ${filtered.map(app => {
            const property = PROPERTIES_DATA.find(p => p.id === app.propertyId);
            const other = isTenant ? USERS_DATA.find(u => u.id === app.landlordId) : USERS_DATA.find(u => u.id === app.tenantId);
            return `
              <div class="application-card" data-status="${app.status}">
                <div class="application-property-img">🏠</div>
                <div class="application-info">
                  <h3>${property ? property.title : 'Property'}</h3>
                  <p>${isTenant ? 'Landlord' : 'Applicant'}: ${other ? other.fullName : 'Unknown'}</p>
                  <p style="margin-top:var(--space-2);font-style:italic;color:var(--text-muted)">"${app.message ? app.message.substring(0, 80) + '...' : 'No message'}"</p>
                  <div class="application-meta">
                    <span>📅 ${new Date(app.submittedAt).toLocaleDateString()}</span>
                    <span class="badge badge-${app.status==='Approved'?'primary':app.status==='Rejected'?'coral':'amber'}">${app.status}</span>
                  </div>
                </div>
                <div class="application-actions">
                  ${!isTenant && app.status === 'Pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="ApplicationsPage.update('${app.id}','Approved')">Accept</button>
                    <button class="btn btn-danger btn-sm" onclick="ApplicationsPage.update('${app.id}','Rejected')">Reject</button>
                  ` : ''}
                  <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/property/${app.propertyId}')">View</button>
                </div>
              </div>`;
          }).join('')}
          ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No Applications</h3><p>No ${this.currentFilter === "All" ? "" : this.currentFilter.toLowerCase() + " "}applications found.</p></div>' : ''}
        </div>
      </div>`;
  },

  filterBy(status) {
    this.currentFilter = status;
    Router.refresh();
  },

  update(appId, status) {
    const app = APPLICATIONS_DATA.find(a => a.id === appId);
    if (app) {
      app.status = status;
      app.updatedAt = new Date().toISOString();

      // Notify tenant
      if (typeof NOTIFICATIONS_DATA !== 'undefined') {
        NOTIFICATIONS_DATA.unshift({
          id: 'n_app_' + appId + '_' + Date.now(),
          userId: app.tenantId,
          type: 'application',
          icon: status === 'Approved' ? '✅' : '❌',
          iconBg: status === 'Approved' ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)',
          title: 'Application ' + status,
          message: `Your rental application has been ${status.toLowerCase()}.`,
          link: '/applications',
          read: false,
          timestamp: new Date().toISOString()
        });
      }

      Toast.success('Application ' + status, 'Application has been ' + status.toLowerCase());
      Router.navigate('/applications');
    }
  }
};
