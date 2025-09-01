import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./components/AppLayout";
import PageLoader from "./components/PageLoader";

// Lazy load all page components for better performance
const Dashboard = lazy(() => import("./components/dashboard").then(module => ({ default: module.Dashboard })));
const DoctorsPage = lazy(() => import("./pages/doctors-page"));
const PatientsPage = lazy(() => import("./pages/patients-page"));
const PatientDetailsPage = lazy(() => import("./pages/patient-details-page"));
const AppointmentsPage = lazy(() => import("./pages/appointments-page"));
const PrescriptionPage = lazy(() => import("./pages/prescription-page"));
const InventoryPage = lazy(() => import("./pages/inventory-page"));
const ReportsPage = lazy(() => import("./pages/reports-page"));
const ProfilePage = lazy(() => import("./pages/profile-page"));
const SettingsPage = lazy(() => import("./pages/settings-page"));
const LoginPage = lazy(() => import("./pages/login"));
const SignupPage = lazy(() => import("./pages/signup"));
const UsersPage = lazy(() => import("./pages/settings/users-page"));
const InvoicesPage = lazy(() => import("./pages/invoices-page"));
const ExpensePage = lazy(() => import("./pages/expense-page"));
const CategoriesPage = lazy(() => import("./pages/settings/categories-page"));
const ForgotPasswordPage = lazy(() => import("./pages/forgot-password"));
const ApplicationSettings = lazy(() => import("./pages/settings/application-settings"));
const ConfigurationSettings = lazy(() => import("./pages/settings/generic-records"));
const EntitiesPage = lazy(() => import("./pages/settings/entities-page"));
const GenericRecordsPage = lazy(() => import("./pages/settings/generic-records"));


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
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Suspense fallback={<PageLoader />}>
                <SignupPage />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <Suspense fallback={<PageLoader />}>
                <ForgotPasswordPage />
              </Suspense>
            </PublicRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <DoctorsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <PatientsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <PatientDetailsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <AppointmentsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <PrescriptionPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/categories"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <CategoriesPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <InventoryPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ReportsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/users"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <UsersPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/application"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ApplicationSettings />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/generic-records/:entityType"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <GenericRecordsPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/entities"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <EntitiesPage />
                </Suspense>
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
                <Suspense fallback={<PageLoader />}>
                  <InvoicesPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/:userid"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <InvoicesPage />
                </Suspense>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ExpensePage />
                </Suspense>
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
