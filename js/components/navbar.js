// Navbar Component
const Navbar = {
  render() {
    const container = document.getElementById('navbar-container');
    const user = Auth.getCurrentUser();
    const isLoggedIn = !!user;

    container.innerHTML = `
      <nav class="navbar" id="main-navbar">
        <div class="navbar-inner">
          <div class="navbar-brand" onclick="Router.navigate('/')">
            <div class="navbar-brand-icon">🏠</div>
            <span>RoomMe</span>
          </div>

          <div class="navbar-links" id="navbar-links">
            ${isLoggedIn ? this.getAuthLinks(user.role) : this.getPublicLinks()}
          </div>

          <div class="navbar-actions">
            ${isLoggedIn ? `
              <div class="relative">
                <button class="navbar-notification-btn" onclick="Navbar.toggleNotifications()" id="notification-btn">
                  🔔
                  ${this.getUnreadCount(user.id) > 0 ? '<span class="notification-dot"></span>' : ''}
                </button>
                <div class="notification-dropdown hidden" id="notification-dropdown">
                  ${this.renderNotifications(user.id)}
                </div>
              </div>
              <div class="relative">
                <div class="navbar-avatar" onclick="Navbar.toggleUserMenu()" id="user-avatar" style="${user.photo ? `background-image:url('${user.photo}');background-size:cover;background-position:center;font-size:0;` : ''}">
                  ${!user.photo ? user.avatar : ''}
                </div>
                <div class="navbar-user-menu hidden" id="user-menu">
                  <div class="navbar-user-menu-item" onclick="Router.navigate('/profile'); Navbar.closeMenus();">
                    👤 My Profile
                  </div>
                  <div class="navbar-user-menu-item" onclick="Router.navigate('/dashboard'); Navbar.closeMenus();">
                    📊 Dashboard
                  </div>
                  ${user.role === 'tenant' ? `
                  <div class="navbar-user-menu-item" onclick="Router.navigate('/favorites'); Navbar.closeMenus();">
                    ❤️ Favorites
                  </div>` : ''}
                  <div class="navbar-user-menu-divider"></div>
                  <div class="navbar-user-menu-item danger" onclick="Auth.logout()">
                    🚪 Sign Out
                  </div>
                </div>
              </div>
            ` : `
              <button class="btn btn-ghost" onclick="Router.navigate('/login')">Log In</button>
              <button class="btn btn-primary" onclick="Router.navigate('/register')">Sign Up</button>
            `}
            <button class="navbar-mobile-toggle" onclick="Navbar.toggleMobile()" id="mobile-toggle">☰</button>
          </div>
        </div>
      </nav>
    `;

    // Close menus on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#notification-btn') && !e.target.closest('#notification-dropdown')) {
        const dd = document.getElementById('notification-dropdown');
        if (dd) dd.classList.add('hidden');
      }
      if (!e.target.closest('#user-avatar') && !e.target.closest('#user-menu')) {
        const menu = document.getElementById('user-menu');
        if (menu) menu.classList.add('hidden');
      }
    });
  },

  getPublicLinks() {
    const currentHash = location.hash;
    return `
      <a class="navbar-link ${currentHash === '' || currentHash === '#/' ? 'active' : ''}" onclick="Router.navigate('/')">Home</a>
      <a class="navbar-link ${currentHash === '#/properties' ? 'active' : ''}" onclick="Router.navigate('/properties')">Properties</a>
      <a class="navbar-link" onclick="Router.navigate('/login')">For Students</a>
      <a class="navbar-link" onclick="Router.navigate('/login')">For Landlords</a>
    `;
  },

  getAuthLinks(role) {
    const h = location.hash;
    if (role === 'tenant') {
      return `
        <a class="navbar-link ${h === '#/dashboard' ? 'active' : ''}" onclick="Router.navigate('/dashboard')">Dashboard</a>
        <a class="navbar-link ${h === '#/properties' ? 'active' : ''}" onclick="Router.navigate('/properties')">Properties</a>
        <a class="navbar-link ${h === '#/roommates' ? 'active' : ''}" onclick="Router.navigate('/roommates')">Roommates</a>
        <a class="navbar-link ${h === '#/messages' ? 'active' : ''}" onclick="Router.navigate('/messages')">Messages</a>
        <a class="navbar-link ${h === '#/favorites' ? 'active' : ''}" onclick="Router.navigate('/favorites')">❤️ Favorites</a>
      `;
    } else if (role === 'landlord') {
      return `
        <a class="navbar-link ${h === '#/dashboard' ? 'active' : ''}" onclick="Router.navigate('/dashboard')">Dashboard</a>
        <a class="navbar-link ${h === '#/properties' ? 'active' : ''}" onclick="Router.navigate('/properties')">My Listings</a>
        <a class="navbar-link ${h === '#/applications' ? 'active' : ''}" onclick="Router.navigate('/applications')">Applications</a>
        <a class="navbar-link ${h === '#/messages' ? 'active' : ''}" onclick="Router.navigate('/messages')">Messages</a>
      `;
    } else if (role === 'admin') {
      return `
        <a class="navbar-link ${h === '#/dashboard' ? 'active' : ''}" onclick="Router.navigate('/dashboard')">Dashboard</a>
        <a class="navbar-link ${h === '#/properties' ? 'active' : ''}" onclick="Router.navigate('/properties')">Listings</a>
        <a class="navbar-link ${h === '#/messages' ? 'active' : ''}" onclick="Router.navigate('/messages')">Messages</a>
      `;
    }
    return '';
  },

  getUnreadCount(userId) {
    return NOTIFICATIONS_DATA.filter(n => n.userId === userId && !n.read).length;
  },

  renderNotifications(userId) {
    const notifs = NOTIFICATIONS_DATA.filter(n => n.userId === userId).slice(0, 6);
    return `
      <div class="notification-dropdown-header">
        <h4>Notifications</h4>
        <button class="btn btn-ghost btn-sm" onclick="Navbar.markAllRead()">Mark all read</button>
      </div>
      ${notifs.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="Navbar.openNotification('${n.id}', '${n.link || '/'}')" style="cursor:pointer">
          <div class="notification-item-icon" style="background: ${n.iconBg}">${n.icon}</div>
          <div class="notification-item-content">
            <div class="notification-item-text"><strong>${n.title}</strong> — ${n.message}</div>
            <div class="notification-item-time">${this.timeAgo(n.timestamp)}</div>
          </div>
        </div>
      `).join('')}
      ${notifs.length === 0 ? '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No notifications</div>' : ''}
    `;
  },

  openNotification(notifId, link) {
    // Mark as read
    const notif = NOTIFICATIONS_DATA.find(n => n.id === notifId);
    if (notif) notif.read = true;
    Navbar.closeMenus();
    Router.navigate(link);
  },

  toggleNotifications() {
    const dd = document.getElementById('notification-dropdown');
    const menu = document.getElementById('user-menu');
    if (menu) menu.classList.add('hidden');
    if (dd) dd.classList.toggle('hidden');
  },

  toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    const dd = document.getElementById('notification-dropdown');
    if (dd) dd.classList.add('hidden');
    if (menu) menu.classList.toggle('hidden');
  },

  toggleMobile() {
    const links = document.getElementById('navbar-links');
    if (links) links.classList.toggle('open');
  },

  closeMenus() {
    const menu = document.getElementById('user-menu');
    const dd = document.getElementById('notification-dropdown');
    const links = document.getElementById('navbar-links');
    if (menu) menu.classList.add('hidden');
    if (dd) dd.classList.add('hidden');
    if (links) links.classList.remove('open');
  },

  markAllRead() {
    const user = Auth.getCurrentUser();
    if (user) {
      NOTIFICATIONS_DATA.forEach(n => { if (n.userId === user.id) n.read = true; });
      Navbar.render();
      Toast.success('Done', 'All notifications marked as read');
    }
  },

  timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  }
};
