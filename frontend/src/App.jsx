import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import QuickAddModal from './components/common/QuickAddModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MyItemsPage from './pages/MyItemsPage';
import AddEditItemPage from './pages/AddEditItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import ExpiringSoonPage from './pages/ExpiringSoonPage';
import ExpiredItemsPage from './pages/ExpiredItemsPage';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';
import FavoritesPage from './pages/FavoritesPage';
import ReportsPage from './pages/ReportsPage';
import TrashPage from './pages/TrashPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Protected App Layout
function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          <Outlet context={{ openQuickAdd: () => setQuickAddOpen(true) }} />
        </main>
      </div>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onItemAdded={() => {
          // Dispatches custom event to reload active views
          window.dispatchEvent(new Event('itemAdded'));
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected User Dashboard Routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/items" element={<MyItemsPage />} />
                <Route path="/items/new" element={<AddEditItemPage />} />
                <Route path="/items/edit/:id" element={<AddEditItemPage />} />
                <Route path="/items/:id" element={<ItemDetailsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/expiring-soon" element={<ExpiringSoonPage />} />
                <Route path="/expired" element={<ExpiredItemsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/trash" element={<TrashPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
