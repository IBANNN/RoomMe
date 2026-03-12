// Property Detail Page
const PropertyDetailPage = {
  render(propertyId) {
    const p = PROPERTIES_DATA.find(pr => pr.id === propertyId);
    if (!p) return '<div class="properties-page"><h2>Property not found</h2></div>';

    const landlord = USERS_DATA.find(u => u.id === p.landlordId);
    const user = Auth.getCurrentUser();
    const similar = PROPERTIES_DATA.filter(pr => pr.id !== p.id && pr.location === p.location).slice(0, 3);

    return `
      <div class="property-detail page-transition">
        <div class="property-detail-back" onclick="Router.navigate('/properties')">
          ← Back to listings
        </div>

        <!-- Gallery -->
        <div class="property-detail-gallery" id="prop-gallery">
          <div class="property-detail-gallery-main" id="gallery-main"
            style="${p.photos && p.photos.length > 0 ? `background-image:url('${p.photos[0]}');background-size:cover;background-position:center;` : ''}">
            ${!p.photos || p.photos.length === 0 ? '🏠' : ''}
          </div>
          <div class="property-detail-gallery-side">
            ${p.photos && p.photos.length > 1 ? `
              <div style="background-image:url('${p.photos[1]}');background-size:cover;background-position:center;border-radius:var(--radius-md);cursor:pointer;overflow:hidden"
                onclick="document.getElementById('gallery-main').style.backgroundImage='url(\'${p.photos[1]}\')'">${''}</div>
            ` : '<div style="background:var(--bg-glass);border-radius:var(--radius-md)"></div>'}
            ${p.photos && p.photos.length > 2 ? `
              <div style="background-image:url('${p.photos[2]}');background-size:cover;background-position:center;border-radius:var(--radius-md);cursor:pointer;overflow:hidden;position:relative"
                onclick="document.getElementById('gallery-main').style.backgroundImage='url(\'${p.photos[2]}'\')'">
                <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:var(--font-sm);font-weight:600">
                  +${p.photos.length - 2} more
                </div>
              </div>
            ` : '<div style="background:var(--bg-glass);border-radius:var(--radius-md)"></div>'}
          </div>
        </div>

        <div class="property-detail-content">
          <!-- Main Info -->
          <div class="property-detail-info">
            <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3)">
              ${p.verified ? '<span class="badge badge-primary">✓ Verified</span>' : '<span class="badge badge-amber">Unverified</span>'}
              <span class="badge badge-sky">${p.type}</span>
              ${p.genderPreference !== 'Any' ? `<span class="badge badge-secondary">${p.genderPreference} Only</span>` : ''}
            </div>
            <h1>${p.title}</h1>
            <div class="property-detail-location">📍 ${p.address}</div>

            <div class="property-detail-meta">
              <div class="property-detail-meta-item">
                <div class="property-detail-meta-value">₱${p.price.toLocaleString()}</div>
                <div class="property-detail-meta-label">Monthly Rent</div>
              </div>
              <div class="property-detail-meta-item">
                <div class="property-detail-meta-value">${p.capacity}</div>
                <div class="property-detail-meta-label">Max Capacity</div>
              </div>
              <div class="property-detail-meta-item">
                <div class="property-detail-meta-value">${p.availableSlots}</div>
                <div class="property-detail-meta-label">Available Slots</div>
              </div>
              <div class="property-detail-meta-item">
                <div class="property-detail-meta-value">⭐ ${p.rating}</div>
                <div class="property-detail-meta-label">${p.reviews} Reviews</div>
              </div>
              <div class="property-detail-meta-item">
                <div class="property-detail-meta-value">${p.distanceFromUni}</div>
                <div class="property-detail-meta-label">From University</div>
              </div>
            </div>

            <div class="property-detail-section">
              <h3>Description</h3>
              <p>${p.description}</p>
            </div>

            <div class="property-detail-section">
              <h3>Amenities</h3>
              <div class="amenities-grid">
                ${p.amenities.map(a => `
                  <div class="amenity-item">
                    <span>${this.getAmenityIcon(a)}</span>
                    <span>${a}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="property-detail-section">
              <h3>House Rules</h3>
              <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--space-2)">
                ${p.rules.map(r => `<li style="font-size:var(--font-sm);color:var(--text-secondary)">📌 ${r}</li>`).join('')}
              </ul>
            </div>

            ${similar.length > 0 ? `
              <div class="property-detail-section">
                <h3>Similar Properties Nearby</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-4)">
                  ${similar.map(s => `
                    <div style="border-radius:var(--radius-lg);overflow:hidden;cursor:pointer;border:1px solid var(--border-color);background:var(--bg-card)" onclick="Router.navigate('/property/${s.id}')">
                      <div style="height:120px;${s.photos && s.photos[0] ? `background-image:url('${s.photos[0]}');background-size:cover;background-position:center;` : 'background:var(--bg-glass);display:flex;align-items:center;justify-content:center;font-size:2rem'}">
                        ${!s.photos || !s.photos[0] ? '🏠' : ''}
                      </div>
                      <div style="padding:var(--space-3)">
                        <div style="font-size:var(--font-sm);font-weight:600">${s.title}</div>
                        <div style="color:var(--accent-primary);font-weight:700;margin-top:var(--space-1)">₱${s.price.toLocaleString()}/mo</div>
                        <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:2px">⭐ ${s.rating} • ${s.type}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Sidebar -->
          <div class="property-detail-sidebar">
            <div class="apply-card">
              <div class="apply-card-price">₱${p.price.toLocaleString()} <span>/month</span></div>
              <div class="apply-card-details">
                <div class="apply-card-detail">
                  <span class="apply-card-detail-label">Room Type</span>
                  <span class="apply-card-detail-value">${p.type}</span>
                </div>
                <div class="apply-card-detail">
                  <span class="apply-card-detail-label">Available Slots</span>
                  <span class="apply-card-detail-value">${p.availableSlots} of ${p.capacity}</span>
                </div>
                <div class="apply-card-detail">
                  <span class="apply-card-detail-label">Distance</span>
                  <span class="apply-card-detail-value">${p.distanceFromUni}</span>
                </div>
                <div class="apply-card-detail">
                  <span class="apply-card-detail-label">Gender Pref.</span>
                  <span class="apply-card-detail-value">${p.genderPreference}</span>
                </div>
              </div>
              ${user && user.role === 'tenant' ? `
                <button class="btn btn-primary btn-lg w-full" onclick="PropertyDetailPage.apply('${p.id}')">Apply Now</button>
                <button class="btn btn-secondary btn-lg w-full" style="margin-top:var(--space-3)" onclick="Router.navigate('/messages')">Message Landlord</button>
              ` : !user ? `
                <button class="btn btn-primary btn-lg w-full" onclick="Router.navigate('/login')">Log In to Apply</button>
              ` : ''}
            </div>

            ${landlord ? `
              <div class="landlord-card">
                <div class="landlord-avatar">${landlord.avatar}</div>
                <div class="landlord-info">
                  <h4>${landlord.fullName} ${landlord.verificationBadge ? '✓' : ''}</h4>
                  <p>Property Owner • ${PROPERTIES_DATA.filter(pr => pr.landlordId === landlord.id).length} listings</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  getAmenityIcon(amenity) {
    const icons = {
      'WiFi': '📶', 'Air Conditioning': '❄️', 'Private Bathroom': '🚿', 'Kitchen': '🍳',
      'Laundry': '👕', 'Study Desk': '📚', 'CCTV': '📹', 'Pool': '🏊', 'Gym': '💪',
      'Parking': '🅿️', '24/7 Security': '🔒', 'Elevator': '🛗', 'Balcony': '🌅',
      'Shared Bathroom': '🚿', 'Common Kitchen': '🍳', 'Shared Kitchen': '🍳',
      'Common Area': '🛋️', 'Water Dispenser': '💧', 'Individual Locker': '🔐',
      'Wardrobe': '👔', 'Cleaning Service': '🧹', 'Concierge': '🛎️', 'Washer/Dryer': '👕',
      'Function Room': '🎤', 'Smart Home': '🏠', 'Spa': '💆', 'Garden': '🌿',
      'Study Area': '📖', 'Rooftop Access': '🌆', 'Study Room': '📖',
      'Rooftop Garden': '🌱', 'Solar Power': '☀️', 'Bike Parking': '🚲', 'Study Nook': '📚'
    };
    return icons[amenity] || '✓';
  },

  apply(propertyId) {
    const user = Auth.getCurrentUser();
    if (!user) { Router.navigate('/login'); return; }

    const existing = APPLICATIONS_DATA.find(a => a.tenantId === user.id && a.propertyId === propertyId);
    if (existing) {
      Toast.warning('Already Applied', 'You have already applied for this property');
      return;
    }

    Modal.show('Apply for this Property', `
      <form onsubmit="PropertyDetailPage.submitApplication(event, '${propertyId}')" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-group">
          <label class="form-label">Message to Landlord</label>
          <textarea class="form-textarea" id="apply-message" placeholder="Introduce yourself and explain why you're a good tenant..." required></textarea>
        </div>
        <div style="padding:0.75rem;background:rgba(0,212,170,0.05);border:1px solid rgba(0,212,170,0.1);border-radius:var(--radius-md);font-size:var(--font-sm);color:var(--text-secondary)">
          ℹ️ Your profile information (name, university, year level) will be shared with the landlord.
        </div>
        <button type="submit" class="btn btn-primary w-full">Submit Application</button>
      </form>
    `);
  },

  submitApplication(e, propertyId) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const property = PROPERTIES_DATA.find(p => p.id === propertyId);

    const newApp = {
      id: 'app' + (APPLICATIONS_DATA.length + 1),
      tenantId: user.id,
      propertyId: propertyId,
      landlordId: property.landlordId,
      status: 'Pending',
      message: document.getElementById('apply-message').value,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    APPLICATIONS_DATA.push(newApp);
    Modal.close();
    Toast.success('Application Submitted!', 'The landlord will review your application');
  }
};
