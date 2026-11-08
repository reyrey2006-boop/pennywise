/**
 * View.js
 * Base View Class for PennyWise MVC Framework
 * 
 * Implements standard View layer mechanics:
 * - Rendering templates to parent containers
 * - Currency formatting in Philippine Peso (₱)
 * - Readable date formatting
 * - HTML escaping for security
 */
 
export default class View {
  _data;
 
  /**
   * Render the received data to the DOM
   * @param {Object|Array} data The data to be rendered
   */
  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this._clear();
    if (this._parentElement) {
      this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }
  }
 
  /**
   * Clear parent container innerHTML
   * @protected
   */
  _clear() {
    if (this._parentElement) {
      this._parentElement.innerHTML = '';
    }
  }
 
  /**
   * Format numbers as Philippine Peso (₱)
   * @param {number} amount 
   * @returns {string} e.g., "₱1,500.00"
   */
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    const isNeg = num < 0;
    const absVal = Math.abs(num);
    return (isNeg ? '-₱' : '₱') + absVal.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
 
  /**
   * Format ISO date string (YYYY-MM-DD) into readable format
   * @param {string} dateString 
   * @returns {string} e.g., "Nov 4, 2026"
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
    const fallback = new Date(dateString);
    if (isNaN(fallback.getTime())) return dateString;
    return fallback.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
 
  /** Today's date as local YYYY-MM-DD (toISOString is UTC and can be a day off) */
  todayISO() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
 
  /** Format an ISO date range like "Nov 2 – Nov 8, 2026" */
  formatRange(startISO, endISO) {
    if (startISO === endISO) return this.formatDate(startISO);
    return `${this.formatDate(startISO)} – ${this.formatDate(endISO)}`;
  }
 
  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} str 
   * @returns {string}
   */
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
 
  /**
   * Get initials from full name
   * @param {string} name 
   * @returns {string}
   */
  getInitials(name) {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
 