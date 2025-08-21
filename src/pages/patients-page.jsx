import React, { useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from "@heroui/react";
import { CrudDialog } from '../components/crud-dialog';
import { toast } from 'react-toastify';

const columns = [
  { key: 'full_name', label: 'FULL NAME' },
  { key: 'father_name', label: 'FATHER NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'contact_number', label: 'CONTACT NUMBER' },
  { key: 'status', label: 'STATUS' }, 
  { key: 'gender', label: 'GENDER' },
  { key: 'age', label: 'DATE OF BIRTH' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  full_name: '',
  father_name: '',
  email: '',
  contact_number: '',
  gender: '',
  age: '',
  address: '',
  notes: '',
  status: 'active',
  medical_history: '',
  allergies: '',
};

const formFields = [
  { key: 'full_name', label: 'Full Name', type: 'text', required: true },
  { key: 'father_name', label: 'Father Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'contact_number', label: 'Contact Number', type: 'text', required: true },
  { 
    key: 'gender', 
    label: 'Gender', 
    type: 'select', 
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ], 
    required: true
  },
  { key: 'age', label: 'Date of Birth', type: 'date', required: true, max: new Date().toISOString().split("T")[0]},
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'notes', label: 'Notes', type: 'textarea' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inActive', label: 'In Active' }
    ]
  },
  { key: 'medical_history', label: 'Medical History', type: 'textarea' },
  { key: 'allergies', label: 'Allergies', type: 'textarea' },
];

// Edit form fields (same as create for patients)
const editFormFields = [...formFields];

// Filter columns
const filterColumns = [
  { key: 'full_name', label: 'FULL NAME' },
  { key: 'father_name', label: 'FATHER NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'status', label: 'STATUS' },
  { key: 'contact_number', label: 'CONTACT NUMBER' },
  {
    key: 'gender', 
    label: 'GENDER', 
    type: 'select', 
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
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

const editPatientForm = {
  sections: [
    {
      fields: editFormFields
    }
  ]
};

// API Service for patients
const patientApiService = {
  // Get patients list
  getPatients: async (token, params = {}) => {
    const { perpage = 5, page = 1, filters = {} } = params;
    const queryParams = new URLSearchParams({
      perpage: perpage.toString(),
      page: page.toString(),
      ...(filters.full_name && { full_name: filters.full_name }),
      ...(filters.father_name && { father_name: filters.father_name }),
      ...(filters.email && { email: filters.email }),
      ...(filters.status && { status: filters.status }),
      ...(filters.contact_number && { contact_number: filters.contact_number }),
      ...(filters.gender && { gender: filters.gender })
    });
    
    return config.getData(`/patients/list?${queryParams.toString()}`);
  },

  // Create new patient
  createPatient: async (token, data) => {
    return config.postData('/patients/create', data);
  },

  // Update existing patient
  updatePatient: async (token, id, data) => {
    return config.postData(`/patients/edit?id=${id}`, data);
  },

  // Delete patient
  deletePatient: async (token, id) => {
    return config.postData(`/patients/delete?id=${id}`, { id: id });
  },

  // Get single patient details
  getPatientById: async (token, id) => {
    return config.getData(`/patients/view?id=${id}`);
  }
};

// Helper function to validate API response
const validateApiResponse = (response, operation) => {
  if (!response || !response.data) {
    throw new Error(`Invalid response from ${operation}`);
  }
  
  if (response.data.success === false) {
    throw new Error(response.data.message || `Operation failed: ${operation}`);
  }
  
  return response;
};

function PatientsPage() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  // Centralized function to fetch patients
  const fetchPatients = async (perpage = itemsPerPage, page = 1, filters = {}) => {
    try {
      setLoading(true);
      const response = await patientApiService.getPatients(token, { perpage, page, filters });
      
      // Validate response
      const validatedResponse = validateApiResponse(response, 'fetch patients');
      
      const patientsData = validatedResponse.data.data.map(patient => ({
        ...patient,
        verified: patient.verified === 1 ? 'Yes' : 'No'
      }));
      
      setPatients(patientsData);
      setTotalItems(validatedResponse.data.meta.total);
      setCurrentPage(validatedResponse.data.meta.page);
      setItemsPerPage(validatedResponse.data.meta.perpage);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error(error.message || 'Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (patient) => {
    try {
      // Fetch detailed patient information
      const response = await patientApiService.getPatientById(token, patient.id);
      if (response.data && response.data.success) {
        const detailedPatient = {
          ...response.data.patient,
          appointments: [
            {
              id: 'APT250465',
              patient: patient.full_name,
              status: 'Checked In',
              problem: '',
              startTime: '10:00:00',
              endTime: '11:15:00',
              date: '26-Apr-2025',
            },
          ]
        };
        setSelectedPatient(detailedPatient);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Error fetching patient details');
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setIsDetailOpen(false);
    onEditOpen();
  };

  // Custom save handler that prevents immediate state update in CrudTemplate
  const handleSaveWrapper = async (formData, isEditing) => {
    try {
      setOperationLoading(true);
      if (isEditing) {
        // Update existing patient
        const response = await patientApiService.updatePatient(token, formData.id, formData);
        validateApiResponse(response, 'update patient');
        toast.success('Patient updated successfully!');
        // Refresh the list to show updated data
        await fetchPatients(itemsPerPage, currentPage);
        // Close the edit dialog
        onEditOpenChange(false);
      } else {
        // Create new patient
        const response = await patientApiService.createPatient(token, formData);
        validateApiResponse(response, 'create patient');
        toast.success(response.data.message || 'Patient created successfully!');
        // Refresh the list to show new data - don't manually update state
        await fetchPatients(itemsPerPage, 1); // Reset to first page for new items
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(error.message || 'Error saving patient');
      // Re-throw error to prevent CrudTemplate from closing the dialog
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (patient) => {
    try {
      setOperationLoading(true);
      // Send only the ID in the payload for delete operation
      const response = await patientApiService.deletePatient(token, patient.id);
      validateApiResponse(response, 'delete patient');
      toast.success('Patient deleted successfully!');
      // Refresh the list to show updated data - don't manually remove from UI
      await fetchPatients(itemsPerPage, currentPage);
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error(error.message || 'Error deleting patient');
    } finally {
      setOperationLoading(false);
    }
  };

  const customActions = (item) => [
    {
      label: "Create Invoice",
      icon: "lucide:file-plus",
      handler: () => {
        navigate(`/invoices/${item.id}`, { state: { patient: item } });
        console.log("Create invoice for patient:", item);
      },
    },
  ];

  // Initialize API configuration and fetch patients on component mount
  useEffect(() => {
    if (token) {
      config.initAPI(token);
      fetchPatients();
    }
  }, [token]);

  // Function to clear all filters and refresh data
  const clearFilters = () => {
    fetchPatients(itemsPerPage, 1, {});
  };

  return (<>
    <CrudTemplate
      title="Patients"
      description="Manage patients records"
      icon="lucide:users"
      loading={loading || operationLoading}
      columns={columns}
      data={patients}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={patientForm}
      filterColumns={filterColumns}
      customRowActions={customActions}
      onRowClick={handleViewDetail}
      disableAutoStateUpdate={true}
      disableAutoDeleteUpdate={true}
      addButtonLabel="Add Patient"
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        fetchPatients(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        fetchPatients(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        fetchPatients(perpage, page);
      }}
      onSave={handleSaveWrapper}
      onDelete={handleDelete} />
    
    {selectedPatient && (
      <>
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedPatient}
          entityType="patient"
          onEdit={handleEdit}
        />
        <CrudDialog
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          title="Edit Patient"
          formData={selectedPatient}
          form={editPatientForm}
          onSave={handleSaveWrapper}
        />
      </>
    )}
  </>)
}

export default PatientsPage;