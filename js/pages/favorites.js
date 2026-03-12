// Favorites Page
const FavoritesPage = {
  // Toggle favorite status for a property
  toggle(propertyId) {
    const user = Auth.getCurrentUser();
    if (!user) {
      Toast.info('Login Required', 'Please log in to save favorites');
      Router.navigate('/login');
      return;
    }
    const idx = FAVORITES_DATA.findIndex(f => f.userId === user.id && f.propertyId === propertyId);
    if (idx > -1) {
      FAVORITES_DATA.splice(idx, 1);
      Toast.info('Removed', 'Property removed from favorites');
    } else {
      FAVORITES_DATA.push({ userId: user.id, propertyId });
      Toast.success('Saved! ❤️', 'Property added to your favorites');
    }
    // Update any visible heart buttons
    const btn = document.querySelector(`[data-fav="${propertyId}"]`);
    if (btn) {
      btn.textContent = FavoritesPage.isFavorite(propertyId) ? '❤️' : '♡';
      btn.classList.toggle('favorited', FavoritesPage.isFavorite(propertyId));
    }
  },

  isFavorite(propertyId) {
    const user = Auth.getCurrentUser();
    if (!user) return false;
    return FAVORITES_DATA.some(f => f.userId === user.id && f.propertyId === propertyId);
  },

  getUserFavorites() {
    const user = Auth.getCurrentUser();
    if (!user) return [];
    return FAVORITES_DATA
      .filter(f => f.userId === user.id)
      .map(f => PROPERTIES_DATA.find(p => p.id === f.propertyId))
      .filter(Boolean);
  },

  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '<div class="auth-page"><div class="auth-card" style="text-align:center"><h2>Please Log In</h2><button class="btn btn-primary" onclick="Router.navigate(\'/login\')">Login</button></div></div>';

    const favorites = this.getUserFavorites();

    return `
      <div class="page-transition" style="max-width:1200px;margin:0 auto;padding:var(--space-8) var(--space-6)">
        <div class="dashboard-page-header">
          <div>
            <h1 class="dashboard-page-title">❤️ My Favorites</h1>
            <p class="dashboard-page-subtitle">${favorites.length} saved properties</p>
          </div>
          <button class="btn btn-secondary" onclick="Router.navigate('/properties')">Browse More</button>
        </div>

        ${favorites.length === 0 ? `
          <div class="empty-state" style="margin-top:var(--space-12)">
            <div class="empty-state-icon">♡</div>
            <h3>No Saved Properties Yet</h3>
            <p>Browse properties and tap the heart icon to save them here.</p>
            <button class="btn btn-primary" onclick="Router.navigate('/properties')">Browse Properties</button>
          </div>
        ` : `
          <div class="properties-grid" style="margin-top:var(--space-6)">
            ${favorites.map((p, i) => `
              <div class="property-card animate-fade-in-up stagger-${(i % 6) + 1}" onclick="Router.navigate('/property/${p.id}')">
                <div class="property-card-image" style="${p.photos && p.photos[0] ? `background-image:url('${p.photos[0]}');background-size:cover;background-position:center;` : ''}">
                  ${!p.photos || !p.photos[0] ? '<div class="property-card-image-placeholder">🏠</div>' : ''}
                  <div class="property-card-badges">
                    ${p.verified ? '<span class="badge badge-primary">✓ Verified</span>' : ''}
                    ${p.availableSlots > 0 ? '<span class="badge badge-sky">Available</span>' : '<span class="badge badge-coral">Full</span>'}
                  </div>
                  <button class="property-card-favorite favorited" 
                    data-fav="${p.id}"
                    onclick="event.stopPropagation(); FavoritesPage.toggle('${p.id}'); this.textContent = FavoritesPage.isFavorite('${p.id}') ? '❤️' : '♡'; this.classList.toggle('favorited', FavoritesPage.isFavorite('${p.id}'))">❤️</button>
                </div>
                <div class="property-card-body">
                  <div class="property-card-price">₱${p.price.toLocaleString()} <span>/month</span></div>
                  <div class="property-card-title">${p.title}</div>
                  <div class="property-card-location">📍 ${p.location}</div>
                  <div class="property-card-features">
                    <span class="property-card-feature">🛏️ ${p.type}</span>
                    <span class="property-card-feature">👤 ${p.capacity} ${p.capacity > 1 ? 'pax' : 'person'}</span>
                    <span class="property-card-feature">⭐ ${p.rating}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }
};
