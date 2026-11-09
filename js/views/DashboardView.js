/**
 * DashboardView.js
 * Assigned to: Member 1 (Dashboard Developer)
 * 
 * Responsibilities:
 * - Renders the dedicated Financial Dashboard page.
 * - Displays the 4 Core Financial Cards:
 *   1. Remaining Balance (Derived Value: Income - Expenses)
 *   2. Total Allowance Received
 *   3. Total Expenses Spent
 *   4. Spending Limit / Budget Goal Status
 * - Renders Expense Breakdown by Category with visual progress bars.
 * - Displays Recent Transactions preview with quick navigation to full history, Add Allowance, or Add Expense.
 */
 
import View from './View.js';
 
class DashboardView extends View {
  _parentElement = document.querySelector('#page-dashboard');
 
  _generateMarkup() {
    const { totals, categoryBreakdown, transactions, currentUser, periodHistory } = this._data;
    const {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount,
      savingsRate,
      budgetGoal,
      budgetRemaining,
      budgetUsedPercent,
    } = totals;
 
    let statusClass = 'status-positive';
    let statusLabel = 'Healthy Balance';
    let statusDesc = `You have saved ${savingsRate}% of your allowance.`;
 
    if (balance < 0) {
      statusClass = 'status-negative';
      statusLabel = 'Over Budget';
      statusDesc = 'Expenses exceed your received allowance!';
    } else if (totalIncome > 0 && balance <= totalIncome * 0.2) {
      statusClass = 'status-warning';
      statusLabel = 'Low Balance';
      statusDesc = 'Less than 20% of your allowance remains.';
    }
 
    const recentTransactions = (transactions || []).slice(0, 5);
 
    return `
      <!-- Top Summary Metric Cards -->
      <div class="dashboard-grid">
        <!-- Card 1: Remaining Balance -->
        <div class="metric-card card-balance ${statusClass}">
          <div class="card-header-flex">
            <span class="card-label">Remaining Balance</span>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </div>
          <div class="card-value balance-value" id="display-balance">${this.formatCurrency(balance)}</div>
          <div class="card-subtext">
            <span>Formula: </span>
            <code class="formula-code">${this.formatCurrency(totalIncome)} - ${this.formatCurrency(totalExpenses)}</code>
          </div>
          <p class="status-explanation">${statusDesc}</p>
        </div>
 
        <!-- Card 2: Total Allowance -->
        <div class="metric-card card-income">
          <div class="card-header-flex">
            <span class="card-label">Total Allowance</span>
            <div class="card-icon-wrap icon-income">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m0-16l-4 4m4-4l4 4" />
              </svg>
            </div>
          </div>
          <div class="card-value income-value" id="display-income">+${this.formatCurrency(totalIncome)}</div>
          <div class="card-subtext">${totals.allowanceCount} allowance record(s)</div>
        </div>
 
        <!-- Card 3: Total Expenses -->
        <div class="metric-card card-expense">
          <div class="card-header-flex">
            <span class="card-label">Total Expenses</span>
            <div class="card-icon-wrap icon-expense">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20V4m0 20l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
          <div class="card-value expense-value" id="display-expenses">-${this.formatCurrency(totalExpenses)}</div>
          <div class="card-subtext">${totals.expenseCount} expense record(s)</div>
        </div>
 
        <!-- Card 4: Spending Budget Goal -->
        <div class="metric-card card-summary">
          <div class="card-header-flex">
            <span class="card-label">${this.escapeHTML(currentUser?.allowanceCycle || 'Weekly')} Budget Goal</span>
            <div class="card-icon-wrap icon-summary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="card-value summary-value" id="display-budget-goal">${this.formatCurrency(budgetGoal)}</div>
          <div class="budget-progress-mini">
            <div class="budget-progress-bar ${budgetUsedPercent >= 90 ? 'bar-danger' : ''}" style="width: ${budgetUsedPercent}%;"></div>
          </div>
          <div class="card-subtext">
            <strong>${this.formatRange(totals.periodStart, totals.periodEnd)}</strong>
            · ${totals.periodDaysLeft} day${totals.periodDaysLeft === 1 ? '' : 's'} left
          </div>
          <div class="card-subtext">
            ${
              budgetRemaining >= 0
                ? `${this.formatCurrency(budgetRemaining)} left before limit (${budgetUsedPercent}% used)`
                : `Exceeded limit by ${this.formatCurrency(Math.abs(budgetRemaining))}!`
            }
          </div>
          ${
            totals.previousPeriod && totals.previousPeriod.hadSpending
              ? `<div class="card-subtext">Last period (${this.formatRange(totals.previousPeriod.start, totals.previousPeriod.end)}): spent ${this.formatCurrency(totals.previousPeriod.spent)} of ${this.formatCurrency(totals.previousPeriod.goal)} — ${totals.previousPeriod.withinBudget ? 'within budget ✓' : 'over budget ✗'}</div>`
              : ''
          }
        </div>
      </div>
 
${this._generateBudgetPeriodsMarkup(totals, periodHistory || [], currentUser)}
 
      <!-- Two-Column Dashboard Content: Category Breakdown & Recent Transactions -->
      <div class="dashboard-split-grid">
        <!-- Left Column: Spending Breakdown by Category -->
        <div class="card panel-card">
          <div class="panel-header">
            <h3 class="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="section-title-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Spending Breakdown by Category
            </h3>
            <button type="button" class="btn-link" data-dash-nav="expense">+ Log Expense</button>
          </div>
          <div class="panel-body">
            ${this._generateCategoryMarkup(categoryBreakdown, totalExpenses)}
          </div>
        </div>
 
        <!-- Right Column: Recent Activity -->
        <div class="card panel-card">
          <div class="panel-header">
            <h3 class="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="section-title-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Transactions (<span id="display-count">${transactionCount}</span> total)
            </h3>
            <button type="button" class="btn-link" data-dash-nav="transactions">View All &rarr;</button>
          </div>
          <div class="panel-body">
            ${this._generateRecentMarkup(recentTransactions)}
          </div>
        </div>
      </div>
    `;
  }
 
