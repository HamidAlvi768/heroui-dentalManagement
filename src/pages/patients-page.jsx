import React from 'react';
import { CrudTemplate } from '../components/crud-template';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'gender', label: 'Gender' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: 'Actions' }
];

const initialFormData = {
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: ''
};

const formFields = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'age', label: 'Age', type: 'number', required: true },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { key: 'phone', label: 'Phone', type: 'tel', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true }
];

const mockData = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    phone: '(555) 123-4567',
    email: 'john.doe@example.com'
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    phone: '(555) 987-6543',
    email: 'jane.smith@example.com'
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