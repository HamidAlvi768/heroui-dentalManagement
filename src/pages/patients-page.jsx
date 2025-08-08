import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';


const columns = [
  { key: 'full_name', label: 'FULL NAME' },
  { key: 'father_name', label: 'FATHER NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'contact_number', label: 'CONTACT NUMBER' },
  { key: 'status', label: 'STATUS' }, 
  { key: 'gender', label: 'GENDER' },
  { key: 'age', label: 'AGE' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  full_name: '',
  father_name: '',
  email: '',
  contact_number: '',
  gender: '',
  date_of_birth: '',
  address: '',
  notes: '',
  status:'active',
};

const formFields = [
  { key: 'full_name', label: 'Full Name', type: 'text', required: true },
  { key: 'father_name', label: 'Father Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'contact_number', label: 'Contact Number', type: 'text', required: true },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female',], required: true },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true, max: new Date().toISOString().split("T")[0]},
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'notes', label: 'Notes', type: 'textarea', },
  { key: 'status', label: 'Status', type: 'select',    options: [
                                                                                  { value: 'active', label: 'Active' },
                                                                                  { value: 'inActive', label: 'In Active' }
                                                                                ]},
];

// Filter columns
const filterColumns = [
  { key: 'full_name', label: 'FULL NAME' },
  { key: 'father_name', label: 'FATHER NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'status', label: 'STATUS' },
  { key: 'contact_number', label: 'CONTACT NUMBER' },
  {
    key: 'gender', label: 'GENDER', type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ]
  },
];

const patientForm = {
  sections: [
    {
    
      fields: formFields
    }
  ]
};

function PatientsPage() {

  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();

  function getPatients(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/patients/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _patients = data.data.data.map(user => {
          user.verified = user.verified === 1 ? 'Yes' : 'No';
          return user;
        });
        setPatients(_patients);
        setTotalItems(data.data.meta.total);
        setCurrentPage(data.data.meta.page);
        setItemsPerPage(data.data.meta.perpage);
        setLoading(false);

      })
      .catch(error => {
        console.log(error);
      });
  }


  useEffect(() => {
    getPatients(5, 1);
  }, []);

  const handleViewDetail = (patient) => {
    navigate(`/patients/${patient.id}`, { state: { patient } });
  };

  const customActions = [
    {
      label: "Create Invoice",
      icon: "lucide:file-plus",
      onClick: (item) => {
        navigate(`/invoices/${item.id}`, { state: { patient: item } });
        console.log("Create invoice for patient:", item);
      },
    },
  ];

  return (
    <CrudTemplate
      title="Patients"
      description="Manage patients records"
      icon="lucide:users"
      loading={loading}
      columns={columns}
      data={patients}
      customActions={customActions}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={patientForm}
      filterColumns={filterColumns}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        getPatients(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        getPatients(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        getPatients(perpage, page);
      }}
      addButtonLabel="Add Patient"
      customRowActions={customActions}
      onRowClick={handleViewDetail}
      onSave={(data, isEditing) => {
        console.log('Save patient:', data, 'isEditing:', isEditing);
        if (isEditing) {
          // Update existing user
          config.postData(`/patients/edit?id=${data.id}`, data)
            .then(response => {
              console.log('Patient updated:', response.data);
              setPatients(patients.map(user => user.id === data.id ? data : user));
              toast.success('Patient updated successfully!');
            })
            .catch(error => {
              console.error('Error updating user:', error);
            });
        } else {
          // Create new user
          config.postData('/patients/create', data)
            .then(response => {
              if (response.data.success == true) {
                setUsers([ response.data.user , ...patients]);
                toast.success(response.data.message);
              } else {
                toast.error(response.data.message);
              }
            })
            .catch(error => {
              console.error('Error creating user:', error);
            });
        }
      }}
      onDelete={(item) => {
        config.postData(`/patients/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Patient deleted:', response.data);
            setPatients(patients.filter(user => user.id !== item.id));
            toast.success('Patient deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting user:', error);
          });
        console.log('Delete patient:', item);
      }}
    />
  );
}

export default PatientsPage;