import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { CrudDialog } from '../components/crud-dialog';
import { useDisclosure } from '@heroui/react';
import config from '../config/config.js';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { filter } from 'lodash';

// Base filter columns structure
const baseFilterColumns = [
  {
    key: 'diagnosis',
    label: 'DIAGNOSIS',
    type: 'select',
    placeholder: 'Select Diagnosis',
    options: [
      { value: '', label: 'All Diagnoses' },
      { value: 'general', label: 'General Checkup' },
      { value: 'followup', label: 'Follow-up' },
      { value: 'specialist', label: 'Specialist Consultation' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'routine', label: 'Routine Visit' }
    ]
  },
  {
    key: 'doctor_id',
    label: 'DOCTOR',
    type: 'select',
    placeholder: 'Select Doctor',
    options: [
      { value: '', label: 'All Doctors' }
    ]
  },
  {
    key: 'patient_id',
    label: 'PATIENT',
    type: 'select',
    placeholder: 'Select Patient',
    options: [
      { value: '', label: 'All Patients' }
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

const columns = [
  {
    key: 'diagnosis',
    label: 'DIAGNOSIS',
    render: (item) => (
      <div>
        <div className="font-medium">{item.diagnosis}</div>
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
  doctor: '',
  patient_id: '',
  diagnosis: '',
  prescription_date: new Date().toISOString().split('T')[0], // Set today's date as default
  notes: '',
  prescription_items: [{
    medicine_type: '',
    medicine_id: '',
    medicine_name: '',
    description: '',
    dosage: '',
    frequency: '',
    duration: ''
  }]
};

function PrescriptionPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [formLoading, setFormLoading] = useState(true);
  const [filterColumns, setFilterColumns] = useState(baseFilterColumns);

  // Define prescriptionForm with sections for CrudDialog
  const prescriptionForm = React.useMemo(() => ({
    sections: [
      {
        title: 'Basic Information',
        fields: [
          {
            key: 'doctor',
            label: 'Select Doctor',
            type: 'select',
            required: true,
            disabled: formLoading || doctors.length === 0,
            options: doctors.length > 0 ? doctors.map(doctor => ({
              key: doctor.id,
              value: doctor.id,
              label: doctor.full_name || doctor.username
            })) : [{ key: '', value: '', label: formLoading ? 'Loading doctors...' : 'No doctors available' }]
          },
          {
            key: 'patient_id',
            label: 'Select Patient',
            type: 'select',
            required: true,
            disabled: formLoading || patients.length === 0,
            options: patients.length > 0 ? patients.map(patient => ({
              key: patient.id,
              value: patient.id,
              label: patient.full_name
            })) : [{ key: '', value: '', label: formLoading ? 'Loading patients...' : 'No patients available' }]
          },
          {
            key: 'diagnosis',
            label: 'Diagnosis Type',
            type: 'select',
            required: true,
            options: [
              { key: 'general', value: 'general', label: 'General Checkup' },
              { key: 'followup', value: 'followup', label: 'Follow-up' },
              { key: 'specialist', value: 'specialist', label: 'Specialist Consultation' },
              { key: 'emergency', value: 'emergency', label: 'Emergency' },
              { key: 'routine', value: 'routine', label: 'Routine Visit' }
            ]
          },
          {
            key: 'prescription_date',
            label: 'Prescription Date',
            type: 'date',
            required: true,
          },
          {
            key: 'notes',
            label: 'Clinical Notes',
            type: 'textarea',
            placeholder: 'Enter any additional clinical notes, instructions, or observations...',
            required: false
          }
        ]
      },
      {
        title: 'Medications',
        fields: [
          {
            key: 'prescription_items',
            label: 'Add Prescription Items',
            type: 'prescription-items-table',
            required: false,
            helpText: 'Select medicines and treatments from inventory'
          }
        ]
      }
    ]
  }), [doctors, patients, formLoading]);

  // Define formFields for backward compatibility (if needed)
  const formFields = React.useMemo(() => [
    {
      key: 'doctor',
      label: 'Select Doctor',
      type: 'select',
      required: true,
      disabled: formLoading || doctors.length === 0,
      options: doctors.length > 0 ? doctors.map(doctor => ({
        key: doctor.id,
        value: doctor.id,
        label: doctor.full_name || doctor.username
      })) : [{ key: '', value: '', label: formLoading ? 'Loading doctors...' : 'No doctors available' }]
    },
    {
      key: 'patient_id',
      label: 'Select Patient',
      type: 'select',
      required: true,
      disabled: formLoading || patients.length === 0,
      options: patients.length > 0 ? patients.map(patient => ({
        key: patient.id,
        value: patient.id,
        label: patient.full_name
      })) : [{ key: '', value: '', label: formLoading ? 'Loading patients...' : 'No patients available' }]
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis Type',
      type: 'select',
      required: true,
      options: [
        { key: 'general', value: 'general', label: 'General Checkup' },
        { key: 'followup', value: 'followup', label: 'Follow-up' },
        { key: 'specialist', value: 'specialist', label: 'Specialist Consultation' },
        { key: 'emergency', value: 'emergency', label: 'Emergency' },
        { key: 'routine', value: 'routine', label: 'Routine Visit' }
      ]
    },
    {
      key: 'prescription_date',
      label: 'Prescription Date',
      type: 'date',
      required: true,
    },
    {
      key: 'notes',
      label: 'Clinical Notes',
      type: 'textarea',
      placeholder: 'Enter any additional clinical notes, instructions, or observations...',
      required: false
    }
  ], [doctors, patients, formLoading]);



  // Function to handle quick date range filters
  const handleQuickDateRange = (quickRange, currentFilters) => {
    const today = new Date();
    const newFilters = { ...currentFilters };

    switch (quickRange) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        newFilters.startDate = todayStr;
        newFilters.endDate = todayStr;
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        newFilters.startDate = tomorrowStr;
        newFilters.endDate = tomorrowStr;
        break;
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        newFilters.startDate = startOfWeek.toISOString().split('T')[0];
        newFilters.endDate = endOfWeek.toISOString().split('T')[0];
        break;
      case 'next_week':
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        newFilters.startDate = nextWeekStart.toISOString().split('T')[0];
        newFilters.endDate = nextWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        newFilters.startDate = startOfMonth.toISOString().split('T')[0];
        newFilters.endDate = endOfMonth.toISOString().split('T')[0];
        break;
      case 'this_year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        newFilters.startDate = startOfYear.toISOString().split('T')[0];
        newFilters.endDate = endOfYear.toISOString().split('T')[0];
        break;
      default:
        // Custom date range - keep existing filters
        break;
    }

    // Clear quick range filter after applying
    newFilters.quick_date_range = '';

    return newFilters;
  };

  // Add data transformation function
  const transformFormData = (formData) => {
    const transformedData = {
      doctor: formData.doctor,
      patient_id: formData.patient_id,
      diagnosis: formData.diagnosis,
      prescription_date: formData.prescription_date,
      notes: formData.notes,
      prescription_items: (formData.prescription_items || []).map(item => ({
        medicine_type: item.medicine_type || '',
        medicine_name: item.medicine_name || '', // Store the medicine name, not ID
        instructions: item.description || '', // Map description to instructions for API
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        duration: item.duration || ''
      }))
    };

    return transformedData;
  };

  function getPrescriptions(perpage = 5, page = 1, filters = {}, isFiltering = false) {
    if (isFiltering) {
      setFilterLoading(true);
    } else {
      setLoading(true);
    }

    if (filters.diagnosis === "[object Object]"
      || filters.doctor_id === "[object Object]"
      || filters.patient_id === "[object Object]"
      || filters.quick_date_range === "[object Object]"
    ) {
      filters = {}
    }

    config.initAPI(token);
    config.getData(`/prescriptions/list?perpage=${perpage}&page=${page}&diagnosis=${filters.diagnosis || ''}&doctro_id=${filters.doctor_id || ''}&patient_id=${filters.patient_id || ''}`)
      .then(response => {
        // Check if response exists and has the expected structure
        if (!response || !response.data) {
          console.error('Invalid response structure:', response);
          toast.error('Invalid response from server');
          if (isFiltering) {
            setFilterLoading(false);
          } else {
            setLoading(false);
          }
          return;
        }

        const { success, message, data, meta } = response.data;

        if (!success) {
          console.error('Error in prescription data:', message);
          toast.error(message || 'Failed to fetch prescriptions');
          if (isFiltering) {
            setFilterLoading(false);
          } else {
            setLoading(false);
          }
          return;
        }

        // Ensure data is properly structured for the table
        const formattedData = data.map(prescription => ({
          ...prescription,
          id: prescription.id || prescription._id, // Ensure id exists
          key: prescription.id || prescription._id, // Add key for React
          diagnosis: prescription.diagnosis || '',
          doctorName: prescription.doctor?.username || '',
          patientName: prescription.patient?.full_name || '',
          date: prescription.prescription_date || '',
          description: prescription.description || '',
        }));

        setPrescriptions(formattedData);
        setTotalItems(meta?.total || 0);
        setCurrentPage(meta?.page || 1);
        setItemsPerPage(meta?.perpage || 5);
        if (isFiltering) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
        console.log("formattedData", formattedData);
      })
      .catch(error => {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to fetch prescriptions. Please try again.');
        if (isFiltering) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    getPrescriptions(5, 1);

    //call the patient list api
    config.initAPI(token);
    config.getData(`/patients/list`)
      .then(response => {
        if (response.data && response.data.success) {
          setPatients(response.data.data);
          console.log("patient list", response.data.data);
        } else {
          console.error('Failed to fetch patients:', response.data?.message);
        }
      })
      .catch(error => console.error('Error fetching patients:', error));

    //call the doctor list api
    config.initAPI(token);
    config.getData(`/users/list?role=doctor`)
      .then(response => {
        if (response.data && response.data.success) {
          setDoctors(response.data.data);
          console.log("doctor list", response.data.data);
        } else {
          console.error('Failed to fetch doctors:', response.data?.message);
        }
      })
      .catch(error => console.error('Error fetching doctors:', error));

    //call the inventory list api
    config.initAPI(token);
    config.getData(`/inventory/list?perpage=100&active=1`)
      .then(response => {
        if (response.data && response.data.success) {
          setInventoryItems(response.data.data);
          console.log("inventory list", response.data.data);
        } else {
          console.error('Failed to fetch inventory:', response.data?.message);
        }
      })
      .catch(error => console.error('Error fetching inventory:', error));

  }, []);

  // Set form loading to false when doctors and patients are loaded
  useEffect(() => {
    if (doctors.length > 0 && patients.length > 0) {
      setFormLoading(false);
    }
  }, [doctors, patients]);

  // Update filter options when doctors and patients data is loaded
  useEffect(() => {
    if (doctors.length > 0 || patients.length > 0) {
      // Update filter columns with dynamic options
      const updatedFilterColumns = baseFilterColumns.map(filter => {
        if (filter.key === 'doctor_id') {
          return {
            ...filter,
            options: [
              { value: '', label: 'All Doctors' },
              ...doctors.map(doctor => ({
                key: doctor.id,
                value: doctor.id,
                label: doctor.full_name || doctor.username
              }))
            ]
          };
        }
        if (filter.key === 'patient_id') {
          return {
            ...filter,
            options: [
              { value: '', label: 'All Patients' },
              ...patients.map(patient => ({
                key: patient.id,
                value: patient.id,
                label: patient.full_name
              }))
            ]
          };
        }
        return filter;
      });

      // Update the filter columns state
      setFilterColumns(updatedFilterColumns);
    }
  }, [doctors, patients]);

  const handleViewDetail = (prescription) => {
    // Set loading state for detail view
    setDetailLoading(true);

    // Call the prescription detail API
    config.initAPI(token);
    config.getData(`/prescriptions/view?id=${prescription.id}`)
      .then(response => {
        console.log("Full API Response:", response);

        // Check if we have data in the nested structure, regardless of success status
        if (response.data && response.data.data && response.data.data.prescription) {
          // Extract prescription data from the nested structure
          const prescriptionData = response.data.data.prescription || {};
          const doctorData = response.data.data.prescription.doctor || {};
          const patientData = response.data.data.prescription.patient || {};
          const prescriptionItemsData = response.data.data.items || [];

          console.log("Prescription Data:", prescriptionData);
          console.log("Doctor Data:", doctorData);
          console.log("Patient Data:", patientData);
          console.log("Prescription Items:", prescriptionItemsData);

          // Validate that we have the essential data
          if (!prescriptionData.id) {
            toast.error('Invalid prescription data received');
            setDetailLoading(false);
            return;
          }

          // Combine all data into a single prescription object
          const completePrescription = {
            ...prescriptionData,
            // Ensure we have all required fields
            id: prescriptionData.id || prescription.id,
            diagnosis: prescriptionData.diagnosis || '',
            prescription_date: prescriptionData.prescription_date || '',
            notes: prescriptionData.notes || '',
            // Map the fields to match what the EntityDetailDialog expects
            prescribed_by: prescriptionData.prescribed_by,
            patient_id: prescriptionData.patient_id,
            created_at: prescriptionData.created_at,
            updated_at: prescriptionData.updated_at,
            // Only include essential doctor and patient information
            doctor: {
              username: doctorData.username || 'Unknown Doctor'
            },
            patient: {
              full_name: patientData.full_name || 'Unknown Patient'
            }
          };

          // Set the prescription items and selected prescription
          setPrescriptionItems(prescriptionItemsData);
          setSelectedPrescription(completePrescription);
          setIsDetailOpen(true);

          // Show success message if we have data
          if (prescriptionData.id) {
            toast.success('Prescription details loaded successfully');
          }
        } else {
          console.error('Failed to fetch prescription details:', response.data?.message);
          toast.error(response.data?.message || 'Failed to fetch prescription details');
        }
      })
      .catch(error => {
        console.error('Error fetching prescription details:', error);
        toast.error('Failed to fetch prescription details. Please try again.');
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const handleEdit = () => {
    // Transform prescription items to match form structure
    const transformedPrescription = {
      ...selectedPrescription,
      prescription_items: prescriptionItems.map(item => ({
        medicine_type: item.medicine_type || '',
        medicine_id: '', // Will be set when medicine is selected
        medicine_name: item.medicine_name || '', // This should already be the name from API
        description: item.instructions || '', // Map instructions to description
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        duration: item.duration || ''
      }))
    };

    setSelectedPrescription(transformedPrescription);
    setIsDetailOpen(false);
    onEditOpen();
  };

  const handleModalClose = () => {
    setSaveLoading(false);
  };

  const handleSave = (updatedData) => {
    if (selectedPrescription) {
      setSaveLoading(true);
      const transformedData = transformFormData(updatedData);
      config.postData(`/prescriptions/edit?id=${selectedPrescription.id}`, transformedData)
        .then(response => {
          setSaveLoading(false);
          if (response.data && response.data.success) {
            // Refresh the prescriptions list with current filters and page
            getPrescriptions(itemsPerPage, currentPage, {});
            toast.success('Prescription updated successfully!');
            onEditOpenChange(false);
          } else {
            toast.error(response.data?.message || 'Failed to update prescription');
          }
        })
        .catch(error => {
          setSaveLoading(false);
          console.error('Error updating prescription:', error);
          toast.error('Failed to update prescription');
        });
    }
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item)
    },
    {
      label: "Create Invoice",
      icon: "lucide:file-plus",
      handler: () => {
        navigate(`/invoices/${item.id}`, { state: { prescription: item } });
      }
    }
  ];

  return (
    <>
      <CrudTemplate
        title="Prescriptions"
        description="Manage patient prescriptions"
        icon="lucide:pill"
        loading={loading || filterLoading}
        columns={columns}
        data={prescriptions}
        initialFormData={initialFormData}
        form={prescriptionForm}
        formFields={formFields}
        addButtonLabel="Add New"
        filterColumns={filterColumns}
        customRowActions={customActions}
        onRowClick={handleViewDetail}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        inventoryItems={inventoryItems}
        operationLoading={saveLoading}
        onFilterChange={(filters) => {
          // Transform filter values from IDs to names for API call
          const transformedFilters = { ...filters };
          // Convert doctor ID to doctor name


          // Handle quick date range filters
          if (filters.quick_date_range && filters.quick_date_range !== '') {
            const processedFilters = handleQuickDateRange(filters.quick_date_range, transformedFilters);


            getPrescriptions(itemsPerPage, 1, processedFilters, true);
          } else {
            getPrescriptions(itemsPerPage, 1, transformedFilters, true);
          }
        }}
        onPerPageChange={(perPage) => {
          getPrescriptions(perPage, 1);
        }}
        onPaginate={(page, perpage) => {
          getPrescriptions(perpage, page);
        }}
        onSave={async (data, isEditing) => {
          setSaveLoading(true);
          try {
            const transformedData = transformFormData(data);

            // Validate required fields
            if (!transformedData.doctor || !transformedData.patient_id || !transformedData.diagnosis) {
              toast.error('Please fill in all required fields');
              return false;
            }

            if (isEditing) {
              const response = await config.postData(`/prescriptions/edit?id=${data.id}`, transformedData);
              if (response.data && response.data.success) {
                // Refresh the prescriptions list to show updated data
                getPrescriptions(itemsPerPage, currentPage, {});
                toast.success('Prescription updated successfully!');
                return true; // Signal successful save
              } else {
                toast.error(response.data?.message || 'Failed to update prescription');
                return false;
              }
            } else {
              const response = await config.postData('/prescriptions/create', transformedData);
              if (response.data && response.data.success) {
                // Reset to first page and refresh the prescriptions list to show latest data
                setCurrentPage(1);
                getPrescriptions(itemsPerPage, 1, {});
                toast.success(response.data.message || 'Prescription created successfully!');
                return true; // Signal successful save
              } else {
                toast.error(response.data?.message || 'Failed to create prescription');
                return false;
              }
            }
          } catch (error) {
            console.error('Error saving prescription:', error);
            toast.error('Failed to save prescription');
            return false;
          } finally {
            setSaveLoading(false);
          }
        }}
        onDelete={(item) => {
          config.postData(
            '/prescriptions/delete',
            { id: item.id }  // ✅ Send ID in request body
          )
            .then(response => {
              if (response.data && response.data.success) {
                toast.success('Prescription deleted successfully!');
              } else {
                toast.error(response.data?.message || 'Failed to delete prescription');
              }
              setPrescriptions(prescriptions.filter(prescription => prescription.id !== item.id));
            })
            .catch(error => {
              console.error('Error deleting prescription:', error);
              toast.error('Failed to delete prescription');
            });
        }}

      />
      {selectedPrescription && (
        <>
          <EntityDetailDialog
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            entity={selectedPrescription}
            title="Prescription Details"
            entityType="prescription"
            prescriptionItems={prescriptionItems || []}
            loading={detailLoading}
          />
          <CrudDialog
            isOpen={isEditOpen}
            onOpenChange={(open) => {
              onEditOpenChange(open);
              if (!open) handleModalClose();
            }}
            title="Edit Prescription"
            formData={selectedPrescription}
            form={prescriptionForm}
            formFields={formFields}
            onSave={handleSave}
            inventoryItems={inventoryItems}
            operationLoading={saveLoading}
          />
        </>
      )}
    </>
  );
}

export default PrescriptionPage;