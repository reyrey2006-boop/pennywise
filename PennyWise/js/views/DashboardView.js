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
    const { totals, categoryBreakdown, transactions, currentUser } = this._data;
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
            ${
              budgetRemaining >= 0
                ? `${this.formatCurrency(budgetRemaining)} left before limit (${budgetUsedPercent}% used)`
                : `Exceeded limit by ${this.formatCurrency(Math.abs(budgetRemaining))}!`
            }
          </div>
        </div>
      </div>

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

  
