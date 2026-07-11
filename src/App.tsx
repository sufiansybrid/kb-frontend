import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth, RequireAdmin } from './components/layout/Guards';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddUrlPage } from './pages/AddUrlPage';
import { UploadPage } from './pages/UploadPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminLogsPage } from './pages/AdminLogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Increased duration so users have time to read the message (3.5 seconds)
          duration: 3500,
          style: {
            fontSize: '13px',
            fontWeight: '500',
            maxWidth: '380px',
            padding: '12px 16px',
            color: '#1A1A1A',
            background: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
            wordBreak: 'break-word', // Prevents long error strings from breaking layout
          },
          success: {
            iconTheme: {
              primary: '#425C52',
              secondary: '#FFF'
            },
            style: {
              border: '1px solid rgba(66, 92, 82, 0.15)', // Subtle matching green border
            }
          },
          error: {
            iconTheme: {
              primary: '#D9383A', // Clean crimson error color
              secondary: '#FFF'
            },
            style: {
              border: '1px solid rgba(217, 56, 58, 0.15)', // Matching red border
            },
            // Keep errors on screen slightly longer if they contain heavy details
            duration: 4500,
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected – all roles */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-url" element={<AddUrlPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Admin only */}
            <Route element={<RequireAdmin />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
