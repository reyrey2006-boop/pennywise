/**
 * NavigationView.js
 * Application Sidebar Menu & Top Bar Navigation View
 * 
 * Responsibilities:
 * - Renders the interactive Sidebar Navigation Menu:
 *   1. Dashboard Overview
 *   2. Allowance Manager (+₱)
 *   3. Expense Tracker (-₱)
 *   4. Transaction History
 *   5. Student Profile & Settings
 * - Renders the Top Header Bar with active page title, quick balance pill, user avatar, and mobile menu toggle.
 * - Handles route switching and Logout button.
 */

import View from './View.js';

class NavigationView extends View {
  _sidebarElement = document.querySelector('#app-sidebar');
  _topbarElement = document.querySelector('#app-topbar');

  render(stateData) {
    this._data = stateData;
    if (this._sidebarElement) {
      this._sidebarElement.innerHTML = this._generateSidebarMarkup();
    }
    if (this._topbarElement) {
      this._topbarElement.innerHTML = this._generateTopbarMarkup();
    }
  }

  _generateSidebarMarkup() {
    const { currentPage, currentUser, totals } = this._data;
    const initials = this.getInitials(currentUser?.fullName);
    const avatarBg = currentUser?.avatarColor || '#2563eb';

    const navItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        badge: '',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
      },
      {
        id: 'allowance',
        label: 'Allowances',
        badge: `+${totals.allowanceCount || 0}`,
        badgeClass: 'nav-badge-green',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      },
      {
        id: 'expense',
        label: 'Expenses',
        badge: `-${totals.expenseCount || 0}`,
        badgeClass: 'nav-badge-rose',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      },
      {
        id: 'transactions',
        label: 'Transaction History',
        badge: `${totals.transactionCount || 0}`,
        badgeClass: 'nav-badge-neutral',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
      },
      {
        id: 'profile',
        label: 'My Profile',
        badge: '',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
      },
    ];

    return `
      <div class="sidebar-inner">
        <!-- Brand Header -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="22" height="22">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="sidebar-brand-text">
            <span class="sidebar-title">Penny<span>Wise</span></span>
            <span class="sidebar-subtitle">Student Finance</span>
          </div>
          <button type="button" class="sidebar-close-btn" id="btn-close-sidebar" aria-label="Close menu">&times;</button>
        </div>

        <!-- Quick Wallet Balance Box in Sidebar -->
        <div class="sidebar-wallet-card">
          <span class="wallet-label">Available Balance</span>
          <strong class="wallet-amount ${totals.balance < 0 ? 'text-danger' : ''}">${this.formatCurrency(totals.balance)}</strong>
          <div class="wallet-cycle-tag">${this.escapeHTML(currentUser?.allowanceCycle || 'Weekly')} Cycle</div>
        </div>

        <!-- Navigation Menu Links -->
        <div class="sidebar-menu-label">MAIN MENU</div>
        <nav class="sidebar-nav" aria-label="Main Navigation">
          ${navItems
            .map(
              (item) => `
            <button 
              type="button" 
              class="nav-item ${currentPage === item.id ? 'active' : ''}" 
              data-nav-page="${item.id}"
            >
              <span class="nav-item-icon">${item.icon}</span>
              <span class="nav-item-label">${item.label}</span>
              ${item.badge ? `<span class="nav-item-badge ${item.badgeClass || ''}">${item.badge}</span>` : ''}
            </button>
          `
            )
            .join('')}
        </nav>

        <!-- Bottom User Profile & Logout -->
        <div class="sidebar-footer">
          <div class="sidebar-user-card" data-nav-page="profile" title="Edit Profile">
            <div class="user-avatar" style="background-color: ${avatarBg};">${initials}</div>
            <div class="user-meta">
              <div class="user-name">${this.escapeHTML(currentUser?.fullName || 'Student')}</div>
              <div class="user-role">${this.escapeHTML(currentUser?.studentId || 'DOrSU Student')}</div>
            </div>
          </div>

          <button type="button" class="btn-logout" id="btn-sidebar-logout" title="Sign Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    `;
  }

  _generateTopbarMarkup() {
    const { currentPage, currentUser, totals } = this._data;
    const initials = this.getInitials(currentUser?.fullName);
    const avatarBg = currentUser?.avatarColor || '#2563eb';

    const pageTitles = {
      dashboard: {
        title: 'Financial Dashboard',
        subtitle: `Welcome back, ${currentUser?.fullName?.split(' ')[0] || 'Student'}! Here is your real-time financial summary.`,
      },
      allowance: {
        title: 'Allowance Manager',
        subtitle: 'Record your weekly or monthly allowances, scholarships, and extra income.',
      },
      expense: {
        title: 'Expense Tracker',
        subtitle: 'Log your daily spending on food, transportation, school supplies, and bills.',
      },
      transactions: {
        title: 'Transaction History',
        subtitle: 'Search, filter, edit, or export your complete ledger of allowances and expenses.',
      },
      profile: {
        title: 'Student Profile & Settings',
        subtitle: 'Manage your personal student credentials, budget goals, and account data.',
      },
    };

    const info = pageTitles[currentPage] || pageTitles.dashboard;

    return `
      <div class="topbar-inner">
        <div class="topbar-left">
          <button type="button" class="mobile-menu-btn" id="btn-open-sidebar" aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 class="topbar-title">${info.title}</h1>
            <p class="topbar-subtitle">${this.escapeHTML(info.subtitle)}</p>
          </div>
        </div>

        <div class="topbar-right">
          <div class="topbar-quick-actions">
            <button type="button" class="btn btn-sm btn-green-soft" data-nav-page="allowance">
              + Add Allowance
            </button>
            <button type="button" class="btn btn-sm btn-rose-soft" data-nav-page="expense">
              - Add Expense
            </button>
          </div>

          <button type="button" class="topbar-profile-pill" data-nav-page="profile" title="Go to Profile">
            <div class="user-avatar-sm" style="background-color: ${avatarBg};">${initials}</div>
            <span class="topbar-username">${this.escapeHTML(currentUser?.fullName || 'Student')}</span>
          </button>
        </div>
      </div>
    `;
  }

  addHandlerNavigate(handler) {
    const handleNavClick = (e) => {
      const navTrigger = e.target.closest('[data-nav-page]');
      if (navTrigger) {
        const targetPage = navTrigger.dataset.navPage;
        this._closeMobileDrawer();
        handler(targetPage);
      }
    };

    if (this._sidebarElement) {
      this._sidebarElement.addEventListener('click', (e) => {
        if (e.target.closest('#btn-close-sidebar')) {
          this._closeMobileDrawer();
          return;
        }
        handleNavClick(e);
      });
    }

    if (this._topbarElement) {
      this._topbarElement.addEventListener('click', (e) => {
        if (e.target.closest('#btn-open-sidebar')) {
          this._openMobileDrawer();
          return;
        }
        handleNavClick(e);
      });
    }

    const overlay = document.querySelector('#sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this._closeMobileDrawer());
    }
  }

  