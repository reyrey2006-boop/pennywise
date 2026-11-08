/**
 * ProfileView.js
 * Student Profile & Account Settings View Layer
 * 
 * Responsibilities:
 * - Renders the Student Profile card (Avatar, Full Name, Student ID, Course, University, Allowance Cycle).
 * - Provides an interactive Edit Profile form to update personal info, avatar theme color, spending budget goal, and password.
 * - Provides Data Management actions (Export CSV, Clear All Records, Log Out).
 */

import View from './View.js';

class ProfileView extends View {
  _parentElement = document.querySelector('#page-profile');

  _generateMarkup() {
    const { currentUser, totals } = this._data || {};
    if (!currentUser) return '';

    const initials = this.getInitials(currentUser.fullName);
    const avatarBg = currentUser.avatarColor || '#2563eb';
    const colors = [
      { hex: '#2563eb', name: 'Royal Blue' },
      { hex: '#059669', name: 'Emerald' },
      { hex: '#7c3aed', name: 'Violet' },
      { hex: '#db2777', name: 'Rose' },
      { hex: '#d97706', name: 'Amber' },
      { hex: '#0f172a', name: 'Slate Navy' },
    ];

    return `
      <div class="profile-grid">
        <!-- Left Column: Student ID Card & Account Summary -->
        <div class="profile-left-col">
          <div class="card student-id-card">
            <div class="student-card-banner" style="background: linear-gradient(135deg, ${avatarBg}, #0f172a);"></div>
            <div class="student-card-body">
              <div class="student-avatar-xl" style="background-color: ${avatarBg};">
                ${initials}
              </div>
              <h3 class="student-card-name">${this.escapeHTML(currentUser.fullName)}</h3>
              <p class="student-card-course">${this.escapeHTML(currentUser.course || 'College Student')}</p>
              <span class="student-id-pill">ID: ${this.escapeHTML(currentUser.studentId || 'N/A')}</span>

              <div class="student-info-list">
                <div class="student-info-row">
                  <span class="info-label">University</span>
                  <span class="info-val">${this.escapeHTML(currentUser.university || 'DOrSU')}</span>
                </div>
                <div class="student-info-row">
                  <span class="info-label">Email</span>
                  <span class="info-val">${this.escapeHTML(currentUser.email)}</span>
                </div>
                <div class="student-info-row">
                  <span class="info-label">Allowance Cycle</span>
                  <span class="info-val">${this.escapeHTML(currentUser.allowanceCycle || 'Weekly')}</span>
                </div>
                <div class="student-info-row">
                  <span class="info-label">Spending Goal</span>
                  <span class="info-val">${this.formatCurrency(currentUser.budgetGoal)}</span>
                </div>
                <div class="student-info-row">
                  <span class="info-label">Total Records</span>
                  <span class="info-val">${totals?.transactionCount || 0} transactions</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Data Management Card -->
          <div class="card panel-card">
            <div class="panel-header">
              <h3 class="panel-title">Data & Account Actions</h3>
            </div>
            <div class="panel-body account-actions-stack">
              <button type="button" class="btn btn-secondary btn-block" id="btn-profile-export">
                Download Transactions (CSV)
              </button>
              <button type="button" class="btn btn-rose-outline btn-block" id="btn-profile-clear">
                Clear All Transaction History
              </button>
              <button type="button" class="btn btn-rose btn-block" id="btn-profile-logout">
                Sign Out of Account
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Edit Profile & Preferences Form -->
        <div class="card form-card">
          <div class="form-card-header">
            <h3 class="form-heading">Edit Profile & Budget Preferences</h3>
            <p class="form-subheading">Update your student information, allowance cycle, spending limit, or password.</p>
          </div>

          <form id="form-edit-profile" class="entry-form" novalidate>
            <div id="profile-alert-box" class="form-alert-box hidden"></div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="prof-fullname" class="form-label">Full Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="prof-fullname" 
                  class="form-control" 
                  value="${this.escapeHTML(currentUser.fullName)}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label for="prof-student-id" class="form-label">Student ID Number</label>
                <input 
                  type="text" 
                  id="prof-student-id" 
                  class="form-control" 
                  value="${this.escapeHTML(currentUser.studentId || '')}" 
                  placeholder="e.g. 2024-01482"
                />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="prof-email" class="form-label">Email Address <span class="required">*</span></label>
                <input 
                  type="email" 
                  id="prof-email" 
                  class="form-control" 
                  value="${this.escapeHTML(currentUser.email)}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label for="prof-course" class="form-label">Course & Year Level</label>
                <input 
                  type="text" 
                  id="prof-course" 
                  class="form-control" 
                  value="${this.escapeHTML(currentUser.course || '')}" 
                  placeholder="e.g. BSIT - 2nd Year"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="prof-university" class="form-label">School / University</label>
              <input 
                type="text" 
                id="prof-university" 
                class="form-control" 
                value="${this.escapeHTML(currentUser.university || '')}" 
              />
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="prof-cycle" class="form-label">Allowance Frequency</label>
                <select id="prof-cycle" class="form-control">
                  <option value="Daily" ${currentUser.allowanceCycle === 'Daily' ? 'selected' : ''}>Daily Allowance</option>
                  <option value="Weekly" ${currentUser.allowanceCycle === 'Weekly' ? 'selected' : ''}>Weekly Allowance</option>
                  <option value="Bi-Weekly" ${currentUser.allowanceCycle === 'Bi-Weekly' ? 'selected' : ''}>Bi-Weekly Allowance</option>
                  <option value="Monthly" ${currentUser.allowanceCycle === 'Monthly' ? 'selected' : ''}>Monthly Allowance</option>
                </select>
              </div>

              <div class="form-group">
                <label for="prof-budget" class="form-label">Spending Budget Goal (₱)</label>
                <div class="input-with-prefix">
                  <span class="currency-prefix">₱</span>
                  <input 
                    type="number" 
                    id="prof-budget" 
                    class="form-control" 
                    value="${currentUser.budgetGoal || 1500}" 
                    step="50" 
                    min="0"
                  />
                </div>
                <span class="form-hint">Target maximum spending per cycle</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Profile Theme Color</label>
              <div class="color-picker-row">
                ${colors
                  .map(
                    (c) => `
                  <label class="color-swatch-option" title="${c.name}">
                    <input 
                      type="radio" 
                      name="prof-avatar-color" 
                      value="${c.hex}" 
                      ${avatarBg === c.hex ? 'checked' : ''} 
                    />
                    <span class="color-swatch" style="background-color: ${c.hex};"></span>
                  </label>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div class="form-group">
              <label for="prof-password" class="form-label">Change Password (Optional)</label>
              <input 
                type="password" 
                id="prof-password" 
                class="form-control" 
                placeholder="Leave blank to keep current password" 
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="btn-save-profile">
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
  addHandlerProfile(handlers) {
    if (!this._parentElement) return;

    this._parentElement.addEventListener('click', (e) => {
      if (e.target.closest('#btn-profile-export')) {
        handlers.onExportCSV();
      } else if (e.target.closest('#btn-profile-clear')) {
        handlers.onClearData();
      } else if (e.target.closest('#btn-profile-logout')) {
        handlers.onLogout();
      }
    });

    this._parentElement.addEventListener('submit', (e) => {
      if (e.target.id !== 'form-edit-profile') return;
      e.preventDefault();

      const form = e.target;
      const selectedColor = form.querySelector('input[name="prof-avatar-color"]:checked')?.value || '#2563eb';

      const updates = {
        fullName: form.querySelector('#prof-fullname')?.value || '',
        studentId: form.querySelector('#prof-student-id')?.value || '',
        email: form.querySelector('#prof-email')?.value || '',
        course: form.querySelector('#prof-course')?.value || '',
        university: form.querySelector('#prof-university')?.value || '',
        allowanceCycle: form.querySelector('#prof-cycle')?.value || 'Weekly',
        budgetGoal: form.querySelector('#prof-budget')?.value || 1500,
        avatarColor: selectedColor,
        newPassword: form.querySelector('#prof-password')?.value || '',
      };

      handlers.onUpdateProfile(updates);
    });
  }

  showAlert(msg, type = 'error') {
    const box = document.querySelector('#profile-alert-box');
    if (!box) return;
    box.innerHTML = `
      <div class="alert alert-${type}">
        <span>${this.escapeHTML(msg)}</span>
      </div>
    `;
    box.classList.remove('hidden');
  }
}

export default new ProfileView();


  
