import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { CrudDialog } from '../components/crud-dialog';
import { useDisclosure } from '@heroui/react';
import config from '../config/config.js';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Filter columns
const filterColumns = [
  { key: 'diagnosis', label: 'DIAGNOSIS' },
  { key: 'doctorName', label: 'DOCTOR' },
  { key: 'patientName', label: 'PATIENT' },
  { key: 'startDate', label: 'START DATE', type: 'date' },
  { key: 'endDate', label: 'END DATE', type: 'date' },
  {
    key: 'medicineType', label: 'MEDICINE TYPE', type: 'select', options: [
      { value: 'tablet', label: 'Tablet' },
      { value: 'syrup', label: 'Syrup' },
      { value: 'injection', label: 'Injection' },
      { value: 'capsule', label: 'Capsule' }
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
  patientId: '',
  diagnosis: '',
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

function PrescriptionPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const [patients, setPatients] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  // Define prescriptionForm inside the component to access patients state
  const prescriptionForm = {
    sections: [
      {
        fields: [
          {
            key: 'doctor',
            label: 'Select Doctor',
            type: 'select',
            required: true,
          },
          {
            key: 'patient_id',
            label: 'Select Patient',
            type: 'select',
            required: true,
            options: [
              ...patients.map(patient => ({
                key: patient.id,
                value: patient.id,
                label: patient.full_name
              }))
            ]
          },

          {
            key: 'diagnosis',
            label: 'Select Diagnosis',
            type: 'select',
            required: true,
            options: [
              { key: 'general', value: 'general', label: 'General Checkup' },
              { key: 'followup', value: 'followup', label: 'Follow-up' },
              { key: 'specialist', value: 'specialist', label: 'Specialist Consultation' }
            ]
          },
          {
            key: 'prescription_date',
            label: 'Prescription Date',
            type: 'date',
            required: true,
            max: new Date().toISOString().split("T")[0]
          },
          {
            key: 'notes',
            label: 'Note',
            type: 'textarea',
          }
        ]
      },
      {
        fields: [
          { key: 'medicines', type: 'medicines-table' }
        ]
      }
    ]
  };

  // Add data transformation function
  const transformFormData = (formData) => {
    return {
      patient_id: formData.patient_id,
      diagnosis: formData.diagnosis,
      prescription_date: formData.prescription_date,
      notes: formData.notes,
      medicines: formData.medicines
    };
  };

  function getPrescriptions(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/prescriptions/list?perpage=${perpage}&page=${page}&diagnosis=${filters.diagnosis || ''}&doctorName=${filters.doctorName || ''}&patientName=${filters.patientName || ''}`)
      .then(response => {
        // Check if response exists and has the expected structure
        if (!response || !response.data) {
          console.error('Invalid response structure:', response);
          toast.error('Invalid response from server');
          setLoading(false);
          return;
        }

        const { success, message, data, meta } = response.data;

        if (!success) {
          console.error('Error in prescription data:', message);
          toast.error(message || 'Failed to fetch prescriptions');
          setLoading(false);
          return;
        }

        // Ensure data is properly structured for the table
        const formattedData = data.map(prescription => ({
          ...prescription,
          id: prescription.id || prescription._id, // Ensure id exists
          key: prescription.id || prescription._id, // Add key for React
          diagnosis: prescription.diagnosis || '',
          doctorName: prescription.doctor.username || '',
          patientName: prescription.patient.full_name || '',
          date: prescription_date || prescription.prescription_date || '',
          description: prescription.description || ''
        }));

        setPrescriptions(formattedData);
        setTotalItems(meta?.total || 0);
        setCurrentPage(meta?.page || 1);
        setItemsPerPage(meta?.perpage || 5);
        setLoading(false);
        console.log("formattedData", formattedData);
      })
      .catch(error => {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to fetch prescriptions. Please try again.');
        setLoading(false);
      });
  }

  useEffect(() => {
    getPrescriptions(5, 1);

    //call the patient list api
    config.initAPI(token);
    config.getData(`/patients/list`)
      .then(data => {
        setPatients(data.data.data);
        console.log("patient list", data.data.data);
      })
      .catch(error => console.error('Error fetching patients:', error));


  }, []);

  const handleViewDetail = (prescription) => {
    //call the prescription detail api
    config.initAPI(token);
    config.getData(`/prescriptions/view?id=${prescription.id}`)
      .then(response => {
        console.log("Full API Response:", response);
        console.log("Prescription Data:", response.data.prescription);
        response.data.prescription = {
            ...response.data.prescription,
            doctor: response.data.doctor,
            patient: response.data.patient
        };
        console.log("Prescription Data:", response.data.doctor);
        console.log("Prescription Items:", response.data.prescriptionItems);
        setPrescriptionItems(response.data.prescriptionItems);
        setSelectedPrescription(response.data.prescription);
        setIsDetailOpen(true);
      })
      .catch(error => console.error('Error fetching prescription details:', error));
  };

  const handleEdit = () => {
    setSelectedPrescription(selectedPrescription);
    setIsDetailOpen(false);
    onEditOpen();
  };

  const handleSave = (updatedData) => {
    if (selectedPrescription) {
      config.postData(`/prescriptions/edit?id=${selectedPrescription.id}`, updatedData)
        .then(response => {
          setPrescriptions(prescriptions.map(prescription =>
            prescription.id === selectedPrescription.id ? updatedData : prescription
          ));
          toast.success('Prescription updated successfully!');
          onEditOpenChange(false);
        })
        .catch(error => {
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
        loading={loading}
        columns={columns}
        data={prescriptions}
        initialFormData={initialFormData}
        form={prescriptionForm}
        addButtonLabel="Add Prescription"
        filterColumns={filterColumns}
        customRowActions={customActions}
        onRowClick={handleViewDetail}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onFilterChange={(filters) => {
          getPrescriptions(itemsPerPage, 1, filters);
        }}
        onPerPageChange={(perPage) => {
          getPrescriptions(perPage, 1);
        }}
        onPaginate={(page, perpage) => {
          getPrescriptions(perpage, page);
        }}
        onSave={(data, isEditing) => {
          const transformedData = transformFormData(data);
          if (isEditing) {
            config.postData(`/prescriptions/edit?id=${data.id}`, transformedData)
              .then(response => {
                if (response.data.success) {
                  getPrescriptions(itemsPerPage, 1, filters);
                  toast.success('Prescription updated successfully!');
                } else {
                  toast.error(response.data.message);
                }
              })
              .catch(error => {
                console.error('Error updating prescription:', error);
                toast.error('Failed to update prescription');
              });
          } else {
            config.postData('/prescriptions/create', transformedData)
              .then(response => {
                if (response.data.success) {
                  setPrescriptions([...prescriptions, response.data.prescription]);
                  console.log("prescription created", response.data.prescription);
                  toast.success(response.data.message);
                } else {
                  toast.error(response.data.message);
                }
              })
              .catch(error => {
                console.error('Error creating prescription:', error);
                toast.error('Failed to create prescription');
              });
          }
        }}
        onDelete={(item) => {
          config.postData(
            '/prescriptions/delete',
            { id: item.id }  // ✅ Send ID in request body
          )
            .then(response => {
              setPrescriptions(prescriptions.filter(prescription => prescription.id !== item.id));
              toast.success('Prescription deleted successfully!');
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
            onEdit={handleEdit}
            entityType="prescription"
            prescriptionItems={prescriptionItems || []}
          />
          <CrudDialog
            isOpen={isEditOpen}
            onOpenChange={onEditOpenChange}
            title="Edit Prescription"
            formData={selectedPrescription}
            form={prescriptionForm}
            onSave={handleSave}
          />
        </>
      )}
    </>
  );
}

export default PrescriptionPage;