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

  // Define prescriptionForm inside the component to access patients state
  const prescriptionForm = {
    sections: [
      {
        fields: [
          {
            key: 'patientId',
            label: 'Select Patient',
            type: 'select',
            required: true,
            options: patients.map(patient => ({
              key: patient.id,
              value: patient.id,
              text: patient.name
            }))
          },
          {
            key: 'diagnosis',
            label: 'Select Diagnosis',
            type: 'select',
            required: true,
            options: [
              { key: 'general', value: 'general', text: 'General Checkup' },
              { key: 'followup', value: 'followup', text: 'Follow-up' },
              { key: 'specialist', value: 'specialist', text: 'Specialist Consultation' }
            ]
          },
          {
            key: 'prescriptionDate',
            label: 'Prescription Date',
            type: 'date',
            required: true
          },
          {
            key: 'note',
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

  function getPrescriptions(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/prescriptions/list?perpage=${perpage}&page=${page}&diagnosis=${filters.diagnosis || ''}&doctorName=${filters.doctorName || ''}&patientName=${filters.patientName || ''}`)
      .then(data => {
        if (!data.success) {
          console.error('Error in prescription data:', data.message);
          toast.error(data.message || 'Failed to fetch prescriptions');
          setLoading(false);
          return;
        }
        // Ensure data is properly structured for the table
        const formattedData = data.data.data.map(prescription => ({
          ...prescription,
          id: prescription.id || prescription._id, // Ensure id exists
          key: prescription.id || prescription._id, // Add key for React
          diagnosis: prescription.diagnosis || '',
          doctorName: prescription.doctorName || '',
          patientName: prescription.patientName || '',
          date: prescription.date || prescription.prescriptionDate || '',
          description: prescription.description || ''
        }));
        console.log("formattedData", formattedData);
        setPrescriptions(formattedData);
        setTotalItems(data.data.meta.total);
        setCurrentPage(data.data.meta.page);
        setItemsPerPage(data.data.meta.perpage);
        setLoading(false);
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
    setSelectedPrescription(prescription);
    setIsDetailOpen(true);
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
          if (isEditing) {
            config.postData(`/prescriptions/edit?id=${data.id}`, data)
              .then(response => {
                setPrescriptions(prescriptions.map(prescription => 
                  prescription.id === data.id ? data : prescription
                ));
                toast.success('Prescription updated successfully!');
              })
              .catch(error => {
                console.error('Error updating prescription:', error);
                toast.error('Failed to update prescription');
              });
          } else {
            config.postData('/prescriptions/create', data)
              .then(response => {
                if (response.data.success) {
                  setPrescriptions([...prescriptions, response.data.prescription]);
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