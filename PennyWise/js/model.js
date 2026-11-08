/**
 * model.js
 * Production Model Layer for PennyWise — Student Allowance & Expense Management System
 * 
 * Capabilities:
 * - Multi-user Registration, Login, Logout & Session Persistence
 * - Editable Student Profile (Full Name, Student ID, Course/Year, University, Budget Goal, Password)
 * - Multi-page Navigation Route State ('dashboard', 'allowance', 'expense', 'transactions', 'profile')
 * - Per-user Transaction Ledger (Income & Expense CRUD)
 * - Automatic Derived Financial Calculations (Balance, Total Allowance, Total Expenses, Daily Average, Savings Rate, Category Breakdown)
 * - CSV Export & Account Data Management
 */

const USERS_STORAGE_KEY = 'pennywise_users_db_v2';
const SESSION_STORAGE_KEY = 'pennywise_active_session_v2';
const TX_STORAGE_PREFIX = 'pennywise_tx_user_';

export const state = {
  currentUser: null,        // null when logged out, or user object when logged in
  currentPage: 'dashboard', // 'dashboard' | 'allowance' | 'expense' | 'transactions' | 'profile'
  authMode: 'login',        // 'login' | 'register'
  transactions: [],
  totals: {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    allowanceCount: 0,
    expenseCount: 0,
    savingsRate: 0,
    budgetGoal: 2000,
    budgetRemaining: 2000,
    budgetUsedPercent: 0,
  },
  categoryBreakdown: [],
  allowanceBreakdown: [],
  currentFilter: {
    type: 'all',
    category: 'all',
    searchQuery: '',
    sortBy: 'newest', // 'newest' | 'oldest' | 'highest' | 'lowest'
  },
};

/* ==========================================================================
   1. Storage Helpers
   ========================================================================== */
const getStoredUsers = function () {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading users from localStorage:', err);
  }
  return [];
};

const saveStoredUsers = function (users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
};

const persistCurrentUserTransactions = function () {
  if (!state.currentUser) return;
  try {
    const txKey = TX_STORAGE_PREFIX + state.currentUser.id;
    localStorage.setItem(txKey, JSON.stringify(state.transactions));
  } catch (err) {
    console.error('Error saving user transactions:', err);
  }
};

const loadUserTransactions = function (userId) {
  try {
    const txKey = TX_STORAGE_PREFIX + userId;
    const raw = localStorage.getItem(txKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state.transactions = parsed;
        calculateTotals();
        return;
      }
    }
  } catch (err) {
    console.error('Error loading user transactions:', err);
  }
  state.transactions = [];
  persistCurrentUserTransactions();
  calculateTotals();
};

/* ==========================================================================
   2. Authentication & Session Management
   ========================================================================== */

/**
 * Restore active session on app boot
 */
export const initSession = function () {
  const users = getStoredUsers();
  try {
    const sessionUserId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionUserId) {
      const found = users.find((u) => u.id === sessionUserId);
      if (found) {
        state.currentUser = { ...found };
        loadUserTransactions(found.id);
        return;
      }
    }
  } catch (err) {
    console.error('Session restore failed:', err);
  }
  // If no session exists yet, stays null (shows Login screen)
  state.currentUser = null;
  state.transactions = [];
};

/**
 * Register a brand new student account
 * @param {Object} userData { fullName, email, password, studentId, course, university, allowanceCycle, budgetGoal }
 */
export const registerUser = function (userData) {
  const fullName = (userData.fullName || '').trim();
  const email = (userData.email || '').trim().toLowerCase();
  const password = userData.password || '';

  if (!fullName) throw new Error('Please enter your full name.');
  if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    throw new Error('An account with this email already exists. Please log in instead.');
  }

  const colors = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2'];
  const randomColor = colors[users.length % colors.length];

  const newUser = {
    id: 'usr-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    fullName,
    email,
    password,
    studentId: (userData.studentId || '').trim(),
    course: (userData.course || 'College Student').trim(),
    university: (userData.university || 'Davao Oriental State University').trim(),
    allowanceCycle: userData.allowanceCycle || 'Weekly',
    budgetGoal: Number(userData.budgetGoal) > 0 ? Number(userData.budgetGoal) : 1500,
    avatarColor: randomColor,
    createdAt: new Date().toISOString().split('T')[0],
  };

  users.push(newUser);
  saveStoredUsers(users);

  state.currentUser = { ...newUser };
  state.transactions = [];
  persistCurrentUserTransactions();
  calculateTotals();

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, newUser.id);
  } catch (e) {}

  state.currentPage = 'dashboard';
  return state.currentUser;
};

