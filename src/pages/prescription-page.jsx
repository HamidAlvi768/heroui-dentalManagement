import React from 'react';
import { CrudTemplate } from '../components/crud-template';

// Filter columns
const filterColumns = [
  { key: 'examination', label: 'EXAM INVESTIGATION' },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'patientName', label: 'PATIENT' },
  { key: 'startDate', label: 'START DATE', type: 'date' },
  { key: 'endDate', label: 'END DATE', type: 'date' },
  { key: 'medicineType', label: 'MEDICINE TYPE', type: 'select', options: [
    { value: 'tablet', label: 'Tablet' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'capsule', label: 'Capsule' }
  ]},
];

const columns = [
  { 
    key: 'examination', 
    label: 'EXAM INVESTIGATION',
    render: (item) => (
      <div>
        <div className="font-medium">{item.examination}</div>
        <div className="text-default-500 text-xs">{item.description}</div>
      </div>
    )
  },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'patientName', label: 'PATIENT' },
  { key: 'date', label: 'DATE' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  patientId: '',
  examination: '',
  prescriptionDate: '',
  note: '',
  medicines: [
    {
      medicineType: '',
      medicineName: '',
      description: '',
      days: '',
      weeks: '',
      months: ''
    }
  ]
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
    key: 'examination', 
    label: 'Select Examination', 
    type: 'select', 
    required: true,
    options: [
      { value: 'general', label: 'General Checkup' },
      { value: 'followup', label: 'Follow-up' },
      { value: 'specialist', label: 'Specialist Consultation' }
    ]
  },
  { 
    key: 'prescriptionDate', 
    label: 'Prescription Date', 
    type: 'date', 
    required: true 
  },
  { 
    key: 'note', 
    label: 'Note', 
    type: 'textarea'
  }
];

const mockData = [
  {
    id: '1',
    examination: 'General Checkup',
    description: 'Regular health examination',
    doctorName: 'Dr. John Smith',
    patientName: 'Emma Wilson',
    date: '2025-04-24'
  }
];

function PrescriptionPage() {
  return (
    <CrudTemplate
      title="Prescriptions"
      description="Manage patient prescriptions"
      icon="lucide:pill"
      columns={columns}
      data={mockData}
      initialFormData={initialFormData}
      formFields={formFields}
      addButtonLabel="Add Prescription"
      filterColumns={filterColumns}
    />
  );
}

export default PrescriptionPage;