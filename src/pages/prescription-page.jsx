import React from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';

// Sample data for prescriptions
const prescriptionsData = [
  {
    id: '1',
    patientName: 'Emma Wilson',
    patientId: 'P1001',
    doctorName: 'Dr. John Smith',
    medication: 'Amoxicillin 500mg',
    dosage: '1 tablet three times daily',
    startDate: '2025-04-18',
    endDate: '2025-04-25',
    status: 'Active',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=5',
    notes: 'Take with food. Complete full course.'
  },
  {
    id: '2',
    patientName: 'Marcus Johnson',
    patientId: 'P1002',
    doctorName: 'Dr. Sarah Johnson',
    medication: 'Hydrochlorothiazide 25mg',
    dosage: '1 tablet daily in the morning',
    startDate: '2025-04-15',
    endDate: '2025-05-15',
    status: 'Active',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=6',
    notes: 'Monitor blood pressure weekly.'
  },
  {
    id: '3',
    patientName: 'Olivia Chen',
    patientId: 'P1003',
    doctorName: 'Dr. Michael Chen',
    medication: 'Fluoxetine 20mg',
    dosage: '1 capsule daily',
    startDate: '2025-03-30',
    endDate: '2025-06-30',
    status: 'Active',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=7',
    notes: 'Follow-up appointment in 4 weeks.'
  },
  {
    id: '4',
    patientName: 'Robert Garcia',
    patientId: 'P1004',
    doctorName: 'Dr. Emily Rodriguez',
    medication: 'Cetirizine 10mg',
    dosage: '1 tablet daily',
    startDate: '2025-04-10',
    endDate: '2025-04-24',
    status: 'Completed',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=8',
    notes: 'For seasonal allergies.'
  }
];

// Table columns configuration
const columns = [
  {
    key: 'patient',
    label: 'PATIENT',
    render: (item) => (
      <div className="flex items-center gap-4">
        <Avatar src={item.avatar} size="sm" />
        <div>
          <div className="font-medium">{item.patientName}</div>
          <div className="text-default-500 text-xs">ID: {item.patientId}</div>
        </div>
      </div>
    )
  },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'medication', label: 'MEDICATION' },
  { key: 'startDate', label: 'START DATE' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' }
];

// Form fields for add/edit dialog
const formFields = [
  { key: 'patientName', label: 'Patient Name', type: 'text', required: true },
  { key: 'patientId', label: 'Patient ID', type: 'text', required: true },
  { key: 'doctorName', label: 'Doctor Name', type: 'text', required: true },
  { key: 'medication', label: 'Medication', type: 'text', required: true },
  { key: 'dosage', label: 'Dosage', type: 'text', required: true },
  { key: 'startDate', label: 'Start Date', type: 'date', required: true },
  { key: 'endDate', label: 'End Date', type: 'date', required: true },
  { key: 'notes', label: 'Notes', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]}
];

// Initial form data for new prescriptions
const initialFormData = {
  patientName: '',
  patientId: '',
  doctorName: '',
  medication: '',
  dosage: '',
  startDate: '',
  endDate: '',
  status: 'Active',
  avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=10',
  notes: ''
};

function PrescriptionPage() {
  return (
    <CrudTemplate
      title="Prescriptions"
      description="Manage patient prescriptions"
      icon="lucide:pill"
      columns={columns}
      data={prescriptionsData}
      initialFormData={initialFormData}
      formFields={formFields}
      addButtonLabel="Add Prescription"
    />
  );
}

export default PrescriptionPage;