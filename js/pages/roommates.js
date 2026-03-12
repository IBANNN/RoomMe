// Roommate Matching Page
const RoommatesPage = {
  render() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'tenant') return '<div class="auth-page"><h2>Please log in as a student</h2></div>';

    const otherStudents = USERS_DATA.filter(u => u.role === 'tenant' && u.id !== user.id && u.lifestyle);

    const matches = otherStudents.map(s => ({
      ...s,
      compatibility: this.calculateCompatibility(user, s)
    })).sort((a, b) => b.compatibility - a.compatibility);

    return `
      <div class="roommates-page page-transition">
        <div class="dashboard-page-header">
          <div>
            <h1 class="dashboard-page-title">Find Your Ideal Roommate 👥</h1>
            <p class="dashboard-page-subtitle">Matched based on lifestyle, habits, and preferences</p>
          </div>
        </div>

        <!-- User's Preferences -->
        <div class="glass-card" style="margin-bottom:var(--space-8)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
            <h3 style="font-size:var(--font-base);font-weight:700">Your Lifestyle Preferences</h3>
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/profile')">✏️ Edit</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
            ${user.lifestyle ? Object.entries(user.lifestyle).map(([key, val]) => `
              <span class="badge badge-primary">${this.formatKey(key)}: <strong>${val}</strong></span>
            `).join('') : '<span class="badge badge-amber">Complete your profile to get better matches</span>'}
          </div>
        </div>

        <!-- Match Cards -->
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
          ${matches.map((m, i) => {
            const compatColor = m.compatibility >= 75 ? 'var(--accent-primary)' : m.compatibility >= 50 ? 'var(--accent-amber)' : 'var(--accent-coral)';
            const compatLabel = m.compatibility >= 75 ? 'Great Match' : m.compatibility >= 50 ? 'Good Match' : 'Low Match';
            return `
              <div class="match-card animate-fade-in-up stagger-${(i % 4) + 1}">
                <div class="match-avatar" style="${m.photo ? `background-image:url('${m.photo}');background-size:cover;background-position:center;` : ['var(--gradient-primary)','var(--gradient-lavender)','var(--gradient-coral)','var(--gradient-sky)'][i % 4] + ';background:' + ['var(--gradient-primary)','var(--gradient-lavender)','var(--gradient-coral)','var(--gradient-sky)'][i % 4]}">
                  ${!m.photo ? m.avatar : ''}
                </div>
                <div class="match-info">
                  <h3>${m.fullName} ${m.verificationBadge ? '<span class="badge badge-verified" style="font-size:10px">Verified</span>' : ''}</h3>
                  <p>${m.university || 'University'} • ${m.yearLevel || 'Student'}</p>
                  <div class="match-traits" style="margin-top:var(--space-2)">
                    ${m.lifestyle ? Object.entries(m.lifestyle).map(([key, val]) => 
                      val && val !== 'Not Set' ? `<span class="badge badge-secondary" style="font-size:10px">${val}</span>` : ''
                    ).join('') : ''}
                  </div>
                  <div class="match-compatibility" style="margin-top:var(--space-3)">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                      <span style="font-size:var(--font-xs);color:var(--text-muted)">Compatibility</span>
                      <span style="font-weight:700;color:${compatColor}">${m.compatibility}% — ${compatLabel}</span>
                    </div>
                    <div class="match-compat-bar">
                      <div class="match-compat-fill" style="width:${m.compatibility}%;background:${compatColor}"></div>
                    </div>
                  </div>
                </div>
                <div class="match-actions">
                  <button class="btn btn-primary btn-sm" onclick="RoommatesPage.connectWith('${m.id}', '${m.fullName}')">💬 Connect</button>
                  <button class="btn btn-ghost btn-sm" onclick="this.closest('.match-card').remove(); Toast.info('Skipped', 'Removed from suggestions')">Skip</button>
                </div>
              </div>
            `;
          }).join('')}
          ${matches.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">👥</div>
              <h3>No Matches Yet</h3>
              <p>Complete your lifestyle preferences in your profile to get roommate suggestions.</p>
              <button class="btn btn-primary" onclick="Router.navigate('/profile')">Complete Profile</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  async connectWith(userId, userName) {
    try {
      const btn = event.target;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Connecting...';
      }

      // Create or start conversation on backend
      const res = await API.post('/messages/conversations', { otherUserId: userId });
      const convId = res.conversationId;

      // Automatically send the first friendly icebreaker message
      const fd = new FormData();
      fd.append('content', `Hi ${userName}! I saw your profile on RoomMe and I think we could be great roommates! 😊`);
      await API.upload(`/messages/${convId}`, fd);

      Toast.success('Connected! 🎉', `Starting a conversation with ${userName}`);
      
      // Navigate to messages
      Router.navigate('/messages');

      // Add a slight delay to allow router to finish rendering Message page, then select conversation
      setTimeout(() => {
        if (typeof MessagesPage !== 'undefined' && MessagesPage.selectConversation) {
          MessagesPage.selectConversation(convId);
        }
      }, 300);

    } catch (e) {
      Toast.error('Connection Failed', e.message);
      if (event.target) {
        event.target.disabled = false;
        event.target.innerHTML = '💬 Connect';
      }
    }
  },

  calculateCompatibility(user1, user2) {
    if (!user1.lifestyle || !user2.lifestyle) return 50;
    let score = 0;
    let total = 0;

    const weights = {
      sleepSchedule: 25,
      cleanliness: 25,
      studyHabits: 20,
      noiseTolerance: 20,
      genderPreference: 10
    };

    Object.keys(weights).forEach(key => {
      total += weights[key];
      const v1 = user1.lifestyle[key];
      const v2 = user2.lifestyle[key];
      if (!v1 || !v2 || v1 === 'Not Set' || v2 === 'Not Set') {
        score += weights[key] * 0.5; // neutral if not set
      } else if (v1 === v2) {
        score += weights[key]; // full match
      } else if (key === 'genderPreference' && (v1 === 'Any' || v2 === 'Any')) {
        score += weights[key]; // any = compatible
      } else {
        score += weights[key] * 0.25; // mismatch
      }
    });

    return Math.round((score / total) * 100);
  },

  formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  }
};
