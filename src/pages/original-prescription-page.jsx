import React, { useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { CrudDialog } from '../components/crud-dialog';
import { useDisclosure } from '@heroui/react';

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

const prescriptionForm = {
  sections: [
    {
      title: 'Prescription Info',
      fields: [
        {
          key: 'patientId',
          label: 'Select Patient',
          type: 'select',
          required: true,
          options: [
            { value: 'P1001', label: 'John Doe' },
            { value: 'P1002', label: 'Jane Smith' }
          ]
        },
        {
          key: 'diagnosis',
          label: 'Select Diagnosis',
          type: 'select',
          required: true,
          options: [
            { value: 'general', label: 'General Checkup' },
            { value: 'followup', label: 'Follow-up' },
            { value: 'specialist', label: 'Specialist Consultation' }
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
          type: 'textarea'
        }
      ]
    },
    {
      title: 'Medicines',
      fields: [
        { key: 'medicines', type: 'medicines-table' }
      ]
    }
  ]
};

const mockData = [
  {
    id: '1',
    diagnosis: 'General Checkup',
    description: 'Regular health examination',
    doctorName: 'Dr. John Smith',
    patientName: 'Emma Wilson',
    date: '2025-04-24'
  }
];

function PrescriptionPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const handleViewDetail = (prescription) => {
    // Map additional fields needed for the detail view
    const mappedPrescription = {
      ...prescription,
      prescriptionId: '0039',
      doctorName: 'Super Admin',
      patientName: 'test Patient',
      phone: '1234567899',
      mrnNumber: '2504150',
      date: '25 Apr 2025',
      medicines: [
        { name: 'Parodontax', description: '1+1', duration: '' },
        { name: 'Enziclor', description: '1+1+1', duration: '' }
      ],
      note: ''  // Empty note field at the bottom
    };
    setSelectedPrescription(mappedPrescription);
    setIsDetailOpen(true);
  };

  const handleEdit = () => {
    // Convert the prescription data to match the form fields format
    const formData = {
      patientId: selectedPrescription.patientName,
      diagnosis: selectedPrescription.diagnosis,
      prescriptionDate: selectedPrescription.date,
      note: selectedPrescription.note,
      medicines: selectedPrescription.medicines.map(med => ({
        medicineType: 'tablet', // Default type since it's not in the detail view
        medicineName: med.name,
        description: med.description,
        days: '',
        weeks: '',
        months: ''
      }))
    };
    setSelectedPrescription({ ...selectedPrescription, ...formData });
    setIsDetailOpen(false);
    onEditOpen();
  };

  const handleSave = (updatedData) => {
    // Here you would typically save to backend
    console.log('Saving prescription:', updatedData);
    onEditOpenChange(false);
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item)
    }
  ];

  return (
    <>
      <CrudTemplate
        title="Prescriptions"
        description="Manage patient prescriptions"
        icon="lucide:pill"
        columns={columns}
        data={mockData}
        initialFormData={initialFormData}
        form={prescriptionForm}
        addButtonLabel="Add Prescription"
        filterColumns={filterColumns}
        customRowActions={customActions}
        onRowClick={handleViewDetail}
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