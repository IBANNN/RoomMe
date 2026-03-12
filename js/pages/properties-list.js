// Properties List Page
const PropertiesListPage = {
  viewMode: 'grid',
  filters: {
    search: '',
    priceMin: 0,
    priceMax: 50000,
    type: '',
    location: '',
    amenities: []
  },

  render() {
    const user = Auth.getCurrentUser();
    const isLoggedIn = !!user;
    const isLandlord = user && user.role === 'landlord';

    let properties;
    if (isLandlord) {
      // Landlords see all their own listings including full ones
      properties = PROPERTIES_DATA.filter(p => p.landlordId === user.id);
    } else {
      // Everyone else: hide fully-occupied listings
      properties = PROPERTIES_DATA.filter(p => p.availableSlots > 0 || isLoggedIn);
    }

    // Apply filters
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      properties = properties.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (isLoggedIn ? p.address.toLowerCase().includes(q) : '') ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }
    if (this.filters.type) {
      properties = properties.filter(p => p.type === this.filters.type);
    }
    if (this.filters.location) {
      properties = properties.filter(p => p.location === this.filters.location);
    }
    properties = properties.filter(p => p.price >= this.filters.priceMin && p.price <= this.filters.priceMax);

    const types = [...new Set(PROPERTIES_DATA.map(p => p.type))];
    const locations = [...new Set(PROPERTIES_DATA.map(p => p.location))];

    return `
      <div class="properties-page page-transition">
        <div class="properties-header">
          <div>
            <h1>${isLandlord ? 'My Property Listings' : 'Find Your Perfect Room'}</h1>
            <p style="color:var(--text-secondary);font-size:var(--font-sm);margin-top:var(--space-1)">${properties.length} properties found</p>
          </div>
          <div class="properties-header-actions">
            ${isLandlord ? '<button class="btn btn-primary" onclick="LandlordDashboard.showAddPropertyModal()">+ Add Listing</button>' : ''}
            <div class="view-toggle">
              <button class="view-toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}" onclick="PropertiesListPage.setView('grid')">▦</button>
              <button class="view-toggle-btn ${this.viewMode === 'list' ? 'active' : ''}" onclick="PropertiesListPage.setView('list')">☰</button>
            </div>
            <select class="form-select" style="width:160px" onchange="PropertiesListPage.sort(this.value)">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        ${!isLoggedIn ? `
          <div style="padding:var(--space-3) var(--space-4);background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);border-radius:var(--radius-lg);margin-bottom:var(--space-6);font-size:var(--font-sm);color:var(--text-secondary);display:flex;align-items:center;gap:var(--space-3)">
            🔒 <span>Log in to see full addresses, landlord contacts, and apply for rooms.</span>
            <button class="btn btn-primary btn-sm" onclick="Router.navigate('/login')">Log In</button>
          </div>
        ` : ''}

        <div class="properties-layout">
          <!-- Filters Sidebar -->
          <div class="properties-filters">
            <div class="glass-card" style="padding:var(--space-5)">
              <h3 style="font-size:var(--font-base);font-weight:700;margin-bottom:var(--space-5)">Filters</h3>

              <div class="filter-section">
                <div class="filter-section-title">Search</div>
                <input type="text" class="form-input" placeholder="Search properties..."
                  id="prop-search-input"
                  value="${this.filters.search}" oninput="PropertiesListPage.updateFilter('search', this.value)" />
              </div>

              <div class="filter-section">
                <div class="filter-section-title">Price Range</div>
                <div class="filter-range">
                  <input type="number" class="form-input" placeholder="Min" value="${this.filters.priceMin || ''}" style="width:48%"
                    oninput="PropertiesListPage.updateFilter('priceMin', parseInt(this.value)||0)" />
                  <span style="color:var(--text-muted)">—</span>
                  <input type="number" class="form-input" placeholder="Max" value="${this.filters.priceMax === 50000 ? '' : this.filters.priceMax}" style="width:48%"
                    oninput="PropertiesListPage.updateFilter('priceMax', parseInt(this.value)||50000)" />
                </div>
              </div>

              <div class="filter-section">
                <div class="filter-section-title">Room Type</div>
                <div class="filter-chips">
                  <span class="filter-chip ${this.filters.type === '' ? 'active' : ''}" onclick="PropertiesListPage.updateFilter('type', '')">All</span>
                  ${types.map(t => `
                    <span class="filter-chip ${this.filters.type === t ? 'active' : ''}" onclick="PropertiesListPage.updateFilter('type', '${t}')">${t}</span>
                  `).join('')}
                </div>
              </div>

              <div class="filter-section">
                <div class="filter-section-title">Location</div>
                <div class="filter-chips">
                  <span class="filter-chip ${this.filters.location === '' ? 'active' : ''}" onclick="PropertiesListPage.updateFilter('location', '')">All</span>
                  ${locations.map(l => `
                    <span class="filter-chip ${this.filters.location === l ? 'active' : ''}" onclick="PropertiesListPage.updateFilter('location', '${l}')">${l}</span>
                  `).join('')}
                </div>
              </div>

              <button class="btn btn-secondary w-full" onclick="PropertiesListPage.clearFilters()">Clear All Filters</button>
            </div>
          </div>

          <!-- Results -->
          <div class="properties-results">
              <div class="${this.viewMode === 'grid' ? 'properties-grid' : 'properties-list-view'}" id="properties-results-grid">
                ${properties.map((p, i) => this.renderPropertyCard(p, i, isLoggedIn)).join('')}
                ${properties.length === 0 ? `
                  <div class="empty-state">
                    <div class="empty-state-icon">🏠</div>
                    <h3>No Properties Found</h3>
                    <p>Try adjusting your filters to see more results.</p>
                  </div>
                ` : ''}
              </div>
          </div>
        </div>
      </div>
    `;
  },

  renderPropertyCard(p, i, isLoggedIn) {
    const isFav = typeof FavoritesPage !== 'undefined' && FavoritesPage.isFavorite(p.id);
    const isFull = p.availableSlots === 0;
    const photo = p.photos && p.photos.length > 0 ? p.photos[0] : null;

    return `
      <div class="property-card animate-fade-in-up stagger-${(i % 6) + 1}" onclick="Router.navigate('/property/${p.id}')">
        <div class="property-card-image" style="${photo ? `background-image:url('${photo}');background-size:cover;background-position:center;` : ''}">
          ${!photo ? '<div class="property-card-image-placeholder">🏠</div>' : ''}
          <div class="property-card-badges">
            ${p.verified ? '<span class="badge badge-primary">✓ Verified</span>' : ''}
            ${isFull ? '<span class="badge badge-coral">Full</span>' : '<span class="badge badge-sky">Available</span>'}
          </div>
          ${isLoggedIn ? `
            <button class="property-card-favorite ${isFav ? 'favorited' : ''}"
              data-fav="${p.id}"
              onclick="event.stopPropagation(); FavoritesPage.toggle('${p.id}'); this.textContent = FavoritesPage.isFavorite('${p.id}') ? '❤️' : '♡'; this.classList.toggle('favorited', FavoritesPage.isFavorite('${p.id}'))">${isFav ? '❤️' : '♡'}</button>
          ` : `
            <button class="property-card-favorite"
              onclick="event.stopPropagation(); Toast.info('Login Required', 'Please log in to save favorites'); Router.navigate('/login')">♡</button>
          `}
        </div>
        <div class="property-card-body">
          <div class="property-card-price">₱${p.price.toLocaleString()} <span>/month</span></div>
          <div class="property-card-title">${p.title}</div>
          <div class="property-card-location">📍 ${isLoggedIn ? p.address : (p.location + ' (Login to see full address)')}</div>
          <div class="property-card-features">
            <span class="property-card-feature">🛏️ ${p.type}</span>
            <span class="property-card-feature">👤 ${p.capacity} ${p.capacity > 1 ? 'pax' : 'person'}</span>
            <span class="property-card-feature">⭐ ${p.rating}</span>
          </div>
          ${!isLoggedIn ? `<div style="margin-top:var(--space-2);font-size:var(--font-xs);color:var(--text-muted);padding:4px 8px;background:rgba(0,0,0,0.05);border-radius:var(--radius-sm)">🔒 Log in to view landlord & contact info</div>` : ''}
        </div>
      </div>
    `;
  },

  setView(mode) {
    this.viewMode = mode;
    Router.refresh();
  },

  updateFilter(key, value) {
    this.filters[key] = value;
    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => this.updateResults(), 250);
  },

  updateResults() {
    const user = Auth.getCurrentUser();
    const isLoggedIn = !!user;
    const isLandlord = user && user.role === 'landlord';

    let properties;
    if (isLandlord) {
      properties = PROPERTIES_DATA.filter(p => p.landlordId === user.id);
    } else {
      properties = PROPERTIES_DATA.filter(p => p.availableSlots > 0 || isLoggedIn);
    }
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      properties = properties.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        p.type.toLowerCase().includes(q)
      );
    }
    if (this.filters.type) properties = properties.filter(p => p.type === this.filters.type);
    if (this.filters.location) properties = properties.filter(p => p.location === this.filters.location);
    properties = properties.filter(p => p.price >= this.filters.priceMin && p.price <= this.filters.priceMax);

    const grid = document.getElementById('properties-results-grid');
    if (!grid) { Router.refresh(); return; }
    grid.innerHTML = properties.map((p, i) => this.renderPropertyCard(p, i, isLoggedIn)).join('') ||
      '<div class="empty-state"><div class="empty-state-icon">🏠</div><h3>No Properties Found</h3><p>Try adjusting your filters.</p></div>';
    // Update count label
    const countEl = document.querySelector('.properties-header p');
    if (countEl) countEl.textContent = `${properties.length} properties found`;
  },

  clearFilters() {
    this.filters = { search: '', priceMin: 0, priceMax: 50000, type: '', location: '', amenities: [] };
    Router.refresh();
  },

  sort(method) {
    Toast.info('Sorted', `Properties sorted by ${method}`);
    Router.refresh();
  }
};
