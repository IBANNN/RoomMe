// Modal Component
const Modal = {
  show(title, bodyHTML, footerHTML = '') {
    const overlay = document.getElementById('modal-overlay');
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="Modal.close()">✕</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
      </div>
    `;
    overlay.classList.remove('hidden');
    overlay.onclick = (e) => {
      if (e.target === overlay) Modal.close();
    };
  },

  close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  },

  confirm(title, message, onConfirm) {
    this.show(
      title,
      `<p style="color: var(--text-secondary); font-size: var(--font-sm);">${message}</p>`,
      `<button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
       <button class="btn btn-primary" onclick="Modal.close(); (${onConfirm})()">Confirm</button>`
    );
  }
};
