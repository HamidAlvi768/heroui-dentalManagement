import React from 'react';
import { CrudTemplate } from '../components/crud-template';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'patientName', label: 'Patient Name' },
  { key: 'doctorName', label: 'Doctor Name' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
];

const initialFormData = {
  patientName: '',
  doctorName: '',
  date: '',
  time: '',
  status: 'Scheduled'
};

const formFields = [
  { key: 'patientName', label: 'Patient Name', type: 'text', required: true },
  { key: 'doctorName', label: 'Doctor Name', type: 'text', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'time', label: 'Time', type: 'time', required: true },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select', 
    options: ['Scheduled', 'Completed', 'Cancelled'], 
    required: true 
  }
];

const mockData = [
  {
    id: '1',
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    date: '2024-03-20',
    time: '10:00',
    status: 'Scheduled'
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    doctorName: 'Dr. Johnson',
    date: '2024-03-21',
    time: '14:30',
    status: 'Completed'
  }
];

function AppointmentsPage() {
  return (
    <CrudTemplate
      title="Appointments"
      description="Manage patient appointments"
      icon="lucide:calendar"
      columns={columns}
      data={mockData}
      initialFormData={initialFormData}
      formFields={formFields}
      onSave={(data, isEditing) => {
        console.log('Save appointment:', data, 'isEditing:', isEditing);
      }}
      onDelete={(item) => {
        console.log('Delete appointment:', item);
      }}
    />
  );
}

export default AppointmentsPage; 