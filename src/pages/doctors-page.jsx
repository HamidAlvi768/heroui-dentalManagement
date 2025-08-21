import React, { useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { useNavigate } from 'react-router-dom';
import { form } from '@heroui/theme';
import { useDisclosure } from "@heroui/react";
import { CrudDialog } from '../components/crud-dialog';
import { toast } from 'react-toastify';

const columns = [
  { key: 'username', label: 'NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'status', label: 'STATUS' }, 
  { key: 'qualification', label: 'QUALIFICATION' }, 
  { key: 'gender', label: 'GENDER' }, 
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  role: 'doctor',
  username: '',
  email: '',
  password: '',
  gender: '',
  date_of_birth: '',
  phone: '',
  address: '',
  specialization: '',
  qualification: '',
  experience: '',
  commission_percentage: '',
  status: 'Active',
};

const formFields = [
  { key: 'role', label: 'Role', type: 'hidden', required: true },
  { key: 'username', label: 'Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'text', required: true },
  {
    key: 'gender', label: 'Gender', type: 'select', options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ]
  },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', max: new Date().toISOString().split("T")[0]},
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'specialization', label: 'Specialization', type: 'text' },
  { key: 'qualification', label: 'Qualification', type: 'text' },
  { key: 'experience', label: 'Experience', type: 'number' },
  {
    key: 'commission_percentage', label: 'Commission Percentage', type: 'select',
    options: [
      { value: '0', label: '0%' },
      { value: '10', label: '10%' },
      { value: '20', label: '20%' },
      { value: '30', label: '30%' },
      { value: '40', label: '40%' },
      { value: '50', label: '50%' },
      { value: '60', label: '60%' },
      { value: '70', label: '70%' },
      { value: '80', label: '80%' },
      { value: '90', label: '90%' },
      { value: '100', label: '100%' }
    ]
  },
  {
    key: 'status', label: 'Status', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'In Active', label: 'In Active' }
    ]
  },
];

// Edit form fields (without password requirement)
const editFormFields = formFields.map(field => 
  field.key === 'password' 
    ? { ...field, required: false, label: 'Password (leave blank to keep current)', type: 'password' }
    : field
);

