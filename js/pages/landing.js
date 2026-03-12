// Landing Page
const LandingPage = {
  render() {
    return `
      <div class="page-transition">
        <!-- Hero Section -->
        <section class="landing-hero">
          <div class="hero-content">
            <div class="hero-badge animate-fade-in-up stagger-1">
              ✨ The #1 Student Housing Platform
            </div>
            <h1 class="hero-title animate-fade-in-up stagger-2">
              Find Your Perfect<br><span class="gradient-text">Home Away From Home</span>
            </h1>
            <p class="hero-subtitle animate-fade-in-up stagger-3">
              RoomMe connects students with verified landlords, matches compatible roommates, 
              and simplifies every aspect of rental management — from search to payment.
            </p>
            <div class="hero-search animate-fade-in-up stagger-4">
              <input type="text" placeholder="Search by location, university, or property type..." id="hero-search-input" />
              <button class="btn btn-primary" onclick="LandingPage.handleSearch()">Search</button>
            </div>
            <div class="hero-actions animate-fade-in-up stagger-5">
              <button class="btn btn-primary btn-lg" onclick="Router.navigate('/register')">Get Started Free</button>
              <button class="btn btn-secondary btn-lg" onclick="Router.navigate('/properties')">Browse Properties</button>
            </div>
            <div class="hero-stats animate-fade-in-up stagger-6">
              <div class="hero-stat">
                <div class="hero-stat-number" data-count="2500">0</div>
                <div class="hero-stat-label">Active Listings</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-number" data-count="8400">0</div>
                <div class="hero-stat-label">Happy Students</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-number" data-count="650">0</div>
                <div class="hero-stat-label">Verified Landlords</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-number" data-count="98">0</div>
                <div class="hero-stat-label">% Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="landing-features">
          <div class="section-header">
            <span class="section-label">Features</span>
            <h2 class="section-title">Everything You Need</h2>
            <p class="section-description">
              RoomMe provides a complete rental management experience designed specifically for university students.
            </p>
          </div>
          <div class="features-grid">
            <div class="feature-card animate-fade-in-up stagger-1">
              <div class="feature-icon">🔍</div>
              <h3 class="feature-title">Smart Search</h3>
              <p class="feature-desc">Find properties near your university with advanced filters for price, amenities, room type, and distance.</p>
            </div>
            <div class="feature-card animate-fade-in-up stagger-2">
              <div class="feature-icon">👥</div>
              <h3 class="feature-title">Roommate Matching</h3>
              <p class="feature-desc">Our algorithm matches you with compatible roommates based on lifestyle, study habits, and preferences.</p>
            </div>
            <div class="feature-card animate-fade-in-up stagger-3">
              <div class="feature-icon">💳</div>
              <h3 class="feature-title">Easy Payments</h3>
              <p class="feature-desc">Pay rent digitally, track billing history, and receive automatic reminders before due dates.</p>
            </div>
            <div class="feature-card animate-fade-in-up stagger-4">
              <div class="feature-icon">🔧</div>
              <h3 class="feature-title">Maintenance Tracking</h3>
              <p class="feature-desc">Submit maintenance requests with photos and track repairs in real-time from submission to resolution.</p>
            </div>
            <div class="feature-card animate-fade-in-up stagger-5">
              <div class="feature-icon">🛡️</div>
              <h3 class="feature-title">Verified & Safe</h3>
              <p class="feature-desc">All landlords are identity-verified and properties are reviewed by admins to ensure your safety.</p>
            </div>
            <div class="feature-card animate-fade-in-up stagger-6">
              <div class="feature-icon">💬</div>
              <h3 class="feature-title">Instant Messaging</h3>
              <p class="feature-desc">Communicate directly with landlords and roommates through our built-in messaging system.</p>
            </div>
          </div>
        </section>

        <!-- Testimonials Section -->
        <section class="landing-testimonials">
          <div class="section-header">
            <span class="section-label">Testimonials</span>
            <h2 class="section-title">Loved by Students</h2>
            <p class="section-description">
              See what students and landlords are saying about their RoomMe experience.
            </p>
          </div>
          <div class="testimonials-grid">
            <div class="testimonial-card animate-fade-in-up stagger-1">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"RoomMe made finding an apartment near campus so easy. I found my place in just two days and the roommate matching feature connected me with an amazing housemate!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" style="background: var(--gradient-primary)">AS</div>
                <div>
                  <div class="testimonial-name">Ana Santos</div>
                  <div class="testimonial-role">UP Diliman, 2nd Year</div>
                </div>
              </div>
            </div>
            <div class="testimonial-card animate-fade-in-up stagger-2">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"As a landlord, managing my properties has never been this efficient. Applications, payments, maintenance — everything is in one place. Highly recommended!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" style="background: var(--gradient-lavender)">RL</div>
                <div>
                  <div class="testimonial-name">Ricardo Lim</div>
                  <div class="testimonial-role">Property Owner, Quezon City</div>
                </div>
              </div>
            </div>
            <div class="testimonial-card animate-fade-in-up stagger-3">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"The verification system gives me peace of mind. Knowing that landlords are verified and the admin team actively monitors listings makes me feel safe."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" style="background: var(--gradient-coral)">KC</div>
                <div>
                  <div class="testimonial-name">Kim Cruz</div>
                  <div class="testimonial-role">DLSU, 3rd Year</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="landing-cta">
          <div class="glow-orb glow-orb-teal" style="width:400px;height:400px;top:-100px;left:50%;transform:translateX(-50%)"></div>
          <div class="cta-content">
            <h2 class="cta-title">Ready to Find Your <span class="gradient-text">Perfect Room</span>?</h2>
            <p class="cta-desc">Join thousands of students who've already found their ideal living situation through RoomMe.</p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" onclick="Router.navigate('/register')">Create Free Account</button>
              <button class="btn btn-secondary btn-lg" onclick="Router.navigate('/properties')">Explore Listings</button>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="landing-footer">
          <div class="footer-grid">
            <div>
              <div class="navbar-brand" style="margin-bottom:0;cursor:default">
                <div class="navbar-brand-icon">🏠</div>
                <span>RoomMe</span>
              </div>
              <p class="footer-brand-desc">The smart rental management platform connecting students with their perfect home near campus.</p>
            </div>
            <div>
              <h4 class="footer-heading">Platform</h4>
              <div class="footer-links">
                <span class="footer-link" onclick="Router.navigate('/properties')">Browse Properties</span>
                <span class="footer-link" onclick="Router.navigate('/register')">List a Property</span>
                <span class="footer-link" onclick="Router.navigate('/register')">Find Roommates</span>
                <span class="footer-link">Pricing</span>
              </div>
            </div>
            <div>
              <h4 class="footer-heading">Company</h4>
              <div class="footer-links">
                <span class="footer-link">About Us</span>
                <span class="footer-link">Careers</span>
                <span class="footer-link">Blog</span>
                <span class="footer-link">Contact</span>
              </div>
            </div>
            <div>
              <h4 class="footer-heading">Support</h4>
              <div class="footer-links">
                <span class="footer-link">Help Center</span>
                <span class="footer-link">Safety Guide</span>
                <span class="footer-link">Terms of Service</span>
                <span class="footer-link">Privacy Policy</span>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            &copy; 2026 RoomMe. All rights reserved. Built with ❤️ for students.
          </div>
        </footer>
      </div>
    `;
  },

  handleSearch() {
    const input = document.getElementById('hero-search-input');
    if (input && input.value.trim()) {
      Router.navigate('/properties?search=' + encodeURIComponent(input.value.trim()));
    } else {
      Router.navigate('/properties');
    }
  },

  afterRender() {
    // Animate stat counters
    document.querySelectorAll('.hero-stat-number[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + (el.dataset.count === '98' ? '%' : '+');
        if (progress < 1) requestAnimationFrame(animate);
      };
      setTimeout(animate, 800);
    });
  }
};
