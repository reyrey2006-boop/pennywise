/**
 * AllowanceView.js
 * Assigned to: Member 2 (Allowance Developer)
 * 
 * Responsibilities:
 * - Renders the dedicated Allowance Management page (#page-allowance).
 * - Provides the Add Allowance form with validation (rejects empty description & negative/zero amounts).
 * - Displays Allowance summary metrics (Total Allowance Received, Number of Allowance Records, Sources Breakdown).
 * - Displays a dedicated Allowance Records table with direct Edit and Delete buttons.
 */
 
import View from './View.js';
 
class AllowanceView extends View {
  _parentElement = document.querySelector('#page-allowance');
 
  _generateMarkup() {
    const today = this.todayISO();
    const { totals, allowances, allowanceBreakdown } = this._data || {
      totals: { totalIncome: 0, allowanceCount: 0 },
      allowances: [],
      allowanceBreakdown: [],
    };
 
    return `
      <!-- Allowance Summary Header Banner -->
      <div class="page-summary-banner banner-green">
        <div class="banner-stat">
          <span class="banner-stat-label">Total Allowance Received</span>
          <strong class="banner-stat-value">+${this.formatCurrency(totals.totalIncome)}</strong>
        </div>
        <div class="banner-stat">
          <span class="banner-stat-label">Allowance Records</span>
          <strong class="banner-stat-value">${totals.allowanceCount} entries</strong>
        </div>
        <div class="banner-stat">
          <span class="banner-stat-label">Current Available Balance</span>
          <strong class="banner-stat-value">${this.formatCurrency(totals.balance)}</strong>
        </div>
      </div>
 
      <!-- Main 2-Column Layout: Form on Left, Allowance Records & Source Breakdown on Right -->
      <div class="page-split-layout">
        <!-- Left Column: Add Allowance Form -->
        <div class="card form-card card-accent-green">
          <div class="form-card-header">
            <div class="form-title-wrap">
              <span class="form-badge badge-green">Income (+₱)</span>
              <h3 class="form-heading">Add New Allowance</h3>
            </div>
            <p class="form-subheading">Record money received from parents, scholarships, or part-time work.</p>
          </div>
 
          <form id="form-add-allowance" class="entry-form" novalidate>
            <div id="allowance-error-box" class="form-alert-box hidden"></div>
 
            <div class="form-group">
              <label for="allowance-amount" class="form-label">Amount Received (₱) <span class="required">*</span></label>
              <div class="input-with-prefix">
                <span class="currency-prefix">₱</span>
                <input 
                  type="number" 
                  id="allowance-amount" 
                  class="form-control" 
                  placeholder="e.g. 1500.00" 
                  step="0.01" 
                  min="0.01" 
                  required 
                />
              </div>
            </div>
 
            <div class="form-group">
              <label for="allowance-desc" class="form-label">Description / Note <span class="required">*</span></label>
              <input 
                type="text" 
                id="allowance-desc" 
                class="form-control" 
                placeholder="e.g. Weekly allowance from parents" 
                maxlength="80" 
                required 
              />
            </div>
 
            <div class="form-row-2">
              <div class="form-group">
                <label for="allowance-category" class="form-label">Allowance Source</label>
                <select id="allowance-category" class="form-control">
                  <option value="Weekly Allowance">Weekly Allowance</option>
                  <option value="Monthly Allowance">Monthly Allowance</option>
                  <option value="Parents / Family">Parents / Family Support</option>
                  <option value="Scholarship / Stipend">Scholarship / Stipend</option>
                  <option value="Part-time Job">Part-time Job Earnings</option>
                  <option value="Other Allowance">Other Income</option>
                </select>
              </div>
 
              <div class="form-group">
                <label for="allowance-method" class="form-label">Received Via</label>
                <select id="allowance-method" class="form-control">
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Bank Transfer">Bank Transfer / ATM</option>
                </select>
              </div>
            </div>
 
            <div class="form-group">
              <label for="allowance-date" class="form-label">Date Received</label>
              <input type="date" id="allowance-date" class="form-control" value="${today}" />
            </div>
 
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-green" id="btn-submit-allowance">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Save Allowance
              </button>
              <button type="button" class="btn btn-secondary" id="btn-reset-allowance">Clear</button>
            </div>
          </form>
        </div>
 
        <!-- Right Column: Allowance History & Source Breakdown -->
        <div class="page-right-stack">
          <!-- Allowance Source Breakdown -->
          <div class="card panel-card">
            <div class="panel-header">
              <h3 class="panel-title">Allowance by Source</h3>
            </div>
            <div class="panel-body">
              ${
                allowanceBreakdown.length === 0
                  ? `<p class="text-muted">No allowances recorded yet.</p>`
                  : `<div class="breakdown-list">
                      ${allowanceBreakdown
                        .map(
                          (item) => `
                        <div class="breakdown-item">
                          <div class="breakdown-item-labels">
                            <span class="breakdown-item-name">${this.escapeHTML(item.category)}</span>
                            <span class="breakdown-item-figures">
                              <strong>${this.formatCurrency(item.total)}</strong>
                              <span class="percentage-pill">(${item.percentage}%)</span>
                            </span>
                          </div>
                          <div class="progress-track">
                            <div class="progress-fill fill-green" style="width: ${item.percentage}%;"></div>
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>`
              }
            </div>
          </div>
 
          <!-- Recorded Allowances Table -->
          <div class="card panel-card">
            <div class="panel-header">
              <h3 class="panel-title">Recorded Allowances (${allowances.length})</h3>
            </div>
            <div class="panel-body no-padding">
              ${
                allowances.length === 0
                  ? `<div class="empty-panel-state"><p>You haven't logged any allowances yet. Use the form on the left to add your first allowance.</p></div>`
                  : `<div class="table-responsive">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Source</th>
                            <th class="text-right">Amount</th>
                            <th class="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${allowances
                            .map(
                              (tx) => `
                            <tr class="tx-row">
                              <td class="tx-cell-date">${this.formatDate(tx.date)}</td>
                              <td class="tx-cell-desc">
                                <div>${this.escapeHTML(tx.description)}</div>
                                <small class="text-muted">${this.escapeHTML(tx.paymentMethod || 'Cash')}</small>
                              </td>
                              <td><span class="category-tag">${this.escapeHTML(tx.category)}</span></td>
                              <td class="text-right tx-amount-income"><strong>+${this.formatCurrency(tx.amount)}</strong></td>
                              <td class="text-center">
                                <div class="action-buttons-group">
                                  <button type="button" class="btn-icon btn-edit" data-id="${tx.id}" title="Edit Allowance">
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                                  </button>
                                  <button type="button" class="btn-icon btn-delete" data-id="${tx.id}" title="Delete Allowance">
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }
 
addHandlerActions(handlers) {
    if (!this._parentElement) return;
 
    this._parentElement.addEventListener('click', (e) => {
      const resetBtn = e.target.closest('#btn-reset-allowance');
      if (resetBtn) {
        const form = this._parentElement.querySelector('#form-add-allowance');
        if (form) {
          form.reset();
          this.hideError();
          const dateInput = form.querySelector('#allowance-date');
          if (dateInput) dateInput.value = this.todayISO();
        }
        return;
      }
 
      const editBtn = e.target.closest('.btn-edit');
      if (editBtn && handlers.onEdit) {
        handlers.onEdit(editBtn.dataset.id);
        return;
      }
 
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn && handlers.onDelete) {
        handlers.onDelete(deleteBtn.dataset.id);
      }
    });
 
    this._parentElement.addEventListener('submit', (e) => {
      if (e.target.id !== 'form-add-allowance') return;
      e.preventDefault();
 
      const form = e.target;
      const amountInput = form.querySelector('#allowance-amount');
      const descInput = form.querySelector('#allowance-desc');
      const categorySelect = form.querySelector('#allowance-category');
      const methodSelect = form.querySelector('#allowance-method');
      const dateInput = form.querySelector('#allowance-date');
 
      const rawAmount = amountInput.value.trim();
      const rawDesc = descInput.value.trim();
      const amount = parseFloat(rawAmount);
 
      if (!rawDesc) {
        this.showError('Description is required. Please specify where this allowance came from.');
        descInput.focus();
        return;
      }
 
      if (rawAmount === '' || isNaN(amount) || amount <= 0) {
        this.showError('Please enter a valid allowance amount greater than ₱0.00.');
        amountInput.focus();
        return;
      }
 
      this.hideError();
 
      handlers.onAdd({
        type: 'income',
        amount: Number(amount.toFixed(2)),
        description: rawDesc,
        category: categorySelect.value || 'Weekly Allowance',
        paymentMethod: methodSelect?.value || 'Cash',
        date: dateInput.value || this.todayISO(),
      });
    });
  }
 
showError(msg) {
    const errorBox = document.querySelector('#allowance-error-box');
    if (!errorBox) return;
    errorBox.innerHTML = `
      <div class="alert alert-error">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>${this.escapeHTML(msg)}</span>
      </div>
    `;
    errorBox.classList.remove('hidden');
  }
 
  hideError() {
    const errorBox = document.querySelector('#allowance-error-box');
    if (errorBox) {
      errorBox.innerHTML = '';
      errorBox.classList.add('hidden');
    }
  }
}
 
export default new AllowanceView();
 