/**
 * ExpenseView.js
 * Assigned to: Member 3 (Expense Developer)
 * 
 * Responsibilities:
 * - Renders the dedicated Expense Tracker page (#page-expense).
 * - Provides the Record Expense form with validation (rejects empty description & negative/zero amounts).
 * - Displays Expense summary metrics (Total Spent, Remaining Budget Limit, Number of Expense Records).
 * - Displays a dedicated Expenses table & Category Breakdown with direct Edit and Delete buttons.
 */
 
import View from './View.js';
 
class ExpenseView extends View {
  _parentElement = document.querySelector('#page-expense');
  _scenarios = []; // hypothetical "what if" expenses (never saved unless recorded)
  _scenarioSeq = 0;
 
  _whatIfMarkup() {
    const t = (this._data && this._data.totals) || {};
    const balance = Number(t.balance) || 0;
    const spent = Number(t.periodExpenses ?? t.totalExpenses) || 0;
    const goal = Number(t.budgetGoal) || 0;
    const extra = this._scenarios.reduce((sum, sc) => sum + sc.amount, 0);
    const balAfter = balance - extra;
    const spentAfter = spent + extra;
    const remAfter = goal - spentAfter;
    const usedAfter = goal > 0 ? (spentAfter / goal) * 100 : 0;
    const over = goal > 0 && spentAfter > goal;
    const negative = balAfter < 0;
 
    const list = this._scenarios.length === 0
      ? `<p class="text-muted">Nothing simulated yet. Try adding something you're thinking of buying.</p>`
      : `<div class="breakdown-list">${this._scenarios.map((sc) => `
          <div class="breakdown-item">
            <div class="breakdown-item-labels">
              <span class="breakdown-item-name">${this.escapeHTML(sc.description)}
                <small class="text-muted">(${this.escapeHTML(sc.category)})</small></span>
              <span class="breakdown-item-figures">
                <strong>-${this.formatCurrency(sc.amount)}</strong>
                <button type="button" class="btn btn-sm btn-rose" data-whatif-record="${sc.id}">Record it</button>
                <button type="button" class="btn-icon" data-whatif-remove="${sc.id}" title="Remove" aria-label="Remove">&times;</button>
              </span>
            </div>
          </div>`).join('')}</div>`;
 
    const verdict = this._scenarios.length === 0 ? '' : negative
      ? `<div class="alert alert-error"><span>You'd be short by ${this.formatCurrency(-balAfter)} — more than you have.</span></div>`
      : over
      ? `<div class="alert alert-error"><span>This would put you ${this.formatCurrency(spentAfter - goal)} over your spending goal.</span></div>`
      : `<div class="alert alert-success"><span>You can afford this and stay within your goal.</span></div>`;
 
    return `
      <form id="form-whatif" class="entry-form" novalidate>
        <div id="whatif-error-box" class="form-alert-box hidden"></div>
        <div class="form-row-2">
          <div class="form-group">
            <label for="whatif-desc" class="form-label">What if I buy…</label>
            <input type="text" id="whatif-desc" class="form-control" placeholder="e.g. New headphones" maxlength="80" />
          </div>
          <div class="form-group">
            <label for="whatif-amount" class="form-label">Cost (₱)</label>
            <input type="number" id="whatif-amount" class="form-control" placeholder="e.g. 450" step="0.01" min="0.01" />
          </div>
        </div>
        <div class="form-group">
          <label for="whatif-category" class="form-label">Category</label>
          <select id="whatif-category" class="form-control">
            <option value="Food & Drinks">Food & Drinks</option>
            <option value="Transportation">Transportation / Commute</option>
            <option value="School Supplies">School Supplies & Printing</option>
            <option value="Boarding House / Rent">Boarding House / Dorm Rent</option>
            <option value="Utilities & Load">Mobile Load & Internet</option>
            <option value="Personal Care">Personal Care & Hygiene</option>
            <option value="Leisure & Entertainment">Leisure & Socials</option>
            <option value="Other Expenses">Other Necessities</option>
          </select>
        </div>
        <button type="submit" class="btn btn-secondary">Simulate</button>
      </form>
      <div style="margin-top:1rem">${list}</div>
      <table class="data-table" style="margin-top:1rem">
        <thead><tr><th></th><th class="text-right">Now</th><th class="text-right">After what-ifs</th></tr></thead>
        <tbody>
          <tr><td>Balance</td><td class="text-right">${this.formatCurrency(balance)}</td><td class="text-right"><strong>${this.formatCurrency(balAfter)}</strong></td></tr>
          <tr><td>Spent this period</td><td class="text-right">${this.formatCurrency(spent)}</td><td class="text-right"><strong>${this.formatCurrency(spentAfter)}</strong></td></tr>
          <tr><td>Budget left (this period)</td><td class="text-right">${this.formatCurrency(goal - spent)}</td><td class="text-right"><strong>${this.formatCurrency(remAfter)}</strong></td></tr>
          <tr><td>Budget used</td><td class="text-right">${(goal > 0 ? (spent / goal) * 100 : 0).toFixed(1)}%</td><td class="text-right"><strong>${usedAfter.toFixed(1)}%</strong></td></tr>
        </tbody>
      </table>
      <div style="margin-top:.75rem">${verdict}</div>
    `;
  }
 
