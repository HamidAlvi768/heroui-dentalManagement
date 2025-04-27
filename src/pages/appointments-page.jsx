import React from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';

// Filter columns
const filterColumns = [
  { key: 'aptNo', label: 'APT NO' },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'patientName', label: 'PATIENT' },
  { key: 'startDate', label: 'START DATE', type: 'date' },
  { key: 'endDate', label: 'END DATE', type: 'date' },
  { key: 'status', label: 'STATUS', type: 'select', options: [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]},
];

const columns = [
  { key: 'aptNo', label: 'APT NO' },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'patientName', label: 'PATIENT' },
  { key: 'aptDate', label: 'APT DATE' },
  { key: 'aptTime', label: 'APT TIME' },
  { key: 'status', label: 'APT STATUS' },
  { 
    key: 'emailReminder', 
    label: 'EMAIL REMINDER',
    render: (item) => (
      <div className={`text-${item.emailReminder ? 'success' : 'danger'}`}>
        {item.emailReminder ? 'Sent' : 'Not Sent'}
      </div>
    )
  },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  patientId: '',
  doctorId: '',
  appointmentDate: '',
  startTime: '',
  endTime: '',
  problem: '',
  status: 'Scheduled'
};

const formFields = [
  { 
    key: 'patientId', 
    label: 'Select Patient', 
    type: 'select', 
    required: true,
    options: [
      { value: 'P1001', label: 'John Doe' },
      { value: 'P1002', label: 'Jane Smith' }
    ]
  },
  { 
    key: 'doctorId', 
    label: 'Select Doctor', 
    type: 'select', 
    required: true,
    options: [
      { value: 'D1001', label: 'Dr. John Smith' },
      { value: 'D1002', label: 'Dr. Sarah Johnson' }
    ]
  },
  { 
    key: 'appointmentDate', 
    label: 'Appointment Date', 
    type: 'date', 
    required: true 
  },
  { 
    key: 'startTime', 
    label: 'Start Time', 
    type: 'time', 
    required: true 
  },
  { 
    key: 'endTime', 
    label: 'End Time', 
    type: 'time', 
    required: true 
  },
  { 
    key: 'problem', 
    label: 'Problem', 
    type: 'textarea', 
    required: true 
  }
];

const mockData = [
  {
    id: 'A1001',
    aptNo: 'APT001',
    patientName: 'John Doe',
    doctorName: 'Dr. John Smith',
    aptDate: '2025-04-24',
    aptTime: '10:00',
    status: 'Scheduled',
    emailReminder: true,
    patientAvatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=1',
    doctorAvatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=2'
  },
  {
    id: 'A1002',
    aptNo: 'APT002',
    patientName: 'Jane Smith',
    doctorName: 'Dr. Sarah Johnson',
    aptDate: '2025-04-24',
    aptTime: '11:00',
    status: 'Completed',
    emailReminder: false,
    patientAvatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=2',
    doctorAvatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=3'
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
      addButtonLabel="Add Appointment"
      filterColumns={filterColumns}
    />
  );
}

export default AppointmentsPage;