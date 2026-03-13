// Payments Page
const PaymentsPage = {
  render() {
    const user = Auth.getCurrentUser();
    if (!user) return '';

    let payments;
    if (user.role === 'tenant') {
      payments = PAYMENTS_DATA.filter(p => p.tenantId === user.id);
    } else if (user.role === 'landlord') {
      payments = PAYMENTS_DATA.filter(p => p.landlordId === user.id);
    } else {
      payments = [...PAYMENTS_DATA];
    }

    const paid = payments.filter(p => p.status === 'Paid');
    const pending = payments.filter(p => p.status === 'Pending' || p.status === 'Pending Verification');
    const overdue = payments.filter(p => p.status === 'Overdue');
    const pendingVerification = payments.filter(p => p.status === 'Pending Verification');
    const totalPaid = paid.reduce((s, p) => s + p.amount, 0);
    const totalPending = pending.reduce((s, p) => s + p.amount, 0);

    return `
      <div class="payments-page page-transition">
        <div class="dashboard-page-header">
          <div>
            <h1 class="dashboard-page-title">${user.role === 'landlord' ? 'Payment Records' : user.role === 'admin' ? 'Payment Monitor' : 'My Payments'}</h1>
            <p class="dashboard-page-subtitle">Track your rental payments and billing</p>
          </div>
        </div>

        <!-- Renting Policy Disclaimer -->
        <div style="background:rgba(0,0,0,0.03);border-left:4px solid var(--accent-primary);padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-6)">
          <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0">
            <strong>Renting Standard:</strong> A two-month security deposit and a one-month advance payment are required for all new move-ins.
          </p>
        </div>

        <!-- Summary Cards -->
        <div class="payment-summary-cards">
          <div class="payment-summary-card animate-fade-in-up stagger-1">
            <div class="payment-summary-icon" style="background:rgba(0,212,170,0.1)">💰</div>
            <div class="payment-summary-value" style="color:var(--accent-primary)">₱${totalPaid.toLocaleString()}</div>
            <div class="payment-summary-label">Total Paid</div>
          </div>
          <div class="payment-summary-card animate-fade-in-up stagger-2">
            <div class="payment-summary-icon" style="background:rgba(245,158,11,0.1)">⏳</div>
            <div class="payment-summary-value" style="color:var(--accent-amber)">₱${totalPending.toLocaleString()}</div>
            <div class="payment-summary-label">Pending</div>
          </div>
          <div class="payment-summary-card animate-fade-in-up stagger-3">
            <div class="payment-summary-icon" style="background:rgba(255,107,107,0.1)">⚠️</div>
            <div class="payment-summary-value" style="color:var(--accent-coral)">${overdue.length}</div>
            <div class="payment-summary-label">Overdue</div>
          </div>
          ${user.role !== 'tenant' ? `
          <div class="payment-summary-card animate-fade-in-up stagger-4">
            <div class="payment-summary-icon" style="background:rgba(99,102,241,0.1)">🔍</div>
            <div class="payment-summary-value" style="color:var(--accent-lavender)">${pendingVerification.length}</div>
            <div class="payment-summary-label">Awaiting Verification</div>
          </div>` : ''}
        </div>

        <!-- Admin/Landlord: Pending Verification Panel -->
        ${(user.role === 'admin' || user.role === 'landlord') && pendingVerification.length > 0 ? `
          <div class="glass-card" style="margin-bottom:var(--space-8);border:1px solid rgba(99,102,241,0.3)">
            <h3 style="font-size:var(--font-lg);font-weight:700;margin-bottom:var(--space-5);color:var(--accent-lavender)">🔍 Payments Awaiting Verification</h3>
            ${pendingVerification.map(p => {
              const property = PROPERTIES_DATA.find(pr => pr.id === p.propertyId);
              const tenant = USERS_DATA.find(u => u.id === p.tenantId);
              return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius-lg);margin-bottom:var(--space-3)">
                  <div>
                    <div style="font-weight:600">${p.month} ${tenant ? '— ' + tenant.fullName : ''}</div>
                    <div style="font-size:var(--font-sm);color:var(--text-muted)">${property ? property.title : 'Property'}</div>
                    <div style="margin-top:var(--space-2)">
                      <span class="badge badge-secondary">Via ${p.method || 'Unknown'}</span>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-3)">
                    <div style="font-size:var(--font-xl);font-weight:800;color:var(--accent-lavender)">₱${p.amount.toLocaleString()}</div>
                    ${p.proofUrl ? `<button class="btn btn-ghost btn-sm" onclick="PaymentsPage.viewProof('${p.id}')">🖼️ Proof</button>` : '<span style="color:var(--text-muted);font-size:var(--font-xs)">No proof</span>'}
                    <button class="btn btn-primary btn-sm" onclick="PaymentsPage.adminApprove('${p.id}')">✓ Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="PaymentsPage.adminReject('${p.id}')">✕ Reject</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Outstanding Move-In Costs (Deposits & Advance) -->
        ${[...overdue, ...pending].filter(p => p.month.includes('Deposit') || p.month.includes('Advance')).length > 0 ? `
          <div class="glass-card" style="margin-bottom:var(--space-8); border:1px solid rgba(0,212,170,0.3)">
            <h3 style="font-size:var(--font-lg);font-weight:700;margin-bottom:var(--space-5);color:var(--accent-primary)">📦 Move-In Costs & Deposits</h3>
            ${[...overdue, ...pending].filter(p => p.month.includes('Deposit') || p.month.includes('Advance')).map(p => {
              const property = PROPERTIES_DATA.find(pr => pr.id === p.propertyId);
              const tenant = user.role !== 'tenant' ? USERS_DATA.find(u => u.id === p.tenantId) : null;
              return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius-lg);margin-bottom:var(--space-3)">
                  <div>
                    <div style="font-weight:700;color:var(--accent-primary)">${p.month}</div>
                    <div style="font-size:var(--font-sm);color:var(--text-muted)">
                      ${property ? property.title : 'Property'}
                      ${tenant ? ` • ${tenant.fullName}` : ''}
                    </div>
                    <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:2px">Due: ${new Date(p.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-4)">
                    <div>
                      <div style="font-size:var(--font-xl);font-weight:800;color:${p.status === 'Overdue' ? 'var(--accent-coral)' : p.status === 'Pending Verification' ? 'var(--accent-lavender)' : 'var(--accent-amber)'}">₱${p.amount.toLocaleString()}</div>
                      <span class="badge badge-${p.status === 'Overdue' ? 'coral' : p.status === 'Pending Verification' ? 'secondary' : 'amber'}">${p.status}</span>
                    </div>
                    ${user.role === 'tenant' && (p.status === 'Pending' || p.status === 'Overdue') ? `<button class="btn btn-primary" onclick="PaymentsPage.payNow('${p.id}')">Pay Now</button>` : ''}
                    ${user.role === 'tenant' && p.status === 'Pending Verification' ? '<span style="font-size:var(--font-xs);color:var(--accent-lavender)">⏳ Awaiting admin approval</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Outstanding Regular Rent -->
        ${[...overdue, ...pending].filter(p => !p.month.includes('Deposit') && !p.month.includes('Advance')).length > 0 ? `
          <div class="glass-card" style="margin-bottom:var(--space-8)">
            <h3 style="font-size:var(--font-lg);font-weight:700;margin-bottom:var(--space-5)">Outstanding Regular Rent</h3>
            ${[...overdue, ...pending].filter(p => !p.month.includes('Deposit') && !p.month.includes('Advance')).map(p => {
              const property = PROPERTIES_DATA.find(pr => pr.id === p.propertyId);
              const tenant = user.role !== 'tenant' ? USERS_DATA.find(u => u.id === p.tenantId) : null;
              return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);background:var(--bg-glass);border:1px solid var(--border-color);border-radius:var(--radius-lg);margin-bottom:var(--space-3)">
                  <div>
                    <div style="font-weight:600">${p.month}</div>
                    <div style="font-size:var(--font-sm);color:var(--text-muted)">
                      ${property ? property.title : 'Property'}
                      ${tenant ? ` • ${tenant.fullName}` : ''}
                    </div>
                    <div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:2px">Due: ${new Date(p.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-4)">
                    <div>
                      <div style="font-size:var(--font-xl);font-weight:800;color:${p.status === 'Overdue' ? 'var(--accent-coral)' : p.status === 'Pending Verification' ? 'var(--accent-lavender)' : 'var(--accent-amber)'}">₱${p.amount.toLocaleString()}</div>
                      <span class="badge badge-${p.status === 'Overdue' ? 'coral' : p.status === 'Pending Verification' ? 'secondary' : 'amber'}">${p.status}</span>
                    </div>
                    ${user.role === 'tenant' && (p.status === 'Pending' || p.status === 'Overdue') ? `<button class="btn btn-primary" onclick="PaymentsPage.payNow('${p.id}')">Pay Now</button>` : ''}
                    ${user.role === 'tenant' && p.status === 'Pending Verification' ? '<span style="font-size:var(--font-xs);color:var(--accent-lavender)">⏳ Awaiting admin approval</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Payment History -->
        <div class="glass-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5)">
            <h3 style="font-size:var(--font-lg);font-weight:700">Payment History</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Month</th>
                ${user.role !== 'tenant' ? '<th>Tenant</th>' : ''}
                <th>Property</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Proof / Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${payments.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate)).map(p => {
                const property = PROPERTIES_DATA.find(pr => pr.id === p.propertyId);
                const tenant = user.role !== 'tenant' ? USERS_DATA.find(u => u.id === p.tenantId) : null;
                const statusClass = p.status === 'Paid' ? 'primary' : p.status === 'Overdue' ? 'coral' : p.status === 'Pending Verification' ? 'secondary' : p.status === 'Rejected' ? 'coral' : 'amber';
                return `
                  <tr>
                    <td style="font-weight:500;color:var(--text-primary)">${p.month}</td>
                    ${user.role !== 'tenant' ? `<td>${tenant ? tenant.fullName : 'Unknown'}</td>` : ''}
                    <td>${property ? property.title.substring(0, 25) + (property.title.length > 25 ? '…' : '') : 'N/A'}</td>
                    <td style="font-weight:600">₱${p.amount.toLocaleString()}</td>
                    <td><span class="badge badge-${statusClass}">${p.status}</span></td>
                    <td>${p.method || '—'}</td>
                    <td>
                      ${p.proofUrl ? `<button class="btn btn-ghost btn-sm" onclick="PaymentsPage.viewProof('${p.id}')">🖼️ Proof</button>` : ''}
                      ${p.receiptNo ? `<button class="btn btn-ghost btn-sm" onclick="PaymentsPage.viewReceipt('${p.id}')">📄 Receipt</button>` : ''}
                      ${!p.proofUrl && !p.receiptNo ? '—' : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  payNow(paymentId) {
    const payment = PAYMENTS_DATA.find(p => p.id === paymentId);
    if (!payment) return;

    Modal.show('Pay Rent', `
      <div style="text-align:center;margin-bottom:var(--space-6)">
        <div style="font-size:var(--font-3xl);font-weight:800;color:var(--accent-primary)">₱${payment.amount.toLocaleString()}</div>
        <div style="font-size:var(--font-sm);color:var(--text-muted)">${payment.month}</div>
      </div>
      <form onsubmit="PaymentsPage.processPayment(event, '${paymentId}')" style="display:flex;flex-direction:column;gap:var(--space-4)">
        <div class="form-group">
          <label class="form-label">Payment Method</label>
          <select class="form-select" id="pay-method" required onchange="PaymentsPage.onMethodChange(this.value)">
            <option value="">Select method</option>
            <option>GCash</option>
            <option>PayMaya</option>
            <option>Bank Transfer</option>
            <option>Manual Transfer</option>
          </select>
        </div>

        <div class="form-group" id="proof-upload-group" style="display:none">
          <label class="form-label">Upload Payment Proof <span style="color:var(--accent-coral)">*</span></label>
          <div class="upload-zone" onclick="document.getElementById('pay-proof-file').click()" style="cursor:pointer">
            <input type="file" id="pay-proof-file" accept="image/*,.pdf" style="display:none" onchange="PaymentsPage.handleProofUpload(this)" />
            📸 Upload screenshot or receipt<br>
            <span id="proof-file-name" style="color:var(--accent-primary);font-size:var(--font-xs);margin-top:4px;display:block"></span>
            <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();document.getElementById('pay-proof-file').click()">Choose File</button>
          </div>
          <div id="proof-preview" style="margin-top:var(--space-3);display:none">
            <img id="proof-preview-img" src="" style="max-width:100%;max-height:150px;border-radius:var(--radius-md);border:1px solid var(--border-color)" />
          </div>
        </div>

        <div style="padding:0.75rem;background:rgba(0,212,170,0.05);border:1px solid rgba(0,212,170,0.1);border-radius:var(--radius-md);font-size:var(--font-sm);color:var(--text-secondary)">
          🔒 After upload, an admin will verify your payment. Status will update to <strong>Paid</strong> once approved.
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full">Submit Payment</button>
      </form>
    `);
  },

  onMethodChange(method) {
    const proofGroup = document.getElementById('proof-upload-group');
    if (proofGroup) {
      proofGroup.style.display = method ? '' : 'none';
    }
  },

  handleProofUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const nameEl = document.getElementById('proof-file-name');
    if (nameEl) nameEl.textContent = `✅ ${file.name}`;

    // Preview image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('proof-preview');
        const img = document.getElementById('proof-preview-img');
        if (preview && img) {
          img.src = e.target.result;
          preview.style.display = '';
        }
        // Store data URL for later use
        input._dataUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      input._dataUrl = 'pdf';
    }
  },

  async processPayment(e, paymentId) {
    e.preventDefault();
    const payment = PAYMENTS_DATA.find(p => p.id === paymentId);
    if (!payment) return;

    const method = document.getElementById('pay-method').value;
    const proofInput = document.getElementById('pay-proof-file');
    
    if (!proofInput || !proofInput.files || proofInput.files.length === 0) {
      Toast.error('Proof Required', 'Please upload a payment screenshot or receipt.');
      return;
    }

    const fd = new FormData();
    fd.append('propertyId', payment.propertyId);
    fd.append('amount', payment.amount);
    fd.append('month', payment.month);
    fd.append('dueDate', payment.dueDate || '');
    fd.append('method', method);
    fd.append('proof', proofInput.files[0]);

    try {
      await API.upload('/payments', fd);
      Modal.close();
      Toast.success('Payment Submitted! ⏳', 'Your payment has been submitted for verification.');
      Router.refresh();
    } catch (err) {
      Toast.error('Payment Failed', err.message);
    }
  },

  viewProof(paymentId) {
    const payment = PAYMENTS_DATA.find(p => p.id === paymentId);
    if (!payment || !payment.proofUrl) return;

    const rawUrl = payment.proofUrl;
    if (!rawUrl || rawUrl === 'pdf' || rawUrl === 'uploaded') {
      Toast.info('Proof', 'Payment proof has been uploaded but cannot be previewed here.');
      return;
    }
    const fullUrl = rawUrl.startsWith('http') ? rawUrl : window.location.origin + rawUrl;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fullUrl);
    const isPdf = /\.pdf$/i.test(fullUrl);

    Modal.show('Payment Proof', `
      <div style="text-align:center">
        ${isImage ? `<img src="${fullUrl}" style="max-width:100%;max-height:400px;border-radius:var(--radius-md);border:1px solid var(--border-color)" onerror="this.style.display='none';document.getElementById('proof-fallback').style.display='block'" />
        <div id="proof-fallback" style="display:none;padding:var(--space-3);color:var(--text-secondary);font-size:var(--font-sm)">⚠️ Cannot preview. <a href="${fullUrl}" target="_blank" style="color:var(--accent-primary)">Open in new tab ↗</a></div>` : ''}
        ${isPdf ? `<div style="padding:var(--space-4)"><div style="font-size:3rem">📄</div><a href="${fullUrl}" target="_blank" class="btn btn-primary btn-sm" style="margin-top:1rem">Open PDF ↗</a></div>` : ''}
        ${!isImage && !isPdf ? `<a href="${fullUrl}" target="_blank" class="btn btn-secondary">View File ↗</a>` : ''}
        <div style="margin-top:var(--space-3);font-size:var(--font-sm);color:var(--text-muted)">
          ${payment.month} — ₱${payment.amount.toLocaleString()} via ${payment.method}
        </div>
        <div style="margin-top:var(--space-2)"><a href="${fullUrl}" target="_blank" style="color:var(--accent-primary);font-size:var(--font-xs)">🔗 Open in new tab</a></div>
      </div>
    `);
  },

  async adminApprove(paymentId) {
    try {
      await API.put(`/payments/${paymentId}/approve`, {});
      Toast.success('Payment Approved', 'Payment has been marked as paid and receipt generated.');
      Router.refresh();
    } catch (e) {
      Toast.error('Approval Failed', e.message);
    }
  },

  async adminReject(paymentId) {
    try {
      await API.put(`/payments/${paymentId}/reject`, {});
      Toast.error('Payment Rejected', 'Payment has been rejected. Tenant will be notified.');
      Router.refresh();
    } catch (e) {
      Toast.error('Rejection Failed', e.message);
    }
  },

  viewReceipt(paymentId) {
    const p = PAYMENTS_DATA.find(x => x.id === paymentId);
    if (!p) return;
    const prop = PROPERTIES_DATA.find(x => x.id === p.propertyId) || { title: 'RoomMe Property' };
    const tenant = USERS_DATA.find(x => x.id === p.tenantId) || { fullName: 'Tenant' };
    
    Modal.show('Payment Receipt', `
      <div id="print-receipt-area" style="padding:var(--space-6);background:var(--bg-primary);border-radius:var(--radius-lg);border:1px solid var(--border-color);color:var(--text-primary)">
        <div style="text-align:center;margin-bottom:var(--space-6);border-bottom:2px dashed var(--border-color);padding-bottom:var(--space-4)">
          <div style="font-size:var(--font-2xl);font-weight:800;color:var(--accent-primary);margin-bottom:var(--space-2)">RoomMe Platform</div>
          <div style="font-size:var(--font-sm);color:var(--text-secondary)">Official Payment Receipt</div>
        </div>
        
        <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-4);font-size:var(--font-sm)">
          <div>
            <div style="color:var(--text-muted)">Receipt No:</div>
            <div style="font-weight:700">${p.receiptNo || 'N/A'}</div>
          </div>
          <div style="text-align:right">
            <div style="color:var(--text-muted)">Date Paid:</div>
            <div style="font-weight:700">${new Date(p.paidDate || p.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div style="background:var(--bg-secondary);padding:var(--space-4);border-radius:var(--radius-md);margin-bottom:var(--space-6)">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)">
            <span style="color:var(--text-muted)">Received From:</span>
            <span style="font-weight:600">${tenant.fullName}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)">
            <span style="color:var(--text-muted)">Payment For:</span>
            <span style="font-weight:600">${p.month} Rent</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)">
            <span style="color:var(--text-muted)">Property:</span>
            <span style="font-weight:600">${prop.title}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">Payment Method:</span>
            <span style="font-weight:600">${p.method || 'Transfer'}</span>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid var(--border-color);padding-top:var(--space-4);font-size:var(--font-xl)">
          <div style="font-weight:700">Total Paid</div>
          <div style="font-weight:800;color:var(--accent-primary)">₱${p.amount.toLocaleString()}</div>
        </div>
      </div>
      <div style="margin-top:var(--space-6);display:flex;gap:var(--space-3);justify-content:flex-end">
        <button class="btn btn-secondary" onclick="Modal.close()">Close</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
      </div>
    `);
  }
};
