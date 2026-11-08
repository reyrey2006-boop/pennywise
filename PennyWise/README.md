# PennyWise — Student Allowance & Expense Management System (Production Multi-Page Edition)

> **Davao Oriental State University (DOrSU) — Student Allowance & Expense Management System**  
> **Architecture:** Model-View-Controller (MVC) using Week 5 View Framework  
> **Technologies:** Vanilla JavaScript (ES6+ Modules & Classes), HTML5, CSS3, `localStorage`

---

## 1. Overview & Real-World Capabilities

**PennyWise** is a full-featured, production-ready web application built for college students to manage their allowances and daily expenses after deployment.

### Key Features
- **Student Authentication (Login & Registration):**
  - Register multiple student accounts with custom credentials, Student ID, Course/Year, University, and Spending Budget Goals.
  - Persistent user sessions (`localStorage`) and per-user isolated transaction ledgers.
  - New accounts begin with an empty transaction ledger and private account data.
- **Interactive Sidebar Navigation Menu & Mobile Drawer:**
  - Dedicated pages for **Dashboard**, **Allowances (+₱)**, **Expenses (-₱)**, **Transaction History**, and **My Profile**.
  - Live sidebar wallet card showing real-time available balance and allowance cycle.
- **Dedicated Allowance Manager Page:**
  - Record allowances from parents, scholarships, or part-time work.
  - Track payment method (`Cash`, `GCash`, `Maya`, `Bank Transfer`), view source breakdowns, and edit/delete allowance entries.
- **Dedicated Expense Tracker Page:**
  - Log daily campus expenses (Food, Transportation, School Supplies, Boarding House/Rent, Load/Internet).
  - View real-time category progress bars and manage expense records.
- **Complete Transaction History Page:**
  - Live search across descriptions, categories, and payment methods.
  - Filter by Type (All, Allowances, Expenses), Category, and Sort Order (Newest, Oldest, Highest, Lowest).
  - Dynamic filtered subtotal bar and **1-Click Export to CSV** for Excel/Google Sheets.
- **Editable Student Profile & Settings Page:**
  - Live digital Student ID Card with customizable avatar theme colors.
  - Edit Full Name, Student ID, Email, Course/Year, University, Allowance Frequency (Daily/Weekly/Bi-Weekly/Monthly), Spending Limit Goal, and Password.

---

## 2. Project File Structure (MVC)

```text
PennyWise/
│
├── index.html                  # Main application shell & multi-page viewport
├── README.md                   # Complete documentation & deployment guide
├── package.json                # ES Module configuration
├── start.bat                   # 1-click local server launcher (Windows)
├── start.sh                    # 1-click local server launcher (Mac/Linux)
├── app_bundle.html             # Self-contained single-file application
│
├── css/
│   └── style.css               # Full responsive stylesheet (Auth, Sidebar, Pages, Modals)
│
└── js/
    ├── model.js                # Model: Auth, User Profiles, Per-User Ledger, Calculations, CSV
    ├── controller.js           # Controller: Multi-page router & Publisher-Subscriber coordinator
    │
    └── views/
        ├── View.js             # Base View Class (Week 5 View Framework)
        ├── AuthView.js         # Login & Registration View
        ├── NavigationView.js   # Sidebar Navigation Menu & Top Bar View
        ├── DashboardView.js    # Member 1: Financial Overview, Budget Goal & Recent Activity
        ├── AllowanceView.js    # Member 2: Allowance Form, Source Breakdown & Allowance Table
        ├── ExpenseView.js      # Member 3: Expense Form, Category Breakdown & Expense Table
        ├── TransactionView.js  # Member 4: Full History, Search/Filter/Sort & CSV Export
        └── ProfileView.js      # Student ID Card, Profile Editor & Account Settings
```

---

## 3. How to Run Locally or Deploy to Production

### Run Locally
1. **Windows:** Double-click `start.bat` (or use VS Code **Live Server** on `index.html`).
2. **Mac / Linux:** Run `./start.sh` or `python3 -m http.server 8000` and open `http://localhost:8000`.
3. **Direct File Open:** Double-click `app_bundle.html` to run without any local server.

### Deploy to GitHub Pages / Netlify / Vercel
1. Push the contents of the `PennyWise` folder to a GitHub repository.
2. In GitHub, go to **Settings > Pages**, choose your `main` branch, and click **Save**.
3. Your live application will work immediately out of the box with no backend setup required.
