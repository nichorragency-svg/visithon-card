import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLoginGate, AdminProtectedRoute } from './guards';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminShell from './layout/AdminShell';
import AdminSection from './pages/AdminSection';
import TemplatesThemesPage from './pages/TemplatesThemesPage';
import CardManagementPage from './pages/CardManagementPage';
import AdminUsersManagementPage from './pages/AdminUsersManagementPage';
import AdminCreateCardUserPage from './pages/AdminCreateCardUserPage';
import AdminManualPaymentsPage from './pages/AdminManualPaymentsPage';
import AdminPlatformPaymentSettings from './pages/AdminPlatformPaymentSettings';


export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <AdminLoginGate>
            <AdminLogin />
          </AdminLoginGate>
        }
      />
      <Route
        element={
          <AdminProtectedRoute>
            <AdminShell />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        {/* Card grid UI */}
        <Route path="users" element={<AdminUsersManagementPage />} />
        <Route path="create-card-user" element={<AdminCreateCardUserPage />} />

        <Route path="cards" element={<CardManagementPage />} />

        <Route path="payments" element={<AdminManualPaymentsPage />} />
        <Route path="analytics" element={<AdminSection title="Analytics" />} />
        <Route path="leads" element={<AdminSection title="Leads" />} />
        <Route path="templates" element={<TemplatesThemesPage />} />
        <Route path="qr-scan" element={<AdminSection title="QR & Scan" />} />
        <Route path="reminders" element={<AdminSection title="Reminders" />} />
        <Route path="packages" element={<AdminSection title="Packages" />} />
        <Route path="support" element={<AdminSection title="Support Tickets" />} />
        <Route path="settings" element={<AdminPlatformPaymentSettings />} />
      </Route>
    </Routes>
  );
}
