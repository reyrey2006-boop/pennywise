/**
 * TransactionView.js
 * Assigned to: Member 4 (Transaction History Developer)
 * 
 * Responsibilities:
 * - Renders the dedicated Transaction History page (#page-transactions).
 * - Displays filter controls (Type, Category, Sort Order, Live Search).
 * - Computes filtered subtotal metrics (Filtered Income, Filtered Expenses, Net Filtered Balance).
 * - Supports CSV Export so students can download their ledger for Excel/Google Sheets.
 * - Handles Edit and Delete transaction actions.
 */

import View from './View.js';

class TransactionView extends View {
  _parentElement = document.querySelector('#page-transactions');

  _generateMarkup() {
    const { transactions, filter, categories } = this._data || {
      transactions: [],
      filter: { type: 'all', category: 'all', searchQuery: '', sortBy: 'newest' },
      categories: [],
    };

    // Calculate subtotals for currently filtered view
    let filteredIncome = 0;
    let filteredExpense = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') filteredIncome += Number(tx.amount) || 0;
      else filteredExpense += Number(tx.amount) || 0;
    });
    const filteredNet = filteredIncome - filteredExpense;

    return `
      <!-- Filtered Summary Bar -->
      <div class="history-summary-bar">
        <div class="history-stat-item">
          <span>Showing Records</span>
          <strong id="tx-filter-count">${transactions.length} entries</strong>
        </div>
        <div class="history-stat-item">
          <span>Filtered Allowances</span>
          <strong class="tx-amount-income">+${this.formatCurrency(filteredIncome)}</strong>
        </div>
        <div class="history-stat-item">
          <span>Filtered Expenses</span>
          <strong class="tx-amount-expense">-${this.formatCurrency(filteredExpense)}</strong>
        </div>
        <div class="history-stat-item">
          <span>Net Total</span>
          <strong>${this.formatCurrency(filteredNet)}</strong>
        </div>
      </div>

      <div class="card table-card">
        <!-- Filter & Search Toolbar -->
        <div class="transaction-toolbar">
          <div class="toolbar-controls-full">
            <!-- Search Input -->
            <div class="search-input-wrap">
              <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
              <input 
                type="text" 
                id="tx-search-input" 
                class="form-control search-field" 
                placeholder="Search description, category, or method..." 
                value="${this.escapeHTML(filter.searchQuery || '')}"
              />
            </div>

            <!-- Type Filter -->
            <select id="tx-filter-type" class="form-control filter-select">
              <option value="all" ${filter.type === 'all' ? 'selected' : ''}>All Types</option>
              <option value="income" ${filter.type === 'income' ? 'selected' : ''}>Allowances Only (+)</option>
              <option value="expense" ${filter.type === 'expense' ? 'selected' : ''}>Expenses Only (-)</option>
            </select>

            <!-- Category Filter -->
            <select id="tx-filter-category" class="form-control filter-select">
              <option value="all" ${filter.category === 'all' ? 'selected' : ''}>All Categories</option>
              ${categories
                .map(
                  (cat) => `
                <option value="${this.escapeHTML(cat)}" ${filter.category === cat ? 'selected' : ''}>
                  ${this.escapeHTML(cat)}
                </option>
              `
                )
                .join('')}
            </select>

            <!-- Sort Order -->
            <select id="tx-sort-by" class="form-control filter-select">
              <option value="newest" ${filter.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              <option value="oldest" ${filter.sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
              <option value="highest" ${filter.sortBy === 'highest' ? 'selected' : ''}>Highest Amount</option>
              <option value="lowest" ${filter.sortBy === 'lowest' ? 'selected' : ''}>Lowest Amount</option>
            </select>

            <!-- Export CSV Button -->
            <button type="button" class="btn btn-secondary" id="btn-export-csv" title="Download CSV for Excel">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="transactions-container">
          ${
            transactions.length === 0
              ? this._generateEmptyStateMarkup()
              : this._generateTableMarkup(transactions)
          }
        </div>
      </div>
    `;
  }

  _generateTableMarkup(transactions) {
    return `
      <div class="table-responsive">
        <table class="data-table" id="transactions-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Category</th>
              <th scope="col">Method</th>
              <th scope="col">Type</th>
              <th scope="col" class="text-right">Amount</th>
              <th scope="col" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map((tx) => this._generateRowMarkup(tx)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  _generateRowMarkup(tx) {
    const isIncome = tx.type === 'income';
    const amountSign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'tx-amount-income' : 'tx-amount-expense';
    const badgeClass = isIncome ? 'badge-green' : 'badge-rose';
    const typeLabel = isIncome ? 'Allowance' : 'Expense';

    return `
      <tr class="tx-row" data-id="${tx.id}">
        <td class="tx-cell-date">${this.formatDate(tx.date)}</td>
        <td class="tx-cell-desc">
          <span class="tx-description-text">${this.escapeHTML(tx.description)}</span>
        </td>
        <td class="tx-cell-category">
          <span class="category-tag">${this.escapeHTML(tx.category)}</span>
        </td>
        <td class="tx-cell-method">
          <span class="method-label">${this.escapeHTML(tx.paymentMethod || 'Cash')}</span>
        </td>
        <td class="tx-cell-type">
          <span class="type-pill ${badgeClass}">${typeLabel}</span>
        </td>
        <td class="tx-cell-amount text-right ${amountClass}">
          <strong>${amountSign}${this.formatCurrency(tx.amount)}</strong>
        </td>
        <td class="tx-cell-actions text-center">
          <div class="action-buttons-group">
            <button 
              type="button" 
              class="btn-icon btn-edit" 
              data-id="${tx.id}" 
              title="Edit Transaction"
              aria-label="Edit transaction"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              type="button" 
              class="btn-icon btn-delete" 
              data-id="${tx.id}" 
              title="Delete Transaction"
              aria-label="Delete transaction"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  