# ⏰ Expiry Reminder — Smart Personal Household Tracker

> A modern, responsive, and aesthetic web application built for personal and family everyday life. It helps individuals remember expiry dates of food, medicines, personal care, cosmetics, and household essentials before products spoil or expire.

---

## 🌟 Key Highlights & Philosophy

- **Personal & Family Centric**: Built purely for home productivity. It completely avoids commercial inventory, sales, suppliers, or warehouse clutter.
- **Smart Expiry Tracking**: Automatically calculates days remaining and classifies every item:
  - 🟢 **Safe**: More than 30 days left
  - 🟡 **Expiring Soon**: 1 to 30 days remaining (with urgent highlights for &le; 3 days)
  - 🟠 **Expiring Today**: Reaches expiry date today (with pulsing visual alert)
  - 🔴 **Expired**: Date has passed (with safety warning notices)
- **Interactive Expiry Calendar**: Monthly calendar view with color-coded status pills and date inspection panel.
- **Automated Reminders**: Built-in `node-cron` scheduled jobs and `nodemailer` email alerts (intervals: 30 days, 15 days, 7 days, 3 days, 1 day, on expiry date, and after expiry).
- **Personal Organization**: Track items by location (*Kitchen, Refrigerator, Freezer, Bathroom, Bedroom, Medicine Cabinet, Storage Room, Pantry*), mark favorites, record consumption (+1 Mark Used), and restore soft-deleted items from Trash.
- **Exportable Personal Reports**: Instant CSV download and beautiful PDF report generation using `jspdf` and `jspdf-autotable`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React icons, Recharts, Axios, jsPDF |
| **Backend** | Node.js, Express.js, REST APIs, JWT Authentication, bcryptjs, Helmet, Express Rate Limit |
| **Database & ORM** | MySQL / MariaDB, Prisma ORM |
| **Automation & Media** | Node-cron (daily automated checks), Nodemailer (email alerts), Multer (image uploads) |

---

## 📁 Project Architecture

```
MINI PROJECT/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # Prisma MySQL schema & models
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Prisma Client instance
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, Login, Profile, Password Reset
│   │   │   ├── productController.js# CRUD, search, filter, favorites, usage counter
│   │   │   ├── categoryController.js # Default & custom categories
│   │   │   ├── notificationController.js # Alerts, unread badge, preferences
│   │   │   └── reportController.js # Overview stats, PDF/CSV export data
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT token protection
│   │   │   └── uploadMiddleware.js # Multer file upload validation
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── services/
│   │   │   ├── emailService.js     # Nodemailer template engine
│   │   │   └── cronService.js      # Daily automated expiry scanner
│   │   ├── utils/
│   │   │   ├── calculateExpiry.js  # Smart date calculation engine
│   │   │   └── seedData.js         # Default categories & demo items seed
│   │   └── index.js                # Express app entry & static frontend server
│   ├── uploads/                    # User product images directory
│   ├── .env                        # Server configuration & credentials
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── calendar/           # Interactive monthly calendar
│   │   │   ├── common/             # Navbar, Sidebar, Badges, Modals, StatCards
│   │   │   ├── dashboard/          # Distribution chart, urgent alerts, overview
│   │   │   └── items/              # ItemCard, ItemRow, CategoryIcon, DetailsModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User session & token state
│   │   │   ├── ThemeContext.jsx    # Dark/Light mode switcher
│   │   │   └── NotificationContext.jsx # Real-time notification polling
│   │   ├── pages/                  # 18 Full application pages
│   │   ├── services/               # Axios API client modules
│   │   ├── utils/                  # Date math & jsPDF export
│   │   ├── App.jsx                 # Client routes & protected layout
│   │   └── index.css               # Tailwind design system & animations
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                    # Workspace root scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MySQL / MariaDB** running on port `3306` (e.g. via XAMPP)

### 2. Database Setup
Ensure MySQL is running and database `expiry_db` exists:
```sql
CREATE DATABASE IF NOT EXISTS expiry_db;
```

### 3. Backend Setup
1. Open terminal in the `backend` folder:
   ```bash
   cd backend
   npm install
   ```
2. Initialize database tables and seed demo data:
   ```bash
   node src/utils/createTables.js
   node src/utils/seedData.js
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   *The server runs on `http://localhost:5000`.*

### 4. Frontend Setup
1. In another terminal, navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Account Credentials

For instant testing and evaluation, pre-seeded demo data is ready to use:

- **Email**: `demo@expiryreminder.local`
- **Password**: `Password123!`

*(You can also register a new account anytime from the `/register` page).*

---

## 📱 Application Pages & Routes

1. **Landing Page** (`/`): Highlighting features, household peace of mind, and quick demo access.
2. **Login** (`/login`): Secure sign-in with 1-click demo button.
3. **Register** (`/register`): Seamless onboarding with automatic category seeding.
4. **Forgot Password** (`/forgot-password`): Tokenized reset request.
5. **Reset Password** (`/reset-password`): Secure password update.
6. **Personal Dashboard** (`/dashboard`): Dynamic statistics cards, greeting overview, distribution chart, upcoming reminders, and category breakdown.
7. **My Items** (`/items`): Full inventory with multi-criteria search, filters, sorting, and Grid/List view switcher.
8. **Add Item** (`/items/new`): Comprehensive form with live smart expiry calculation and image upload.
9. **Edit Item** (`/items/edit/:id`): Edit existing product details, location, and dates.
10. **Item Details** (`/items/:id`): Full view with event history and consumption logger.
11. **My Categories** (`/categories`): 12 default household categories + user-created custom categories with color and icon selection.
12. **Expiring Soon** (`/expiring-soon`): Dedicated focus view for items expiring in 1 to 30 days.
13. **Expired Items** (`/expired`): Safety review view for items past their date.
14. **Expiry Calendar** (`/calendar`): Interactive monthly calendar with colored date indicators and side inspection drawer.
15. **Notifications** (`/notifications`): Unread counts, mark-as-read, manual check trigger, and alert history.
16. **Favorites** (`/favorites`): Fast access to pinned household essentials.
17. **Personal Reports** (`/reports`): Summary metrics with CSV and PDF export.
18. **Trash & Restore** (`/trash`): Soft-deleted items with instant restore and permanent delete options.
19. **My Profile** (`/profile`): User account details and password change.
20. **Settings** (`/settings`): Custom reminder intervals (30d, 15d, 7d, 3d, 1d, 0d), delivery channels, and theme switcher.

---

## 🔒 Security & Data Isolation
- Passwords securely hashed with **bcryptjs** (salt rounds 10).
- Stateless **JWT** authentication with protected API endpoints.
- User-level data isolation via `userId` foreign keys on all products, categories, notifications, and logs.
- Strict upload filtering for image MIME types and file sizes.
- Rate limiting protection on API endpoints.
#   e x p i r y - r e m i n d e r - f r o n t e n d  
 