import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './components/dashboard';
import DoctorsPage from './pages/doctors-page';
import PatientsPage from './pages/patients-page';
import AppointmentsPage from './pages/appointments-page';
import PrescriptionPage from './pages/prescription-page';
import InventoryPage from './pages/inventory-page';
import ReportsPage from './pages/reports-page';
import ProfilePage from './pages/profile-page';
import SettingsPage from './pages/settings-page';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/" />;
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } />

        {/* Private Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/doctors" element={
          <PrivateRoute>
            <AppLayout>
              <DoctorsPage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/patients" element={
          <PrivateRoute>
            <AppLayout>
              <PatientsPage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute>
            <AppLayout>
              <AppointmentsPage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/prescriptions" element={
          <PrivateRoute>
            <AppLayout>
              <PrescriptionPage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/inventory" element={
          <PrivateRoute>
            <AppLayout>
              <InventoryPage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </PrivateRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}