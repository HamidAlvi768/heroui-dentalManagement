import React, { useEffect, useState, useMemo } from "react";
import { CrudTemplate } from "../components/crud-template";
import config from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { CrudDialog } from "../components/crud-dialog";
import { toast } from "react-toastify";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

function AppointmentsPage() {
  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false); // Add operation loading state
  const [viewDetailLoading, setViewDetailLoading] = useState(false); // Add view detail loading state
  const [editLoading, setEditLoading] = useState(false); // Add edit loading state

  // Define formFields for Appointments
  const formFields = useMemo(() => {

    // Don't create form fields until we have patient and doctor data
    if (!patientsList.length || !doctorsList.length) {
      return [];
    }

    const patientOptions = [
      { value: "", label: "Select Patient" },
      ...patientsList.map((patient) => ({
        value: patient.id.toString(), // Ensure consistent string value
        label: patient.username || patient.name || patient.patient_name || `Patient ${patient.id}`,
      })),
    ];

    const doctorOptions = [
      { value: "", label: "Select Doctor" },
      ...doctorsList.map((doctor) => ({
        value: doctor.id.toString(), // Ensure consistent string value
        label: doctor.username || doctor.name || doctor.doctor_name || `Doctor ${doctor.id}`,
      })),
    ];


    const fields = [
      {
        key: "patient_id",
        label: "Patient",
        type: "select",
        required: true,
        placeholder: "Select a patient",
        options: patientOptions,
      },
      {
        key: "doctor_id",
        label: "Doctor",
        type: "select",
        required: true,
        placeholder: "Select a doctor",
        options: doctorOptions,
      },
      {
        key: "appointment_date",
        label: "Appointment Date",
        type: "date",
        required: true,
        placeholder: "Select appointment date",
        min: new Date().toISOString().split('T')[0],
      },
      {
        key: "appointment_time",
        label: "Appointment Time",
        type: "time",
        required: true,
        placeholder: "Select appointment time",
        min: new Date().toISOString().split('T')[0],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        placeholder: "Select status",
        options: [
          { value: "scheduled", label: "Scheduled" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      {
        key: "appointment_reason",
        label: "Reason for Appointment",
        type: "textarea",
        required: false,
        placeholder: "Enter reason for appointment (optional)",
      },
    ];

    return fields;
  }, [patientsList, doctorsList]);

  const columns = useMemo(() => {
    // Always include the actions column, even when data is loading
    const baseColumns = [
      {
        key: 'patient_name',
        label: 'PATIENT',
        render: (item) => {
          return (
            <div>
              <div className="font-medium">{item.patient_name}</div>
            </div>
          );
        }
      },
      {
        key: 'doctor_name',
        label: 'DOCTOR',
        render: (item) => {
          // First try to use doctor_name from appointment data
          if (item.doctor_name) {
            return item.doctor_name;
          }
          // Fallback to doctor_id if no name found
          return item.doctor_id || 'N/A';
        }
      },
      {
        key: 'appointment_date',
        label: 'DATE',
        render: (item) => {
          if (!item.appointment_date) return 'N/A';
          try {
            return new Date(item.appointment_date).toLocaleDateString();
          } catch (e) {
            return item.appointment_date;
          }
        }
      },
      {
        key: 'appointment_time',
        label: 'TIME',
        render: (item) => {
          if (!item.appointment_time) return 'N/A';
          try {
            // Handle time string properly
            const timeStr = item.appointment_time;
            if (timeStr.includes(':')) {
              return timeStr; // Return as is if it's already formatted
            }
            // If it's a timestamp, convert to readable time
            const date = new Date(timeStr);
            if (!isNaN(date.getTime())) {
              return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            }
            return timeStr;
          } catch (e) {
            return item.appointment_time;
          }
        }
      },
      {
        key: 'appointment_reason',
        label: 'REASON',
        render: (item) => {
          const reason = item.appointment_reason;
          if (!reason) return 'N/A';
          const maxLength = 30;
          return reason.length > maxLength ? `${reason.substring(0, maxLength - 3)}...` : reason;
        }
      },
      {
        key: 'status',
        label: 'STATUS',
        render: (item) => {
          const status = item.status || 'N/A';
          return (
            <div>
              <div className="font-medium">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: "ACTIONS",
      }
    ];

    // If we don't have patient/doctor data yet, return columns with loading placeholders
    if (!patientsList.length || !doctorsList.length) {
      return baseColumns.map(col => {
        if (col.key === 'patient_id' || col.key === 'doctor_id') {
          return {
            ...col,
            render: () => 'Loading...'
          };
        }
        return col;
      });
    }

    return baseColumns;
  }, [patientsList, doctorsList, dataList]);

  const initialAppointmentFormData = {
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_reason: '',
    status: 'scheduled',
    notes: ''
  };

  // Function to reset form data
  const resetFormData = () => {
    return {
      patient_id: '',
      doctor_id: '',
      appointment_date: new Date().toISOString().split('T')[0], // Set today as default date
      appointment_time: '09:00', // Set 9 AM as default time
      appointment_reason: '',
      status: 'scheduled',
      notes: ''
    };
  };

  // Function to get clean form data for editing
  const getCleanFormData = (item) => {
    if (!item) {
      const resetData = resetFormData();
      console.log('Reset form data:', resetData);
      return resetData;
    }

    // If the item already has the correct structure (from API), use it directly
    if (item.patient_id !== undefined && item.doctor_id !== undefined) {
      const cleanData = {
        id: item.id,
        patient_id: item.patient_id ? item.patient_id.toString() : '',
        doctor_id: item.doctor_id ? item.doctor_id.toString() : '',
        appointment_date: item.appointment_date || new Date().toISOString().split('T')[0],
        appointment_time: item.appointment_time || '09:00',
        appointment_reason: item.appointment_reason || '',
        status: item.status || 'scheduled',
        notes: item.notes || ''
      };

      console.log('Clean form data for editing (from API):', cleanData);
      return cleanData;
    }

    // Fallback for basic item data
    const cleanData = {
      id: item.id,
      patient_id: item.patient_id ? item.patient_id.toString() : '',
      doctor_id: item.doctor_id ? item.doctor_id.toString() : '',
      appointment_date: item.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: item.appointment_time || '09:00',
      appointment_reason: item.appointment_reason || '',
      status: item.status || 'scheduled',
      notes: item.notes || ''
    };

    console.log('Clean form data for editing (fallback):', cleanData);
    return cleanData;
  };

  const appointmentFormConfig = {
    sections: [
      {
        fields: formFields,
      },
    ],
  };

  // Define filter columns relevant to Appointments
  const appointmentFilterColumns = useMemo(() => [
    {
      key: 'patient_id', // Changed from 'patient_name' to 'patient_id' for consistency
      label: 'PATIENT',
      type: 'select',
      placeholder: 'Filter by patient',
      options: [
        { value: "", label: "All Patients" },
        ...(patientsList.length > 0 ? patientsList.map((patient) => ({
          value: patient.id.toString(), // Ensure consistent string value
          label: patient.username || patient.name || patient.patient_name || `Patient ${patient.id}`,
        })) : [])
      ]
    },
    {
      key: 'doctor_id', // Changed from 'doctor_name' to 'doctor_id' for consistency
      label: 'DOCTOR',
      type: 'select',
      placeholder: 'Filter by doctor',
      options: [
        { value: "", label: "All Doctors" },
        ...(doctorsList.length > 0 ? doctorsList.map((doctor) => ({
          value: doctor.id.toString(), // Ensure consistent string value
          label: doctor.username || doctor.name || doctor.doctor_name || `Doctor ${doctor.id}`,
        })) : [])
      ]
    },

    {
      key: 'status',
      label: 'STATUS',
      type: 'select',
      placeholder: 'Filter by status',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
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
        { value: 'this_month', label: 'This Month' }
      ]
    },

  ], [patientsList, doctorsList]);

  // API Service for appointments
  const appointmentApiService = {
    // Get appointments list with patients and doctors data
    getAppointments: async (token, params = {}) => {
      const { perpage = 5, page = 1, filters = {} } = params;
      const queryParams = new URLSearchParams({
        perpage: perpage.toString(),
        page: page.toString(),
        ...(filters.patient_id && { patient_id: filters.patient_id.toString() }),
        ...(filters.doctor_id && { doctor_id: filters.doctor_id.toString() }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to })
      });

      return config.getData(`/appointments/list?${queryParams.toString()}`);
    },

    // Get single appointment details
    getAppointmentById: async (token, id) => {
      return config.getData(`/appointments/view?id=${id}`);
    },

    // Create new appointment
    createAppointment: async (token, data) => {
      return config.postData('/appointments/create', data);
    },

    // Update existing appointment
    updateAppointment: async (token, id, data) => {
      return config.postData(`/appointments/edit?id=${id}`, data);
    },

    // Delete appointment
    deleteAppointment: async (token, id) => {
      return config.postData(`/appointments/delete?id=${id}`, { id: id });
    },
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

  // Helper function to enhance appointment data with patient and doctor names
  const enhanceAppointmentData = (appointments, patients, doctors) => {
    return appointments.map(appointment => {
      // Find patient and doctor data
      const patient = patients.find(p => p.id === appointment.patient_id);
      const doctor = doctors.find(d => d.id === appointment.scheduled_by);

      return {
        ...appointment,
        // Map scheduled_by to doctor_id for consistency
        doctor_id: appointment.scheduled_by,
        // Add patient name if not present
        patient_name: appointment.patient_name || (patient ? (patient.username || patient.name || patient.patient_name) : null),
        // Add doctor name if not present
        doctor_name: appointment.doctor_name || (doctor ? (doctor.username || doctor.name || doctor.doctor_name) : null),
        // Add additional patient/doctor info for display
        patient_info: patient ? {
          id: patient.id,
          name: patient.username || patient.name || patient.patient_name,
          email: patient.email,
          phone: patient.phone
        } : null,
        doctor_info: doctor ? {
          id: doctor.id,
          name: doctor.username || doctor.name || doctor.doctor_name,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization
        } : null
      };
    });
  };

  // Centralized function to fetch appointments with patients and doctors
  const fetchAppointments = async (perpage = itemsPerPage, page = 1, filters = {}, isInitialFetch = false) => {
    try {
      if (isInitialFetch) {
        setLoading(true);
      } else {
        setIsTableLoading(true);
      }

      const response = await appointmentApiService.getAppointments(token, { perpage, page, filters });

      // Validate response
      const validatedResponse = validateApiResponse(response, 'fetch appointments');

      const appointments = validatedResponse.data.data || [];
      const patients = validatedResponse.data.patients || [];
      const doctors = validatedResponse.data.doctors || [];

      // Debug logging to see what data we're getting
      console.log('Appointments API Response:', {
        appointments: appointments.length,
        patients: patients.length,
        doctors: doctors.length,
        sampleAppointment: appointments[0],
        samplePatient: patients[0],
        sampleDoctor: doctors[0]
      });

      const enhancedAppointments = enhanceAppointmentData(appointments, patients, doctors);

      setDataList(enhancedAppointments);
      setPatientsList(patients);
      setDoctorsList(doctors);
      setTotalItems(validatedResponse.data.meta?.total || 0);
      setCurrentPage(validatedResponse.data.meta?.page || 1);
      setItemsPerPage(validatedResponse.data.meta?.perpage || 5);

      // Mark as initialized after first successful fetch
      if (!isInitialized) {
        setIsInitialized(true);
      }

    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      toast.error(error.message || 'Error fetching appointments');
    } finally {
      if (isInitialFetch) {
        setLoading(false);
      } else {
        setIsTableLoading(false);
      }
    }
  };

  // Function to refresh dropdown lists
  const refreshDropdownLists = async () => {
    try {
      // Refresh appointments which will also refresh patients and doctors lists
      await fetchAppointments(itemsPerPage, currentPage, {}, false);
    } catch (error) {
      console.error('Error in refreshDropdownLists:', error);
      // Silently handle refresh errors
    }
  };

  // Function to refresh only patient and doctor lists
  const refreshPatientDoctorLists = async () => {
    try {
      // This could be a separate API call if needed
      // For now, we'll refresh the full appointments list
      await fetchAppointments(itemsPerPage, currentPage, {}, false);
    } catch (error) {
      console.error('Error refreshing patient/doctor lists:', error);
      toast.error('Failed to refresh patient and doctor lists');
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
      default:
        // Custom date range - keep existing filters
        break;
    }

    // Clear quick range filter after applying
    newFilters.quick_date_range = '';

    return newFilters;
  };

  // Function to test the view API (can be called from browser console)
  const testViewAPI = async (appointmentId) => {
    try {
      console.log('Testing appointment view API for ID:', appointmentId);
      const response = await appointmentApiService.getAppointmentById(token, appointmentId);
      console.log('View API Response:', response);
      console.log('Response Status:', response.data?.status);
      console.log('Response Message:', response.data?.message);
      console.log('Appointment Details:', response.data?.data);

      if (response.data?.status === true) {
        // console.log('✅ API call successful');
        // console.log('📅 Appointment Date:', response.data.data.appointment_date);
        // console.log('📝 Status:', response.data.data.status);

        // Patient Information
        if (response.data.data.patient) {
          // console.log('👤 Patient Information:');
          // console.log('   - Name:', response.data.data.patient.full_name);
          // console.log('   - Father Name:', response.data.data.patient.father_name);
          // console.log('   - Email:', response.data.data.patient.email);
          // console.log('   - Phone:', response.data.data.patient.contact_number);
          // console.log('   - Gender:', response.data.data.patient.gender);
          // console.log('   - DOB:', response.data.data.patient.dob);
          // console.log('   - Address:', response.data.data.patient.address);
          // console.log('   - Medical History:', response.data.data.patient.medical_history);
          // console.log('   - Allergies:', response.data.data.patient.allergies);
        }

        // Doctor Information
        if (response.data.data.doctor) {
          // console.log('👨‍⚕️ Doctor Information:');
          // console.log('   - Username:', response.data.data.doctor.username);
          // console.log('   - Full Name:', response.data.data.doctor.full_name);
        }
      } else {
        console.log('❌ API call failed:', response.data?.message);
      }

      return response;
    } catch (error) {
      console.error('View API Test Error:', error);
      return null;
    }
  };

  // Expose test function to window for console testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testAppointmentViewAPI = testViewAPI;
      console.log('Test function available: window.testAppointmentViewAPI(appointmentId)');
    }
  }, [token]);

  // Initialize API configuration and fetch data on component mount
  useEffect(() => {
    if (token) {
      config.initAPI(token);
      // Fetch appointments which includes patients and doctors data
      fetchAppointments(5, 1, {}, true);
    }
  }, [token]); // Initial fetch

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isEditOpen) {
      // Clear selected item when modal closes
      setSelectedItem(null);
    }
  }, [isEditOpen]);

  // Determine if we should show loading state
  const isLoading = loading || !isInitialized || !patientsList.length || !doctorsList.length;

  // Determine if table should show loading (for filters, pagination, etc.)
  const isTableLoadingState = isTableLoading || !isInitialized;

  // Determine if form should show loading
  const isFormLoading = !patientsList.length || !doctorsList.length;

  // Determine if form is ready for operations
  const isFormReady = patientsList.length > 0 && doctorsList.length > 0 && formFields.length > 0;

  // Debug: Log when form fields are ready
  useEffect(() => {
    if (formFields.length > 0) {
      console.log('Form fields are ready:', {
        patientCount: patientsList.length,
        doctorCount: doctorsList.length,
        formFieldsCount: formFields.length,
        samplePatientOptions: formFields.find(f => f.key === 'patient_id')?.options?.slice(0, 3),
        sampleDoctorOptions: formFields.find(f => f.key === 'doctor_id')?.options?.slice(0, 3)
      });
    }
  }, [formFields, patientsList.length, doctorsList.length]);

  // Debug: Log when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      console.log('Selected item changed:', selectedItem);
      console.log('Clean form data:', getCleanFormData(selectedItem));
    }
  }, [selectedItem]);

  const handleViewDetail = async (item) => {
    try {
      setViewDetailLoading(true); // Start loading
      console.log('Fetching appointment details for ID:', item.id);

      const response = await appointmentApiService.getAppointmentById(token, item.id);
      console.log('Appointment view API response:', response);

      if (response.data && response.data.status === true) {
        const detailedItem = response.data.data;

        // Map the API response to display fields with nested patient/doctor data
        const mappedItem = {
          ...detailedItem,
          // Extract patient information from nested object
          patient_name: detailedItem.patient?.full_name || detailedItem.patient?.username || `Patient ID: ${detailedItem.patient_id}`,
          patient_father_name: detailedItem.patient?.father_name || 'Not specified',
          patient_email: detailedItem.patient?.email || 'Not specified',
          patient_phone: detailedItem.patient?.contact_number || 'Not specified',
          patient_gender: detailedItem.patient?.gender || 'Not specified',
          patient_dob: detailedItem.patient?.dob || 'Not specified',
          patient_address: detailedItem.patient?.address || 'Not specified',
          patient_medical_history: detailedItem.patient?.medical_history || 'Not specified',
          patient_allergies: detailedItem.patient?.allergies || 'Not specified',

          // Extract doctor information from nested object
          doctor_name: detailedItem.doctor?.username || detailedItem.doctor?.full_name || `Scheduled by: ${detailedItem.scheduled_by}`,

          // Keep other appointment fields
          appointment_date: detailedItem.appointment_date,
          appointment_time: detailedItem.appointment_time || 'Not specified',
          appointment_reason: detailedItem.appointment_reason || 'Not specified',
          status: detailedItem.status || 'Not specified',
          notes: detailedItem.notes || 'Not specified',
          created_at: detailedItem.created_at,
          updated_at: detailedItem.updated_at
        };

        setSelectedItem(mappedItem);
        setIsDetailOpen(true);
      } else {
        console.error('❌ API response indicates failure:', response.data);
        toast.error(response.data?.message || 'Failed to load appointment details');
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error(error.message || 'Failed to load appointment details');
    } finally {
      setViewDetailLoading(false); // End loading
    }
  };

  const handleEdit = async (itemToEdit) => {
    // Check if formFields are properly loaded
    if (!isFormReady) {
      toast.warning('Please wait for patient and doctor data to load...');
      return;
    }

    console.log('Editing item:', itemToEdit);
    console.log('Available patients:', patientsList.length);
    console.log('Available doctors:', doctorsList.length);

    // Open modal immediately with current data
    setSelectedItem({ ...itemToEdit });
    setIsDetailOpen(false);
    setIsEditOpen(true);

    try {
      setEditLoading(true); // Start loading
      // Fetch detailed appointment data in background
      const response = await appointmentApiService.getAppointmentById(token, itemToEdit.id);

      if (response.data && response.data.status === true) {
        const detailedItem = response.data.data;

        // Map the API response to form data
        const mappedItem = {
          id: detailedItem.id,
          patient_id: detailedItem.patient_id ? detailedItem.patient_id.toString() : '',
          doctor_id: detailedItem.scheduled_by ? detailedItem.scheduled_by.toString() : '', // Use scheduled_by as doctor_id
          appointment_date: (() => {
            // Try to extract a valid date from either appointment_date or appointment_time
            let dateStr = '';
            if (detailedItem.appointment_date) {
              // Handles both "YYYY-MM-DD" and "YYYY-MM-DD HH:mm:ss"
              dateStr = detailedItem.appointment_date.split(' ')[0];
            } else if (detailedItem.appointment_time && detailedItem.appointment_time.includes('T')) {
              // Sometimes appointment_time may contain a full ISO string
              dateStr = detailedItem.appointment_time.split('T')[0];
            }
            // Validate format (should be YYYY-MM-DD)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              return dateStr;
            }
            // Fallback to today if not valid
            return new Date().toISOString().split('T')[0];
          })(),
          appointment_time: detailedItem.appointment_time || (detailedItem.appointment_date && detailedItem.appointment_date.includes(' ') ? detailedItem.appointment_date.split(' ')[1].substring(0, 5) : '09:00'),
          appointment_reason: detailedItem.appointment_reason || '',
          status: detailedItem.status || 'scheduled',
          notes: detailedItem.notes || ''
        };

        console.log('Mapped item for editing:', mappedItem);

        // Update the selected item with fresh data
        setSelectedItem(mappedItem);
      } else {
        toast.error('Failed to load appointment details for editing');
      }
    } catch (error) {
      console.error('Error loading appointment details for editing:', error);
      toast.error('Failed to load appointment details for editing');
    } finally {
      setEditLoading(false); // End loading
    }
  };

  const handleCloseModal = () => {
    setIsEditOpen(false);
    setSelectedItem(null); // Clear selected item to reset form
  };

  const handleAddNew = async () => {
    // Check if formFields are properly loaded
    if (!isFormReady) {
      toast.warning('Please wait for patient and doctor data to load...');
      return;
    }

    console.log('Adding new appointment');
    console.log('Available patients:', patientsList.length);
    console.log('Available doctors:', doctorsList.length);

    // Clear selected item and ensure form is reset
    setSelectedItem(null);
    setIsEditOpen(true);
  };

  const handleSave = async (dataFromForm, isEditing) => {
    try {
      // Check if form is ready
      if (!isFormReady) {
        toast.error('Form is not ready. Please wait for data to load.');
        return;
      }

      setOperationLoading(true); // Start loading

      // Debug: Log the form data received
      console.log('Form data received:', dataFromForm);

      // Validate required fields before proceeding
      if (!dataFromForm.patient_id || !dataFromForm.doctor_id) {
        toast.error('Patient and Doctor are required fields');
        return;
      }

      // Create payload with proper type conversion
      const payload = {
        ...dataFromForm,
        patient_id: parseInt(dataFromForm.patient_id, 10),
        doctor_id: parseInt(dataFromForm.doctor_id, 10),
        // Ensure other fields are properly formatted
        appointment_date: dataFromForm.appointment_date,
        appointment_time: dataFromForm.appointment_time,
        appointment_reason: dataFromForm.appointment_reason || '',
        status: dataFromForm.status || 'scheduled',
        notes: dataFromForm.notes || ''
      };

      // Debug: Log the payload being sent
      console.log('Payload being sent:', payload);

      let response;
      if (isEditing) {
        response = await appointmentApiService.updateAppointment(token, dataFromForm.id, payload);
      } else {
        response = await appointmentApiService.createAppointment(token, payload);
      }

      if (response.data && response.data.success) {
        // Show toast message from API response
        if (response.data.message) {
          toast.success(response.data.message);
        }
        // Close the modal and reset state
        handleCloseModal();
        // Refresh the appointments list
        await fetchAppointments(itemsPerPage, isEditing ? currentPage : 1, {}, false);
      } else {
        toast.error(response.data?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      // Show error message from API response if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} appointment`);
      }
    } finally {
      setOperationLoading(false); // End loading
    }
  };

  const handleDelete = async (itemToDelete) => {
    try {
      const response = await appointmentApiService.deleteAppointment(token, itemToDelete.id);

      if (response.data && response.data.success) {
        // Show toast message from API response
        if (response.data.message) {
          toast.success(response.data.message);
        }
        // Refresh the appointments list
        await fetchAppointments(itemsPerPage, currentPage, {}, false);
      } else {
        toast.error(response.data?.message || "Failed to delete appointment");
      }
    } catch (error) {
      // Show error message from API response if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Failed to delete appointment");
      }
    }
  };

  const customActions = (item) => [
    // {
    //   label: "View Details",
    //   icon: "lucide:eye",
    //   handler: () => handleViewDetail(item),
    // },
    // {
    //   label: "Edit",
    //   icon: "lucide:edit",
    //   handler: () => handleEdit(item),
    // },
    // {
    //   label: "Delete",
    //   icon: "lucide:trash-2",
    //   handler: () => handleDelete(item),
    //   isDanger: true,
    // },
  ];

  return (
    <>
      <CrudTemplate
        title="Appointments"
        description={
          isLoading
            ? "Loading patient and doctor data..."
            : `Manage ${dataList.length} appointment${dataList.length !== 1 ? 's' : ''}`
        }
        icon="lucide:calendar-days"
        loading={isTableLoadingState}
        columns={columns}
        data={dataList}
        formFields={formFields}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        initialFormData={initialAppointmentFormData}
        form={appointmentFormConfig}
        filterColumns={appointmentFilterColumns}
        customActions={customActions}
        onRowClick={handleViewDetail}
        customEditHandler={handleEdit}
        onFilterChange={(filters) => {
          // Handle quick date range filters
          if (filters.quick_date_range && filters.quick_date_range !== '') {
            const processedFilters = handleQuickDateRange(filters.quick_date_range, filters);
            fetchAppointments(itemsPerPage, 1, processedFilters, false);
          } else {
            fetchAppointments(itemsPerPage, 1, filters, false);
          }
        }}
        onPerPageChange={(perPage) => {
          fetchAppointments(perPage, 1, {}, false);
        }}
        onPaginate={(page, perpage) => {
          fetchAppointments(perpage, page, {}, false);
        }}
        onSave={(data, isEditingState) => handleSave(data, isEditingState)}
        onDelete={handleDelete}
        onAdd={handleAddNew}
        disableBuiltInModal={true}
      />
      {selectedItem && (
        <Modal isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xl font-semibold">
                        📅
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Appointment Details</h2>
                      <p className="text-sm text-gray-500">ID: {selectedItem.id}</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-6">
                    {/* Appointment Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary-600">Appointment Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Appointment Date</label>
                          <p className="text-gray-900">
                            {selectedItem.appointment_date ? new Date(selectedItem.appointment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="text-gray-900 capitalize">
                            {selectedItem.status || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Reason for Appointment</label>
                          <p className="text-gray-900">
                            {selectedItem.appointment_reason || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary-600">Patient Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Patient Name</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_name || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Father Name</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_father_name || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_email || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_phone || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Gender</label>
                          <p className="text-gray-900 capitalize">
                            {selectedItem.patient_gender || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_dob ? new Date(selectedItem.patient_dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                          </p>
                        </div>
                        <div className="col-span-full">
                          <label className="text-sm font-medium text-gray-600">Address</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_address || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Medical History</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_medical_history || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Allergies</label>
                          <p className="text-gray-900">
                            {selectedItem.patient_allergies || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary-600">Doctor Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                          <p className="text-gray-900">
                            {selectedItem.doctor_name || 'Not specified'}
                          </p>
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
      )}

      <CrudDialog
        key={`appointment-form-${selectedItem?.id || 'new'}-${isEditOpen}`}
        isOpen={isEditOpen}
        onOpenChange={handleCloseModal}
        title={selectedItem?.id ? "Edit Appointment" : "Add New Appointment"}
        formData={getCleanFormData(selectedItem)}
        form={appointmentFormConfig}
        formFields={isFormLoading ? [
          {
            key: "patient_id",
            label: "Patient",
            type: "select",
            required: true,
            options: [{ value: "", label: "Loading patients..." }],
            disabled: true
          },
          {
            key: "doctor_id",
            label: "Doctor",
            type: "select",
            required: true,
            options: [{ value: "", label: "Loading doctors..." }],
            disabled: true
          },
          {
            key: "appointment_date",
            label: "Appointment Date",
            type: "date",
            required: true,
          },
          {
            key: "appointment_time",
            label: "Appointment Time",
            type: "time",
            required: true,
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
              { value: "scheduled", label: "Scheduled" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            key: "appointment_reason",
            label: "Reason for Appointment",
            type: "textarea",
            required: false,
          },
        ] : formFields}
        onSave={(data) => {
          console.log('Form save triggered with data:', data);
          console.log('Form fields available:', formFields.length);
          console.log('Patients list:', patientsList.length);
          console.log('Doctors list:', doctorsList.length);
          handleSave(data, !!selectedItem?.id);
        }}
        operationLoading={operationLoading || editLoading}
      />
    </>
  );
}

export default AppointmentsPage;