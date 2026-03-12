// Hash-based SPA Router
const Router = {
  routes: {},

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  refresh() {
    this.resolve();
  },

  async resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const content = document.getElementById('page-content');

    let html = '';
    let pageObj = null;

    // Sync live data for ALL authenticated users before rendering ANY page
    if (Auth.isAuthenticated()) {
      try {
        const [liveUsers, liveProperties, livePayments] = await Promise.all([
          API.get('/users'),
          API.get('/properties'),
          API.get('/payments')
        ]);
        
        if (Array.isArray(liveUsers)) USERS_DATA = liveUsers;
        if (Array.isArray(liveProperties)) PROPERTIES_DATA = liveProperties;
        if (Array.isArray(livePayments)) PAYMENTS_DATA = livePayments;
        
      } catch (e) {
        console.error('Failed to sync live data:', e.message);
      }
    }

    if (hash === '/' || hash === '') {
      if (Auth.isAuthenticated()) {
        html = await this.getDashboard();
      } else {
        Navbar.render();
        html = LandingPage.render();
        content.innerHTML = html;
        LandingPage.afterRender();
        return;
      }
    } else if (hash === '/login') {
      html = LoginPage.render();
      pageObj = LoginPage;
    } else if (hash === '/register') {
      html = RegisterPage.render();
    } else if (hash === '/verify-email') {
      html = VerifyEmailPage.render();
    } else if (hash === '/dashboard') {
      html = await this.getDashboard();
    } else if (hash === '/properties') {
      html = PropertiesListPage.render();
    } else if (hash.startsWith('/property/')) {
      const id = hash.split('/property/')[1];
      html = PropertyDetailPage.render(id);
      content.innerHTML = html;
      Navbar.render();
      if (PropertyDetailPage.afterRender) PropertyDetailPage.afterRender(id);
      window.scrollTo(0, 0);
      return;
    } else if (hash === '/roommates') {
      html = RoommatesPage.render();
    } else if (hash === '/maintenance') {
      html = MaintenancePage.render();
    } else if (hash === '/payments') {
      html = PaymentsPage.render();
    } else if (hash === '/messages') {
      html = MessagesPage.render();
      content.innerHTML = html;
      Navbar.render();
      if (MessagesPage.afterRender) MessagesPage.afterRender();
      window.scrollTo(0, 0);
      return;
    } else if (hash === '/profile') {
      html = ProfilePage.render();
      pageObj = ProfilePage;
    } else if (hash === '/applications') {
      html = ApplicationsPage.render();
    } else if (hash === '/favorites') {
      html = FavoritesPage.render();
    } else if (hash === '/admin/users' || hash === '/admin/verification' || hash === '/admin/reports') {
      html = await AdminDashboard.render();
    } else {
      html = `<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>404</h2><p style="color:var(--text-secondary);margin:var(--space-4) 0">Page not found</p><button class="btn btn-primary" onclick="Router.navigate('/')">Go Home</button></div></div>`;
    }

    content.innerHTML = html;
    window.scrollTo(0, 0);

    // Now that async page data is loaded, safely re-render navbar/sidebar if needed
    Navbar.render();

    // Call afterRender if the page or dashboard object has it
    if (pageObj && pageObj.afterRender) pageObj.afterRender();
  },

  async getDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) {
      this.navigate('/login');
      return '';
    }
    if (user.role === 'tenant') return StudentDashboard.render();
    if (user.role === 'landlord') return LandlordDashboard.render();
    if (user.role === 'admin') return await AdminDashboard.render();
    return '';
  }
};