  _generateCategoryMarkup(breakdown, totalExpenses) {
    if (!breakdown || breakdown.length === 0 || totalExpenses === 0) {
      return `
        <div class="empty-panel-state">
          <p>No expenses recorded yet. Click <strong>+ Log Expense</strong> to track where your allowance goes.</p>
        </div>
      `;
    }
 
    return `
      <div class="breakdown-list">
        ${breakdown
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
              <div class="progress-fill" style="width: ${item.percentage}%;"></div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }
 
  _generateRecentMarkup(recentList) {
    if (!recentList || recentList.length === 0) {
      return `
        <div class="empty-panel-state">
          <p>No transactions recorded yet.</p>
          <div class="empty-panel-actions">
            <button type="button" class="btn btn-sm btn-green" data-dash-nav="allowance">+ Add Allowance</button>
            <button type="button" class="btn btn-sm btn-rose" data-dash-nav="expense">- Add Expense</button>
          </div>
        </div>
      `;
    }
 
    return `
      <div class="recent-list">
        ${recentList
          .map((tx) => {
            const isIncome = tx.type === 'income';
            const sign = isIncome ? '+' : '-';
            const amtClass = isIncome ? 'tx-amount-income' : 'tx-amount-expense';
            return `
              <div class="recent-item">
                <div class="recent-item-left">
                  <div class="recent-dot ${isIncome ? 'dot-green' : 'dot-rose'}"></div>
                  <div>
                    <div class="recent-desc">${this.escapeHTML(tx.description)}</div>
                    <div class="recent-meta">${this.escapeHTML(tx.category)} • ${this.formatDate(tx.date)}</div>
                  </div>
                </div>
                <div class="recent-amount ${amtClass}">
                  ${sign}${this.formatCurrency(tx.amount)}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }
  _generateSavingsMarkup(totals, unit) {
    const sv = totals.savings || { total: 0, excess: 0, leftover: 0, capped: false, thisPeriodSetAside: 0 };
    return `
      <div class="metric-card card-income" id="savings-card" style="margin-bottom:1rem">
        <span class="card-label">Savings (excess money)</span>
        <div class="card-value income-value" id="display-savings">${this.formatCurrency(sv.total)}</div>
        <div class="card-subtext">Excess received but not budgeted: ${this.formatCurrency(sv.excess)}</div>
        <div class="card-subtext">Unspent budget from finished ${unit.toLowerCase()}s: ${this.formatCurrency(sv.leftover)}</div>
        <div class="card-subtext">Set aside this ${unit.toLowerCase()} so far: ${this.formatCurrency(sv.thisPeriodSetAside)}</div>
        ${sv.capped ? `<div class="card-subtext tx-amount-expense">Shown savings are capped at your current balance because you've spent more than your budgets.</div>` : ''}
      </div>`;
  }
 
  _generateBudgetPeriodsMarkup(totals, history, currentUser) {
    const unit = { Daily: 'Day', 'Bi-Weekly': 'Fortnight', Monthly: 'Month' }[currentUser?.allowanceCycle] || 'Week';
    const prev = totals.previousPeriod;
    const next = totals.nextPeriod;
 
    const leftText = (left) =>
      left >= 0
        ? `<strong class="tx-amount-income">${this.formatCurrency(left)} left</strong>`
        : `<strong class="tx-amount-expense">${this.formatCurrency(Math.abs(left))} over</strong>`;
 
    // One card per period: received -> budgeted -> spent -> left
    const card = ({ title, start, end, income, budget, custom, spent, extra = '' }) => {
      const unbudgeted = income - budget;
      return `
      <div class="metric-card">
        <span class="card-label">${title}</span>
        <div class="card-subtext">${this.formatRange(start, end)}</div>
        <div class="card-value">${spent === null ? `<strong>${this.formatCurrency(budget)}</strong>` : leftText(budget - spent)}</div>
        <div class="card-subtext">Received ${this.formatCurrency(income)}</div>
        <div class="card-subtext">Budget ${this.formatCurrency(budget)} ${custom ? '' : '<span class="text-muted">(default)</span>'}${spent === null ? '' : ` · Spent ${this.formatCurrency(spent)}`}</div>
        ${income > 0 ? `<div class="card-subtext">${unbudgeted >= 0 ? `💰 Excess to savings: <strong>${this.formatCurrency(unbudgeted)}</strong>` : `<span class="tx-amount-expense">Budget is ${this.formatCurrency(-unbudgeted)} more than received</span>`}</div>` : ''}
        ${extra}
      </div>`;
    };
 
    const thisCard = card({
      title: `This ${unit}`,
      start: totals.periodStart,
      end: totals.periodEnd,
      income: totals.periodIncome,
      budget: totals.budgetGoal,
      custom: totals.periodBudgetCustom,
      spent: totals.periodExpenses,
      extra: `<div class="card-subtext">${totals.periodDaysLeft} day${totals.periodDaysLeft === 1 ? '' : 's'} left</div>`,
    });
    const nextCard = card({
      title: `Next ${unit}`,
      start: next.start,
      end: next.end,
      income: next.income,
      budget: next.budget,
      custom: next.custom,
      spent: null,
    });
    const lastCard = prev
      ? card({
          title: `Last ${unit}`,
          start: prev.start,
          end: prev.end,
          income: prev.income,
          budget: prev.goal,
          custom: prev.custom,
          spent: prev.spent,
        })
      : '';
 
    return `
      <div class="card panel-card" id="budget-periods">
        <div class="panel-header"><h3 class="panel-title">${unit}ly Budget Planner</h3></div>
        <div class="panel-body">
          ${this._generateSavingsMarkup(totals, unit)}
          <form id="form-period-budget" class="entry-form" novalidate>
            <div id="period-budget-error" class="form-alert-box hidden"></div>
            <div class="form-row-2">
              <div class="form-group">
                <label for="pb-period" class="form-label">Set a budget for</label>
                <select id="pb-period" class="form-control">
                  <option value="${totals.periodStart}">This ${unit} (${this.formatRange(totals.periodStart, totals.periodEnd)})</option>
                  <option value="${next.start}">Next ${unit} (${this.formatRange(next.start, next.end)})</option>
                </select>
              </div>
              <div class="form-group">
                <label for="pb-amount" class="form-label">Budget amount (₱)</label>
                <input type="number" id="pb-amount" class="form-control" min="0" step="0.01" placeholder="e.g. 1000" />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Save Budget</button>
              <button type="button" class="btn btn-secondary" id="btn-pb-reset">Use default (${this.formatCurrency(totals.defaultBudget)})</button>
            </div>
            <span class="form-hint">Example: receive ₱1,500 this ${unit.toLowerCase()} but budget only ₱1,000; next ${unit.toLowerCase()} receive ₱5,000 and budget ₱3,000.</span>
          </form>
 
          <div class="dashboard-grid" style="margin-top:1rem">
            ${thisCard}
            ${nextCard}
            ${lastCard}
          </div>
          ${
            history.length > 1
              ? `<table class="data-table" style="margin-top:1rem">
                  <thead><tr><th>Earlier ${unit}s</th><th class="text-right">Received</th><th class="text-right">Budget</th><th class="text-right">Spent</th><th class="text-right">Left</th><th class="text-right">To savings</th></tr></thead>
                  <tbody>
                    ${history.slice(1).map((h) => `
                      <tr>
                        <td>${this.formatRange(h.start, h.end)}</td>
                        <td class="text-right">${this.formatCurrency(h.income)}</td>
                        <td class="text-right">${this.formatCurrency(h.goal)}</td>
                        <td class="text-right">${this.formatCurrency(h.spent)}</td>
                        <td class="text-right">${leftText(h.left)}</td>
                        <td class="text-right">${this.formatCurrency(h.saved)}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>`
              : ''
          }
        </div>
      </div>`;
  }
 
  /** Bind the "set budget for a period" form and its reset button. */
  addHandlerPeriodBudget(handler) {
    if (!this._parentElement) return;
    this._parentElement.addEventListener('submit', (e) => {
      if (e.target.id !== 'form-period-budget') return;
      e.preventDefault();
      const f = e.target;
      const raw = f.querySelector('#pb-amount').value.trim();
      if (raw === '' || isNaN(Number(raw)) || Number(raw) < 0) {
        const box = f.querySelector('#period-budget-error');
        box.innerHTML = '<div class="alert alert-error"><span>Enter a budget amount of ₱0 or more.</span></div>';
        box.classList.remove('hidden');
        return;
      }
      handler(f.querySelector('#pb-period').value, Number(raw));
    });
    this._parentElement.addEventListener('click', (e) => {
      if (!e.target.closest('#btn-pb-reset')) return;
      const sel = this._parentElement.querySelector('#pb-period');
      if (sel) handler(sel.value, null);
    });
  }
 
  addHandlerQuickNav(handler) {
    if (!this._parentElement) return;
    this._parentElement.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-dash-nav]');
      if (btn) handler(btn.dataset.dashNav);
    });
  }
}
 
export default new DashboardView();
 