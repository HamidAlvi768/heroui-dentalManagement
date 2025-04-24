import React, { useState } from 'react';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './components/dashboard';
import DoctorsPage from './pages/doctors-page';
import PatientsPage from './pages/patients-page';
import AppointmentsPage from './pages/appointments-page';

export default function App() {
  const [activePage, setActivePage] = useState('/');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'doctors':
        return <DoctorsPage />;
      case 'patients':
        return <PatientsPage />;
      case 'appointments':
        return <AppointmentsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onNavigate={setActivePage} activePage={activePage} />
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}