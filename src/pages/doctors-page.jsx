import React, { useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { useAuthGuard } from '../hooks/useAuthRedirect';
import { useNavigate } from 'react-router-dom';
import { form } from '@heroui/theme';
import { useDisclosure } from "@heroui/react";
import { CrudDialog } from '../components/crud-dialog';
import { toast } from 'react-toastify';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider, Skeleton } from "@heroui/react";

// Custom Doctor Detail Modal Component with Shimmer Loading
const DoctorDetailModal = ({ isOpen, onOpenChange, doctor, onEdit, isLoading }) => {
  if (!doctor && !isLoading) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-primary-600 text-xl font-semibold">
                      {doctor?.username?.charAt(0)?.toUpperCase() || 'D'}
                    </span>
                  )}
                </div>
                <div>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold">{doctor?.username}</h2>
                      <p className="text-sm text-gray-500">Doctor ID: {doctor?.id}</p>
                    </>
                  )}
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary-600">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                        <p className="text-gray-900">{doctor?.username || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                        <p className="text-gray-900">{doctor?.email || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-28" />
                      ) : (
                        <p className="text-gray-900">{doctor?.phone || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-gray-900 capitalize">{doctor?.gender || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                        <p className="text-gray-900">{doctor?.date_of_birth_formatted || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Blood Group</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                        <p className="text-gray-900">{doctor?.blood_group || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary-600">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Qualification</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                        <p className="text-gray-900">{doctor?.qualification || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Specialization</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                        <p className="text-gray-900">{doctor?.specialization || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience (Years)</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-gray-900">{doctor?.experience || '0'} years</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Commission Percentage</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-gray-900">{doctor?.commission_percentage || '0'}%</p>
                      )}
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary-600">Address Information</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    {isLoading ? (
                      <Skeleton className="h-5 w-64" />
                    ) : (
                      <p className="text-gray-900">{doctor?.address || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <Divider />

                {/* System Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary-600">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-gray-900 capitalize">{doctor?.status || 'Active'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">User ID</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                        <p className="text-gray-900">{doctor?.user_id || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created On</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                        <p className="text-gray-900">{doctor?.created_at_formatted || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Updated</label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                        <p className="text-gray-900">{doctor?.updated_at_formatted || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const columns = [
  {
    key: 'username', label: 'NAME',
    render: (item) => (
      <div>
        <div className="font-medium">{item.username}</div>
      </div>
    )
  },
  { key: 'email', label: 'EMAIL' },
  { key: 'qualification', label: 'QUALIFICATION' },
  { key: 'gender', label: 'GENDER' },
  {
    key: 'active', label: 'STATUS',
    render: (item) => (
      <div>
        <div className="font-medium">{item.active}</div>
      </div>
    )
  },
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
  active: 'Active',
};

const formFields = [
  { key: 'username', label: 'Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'text', required: true },
  {
    key: 'gender', label: 'Gender', type: 'select', required: true, options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ]
  },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true, max: new Date().toISOString().split("T")[0] },
  { key: 'phone', label: 'Phone', type: 'text', required: true },
  { key: 'address', label: 'Address', type: 'text', required: true },
  { key: 'specialization', label: 'Specialization', type: 'text', required: true },
  { key: 'qualification', label: 'Qualification', type: 'text', required: true },
  { key: 'experience', label: 'Experience', type: 'number', required: true, min: 0, step: 1 },
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
    key: 'active', label: 'Status', type: 'select', options: [
      { value: '1', label: 'Active' },
      { value: '0', label: 'In Active' }
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
    key: 'gender', label: 'GENDER', type: 'select', options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ]
  },
  {
    key: 'active', label: 'STATUS', type: 'select', options: [
      { value: '1', label: 'Active' },
      { value: '0', label: 'Inactive' }
    ]
  },
  {
    key: 'quick_date_range',
    label: 'QUICK FILTERS',
    type: 'select',
    placeholder: 'Quick date filters',
    options: [
      { value: '', label: 'Custom Date Range' },
      { value: 'today', label: 'Today' },
      { value: 'tomorrow', label: 'Tomorrow' },
      { value: 'this_week', label: 'This Week' },
      { value: 'next_week', label: 'Next Week' },
      { value: 'this_month', label: 'This Month' },
      { value: 'this_year', label: 'This Year' }
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
      ...(filters.active && { active: filters.active }),
      ...(filters.gender && { gender: filters.gender })
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

  // Add authentication guard - redirect to login if not authenticated
  const { shouldRender, isLoading: authLoading } = useAuthGuard();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  // Don't render if not authenticated
  if (!shouldRender) {
    return null;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Centralized function to fetch doctors
  const fetchDoctors = async (perpage = itemsPerPage, page = 1, filters = {}, isFiltering = false) => {
    try {
      if (isFiltering) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }

      const response = await doctorApiService.getDoctors(token, { perpage, page, filters });

      // Validate response
      const validatedResponse = validateApiResponse(response, 'fetch doctors');

      const doctors = validatedResponse.data.data.map(user => ({
        ...user,
        active: user.active === 1 ? 'Active' : 'Inactive',
        gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase() : 'Not specified'
      }));

      setUsers(doctors);
      setTotalItems(validatedResponse.data.meta.total);
      setCurrentPage(validatedResponse.data.meta.page);
      setItemsPerPage(validatedResponse.data.meta.perpage);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error(error.message || 'Error fetching doctors');
    } finally {
      if (isFiltering) {
        setFilterLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleViewDetail = async (doctor) => {
    try {
      // Show modal immediately with loading state and basic data from list
      setSelectedDoctor({
        ...doctor,
        // Show basic info while loading
        username: doctor.username,
        email: doctor.email,
        status: doctor.status
      });
      setIsDetailOpen(true);
      setViewDetailLoading(true);

      // Fetch detailed doctor information using view API
      const response = await doctorApiService.getDoctorById(token, doctor.id);
      if (response.data && response.data.success) {
        // Extract doctor data from the response
        const doctorData = response.data.data;

        // Create detailed doctor object with proper data structure
        const detailedDoctor = {
          ...doctorData,
          // Ensure ID is preserved from the original doctor object
          id: doctor.id || doctorData.id,
          // Add default values for fields not in API response
          username: doctor.username || 'Not specified', // From list API
          email: doctor.email || 'Not specified', // From list API
          status: doctor.status || 'Active', // From list API
          // Format the date for better display
          date_of_birth_formatted: doctorData.date_of_birth && doctorData.date_of_birth !== '0000-00-00'
            ? new Date(doctorData.date_of_birth).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            : 'Not specified',
          // Add created/updated info for display
          created_at_formatted: doctorData.created_at
            ? new Date(doctorData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            : 'Not specified',
          updated_at_formatted: doctorData.updated_at
            ? new Date(doctorData.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            : 'Not specified'
        };

        setSelectedDoctor(detailedDoctor);
        console.log('Detailed doctor data set for view modal:', detailedDoctor);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Error fetching doctor details');
    } finally {
      setViewDetailLoading(false);
    }
  };

  const handleEdit = async (doctor) => {
    try {
      console.log('handleEdit called with doctor:', doctor);

      // Ensure we have the correct ID for the API call
      const doctorId = doctor.id || doctor.user_id;
      if (!doctorId) {
        console.error('No valid ID found for doctor:', doctor);
        toast.error('Cannot edit doctor: Invalid ID');
        return;
      }

      console.log('Calling view API for doctor ID:', doctorId);

      // Fetch fresh doctor data using view API for editing
      const response = await doctorApiService.getDoctorById(token, doctorId);
      console.log('View API response:', response);

      if (response.data && response.data.success) {
        const doctorData = response.data.data;

        // Create complete doctor object for editing with all necessary fields
        const completeDoctorData = {
          ...doctorData,
          // Ensure we have all the fields needed for the edit form
          username: doctor.username || doctorData.username || '', // From list API or view API
          email: doctor.email || doctorData.email || '', // From list API or view API
          status: doctor.status || doctorData.status || 'Active', // From list API or view API
          role: 'doctor', // Always set role for doctor
          // Ensure password field exists but is empty for editing
          password: '', // Empty for edit form
          // Format dates for form inputs
          date_of_birth: doctorData.date_of_birth && doctorData.date_of_birth !== '0000-00-00'
            ? doctorData.date_of_birth
            : '',
          // Ensure all other fields are present
          gender: doctorData.gender || '',
          phone: doctorData.phone || '',
          address: doctorData.address || '',
          specialization: doctorData.specialization || '',
          qualification: doctorData.qualification || '',
          experience: doctorData.experience || '',
          commission_percentage: doctorData.commission_percentage || '0',
          blood_group: doctorData.blood_group || ''
        };

        console.log('Complete doctor data for editing:', completeDoctorData);

        // Set the complete data for editing
        setSelectedDoctor(completeDoctorData);
        setIsDetailOpen(false);
        onEditOpen();
      }
    } catch (error) {
      console.error('Error fetching doctor data for editing:', error);
      toast.error('Error fetching doctor data for editing');
    }
  };

  // Separate function for handling table row edits (direct edit without view modal)
  const handleTableEdit = async (doctor) => {
    try {
      console.log('handleTableEdit called with doctor:', doctor);

      // Open modal immediately with loading state
      setSelectedDoctor({ ...doctor, isLoading: true });
      onEditOpen();

      // Ensure we have the correct ID for the API call
      const doctorId = doctor.id || doctor.user_id;
      if (!doctorId) {
        console.error('No valid ID found for doctor:', doctor);
        toast.error('Cannot edit doctor: Invalid ID');
        return;
      }

      console.log('Calling view API for doctor ID:', doctorId);

      // Fetch fresh doctor data using view API for editing
      const response = await doctorApiService.getDoctorById(token, doctorId);
      console.log('View API response:', response);

      if (response.data && response.data.success) {
        const doctorData = response.data.data;

        // Create complete doctor object for editing with all necessary fields
        const completeDoctorData = {
          ...doctorData,
          // Ensure we have all the fields needed for the edit form
          username: doctor.username || doctorData.username || '', // From list API or view API
          email: doctor.email || doctorData.email || '', // From list API or view API
          status: doctor.status || doctorData.status || 'Active', // From list API or view API
          role: 'doctor', // Always set role for doctor
          // Ensure password field exists but is empty for editing
          password: '', // Empty for edit form
          // Format dates for form inputs
          date_of_birth: doctorData.date_of_birth && doctorData.date_of_birth !== '0000-00-00'
            ? doctorData.date_of_birth
            : '',
          // Ensure all other fields are present
          gender: doctorData.gender || '',
          phone: doctorData.phone || '',
          address: doctorData.address || '',
          specialization: doctorData.specialization || '',
          qualification: doctorData.qualification || '',
          experience: doctorData.experience || '',
          commission_percentage: doctorData.commission_percentage || '0',
          blood_group: doctorData.blood_group || '',
          isLoading: false // Mark as loaded
        };

        console.log('Complete doctor data for table editing:', completeDoctorData);

        // Update the selected doctor with complete data
        setSelectedDoctor(completeDoctorData);
      }
    } catch (error) {
      console.error('Error fetching doctor data for table editing:', error);
      toast.error('Error fetching doctor data for editing');
      // Set error state
      setSelectedDoctor({ ...doctor, isLoading: false, hasError: true });
    }
  };

  // Function to handle quick date range filters
  const handleQuickDateRange = (quickRange, currentFilters) => {
    const today = new Date();
    const newFilters = { ...currentFilters };

    switch (quickRange) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        newFilters.date_from = todayStr;
        newFilters.date_to = todayStr;
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        newFilters.date_from = tomorrowStr;
        newFilters.date_to = tomorrowStr;
        break;
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        newFilters.date_from = startOfWeek.toISOString().split('T')[0];
        newFilters.date_to = endOfWeek.toISOString().split('T')[0];
        break;
      case 'next_week':
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        newFilters.date_from = nextWeekStart.toISOString().split('T')[0];
        newFilters.date_to = nextWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        newFilters.date_from = startOfMonth.toISOString().split('T')[0];
        newFilters.date_to = endOfMonth.toISOString().split('T')[0];
        break;
      case 'this_year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        newFilters.date_from = startOfYear.toISOString().split('T')[0];
        newFilters.date_to = endOfYear.toISOString().split('T')[0];
        break;
      default:
        // Custom date range - keep existing filters
        break;
    }

    // Clear quick range filter after applying
    newFilters.quick_date_range = '';

    return newFilters;
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
        // Close the edit dialog only on success
        onEditOpenChange(false);
        return true; // Indicate success
      } else {
        // Create new doctor - add role field
        const createData = {
          ...formData,
          role: 'doctor' // Virtual field added to payload
        };

        const response = await doctorApiService.createDoctor(token, createData);
        validateApiResponse(response, 'create doctor');
        toast.success(response.data.message || 'Doctor created successfully!');
        // Refresh the list to show new data - don't manually update state
        await fetchDoctors(itemsPerPage, 1); // Reset to first page for new items
        return true; // Indicate success
      }
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error.message || 'Error saving doctor');
      // Don't close dialog on error - return false to indicate failure
      return false;
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
      loading={loading || operationLoading || filterLoading}
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
      disableAutoStateUpdate={false}
      disableAutoDeleteUpdate={false}
      customEditHandler={handleTableEdit}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        // Handle quick date range filters
        if (filters.quick_date_range && filters.quick_date_range !== '') {
          const processedFilters = handleQuickDateRange(filters.quick_date_range, filters);
          fetchDoctors(itemsPerPage, 1, processedFilters, true);
        } else {
          fetchDoctors(itemsPerPage, 1, filters, true);
        }
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
        <DoctorDetailModal
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          doctor={selectedDoctor}
          isLoading={viewDetailLoading}
        />
        <CrudDialog
          isOpen={isEditOpen && !!selectedDoctor}
          onOpenChange={onEditOpenChange}
          title="Edit Doctor"
          formData={selectedDoctor}
          formFields={editFormFields}
          form={editDoctorForm}
          onSave={handleSaveWrapper}
          operationLoading={operationLoading}
        />
      </>
    )}
  </>)
}

export default DoctorsPage;