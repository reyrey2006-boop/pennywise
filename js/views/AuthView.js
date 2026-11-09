/**
 * AuthView.js
 * Authentication View Layer (Login & Registration Pages)
 * 
 * Responsibilities:
 * - Renders full-page Login and Registration interface when user is signed out.
 * - Supports tab switching between Sign In and Create Account.
 * - Validates registration and login inputs.
 */

import View from './View.js';

class AuthView extends View {
  _parentElement = document.querySelector('#auth-container');

  _generateMarkup() {
    const mode = this._data?.authMode || 'login';
    const isRegister = mode === 'register';

    return `
      <div class="auth-wrapper">
        <!-- Left Feature Showcase Panel -->
        <div class="auth-hero">
          <div class="auth-hero-brand">
            <div class="brand-icon-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="28" height="28">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="auth-brand-name">Penny<span>Wise</span></h1>
              <span class="auth-brand-tag">Student Allowance & Expense Tracker</span>
            </div>
          </div>

          <div class="auth-hero-content">
            <h2 class="auth-hero-heading">Take full control of your college allowance.</h2>
            <p class="auth-hero-lead">
              Track daily expenses, monitor your weekly or monthly stipend, and always know exactly how much money you have left.
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong>Real-Time Balance Calculation</strong>
                  <p>Automatically computes your remaining balance and spending limit.</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong>Dedicated Multi-Page Workspace</strong>
                  <p>Separate pages for Dashboard, Allowances, Expenses, History & Student Profile.</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong>Private Browser Storage</strong>
                  <p>Your records are safely stored per account in localStorage—even offline.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="auth-hero-footer">
            Davao Oriental State University (DOrSU) • MVC Web Application
          </div>
        </div>

        <!-- Right Auth Card Panel -->
        <div class="auth-card-panel">
          <div class="auth-card">
            <!-- Mode Switcher Tabs -->
            <div class="auth-tabs">
              <button type="button" class="auth-tab ${!isRegister ? 'active' : ''}" data-mode="login">
                Sign In
              </button>
              <button type="button" class="auth-tab ${isRegister ? 'active' : ''}" data-mode="register">
                Create Account
              </button>
            </div>

            <div id="auth-error-box" class="form-alert-box hidden"></div>

            ${isRegister ? this._generateRegisterForm() : this._generateLoginForm()}
          </div>
        </div>
      </div>
    `;
  }

  _generateLoginForm() {
    return `
      <div class="auth-form-header">
        <h3>Welcome Back!</h3>
        <p>Log in to access your student allowance dashboard.</p>
      </div>

      <form id="form-login" class="entry-form" novalidate>
        <div class="form-group">
          <label for="login-email" class="form-label">Email Address <span class="required">*</span></label>
          <input 
            type="email" 
            id="login-email" 
            class="form-control" 
            placeholder="e.g. student@dorsu.edu.ph" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="login-password" class="form-label">Password <span class="required">*</span></label>
          <input 
            type="password" 
            id="login-password" 
            class="form-control" 
            placeholder="Enter your password" 
            required 
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-login-submit">
          Sign In to PennyWise
        </button>

      </form>

      <p class="auth-switch-prompt">
        Don't have an account yet? 
        <button type="button" class="link-btn" data-switch-mode="register">Register a student account</button>
      </p>
    `;
  }

  _generateRegisterForm() {
    return `
      <div class="auth-form-header">
        <h3>Create Student Account</h3>
        <p>Set up your profile and budget preferences in seconds.</p>
      </div>

      <form id="form-register" class="entry-form" novalidate>
        <div class="form-row-2">
          <div class="form-group">
            <label for="reg-fullname" class="form-label">Full Name <span class="required">*</span></label>
            <input 
              type="text" 
              id="reg-fullname" 
              class="form-control" 
              placeholder="e.g. Maria Santos" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="reg-student-id" class="form-label">Student ID No.</label>
            <input 
              type="text" 
              id="reg-student-id" 
              class="form-control" 
              placeholder="e.g. 2026-0194" 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email" class="form-label">Email Address <span class="required">*</span></label>
          <input 
            type="email" 
            id="reg-email" 
            class="form-control" 
            placeholder="e.g. maria@dorsu.edu.ph" 
            required 
          />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="reg-course" class="form-label">Course & Year</label>
            <input 
              type="text" 
              id="reg-course" 
              class="form-control" 
              placeholder="e.g. BSIT - 2nd Year" 
            />
          </div>

          <div class="form-group">
            <label for="reg-budget" class="form-label">Spending Limit Goal (₱)</label>
            <input 
              type="number" 
              id="reg-budget" 
              class="form-control" 
              placeholder="1500" 
              value="1500"
              min="100"
              step="50"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-university" class="form-label">School / University</label>
          <input 
            type="text" 
            id="reg-university" 
            class="form-control" 
            value="Davao Oriental State University (DOrSU)" 
          />
        </div>

        <div class="form-group">
          <label for="reg-password" class="form-label">Password (min. 6 chars) <span class="required">*</span></label>
          <input 
            type="password" 
            id="reg-password" 
            class="form-control" 
            placeholder="Create a password" 
            required 
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-register-submit">
          Create My Account
        </button>
      </form>

      <p class="auth-switch-prompt">
        Already have an account? 
        <button type="button" class="link-btn" data-switch-mode="login">Sign in here</button>
      </p>
    `;
  }

  /**
   * Bind authentication events (Login, Register, Mode Switch)
   */
  addHandlerAuth(handlers) {
    if (!this._parentElement) return;

    this._parentElement.addEventListener('click', (e) => {
      // Switch mode tab
      const tabBtn = e.target.closest('.auth-tab');
      if (tabBtn) {
        handlers.onSwitchMode(tabBtn.dataset.mode);
        return;
      }

      // Switch mode link
      const switchBtn = e.target.closest('[data-switch-mode]');
      if (switchBtn) {
        handlers.onSwitchMode(switchBtn.dataset.switchMode);
        return;
      }

    });

    this._parentElement.addEventListener('submit', (e) => {
      if (e.target.id === 'form-login') {
        e.preventDefault();
        const email = document.querySelector('#login-email')?.value || '';
        const password = document.querySelector('#login-password')?.value || '';
        handlers.onLogin(email, password);
      } else if (e.target.id === 'form-register') {
        e.preventDefault();
        const userData = {
          fullName: document.querySelector('#reg-fullname')?.value || '',
          studentId: document.querySelector('#reg-student-id')?.value || '',
          email: document.querySelector('#reg-email')?.value || '',
          course: document.querySelector('#reg-course')?.value || '',
          budgetGoal: document.querySelector('#reg-budget')?.value || 1500,
          university: document.querySelector('#reg-university')?.value || '',
          password: document.querySelector('#reg-password')?.value || '',
        };
        handlers.onRegister(userData);
      }
    });
  }
showError(msg) {
    const box = document.querySelector('#auth-error-box');
    if (!box) return;
    box.innerHTML = `
      <div class="alert alert-error">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>${this.escapeHTML(msg)}</span>
      </div>
    `;
    box.classList.remove('hidden');
  }
}

export default new AuthView();
  