  _refreshWhatIf() {
    const box = this._parentElement?.querySelector('#whatif-panel-body');
    if (box) box.innerHTML = this._whatIfMarkup();
  }
 
  _generateMarkup() {
    const today = this.todayISO();
    const { totals, expenses, categoryBreakdown } = this._data || {
      totals: { totalExpenses: 0, expenseCount: 0, balance: 0, budgetRemaining: 0 },
      expenses: [],
      categoryBreakdown: [],
    };
 
    return `
      <!-- Expense Summary Header Banner -->
      <div class="page-summary-banner banner-rose">
        <div class="banner-stat">
          <span class="banner-stat-label">Total Expenses Spent</span>
          <strong class="banner-stat-value">-${this.formatCurrency(totals.totalExpenses)}</strong>
        </div>
        <div class="banner-stat">
          <span class="banner-stat-label">Expense Entries</span>
          <strong class="banner-stat-value">${totals.expenseCount} records</strong>
        </div>
        <div class="banner-stat">
          <span class="banner-stat-label">Remaining Allowance Balance</span>
          <strong class="banner-stat-value">${this.formatCurrency(totals.balance)}</strong>
        </div>
      </div>
 
      <!-- Main 2-Column Layout: Expense Form on Left, Breakdown & Expense Records on Right -->
      <div class="page-split-layout">
        <!-- Left Column: Record Expense Form -->
        <div class="card form-card card-accent-rose">
          <div class="form-card-header">
            <div class="form-title-wrap">
              <span class="form-badge badge-rose">Expense (-₱)</span>
              <h3 class="form-heading">Record New Expense</h3>
            </div>
            <p class="form-subheading">Log your daily spending on meals, fare, school supplies, and bills.</p>
          </div>
 
          <form id="form-add-expense" class="entry-form" novalidate>
            <div id="expense-error-box" class="form-alert-box hidden"></div>
 
            <div class="form-group">
              <label for="expense-amount" class="form-label">Amount Spent (₱) <span class="required">*</span></label>
              <div class="input-with-prefix">
                <span class="currency-prefix">₱</span>
                <input 
                  type="number" 
                  id="expense-amount" 
                  class="form-control" 
                  placeholder="e.g. 85.00" 
                  step="0.01" 
                  min="0.01" 
                  required 
                />
              </div>
            </div>
 
            <div class="form-group">
              <label for="expense-desc" class="form-label">What did you spend on? <span class="required">*</span></label>
              <input 
                type="text" 
                id="expense-desc" 
                class="form-control" 
                placeholder="e.g. Campus lunch at canteen, tricycle fare" 
                maxlength="80" 
                required 
              />
            </div>
 
            <div class="form-row-2">
              <div class="form-group">
                <label for="expense-category" class="form-label">Expense Category <span class="required">*</span></label>
                <select id="expense-category" class="form-control" required>
                  <option value="Food & Drinks">Food & Drinks</option>
                  <option value="Transportation">Transportation / Commute</option>
                  <option value="School Supplies">School Supplies & Printing</option>
                  <option value="Boarding House / Rent">Boarding House / Dorm Rent</option>
                  <option value="Utilities & Load">Mobile Load & Internet</option>
                  <option value="Personal Care">Personal Care & Hygiene</option>
                  <option value="Leisure & Entertainment">Leisure & Socials</option>
                  <option value="Other Expenses">Other Necessities</option>
                </select>
              </div>
 
              <div class="form-group">
                <label for="expense-method" class="form-label">Payment Method</label>
                <select id="expense-method" class="form-control">
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Bank / Card">Debit Card / Bank</option>
                </select>
              </div>
            </div>
 
            <div class="form-group">
              <label for="expense-date" class="form-label">Date Spent</label>
              <input type="date" id="expense-date" class="form-control" value="${today}" />
            </div>
 
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-rose" id="btn-submit-expense">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
                Save Expense
              </button>
              <button type="button" class="btn btn-secondary" id="btn-reset-expense">Clear</button>
            </div>
          </form>
        </div>
 
        <!-- Right Column: Category Breakdown & Recorded Expenses Table -->
        <div class="page-right-stack">
          <!-- What-If Expenses Simulator -->
          <div class="card panel-card">
            <div class="panel-header">
              <h3 class="panel-title">What If Expenses</h3>
            </div>
            <div class="panel-body" id="whatif-panel-body">
              ${this._whatIfMarkup()}
            </div>
          </div>
 
          <!-- Category Breakdown -->
          <div class="card panel-card">
            <div class="panel-header">
              <h3 class="panel-title">Expenses by Category</h3>
            </div>
            <div class="panel-body">
              ${
                categoryBreakdown.length === 0
                  ? `<p class="text-muted">No expenses recorded yet.</p>`
                  : `<div class="breakdown-list">
                      ${categoryBreakdown
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
                            <div class="progress-fill fill-rose" style="width: ${item.percentage}%;"></div>
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>`
              }
            </div>
          </div>
 
          <!-- Recorded Expenses Table -->
          <div class="card panel-card">
            <div class="panel-header">
              <h3 class="panel-title">Recorded Expenses (${expenses.length})</h3>
            </div>
            <div class="panel-body no-padding">
              ${
                expenses.length === 0
                  ? `<div class="empty-panel-state"><p>You haven't logged any expenses yet. Use the form on the left to record your spending.</p></div>`
                  : `<div class="table-responsive">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th class="text-right">Amount</th>
                            <th class="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${expenses
                            .map(
                              (tx) => `
                            <tr class="tx-row">
                              <td class="tx-cell-date">${this.formatDate(tx.date)}</td>
                              <td class="tx-cell-desc">
                                <div>${this.escapeHTML(tx.description)}</div>
                                <small class="text-muted">${this.escapeHTML(tx.paymentMethod || 'Cash')}</small>
                              </td>
                              <td><span class="category-tag">${this.escapeHTML(tx.category)}</span></td>
                              <td class="text-right tx-amount-expense"><strong>-${this.formatCurrency(tx.amount)}</strong></td>
                              <td class="text-center">
                                <div class="action-buttons-group">
                                  <button type="button" class="btn-icon btn-edit" data-id="${tx.id}" title="Edit Expense">
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                                  </button>
                                  <button type="button" class="btn-icon btn-delete" data-id="${tx.id}" title="Delete Expense">
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
      const removeBtn = e.target.closest('[data-whatif-remove]');
      if (removeBtn) {
        this._scenarios = this._scenarios.filter((sc) => String(sc.id) !== removeBtn.dataset.whatifRemove);
        this._refreshWhatIf();
        return;
      }
      const recordBtn = e.target.closest('[data-whatif-record]');
      if (recordBtn) {
        const sc = this._scenarios.find((x) => String(x.id) === recordBtn.dataset.whatifRecord);
        if (sc) {
          this._scenarios = this._scenarios.filter((x) => x !== sc);
          handlers.onAdd({
            type: 'expense',
            amount: sc.amount,
            description: sc.description,
            category: sc.category,
            paymentMethod: 'Cash',
            date: this.todayISO(),
          });
        }
        return;
      }
      const resetBtn = e.target.closest('#btn-reset-expense');
      if (resetBtn) {
        const form = this._parentElement.querySelector('#form-add-expense');
        if (form) {
          form.reset();
          this.hideError();
          const dateInput = form.querySelector('#expense-date');
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
      if (e.target.id === 'form-whatif') {
        e.preventDefault();
        const f = e.target;
        const desc = f.querySelector('#whatif-desc').value.trim();
        const amt = parseFloat(f.querySelector('#whatif-amount').value);
        const errBox = f.querySelector('#whatif-error-box');
        if (!desc || isNaN(amt) || amt <= 0) {
          errBox.innerHTML = '<div class="alert alert-error"><span>Enter a description and a cost greater than ₱0.00.</span></div>';
          errBox.classList.remove('hidden');
          return;
        }
        this._scenarios.push({
          id: ++this._scenarioSeq,
          description: desc,
          amount: Number(amt.toFixed(2)),
          category: f.querySelector('#whatif-category').value,
        });
        this._refreshWhatIf();
        return;
      }
      if (e.target.id !== 'form-add-expense') return;
      e.preventDefault();
 
     const form = e.target;
      const amountInput = form.querySelector('#expense-amount');
      const descInput = form.querySelector('#expense-desc');
      const categorySelect = form.querySelector('#expense-category');
      const methodSelect = form.querySelector('#expense-method');
      const dateInput = form.querySelector('#expense-date');
 
      const rawAmount = amountInput.value.trim();
      const rawDesc = descInput.value.trim();
      const amount = parseFloat(rawAmount);
 
      if (!rawDesc) {
        this.showError('Description is required. Please specify what you spent on.');
        descInput.focus();
        return;
      }
 
      if (rawAmount === '' || isNaN(amount) || amount <= 0) {
        this.showError('Please enter a valid expense amount greater than ₱0.00.');
        amountInput.focus();
        return;
      }
 
      this.hideError();
 
      handlers.onAdd({
        type: 'expense',
        amount: Number(amount.toFixed(2)),
        description: rawDesc,
        category: categorySelect.value || 'Food & Drinks',
        paymentMethod: methodSelect?.value || 'Cash',
        date: dateInput.value || this.todayISO(),
      });
    });
  }
 
  showError(msg) {
    const errorBox = document.querySelector('#expense-error-box');
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
    const errorBox = document.querySelector('#expense-error-box');
    if (errorBox) {
      errorBox.innerHTML = '';
      errorBox.classList.add('hidden');
    }
  }
}
 
export default new ExpenseView();
 
 
