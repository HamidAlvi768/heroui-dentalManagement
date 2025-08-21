import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Dashboard } from "./components/dashboard";
import DoctorsPage from "./pages/doctors-page";
import PatientsPage from "./pages/patients-page";
import PatientDetailsPage from "./pages/patient-details-page";
import AppointmentsPage from "./pages/appointments-page";
import PrescriptionPage from "./pages/prescription-page";
import InventoryPage from "./pages/inventory-page";
import ReportsPage from "./pages/reports-page";
import ProfilePage from "./pages/profile-page";
import SettingsPage from "./pages/settings-page";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import UsersPage from "./pages/settings/users-page";
import InvoicesPage from "./pages/invoices-page";
import ExpensePage from "./pages/expense-page";
import CategoriesPage from "./pages/settings/categories-page";
import ForgotPasswordPage from "./pages/forgot-password";
import ApplicationSettings from "./pages/settings/application-settings";
import ConfigurationSettings from "./pages/settings/generic-records";
import EntitiesPage from "./pages/settings/entities-page";
import GenericRecordsPage from "./pages/settings/generic-records";
// import Test from "./pages/test";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/dashboard" />;
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex-1 w-0 overflow-auto">{children}</div>
    </div>
  );
}


export default function App() {
  const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

  return (
    // <Router basename='/jantrah/react/dental/'>
    <Router basename={isLocalhost ? "/" : "/dental-lite/"}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Navigate to="/login" />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <PrivateRoute>
              <AppLayout>
                <DoctorsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <AppLayout>
                <PatientsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <PatientDetailsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <AppLayout>
                <AppointmentsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <PrivateRoute>
              <AppLayout>
                <PrescriptionPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/categories"
          element={
            <PrivateRoute>
              <AppLayout>
                <CategoriesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <AppLayout>
                <InventoryPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <AppLayout>
                <ReportsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/users"
          element={
            <PrivateRoute>
              <AppLayout>
                <UsersPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/application"
          element={
            <PrivateRoute>
              <AppLayout>
                <ApplicationSettings />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/generic-records/:entityType"
          element={
            <PrivateRoute>
              <AppLayout>
                <GenericRecordsPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/entities"
          element={
            <PrivateRoute>
              <AppLayout>
                <EntitiesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/test"
          element={
            <PrivateRoute>
              <AppLayout>
                <Test />
              </AppLayout>
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/invoices/"
          element={
            <PrivateRoute>
              <AppLayout>
                <InvoicesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/:userid"
          element={
            <PrivateRoute>
              <AppLayout>
                <InvoicesPage />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <AppLayout>
                <ExpensePage />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
