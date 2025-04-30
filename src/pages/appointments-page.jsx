import React, { useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';
import { EntityDetailDialog } from '../components/entity-detail-dialog';

// Filter columns
const filterColumns = [
  { key: 'aptNo', label: 'APT NO' },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'patientName', label: 'PATIENT' }, {
    key: 'appointmentDate',
    label: 'Appointment Date',
    type: 'date',
    required: true
  },
  {
    key: 'startTime',
    label: 'Start Time',
    type: 'select',
    required: true,
    options: Array.from({ length: 24 * 4 }, (_, i) => {
      const hours = Math.floor(i / 4).toString().padStart(2, '0');
      const minutes = (i % 4 * 15).toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { value: time, label: time };
    })
  },
  {
    key: 'endTime',
    label: 'End Time',
    type: 'select',
    required: true,
    options: Array.from({ length: 24 * 4 }, (_, i) => {
      const hours = Math.floor(i / 4).toString().padStart(2, '0');
      const minutes = (i % 4 * 15).toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { value: time, label: time };
    })
  },
  {
    key: 'status', label: 'STATUS', type: 'select', options: [
      { value: 'Scheduled', label: 'Scheduled' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Cancelled', label: 'Cancelled' }
    ]
  },
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
    type: 'select',
    required: true,
    options: Array.from({ length: 24 * 4 }, (_, i) => {
      const hours = Math.floor(i / 4).toString().padStart(2, '0');
      const minutes = (i % 4 * 15).toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { value: time, label: time };
    })
  },
  {
    key: 'endTime',
    label: 'End Time',
    type: 'select',
    required: true,
    options: Array.from({ length: 24 * 4 }, (_, i) => {
      const hours = Math.floor(i / 4).toString().padStart(2, '0');
      const minutes = (i % 4 * 15).toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return { value: time, label: time };
    })
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleViewDetail = (appointment) => {
    const mappedAppointment = {
      ...appointment,
      mrnNumber: '2504150',
      gender: 'male',
      problem: appointment.problem || '',
      patientName: appointment.patientName || 'test Patient',
      doctorName: appointment.doctorName || 'Test User',
      status: appointment.status || 'Checked In'
    };
    setSelectedAppointment(mappedAppointment);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    setSelectedAppointment(prev => ({
      ...prev,
      status: newStatus
    }));
    // Here you would typically update the status in your backend
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item)
    }
  ];

  return (
    <>
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
        customRowActions={customActions}
        onRowClick={handleViewDetail}
      />
      {selectedAppointment && (
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedAppointment}
          title={`Appointment Details - ${selectedAppointment.patientName}`}
          onEdit={() => console.log('Edit appointment:', selectedAppointment)}
          onStatusChange={handleStatusChange}
          entityType="appointment"
        />
      )}
    </>
  );
}

export default AppointmentsPage;