/**
 * Log in an existing student account
 * @param {string} email 
 * @param {string} password 
 */
export const loginUser = function (email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Please enter your email address.');
  if (!password) throw new Error('Please enter your password.');

  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password. Please check your credentials or create a new account.');
  }

  state.currentUser = { ...user };
  loadUserTransactions(user.id);
  state.currentPage = 'dashboard';

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, user.id);
  } catch (e) {}

  return state.currentUser;
};

/**
 * Log out current student
 */
export const logoutUser = function () {
  state.currentUser = null;
  state.transactions = [];
  state.currentPage = 'dashboard';
  state.authMode = 'login';
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {}
};

/**
 * Update current user's profile information
 * @param {Object} profileUpdates 
 */
export const updateUserProfile = function (profileUpdates) {
  if (!state.currentUser) throw new Error('No active user session.');

  const fullName = (profileUpdates.fullName || '').trim();
  const email = (profileUpdates.email || '').trim().toLowerCase();

  if (!fullName) throw new Error('Full Name cannot be empty.');
  if (!email || !email.includes('@')) throw new Error('Please provide a valid email address.');

  const users = getStoredUsers();
  const emailConflict = users.find(
    (u) => u.email.toLowerCase() === email && u.id !== state.currentUser.id
  );
  if (emailConflict) {
    throw new Error('That email address is already in use by another account.');
  }

  const budgetGoal = Number(profileUpdates.budgetGoal);
  if (isNaN(budgetGoal) || budgetGoal < 0) {
    throw new Error('Spending budget goal must be a valid non-negative number.');
  }

  const updatedUser = {
    ...state.currentUser,
    fullName,
    email,
    studentId: (profileUpdates.studentId || '').trim(),
    course: (profileUpdates.course || '').trim(),
    university: (profileUpdates.university || '').trim(),
    allowanceCycle: profileUpdates.allowanceCycle || state.currentUser.allowanceCycle,
    budgetGoal: Number(budgetGoal.toFixed(2)),
    avatarColor: profileUpdates.avatarColor || state.currentUser.avatarColor,
  };

  if (profileUpdates.newPassword && profileUpdates.newPassword.trim() !== '') {
    if (profileUpdates.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    updatedUser.password = profileUpdates.newPassword;
  }

  const idx = users.findIndex((u) => u.id === state.currentUser.id);
  if (idx !== -1) {
    users[idx] = updatedUser;
    saveStoredUsers(users);
  }

  state.currentUser = updatedUser;
  calculateTotals();
  return state.currentUser;
};

/* ==========================================================================
   3. Navigation & View State
   ========================================================================== */
export const setPage = function (pageName) {
  const validPages = ['dashboard', 'allowance', 'expense', 'transactions', 'profile'];
  if (validPages.includes(pageName)) {
    state.currentPage = pageName;
  }
};

export const setAuthMode = function (mode) {
  state.authMode = mode === 'register' ? 'register' : 'login';
};

/* ==========================================================================
   4. Automatic Financial Calculations (Derived Values)
   ========================================================================== */
export const calculateTotals = function () {
  let income = 0;
  let expenses = 0;
  let allowanceCount = 0;
  let expenseCount = 0;
  const expByCat = {};
  const incByCat = {};

  state.transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      income += amt;
      allowanceCount++;
      const cat = tx.category || 'Other Allowance';
      incByCat[cat] = (incByCat[cat] || 0) + amt;
    } else {
      expenses += amt;
      expenseCount++;
      const cat = tx.category || 'Other Expenses';
      expByCat[cat] = (expByCat[cat] || 0) + amt;
    }
  });

  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;
  const budgetGoal = state.currentUser ? Number(state.currentUser.budgetGoal) || 1500 : 1500;
  const budgetRemaining = budgetGoal - expenses;
  const budgetUsedPercent = budgetGoal > 0 ? Math.min(100, (expenses / budgetGoal) * 100) : 0;

  state.totals = {
    totalIncome: Number(income.toFixed(2)),
    totalExpenses: Number(expenses.toFixed(2)),
    balance: Number(balance.toFixed(2)),
    transactionCount: state.transactions.length,
    allowanceCount,
    expenseCount,
    savingsRate: Number(savingsRate.toFixed(1)),
    budgetGoal: Number(budgetGoal.toFixed(2)),
    budgetRemaining: Number(budgetRemaining.toFixed(2)),
    budgetUsedPercent: Number(budgetUsedPercent.toFixed(1)),
  };

  state.categoryBreakdown = Object.keys(expByCat)
    .map((category) => {
      const total = expByCat[category];
      const percentage = expenses > 0 ? (total / expenses) * 100 : 0;
      return {
        category,
        total: Number(total.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
      };
    })
    .sort((a, b) => b.total - a.total);

  state.allowanceBreakdown = Object.keys(incByCat)
    .map((category) => {
      const total = incByCat[category];
      const percentage = income > 0 ? (total / income) * 100 : 0;
      return {
        category,
        total: Number(total.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
      };
    })
    .sort((a, b) => b.total - a.total);
};

/* ==========================================================================
   5. Transaction CRUD Operations
   ========================================================================== */
export const addTransaction = function (txData) {
  const amount = Number(txData.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Transaction amount must be a positive number greater than ₱0.00.');
  }
  const description = (txData.description || '').trim();
  if (!description) {
    throw new Error('Transaction description cannot be empty.');
  }

  const newTx = {
    id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    type: txData.type === 'income' ? 'income' : 'expense',
    amount: Number(amount.toFixed(2)),
    description,
    category: txData.category || (txData.type === 'income' ? 'Weekly Allowance' : 'Food & Drinks'),
    paymentMethod: txData.paymentMethod || 'Cash',
    date: txData.date || new Date().toISOString().split('T')[0],
    createdAt: Date.now(),
  };

  state.transactions.unshift(newTx);
  calculateTotals();
  persistCurrentUserTransactions();
  return newTx;
};

export const editTransaction = function (id, updatedData) {
  const index = state.transactions.findIndex((tx) => tx.id === id);
  if (index === -1) {
    throw new Error('Transaction record not found.');
  }

  const amount = Number(updatedData.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be greater than ₱0.00.');
  }
  const description = (updatedData.description || '').trim();
  if (!description) {
    throw new Error('Description cannot be empty.');
  }

  state.transactions[index] = {
    ...state.transactions[index],
    amount: Number(amount.toFixed(2)),
    description,
    category: updatedData.category || state.transactions[index].category,
    paymentMethod: updatedData.paymentMethod || state.transactions[index].paymentMethod || 'Cash',
    date: updatedData.date || state.transactions[index].date,
    updatedAt: Date.now(),
  };

  calculateTotals();
  persistCurrentUserTransactions();
  return state.transactions[index];
};

export const deleteTransaction = function (id) {
  const initialLen = state.transactions.length;
  state.transactions = state.transactions.filter((tx) => tx.id !== id);
  if (state.transactions.length === initialLen) {
    throw new Error('Transaction could not be found to delete.');
  }
  calculateTotals();
  persistCurrentUserTransactions();
  return true;
};

export const getTransactionById = function (id) {
  return state.transactions.find((tx) => tx.id === id) || null;
};

export const getAllowances = function () {
  return state.transactions.filter((tx) => tx.type === 'income');
};

export const getExpenses = function () {
  return state.transactions.filter((tx) => tx.type === 'expense');
};

export const clearAllUserTransactions = function () {
  state.transactions = [];
  calculateTotals();
  persistCurrentUserTransactions();
};

/* ==========================================================================
   6. Filtering, Sorting & CSV Export
   ========================================================================== */
export const setFilter = function (filterUpdates) {
  state.currentFilter = {
    ...state.currentFilter,
    ...filterUpdates,
  };
};

export const getFilteredTransactions = function () {
  const { type, category, searchQuery, sortBy } = state.currentFilter;

  const filtered = state.transactions.filter((tx) => {
    if (type && type !== 'all' && tx.type !== type) return false;
    if (category && category !== 'all' && tx.category !== category) return false;
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchMethod) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date) || a.createdAt - b.createdAt;
    }
    if (sortBy === 'highest') {
      return b.amount - a.amount;
    }
    if (sortBy === 'lowest') {
      return a.amount - b.amount;
    }
    // default: newest
    return new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt;
  });
};

export const getAllUniqueCategories = function () {
  const set = new Set();
  state.transactions.forEach((tx) => {
    if (tx.category) set.add(tx.category);
  });
  return Array.from(set).sort();
};

export const exportTransactionsCSV = function () {
  const rows = [
    ['Date', 'Type', 'Category', 'Description', 'Payment Method', 'Amount (PHP)'],
  ];
  state.transactions.forEach((tx) => {
    const sign = tx.type === 'income' ? '' : '-';
    rows.push([
      tx.date,
      tx.type === 'income' ? 'Allowance' : 'Expense',
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${(tx.paymentMethod || 'Cash').replace(/"/g, '""')}"`,
      `${sign}${tx.amount.toFixed(2)}`,
    ]);
  });
  return rows.map((r) => r.join(',')).join('\n');
};
