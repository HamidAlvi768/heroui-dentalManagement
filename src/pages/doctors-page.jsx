import React from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';

// Sample data for doctors
const doctorsData = [
  {
    id: '1',
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    email: 'john.smith@hospital.com',
    phone: '(555) 123-4567',
    status: 'Active',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=1',
    experience: '15 years',
    address: '123 Medical Drive, New York, NY'
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    specialty: 'Neurology',
    email: 'sarah.johnson@hospital.com',
    phone: '(555) 234-5678',
    status: 'Active',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=2',
    experience: '12 years',
    address: '456 Health Avenue, Boston, MA'
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrics',
    email: 'michael.chen@hospital.com',
    phone: '(555) 345-6789',
    status: 'On Leave',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=3',
    experience: '8 years',
    address: '789 Care Street, Chicago, IL'
  },
  {
    id: '4',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    email: 'emily.rodriguez@hospital.com',
    phone: '(555) 456-7890',
    status: 'Active',
    avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=4',
    experience: '10 years',
    address: '321 Wellness Road, Miami, FL'
  }
];

// Table columns configuration
const columns = [
  {
    key: 'name',
    label: 'NAME',
    render: (item) => (
      <div className="flex items-center gap-4">
        <Avatar src={item.avatar} size="sm" />
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-default-500 text-xs">{item.specialty}</div>
        </div>
      </div>
    )
  },
  { key: 'email', label: 'EMAIL' },
  { key: 'phone', label: 'PHONE' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' }
];

// Form fields for add/edit dialog
const formFields = [
  { key: 'name', label: 'Full Name', type: 'text', required: true },
  { key: 'specialty', label: 'Specialty', type: 'select', required: true, options: [
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Ophthalmology', label: 'Ophthalmology' },
    { value: 'Psychiatry', label: 'Psychiatry' }
  ]},
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { key: 'experience', label: 'Experience', type: 'text' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' }
  ]}
];

// Initial form data for new doctors
const initialFormData = {
  name: '',
  specialty: '',
  email: '',
  phone: '',
  status: 'Active',
  avatar: 'https://img.heroui.chat/image/avatar?w=128&h=128&u=10',
  experience: '',
  address: ''
};

function DoctorsPage() {
  return (
    <CrudTemplate
      title="Doctors"
      description="Manage hospital doctors"
      icon="lucide:stethoscope"
      columns={columns}
      data={doctorsData}
      initialFormData={initialFormData}
      formFields={formFields}
      addButtonLabel="Add Doctor"
    />
  );
}

export default DoctorsPage;