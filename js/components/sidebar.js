// Dashboard Sidebar Component
const Sidebar = {
  render(containerId, role) {
    const user = Auth.getCurrentUser();
    if (!user) return '';

    const items = this.getItems(role);
    const currentHash = location.hash;

    return `
      <aside class="dashboard-sidebar" id="dashboard-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-user">
            <div class="sidebar-user-avatar" style="${user.photo ? `background-image:url('${user.photo}');background-size:cover;background-position:center;font-size:0;` : ''}">${!user.photo ? user.avatar : ''}</div>
            <div>
              <div class="sidebar-user-name">${user.fullName}</div>
              <div class="sidebar-user-role">${role.charAt(0).toUpperCase() + role.slice(1)}</div>
            </div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${items.map(section => `
            <div class="sidebar-nav-section">
              <div class="sidebar-nav-label">${section.label}</div>
              ${section.items.map(item => `
                <div class="sidebar-nav-item ${currentHash === '#' + item.route ? 'active' : ''}"
                     onclick="Router.navigate('${item.route}')">
                  <span class="sidebar-nav-item-icon">${item.icon}</span>
                  ${item.label}
                  ${item.badge ? `<span class="sidebar-nav-item-badge">${item.badge}</span>` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </nav>
      </aside>
    `;
  },

  getItems(role) {
    const user = Auth.getCurrentUser();
    const userId = user ? user.id : null;

    if (role === 'tenant') {
      const pendingApps = APPLICATIONS_DATA.filter(a => a.tenantId === userId && a.status === 'Pending').length;
      const pendingMaint = MAINTENANCE_DATA.filter(m => m.tenantId === userId && m.status !== 'Completed').length;
      const favCount = typeof FavoritesPage !== 'undefined' ? FavoritesPage.getUserFavorites().length : 0;
      return [
        {
          label: 'Overview',
          items: [
            { icon: '📊', label: 'Dashboard', route: '/dashboard' },
            { icon: '🔍', label: 'Browse Properties', route: '/properties' },
            { icon: '👥', label: 'Roommate Match', route: '/roommates' },
            { icon: '❤️', label: 'Favorites', route: '/favorites', badge: favCount > 0 ? favCount : null },
          ]
        },
        {
          label: 'Management',
          items: [
            { icon: '📋', label: 'My Applications', route: '/applications', badge: pendingApps || null },
            { icon: '🔧', label: 'Maintenance', route: '/maintenance', badge: pendingMaint || null },
            { icon: '💳', label: 'Payments', route: '/payments' },
          ]
        },
        {
          label: 'Communication',
          items: [
            { icon: '💬', label: 'Messages', route: '/messages' },
            { icon: '👤', label: 'My Profile', route: '/profile' },
          ]
        }
      ];
    } else if (role === 'landlord') {
      const pendingApps = APPLICATIONS_DATA.filter(a => a.landlordId === userId && a.status === 'Pending').length;
      const pendingMaint = MAINTENANCE_DATA.filter(m => {
        const prop = PROPERTIES_DATA.find(p => p.id === m.propertyId);
        return prop && prop.landlordId === userId && m.status === 'Pending';
      }).length;
      const pendingPayments = PAYMENTS_DATA.filter(p => p.landlordId === userId && p.status === 'Pending Verification').length;
      return [
        {
          label: 'Overview',
          items: [
            { icon: '📊', label: 'Dashboard', route: '/dashboard' },
            { icon: '🏠', label: 'My Listings', route: '/properties' },
          ]
        },
        {
          label: 'Management',
          items: [
            { icon: '📋', label: 'Applications', route: '/applications', badge: pendingApps || null },
            { icon: '🔧', label: 'Maintenance', route: '/maintenance', badge: pendingMaint || null },
            { icon: '💳', label: 'Payments', route: '/payments', badge: pendingPayments || null },
          ]
        },
        {
          label: 'Communication',
          items: [
            { icon: '💬', label: 'Messages', route: '/messages' },
            { icon: '👤', label: 'My Profile', route: '/profile' },
          ]
        }
      ];
    } else if (role === 'admin') {
      const pendingVerifications = USERS_DATA.filter(u => !u.verified && u.role !== 'admin').length;
      const pendingPayments = PAYMENTS_DATA.filter(p => p.status === 'Pending Verification').length;
      return [
        {
          label: 'Overview',
          items: [
            { icon: '📊', label: 'Dashboard', route: '/dashboard' },
            { icon: '👥', label: 'User Management', route: '/admin/users' },
          ]
        },
        {
          label: 'Moderation',
          items: [
            { icon: '🏠', label: 'Listings', route: '/properties' },
            { icon: '🛡️', label: 'Verification Queue', route: '/admin/verification', badge: pendingVerifications || null },
            { icon: '💳', label: 'Payment Monitor', route: '/payments', badge: pendingPayments || null },
          ]
        },
        {
          label: 'System',
          items: [
            { icon: '💬', label: 'Messages', route: '/messages' },
            { icon: '📈', label: 'Reports', route: '/admin/reports' },
          ]
        }
      ];
    }
    return [];
  }
};