// Filter columns
const filterColumns = [
  { key: 'username', label: 'NAME' },
  { key: 'email', label: 'EMAIL' },
  {
    key: 'status', label: 'STATUS', type: 'select', options: [
      { value: 'Active', label: 'Active' },
      { value: 'In Active', label: 'In Active' }
    ]
  },
  {
    key: 'verified', label: 'VERIFIED', type: 'select', options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
];

const doctorForm = {
  sections: [
    {
      fields: formFields
    }
  ]
};

const editDoctorForm = {
  sections: [
    {
      fields: editFormFields
    }
  ]
};

// API Service for doctors
const doctorApiService = {
  // Get doctors list
  getDoctors: async (token, params = {}) => {
    const { perpage = 5, page = 1, filters = {} } = params;
    const queryParams = new URLSearchParams({
      role: 'doctor',
      perpage: perpage.toString(),
      page: page.toString(),
      ...(filters.username && { username: filters.username }),
      ...(filters.email && { email: filters.email }),
      ...(filters.status && { status: filters.status }),
      ...(filters.verified !== undefined && { verified: filters.verified.toString() })
    });
    
    return config.getData(`/users/list?${queryParams.toString()}`);
  },

  // Create new doctor
  createDoctor: async (token, data) => {
    return config.postData('/users/create', data);
  },

  // Update existing doctor
  updateDoctor: async (token, id, data) => {
    return config.postData(`/users/edit?id=${id}`, data);
  },

  // Delete doctor
  deleteDoctor: async (token, id) => {
    return config.postData(`/users/delete?id=${id}`, { id: id });
  },

  // Get single doctor details
  getDoctorById: async (token, id) => {
    return config.getData(`/users/view?id=${id}`);
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

function DoctorsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  // Centralized function to fetch doctors
  const fetchDoctors = async (perpage = itemsPerPage, page = 1, filters = {}) => {
    try {
      setLoading(true);
      const response = await doctorApiService.getDoctors(token, { perpage, page, filters });
      
      // Validate response
      const validatedResponse = validateApiResponse(response, 'fetch doctors');
      
      const doctors = validatedResponse.data.data.map(user => ({
        ...user,
        verified: user.verified === 1 ? 'Yes' : 'No'
      }));
      
      setUsers(doctors);
      setTotalItems(validatedResponse.data.meta.total);
      setCurrentPage(validatedResponse.data.meta.page);
      setItemsPerPage(validatedResponse.data.meta.perpage);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error(error.message || 'Error fetching doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (doctor) => {
    try {
      // Fetch detailed doctor information
      const response = await doctorApiService.getDoctorById(token, doctor.id);
      if (response.data && response.data.success) {
        const detailedDoctor = {
          ...response.data.user,
          appointments: [
            {
              id: 'APT250465',
              patient: 'test Patient',
              status: 'Checked In',
              problem: '',
              startTime: '10:00:00',
              endTime: '11:15:00',
              date: '26-Apr-2025',
            },
          ]
        };
        setSelectedDoctor(detailedDoctor);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Error fetching doctor details');
    }
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailOpen(false);
    onEditOpen();
  };

  // Custom save handler that prevents immediate state update in CrudTemplate
  const handleSaveWrapper = async (formData, isEditing) => {
    try {
      setOperationLoading(true);
      if (isEditing) {
        // Update existing doctor - remove empty password field
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
          delete dataToUpdate.password;
        }
        
        const response = await doctorApiService.updateDoctor(token, formData.id, dataToUpdate);
        validateApiResponse(response, 'update doctor');
        toast.success('Doctor updated successfully!');
        // Refresh the list to show updated data
        await fetchDoctors(itemsPerPage, currentPage);
        // Close the edit dialog
        onEditOpenChange(false);
      } else {
        // Create new doctor
        const response = await doctorApiService.createDoctor(token, formData);
        validateApiResponse(response, 'create doctor');
        toast.success(response.data.message || 'Doctor created successfully!');
        // Refresh the list to show new data - don't manually update state
        await fetchDoctors(itemsPerPage, 1); // Reset to first page for new items
      }
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error.message || 'Error saving doctor');
      // Re-throw error to prevent CrudTemplate from closing the dialog
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (doctor) => {
    try {
      setOperationLoading(true);
      // Send only the ID in the payload for delete operation
      const response = await doctorApiService.deleteDoctor(token, doctor.id);
      validateApiResponse(response, 'delete doctor');
      toast.success('Doctor deleted successfully!');
      // Refresh the list to show updated data - don't manually remove from UI
      await fetchDoctors(itemsPerPage, currentPage);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.message || 'Error deleting doctor');
    } finally {
      setOperationLoading(false);
    }
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item)
    }
  ];

  // Initialize API configuration and fetch doctors on component mount
  useEffect(() => {
    if (token) {
      config.initAPI(token);
      fetchDoctors();
    }
  }, [token]);

  // Function to clear all filters and refresh data
  const clearFilters = () => {
    fetchDoctors(itemsPerPage, 1, {});
  };

  return (<>
    <CrudTemplate
      title="Doctors"
      description="Manage doctors records"
      icon="lucide:users"
      loading={loading || operationLoading}
      columns={columns}
      data={users}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={doctorForm}
      filterColumns={filterColumns} 
      customRowActions={customActions}
      onRowClick={handleViewDetail}
      disableAutoStateUpdate={true}
      disableAutoDeleteUpdate={true}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        fetchDoctors(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        fetchDoctors(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        fetchDoctors(perpage, page);
      }}
      onSave={handleSaveWrapper}
      onDelete={handleDelete} />
    
    {selectedDoctor && (
      <>
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedDoctor}
          entityType="doctor"
          onEdit={handleEdit}
        />
        <CrudDialog
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          title="Edit Doctor"
          formData={selectedDoctor}
          form={editDoctorForm}
          onSave={handleSaveWrapper}
        />
      </>
    )}
  </>)
}

export default DoctorsPage;