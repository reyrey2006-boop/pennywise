/**
 * controller.js
 * Central Application Controller for PennyWise (Multi-Page Production Edition)
 * 
 * Coordinates:
 * - Authentication (Login, Register, Logout, Session Recovery)
 * - Multi-Page Navigation Router ('dashboard', 'allowance', 'expense', 'transactions', 'profile')
 * - All 6 View Modules (AuthView, NavigationView, DashboardView, AllowanceView, ExpenseView, TransactionView, ProfileView)
 * - Edit Transaction Modal & In-Page Confirmation Dialog
 * - CSV Data Export
 */

import * as model from './model.js';
import authView from './views/AuthView.js';
import navigationView from './views/NavigationView.js';
import dashboardView from './views/DashboardView.js';
import allowanceView from './views/AllowanceView.js';
import expenseView from './views/ExpenseView.js';
import transactionView from './views/TransactionView.js';
import profileView from './views/ProfileView.js';

/* ==========================================================================
   1. Toast Notification System
   ========================================================================== */
const showToast = function (message, type = 'success') {
  const toastContainer = document.querySelector('#toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-message">${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

/* ==========================================================================
   2. Master Layout & Multi-Page Renderer
   ========================================================================== */
const renderApp = function () {
  const authScreen = document.querySelector('#auth-container');
  const appShell = document.querySelector('#app-shell');

  // If no user is logged in, show Login / Register screen
  if (!model.state.currentUser) {
    authScreen?.classList.remove('hidden');
    appShell?.classList.add('hidden');
    authView.render(model.state);
    return;
  }

  // User is logged in: hide Auth screen, show App Shell
  authScreen?.classList.add('hidden');
  appShell?.classList.remove('hidden');

  // Render Sidebar Menu & Top Bar
  navigationView.render(model.state);

  // Toggle active page section visibility
  const pageIds = ['dashboard', 'allowance', 'expense', 'transactions', 'profile'];
  pageIds.forEach((id) => {
    const el = document.querySelector(`#page-${id}`);
    if (el) {
      if (id === model.state.currentPage) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Render the active page's View with fresh state
  const current = model.state.currentPage;
  if (current === 'dashboard') {
    dashboardView.render(model.state);
  } else if (current === 'allowance') {
    allowanceView.render({
      totals: model.state.totals,
      allowances: model.getAllowances(),
      allowanceBreakdown: model.state.allowanceBreakdown,
    });
  } else if (current === 'expense') {
    expenseView.render({
      totals: model.state.totals,
      expenses: model.getExpenses(),
      categoryBreakdown: model.state.categoryBreakdown,
    });
  } else if (current === 'transactions') {
    transactionView.render({
      transactions: model.getFilteredTransactions(),
      filter: model.state.currentFilter,
      categories: model.getAllUniqueCategories(),
    });
  } else if (current === 'profile') {
    profileView.render(model.state);
  }
};

/* ==========================================================================
   3. Authentication Controllers
   ========================================================================== */
const controlAuthSwitchMode = function (mode) {
  model.setAuthMode(mode);
  authView.render(model.state);
};

const controlLogin = function (email, password) {
  try {
    const user = model.loginUser(email, password);
    renderApp();
    showToast(`Welcome back, ${user.fullName}!`, 'success');
  } catch (err) {
    authView.showError(err.message);
  }
};

const controlRegister = function (userData) {
  try {
    const user = model.registerUser(userData);
    renderApp();
    showToast(`Account created! Welcome to PennyWise, ${user.fullName}.`, 'success');
  } catch (err) {
    authView.showError(err.message);
  }
};

const controlLogout = function () {
  showConfirmModal(
    'Sign Out',
    'Are you sure you want to log out of your PennyWise account?',
    () => {
      model.logoutUser();
      renderApp();
      showToast('You have been signed out safely.', 'info');
    }
  );
};

/* ==========================================================================
   4. Navigation Controller
   ========================================================================== */
const controlNavigate = function (targetPage) {
  model.setPage(targetPage);
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ==========================================================================
   5. Transaction CRUD Controllers
   ========================================================================== */
const controlAddAllowance = function (txData) {
  try {
    const newTx = model.addTransaction(txData);
    renderApp();
    showToast(`Allowance of ₱${newTx.amount.toFixed(2)} saved!`, 'success');
  } catch (err) {
    allowanceView.showError(err.message);
  }
};

const controlAddExpense = function (txData) {
  try {
    const newTx = model.addTransaction(txData);
    renderApp();
    showToast(`Expense of ₱${newTx.amount.toFixed(2)} recorded!`, 'success');
  } catch (err) {
    expenseView.showError(err.message);
  }
};

const controlDeleteTransaction = function (id) {
  const tx = model.getTransactionById(id);
  if (!tx) {
    showToast('Transaction record not found.', 'error');
    return;
  }

  showConfirmModal(
    'Delete Transaction',
    `Are you sure you want to delete "${tx.description}" (${tx.type === 'income' ? '+' : '-'}₱${tx.amount.toFixed(2)})?`,
    () => {
      try {
        model.deleteTransaction(id);
        renderApp();
        showToast('Transaction deleted.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
};

/* ==========================================================================
   6. Filter, Search & CSV Export Controllers
   ========================================================================== */
const controlFilterTransactions = function (filterOptions) {
  model.setFilter(filterOptions);
  transactionView.render({
    transactions: model.getFilteredTransactions(),
    filter: model.state.currentFilter,
    categories: model.getAllUniqueCategories(),
  });
};

const controlSearchTransactions = function (query) {
  model.setFilter({ searchQuery: query });
  transactionView.render({
    transactions: model.getFilteredTransactions(),
    filter: model.state.currentFilter,
    categories: model.getAllUniqueCategories(),
  });
};

const controlExportCSV = function () {
  try {
    const csvContent = model.exportTransactionsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `PennyWise_Transactions_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Transactions exported to CSV!', 'success');
  } catch (err) {
    showToast('Failed to export CSV.', 'error');
  }
};

/* ==========================================================================
   7. Profile & Account Settings Controllers
   ========================================================================== */
const controlUpdateProfile = function (updates) {
  try {
    model.updateUserProfile(updates);
    renderApp();
    profileView.showAlert('Your student profile and budget settings have been updated!', 'success');
    showToast('Profile saved!', 'success');
  } catch (err) {
    profileView.showAlert(err.message, 'error');
  }
};

const controlClearAllData = function () {
  showConfirmModal(
    'Clear All Records',
    'Are you sure you want to permanently delete all your recorded allowances and expenses? This cannot be undone.',
    () => {
      model.clearAllUserTransactions();
      renderApp();
      showToast('All transaction records cleared.', 'info');
    }
  );
};

/* ==========================================================================
   8. Edit Transaction Modal & Confirmation Modal
   ========================================================================== */
const editModal = document.querySelector('#edit-modal');
const editForm = document.querySelector('#form-edit-transaction');
const editErrorBox = document.querySelector('#edit-error-box');
let currentEditingId = null;

const controlEditTransaction = function (id) {
  const tx = model.getTransactionById(id);
  if (!tx) {
    showToast('Transaction not found.', 'error');
    return;
  }

  currentEditingId = tx.id;
  const modalTitle = document.querySelector('#edit-modal-title');
  const amountInput = document.querySelector('#edit-amount');
  const descInput = document.querySelector('#edit-desc');
  const categorySelect = document.querySelector('#edit-category');
  const methodSelect = document.querySelector('#edit-method');
  const dateInput = document.querySelector('#edit-date');

  if (modalTitle) {
    modalTitle.textContent = `Edit ${tx.type === 'income' ? 'Allowance' : 'Expense'}`;
  }
  if (amountInput) amountInput.value = tx.amount;
  if (descInput) descInput.value = tx.description;
  if (dateInput) dateInput.value = tx.date;
  if (methodSelect) methodSelect.value = tx.paymentMethod || 'Cash';

  if (categorySelect) {
    if (tx.type === 'income') {
      categorySelect.innerHTML = `
        <option value="Weekly Allowance">Weekly Allowance</option>
        <option value="Monthly Allowance">Monthly Allowance</option>
        <option value="Parents / Family">Parents / Family Support</option>
        <option value="Scholarship / Stipend">Scholarship / Stipend</option>
        <option value="Part-time Job">Part-time Job Earnings</option>
        <option value="Other Allowance">Other Income</option>
      `;
    } else {
      categorySelect.innerHTML = `
        <option value="Food & Drinks">Food & Drinks</option>
        <option value="Transportation">Transportation / Commute</option>
        <option value="School Supplies">School Supplies & Printing</option>
        <option value="Boarding House / Rent">Boarding House / Dorm Rent</option>
        <option value="Utilities & Load">Mobile Load & Internet</option>
        <option value="Personal Care">Personal Care & Hygiene</option>
        <option value="Leisure & Entertainment">Leisure & Socials</option>
        <option value="Other Expenses">Other Necessities</option>
      `;
    }
    categorySelect.value = tx.category;
  }

  if (editErrorBox) {
    editErrorBox.innerHTML = '';
    editErrorBox.classList.add('hidden');
  }

  editModal?.classList.remove('hidden');
};

const closeEditModal = function () {
  currentEditingId = null;
  editModal?.classList.add('hidden');
  editForm?.reset();
};

const setupEditModalListeners = function () {
  document.querySelector('#btn-close-modal')?.addEventListener('click', closeEditModal);
  document.querySelector('#btn-cancel-edit')?.addEventListener('click', closeEditModal);

  editModal?.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  editForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingId) return;

    const amountInput = editForm.querySelector('#edit-amount');
    const descInput = editForm.querySelector('#edit-desc');
    const categorySelect = editForm.querySelector('#edit-category');
    const methodSelect = editForm.querySelector('#edit-method');
    const dateInput = editForm.querySelector('#edit-date');

    const rawAmount = amountInput.value.trim();
    const rawDesc = descInput.value.trim();
    const amount = parseFloat(rawAmount);

    if (!rawDesc) {
      if (editErrorBox) {
        editErrorBox.innerHTML = '<div class="alert alert-error"><span>Description cannot be empty.</span></div>';
        editErrorBox.classList.remove('hidden');
      }
      return;
    }

    if (rawAmount === '' || isNaN(amount) || amount <= 0) {
      if (editErrorBox) {
        editErrorBox.innerHTML = '<div class="alert alert-error"><span>Please enter an amount greater than ₱0.00.</span></div>';
        editErrorBox.classList.remove('hidden');
      }
      return;
    }

    try {
      model.editTransaction(currentEditingId, {
        amount,
        description: rawDesc,
        category: categorySelect.value,
        paymentMethod: methodSelect?.value || 'Cash',
        date: dateInput.value,
      });

      closeEditModal();
      renderApp();
      showToast('Transaction updated!', 'success');
    } catch (err) {
      if (editErrorBox) {
        editErrorBox.innerHTML = `<div class="alert alert-error"><span>${err.message}</span></div>`;
        editErrorBox.classList.remove('hidden');
      }
    }
  });
};

/* In-Page Confirmation Modal */
const confirmModal = document.querySelector('#confirm-modal');
const confirmTitle = document.querySelector('#confirm-modal-title');
const confirmMessage = document.querySelector('#confirm-modal-message');
let confirmCallback = null;

const showConfirmModal = function (title, message, onConfirm) {
  if (!confirmModal) {
    onConfirm();
    return;
  }
  if (confirmTitle) confirmTitle.textContent = title;
  if (confirmMessage) confirmMessage.textContent = message;
  confirmCallback = onConfirm;
  confirmModal.classList.remove('hidden');
};

const closeConfirmModal = function () {
  confirmCallback = null;
  confirmModal?.classList.add('hidden');
};

const setupConfirmModalListeners = function () {
  document.querySelector('#btn-close-confirm-modal')?.addEventListener('click', closeConfirmModal);
  document.querySelector('#btn-cancel-confirm')?.addEventListener('click', closeConfirmModal);
  document.querySelector('#btn-proceed-confirm')?.addEventListener('click', () => {
    if (typeof confirmCallback === 'function') {
      const cb = confirmCallback;
      closeConfirmModal();
      cb();
    } else {
      closeConfirmModal();
    }
  });
  confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeConfirmModal();
  });
};

/* ==========================================================================
   9. Application Initialization
   ========================================================================== */
const init = function () {
  // 1. Restore session or prepare login screen
  model.initSession();

  // 2. Render initial view state
  renderApp();

  // 3. Bind Publisher-Subscriber Handlers across all Views
  authView.addHandlerAuth({
    onSwitchMode: controlAuthSwitchMode,
    onLogin: controlLogin,
    onRegister: controlRegister,
  });

  navigationView.addHandlerNavigate(controlNavigate);
  navigationView.addHandlerLogout(controlLogout);

  dashboardView.addHandlerQuickNav(controlNavigate);

  allowanceView.addHandlerActions({
    onAdd: controlAddAllowance,
    onEdit: controlEditTransaction,
    onDelete: controlDeleteTransaction,
  });

  expenseView.addHandlerActions({
    onAdd: controlAddExpense,
    onEdit: controlEditTransaction,
    onDelete: controlDeleteTransaction,
  });

  transactionView.addHandlerActions({
    onEdit: controlEditTransaction,
    onDelete: controlDeleteTransaction,
    onFilter: controlFilterTransactions,
    onSearch: controlSearchTransactions,
    onExportCSV: controlExportCSV,
  });

  profileView.addHandlerProfile({
    onUpdateProfile: controlUpdateProfile,
    onExportCSV: controlExportCSV,
    onClearData: controlClearAllData,
    onLogout: controlLogout,
  });

  setupEditModalListeners();
  setupConfirmModalListeners();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
