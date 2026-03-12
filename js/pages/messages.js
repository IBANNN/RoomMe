// Messages Page
const MessagesPage = {
  activeConversation: null,
  searchQuery: '',

  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';
    const allConversations = MESSAGES_DATA.filter(c => c.participants.includes(user.id));
    if (!this.activeConversation && allConversations.length > 0) this.activeConversation = allConversations[0].id;

    // Filter conversations by search
    const conversations = this.searchQuery
      ? allConversations.filter(c => {
          const otherId = c.participants.find(p => p !== user.id);
          const other = USERS_DATA.find(u => u.id === otherId);
          return other && other.fullName.toLowerCase().includes(this.searchQuery.toLowerCase());
        })
      : allConversations;

    const activeConv = allConversations.find(c => c.id === this.activeConversation);
    return `
      <div class="messages-page page-transition">
        <div class="messages-sidebar">
          <div class="messages-sidebar-header">
            <h2>Messages</h2>
            <div class="messages-search">
              <span class="messages-search-icon">🔍</span>
              <input type="text" placeholder="Search conversations..." id="msg-search-input" value="${this.searchQuery}" oninput="MessagesPage.onSearch(this.value)" />
            </div>
          </div>
          <div style="padding:var(--space-2) var(--space-3)">
            <button class="btn btn-primary btn-sm w-full" onclick="MessagesPage.showNewConversationModal()">✏️ New Conversation</button>
          </div>
          <div class="messages-list">
            ${conversations.length === 0 ? `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:var(--font-sm)">${this.searchQuery ? 'No conversations found' : 'No conversations yet'}</div>` : ''}
            ${conversations.map((conv, ci) => {
              const otherId = conv.participants.find(p => p !== user.id);
              const other = USERS_DATA.find(u => u.id === otherId);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const colors = ['var(--gradient-primary)','var(--gradient-lavender)','var(--gradient-coral)','var(--gradient-sky)'];
              return `<div class="message-contact ${conv.id === this.activeConversation ? 'active' : ''}" onclick="MessagesPage.selectConversation('${conv.id}')">
                <div class="message-contact-avatar" style="background:${colors[ci % 4]}">${other ? other.avatar : '??'}<span class="message-contact-online"></span></div>
                <div class="message-contact-info">
                  <div class="message-contact-name"><span>${other ? other.fullName : 'Unknown'}</span><span class="message-contact-time">${Navbar.timeAgo(lastMsg.timestamp)}</span></div>
                  <div class="message-contact-preview">${lastMsg.text.substring(0, 45)}${lastMsg.text.length > 45 ? '...' : ''}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="messages-chat">${activeConv ? this.renderChat(activeConv, user) : '<div class="empty-state" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="empty-state-icon">💬</div><h3>Select a Conversation</h3><p>Choose a conversation from the list or start a new one.</p></div>'}</div>
      </div>`;
  },

  onSearch(query) {
    this.searchQuery = query;
    // Only re-render sidebar, not full page
    const user = Auth.getCurrentUser();
    const allConversations = MESSAGES_DATA.filter(c => c.participants.includes(user.id));
    const conversations = query
      ? allConversations.filter(c => {
          const otherId = c.participants.find(p => p !== user.id);
          const other = USERS_DATA.find(u => u.id === otherId);
          return other && other.fullName.toLowerCase().includes(query.toLowerCase());
        })
      : allConversations;

    const list = document.querySelector('.messages-list');
    if (!list) return;
    if (conversations.length === 0) {
      list.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:var(--font-sm)">${query ? 'No conversations found' : 'No conversations yet'}</div>`;
      return;
    }
    const colors = ['var(--gradient-primary)','var(--gradient-lavender)','var(--gradient-coral)','var(--gradient-sky)'];
    list.innerHTML = conversations.map((conv, ci) => {
      const otherId = conv.participants.find(p => p !== user.id);
      const other = USERS_DATA.find(u => u.id === otherId);
      const lastMsg = conv.messages[conv.messages.length - 1];
      return `<div class="message-contact ${conv.id === this.activeConversation ? 'active' : ''}" onclick="MessagesPage.selectConversation('${conv.id}')">
        <div class="message-contact-avatar" style="background:${colors[ci % 4]}">${other ? other.avatar : '??'}<span class="message-contact-online"></span></div>
        <div class="message-contact-info">
          <div class="message-contact-name"><span>${other ? other.fullName : 'Unknown'}</span><span class="message-contact-time">${Navbar.timeAgo(lastMsg.timestamp)}</span></div>
          <div class="message-contact-preview">${lastMsg.text.substring(0, 45)}${lastMsg.text.length > 45 ? '...' : ''}</div>
        </div>
      </div>`;
    }).join('');
  },

  showNewConversationModal() {
    const user = Auth.getCurrentUser();
    // Show all users except current user
    const users = USERS_DATA.filter(u => u.id !== user.id && u.role !== 'admin');
    Modal.show('New Conversation', `
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        <p style="color:var(--text-secondary);font-size:var(--font-sm)">Select a user to start a conversation with:</p>
        ${users.map(u => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3);background:var(--bg-glass);border-radius:var(--radius-md);cursor:pointer;border:1px solid var(--border-color)" onclick="MessagesPage.startConversation('${u.id}')">
            <div style="display:flex;align-items:center;gap:var(--space-3)">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:var(--font-xs)">${u.avatar}</div>
              <div>
                <div style="font-weight:600;font-size:var(--font-sm)">${u.fullName}</div>
                <div style="font-size:var(--font-xs);color:var(--text-muted)">${u.role.charAt(0).toUpperCase() + u.role.slice(1)} ${u.university ? '• ' + u.university : ''}</div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm">Message</button>
          </div>
        `).join('')}
      </div>
    `);
  },

  startConversation(targetUserId) {
    const user = Auth.getCurrentUser();
    // Check if conversation already exists
    const existing = MESSAGES_DATA.find(c =>
      c.participants.includes(user.id) && c.participants.includes(targetUserId)
    );

    if (existing) {
      this.activeConversation = existing.id;
      Modal.close();
      Router.refresh();
      return;
    }

    // Create new conversation
    const newConv = {
      id: 'conv' + Date.now(),
      participants: [user.id, targetUserId],
      messages: [
        {
          id: 'm_init_' + Date.now(),
          senderId: user.id,
          text: 'Hello! I would like to connect with you.',
          timestamp: new Date().toISOString(),
          read: false
        }
      ]
    };
    MESSAGES_DATA.push(newConv);
    this.activeConversation = newConv.id;
    Modal.close();
    Router.refresh();
    Toast.success('Conversation Started', 'You can now message each other');
  },

  renderChat(conv, user) {
    const otherId = conv.participants.find(p => p !== user.id);
    const other = USERS_DATA.find(u => u.id === otherId);
    return `
      <div class="messages-chat-header"><div class="messages-chat-header-user"><div class="message-contact-avatar" style="background:var(--gradient-primary);width:36px;height:36px;font-size:var(--font-xs)">${other ? other.avatar : '??'}</div><div><div style="font-weight:600;font-size:var(--font-sm)">${other ? other.fullName : 'Unknown'}</div><div style="font-size:var(--font-xs);color:var(--accent-primary)">${other ? other.role.charAt(0).toUpperCase() + other.role.slice(1) : ''} • Online</div></div></div></div>
      <div class="messages-chat-body" id="chat-body">${conv.messages.map(msg => `<div class="message-bubble ${msg.senderId === user.id ? 'sent' : 'received'}">${msg.text}<div class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div></div>`).join('')}</div>
      <div class="messages-chat-input"><button class="btn btn-ghost btn-icon" onclick="document.getElementById('msg-attach').click()">📎</button><input type="file" id="msg-attach" style="display:none" onchange="MessagesPage.handleAttachment(this)"/><input type="text" placeholder="Type a message..." id="chat-input" onkeypress="if(event.key==='Enter')MessagesPage.sendMessage()" /><button class="btn btn-primary btn-icon" onclick="MessagesPage.sendMessage()">➤</button></div>`;
  },

  handleAttachment(input) {
    if (input.files && input.files[0]) {
      Toast.info('File Selected', `"${input.files[0].name}" will be sent as attachment`);
    }
  },

  afterRender() {
    const b = document.getElementById('chat-body');
    if (b) b.scrollTop = b.scrollHeight;
  },

  selectConversation(convId) {
    this.activeConversation = convId;
    Router.refresh();
    setTimeout(() => { const b = document.getElementById('chat-body'); if (b) b.scrollTop = b.scrollHeight; }, 100);
  },

  sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    const user = Auth.getCurrentUser();
    const conv = MESSAGES_DATA.find(c => c.id === this.activeConversation);
    if (!conv) return;
    conv.messages.push({ id: 'm' + Date.now(), senderId: user.id, text: input.value.trim(), timestamp: new Date().toISOString(), read: false });
    input.value = '';
    Router.refresh();
    setTimeout(() => { const b = document.getElementById('chat-body'); if (b) b.scrollTop = b.scrollHeight; }, 100);
  }
};
