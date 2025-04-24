import React from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';

const columns = [
  { key: 'mrnNumber', label: 'MRN NUMBER' },
  { key: 'name', label: 'NAME' },
  { key: 'phone', label: 'PHONE' },
  { key: 'area', label: 'AREA' },
  { key: 'city', label: 'CITY' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  name: '',
  dob: '',
  gender: '',
  status: 'Active',
  cnicPassport: '',
  insuranceProvider: '',
  phone: '',
  email: '',
  address: '',
  otherDetails: '',
  avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=10'
};

const formFields = [
  { key: 'name', label: 'Full Name', type: 'text', required: true },
  { key: 'dob', label: 'Date of Birth', type: 'date', required: true },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Admitted', label: 'Admitted' }
  ]},
  { key: 'cnicPassport', label: 'CNIC/Passport', type: 'text', required: true },
  { key: 'insuranceProvider', label: 'Insurance Provider', type: 'text' },
  { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'otherDetails', label: 'Other Details', type: 'textarea' }
];

const mockData = [
  {
    id: 'P1001',
    name: 'John Doe',
    mrnNumber: 'MRN001',
    phone: '(555) 123-4567',
    area: 'Downtown',
    city: 'New York',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=1'
  },
  {
    id: 'P1002',
    name: 'Jane Smith',
    mrnNumber: 'MRN002',
    phone: '(555) 987-6543',
    area: 'Uptown',
    city: 'Boston',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=2'
  }
];

function PatientsPage() {
  return (
    <CrudTemplate
      title="Patients"
      description="Manage patient records"
      icon="lucide:users"
      columns={columns}
      data={mockData}
      initialFormData={initialFormData}
      formFields={formFields}
      onSave={(data, isEditing) => {
        console.log('Save patient:', data, 'isEditing:', isEditing);
      }}
      onDelete={(item) => {
        console.log('Delete patient:', item);
      }}
    />
  );
}

export default PatientsPage;