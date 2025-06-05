import React, { useEffect, useState, useMemo } from "react";
import { CrudTemplate } from "../components/crud-template";
// Assuming Avatar is used elsewhere or can be removed if not needed for appointments list
// import { Avatar } from "@heroui/react";
import config from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { EntityDetailDialog } from "../components/entity-detail-dialog";
import { CrudDialog } from "../components/crud-dialog";
import { useDisclosure } from "@heroui/react";

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

function AppointmentsPage() {
  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const [patientsList, setPatientsList] = useState([]);
  // const [categoriesList, setCategoriesList] = useState([]); // For the old inventory-style filters

  // Define formFields for Appointments (as provided in the original code)
  // These keys (e.g., patient_id) are expected in your API data items.
  const formFields = useMemo(() => [
    {
      key: "patient_id",
      label: "Select Patient",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select Patient" },
        ...patientsList.map((patient) => ({
          value: patient.id,
          label: `${patient.username || patient.name}`, // Adjust if patient object has different name field
        })),
      ],
    },
    {
      key: "scheduled_by",
      label: "Scheduled By", // This could be a text field or a select for users/doctors
      type: "text",
      required: false,
    },
    {
      key: "appointment_date",
      label: "Appointment Date",
      type: "date",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "Scheduled", label: "Scheduled" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "appointment_reason",
      label: "Reason for Appointment",
      type: "textarea",
      required: false,
    },
    // {
    //   key: "notes",
    //   label: "Notes",
    //   type: "textarea",
    //   required: false,
    // },
  ], [patientsList]); // Recompute if patientsList changes for the patient_id options

  const columns = useMemo(() => [
    {
      key: 'patient_id',
      label: 'PATIENT',
      render: (item) => {
        const patient = patientsList.find(p => p.id === item.patient_id);
        return patient ? (patient.username || patient.name) : (item.patient_name || item.patient_id || 'N/A');
      }
    },
    {
      key: 'scheduled_by',
      label: 'SCHEDULED BY',
      render: (item) => item.scheduled_by || 'N/A',
    },
    {
      key: 'appointment_date',
      label: 'APPOINTMENT DATE',
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
      render: (item) => item.status || 'N/A',
    },
    // { // Uncomment if 'notes' column is desired in the main table
    //   key: 'notes',
    //   label: 'NOTES',
    //   render: (item) => {
    //     const notes = item.notes;
    //     if (!notes) return 'N/A';
    //     const maxLength = 25;
    //     return notes.length > maxLength ? `${notes.substring(0, maxLength - 3)}...` : notes;
    //   }
    // },
    { key: 'actions', label: 'ACTIONS' }
  ], [patientsList]);

  const initialAppointmentFormData = {
    patient_id: '',
    scheduled_by: '',
    appointment_date: '',
    appointment_reason: '',
    status: 'Scheduled',
    notes: ''
  };

  const appointmentFormConfig = {
    sections: [
      {
        // title: "Appointment Details",
        fields: formFields,
      },
    ],
  };

  // Define filter columns relevant to Appointments
  // CrudTemplate needs to be able to handle these filter types (e.g., 'date_range')
  // or you adapt them to what CrudTemplate supports.
  const appointmentFilterColumns = useMemo(() => [
    {
      key: 'patient_id',
      label: 'PATIENT',
      type: 'select', // Assuming CrudTemplate supports select filters
      options: [
        { value: "", label: "All Patients" },
        ...patientsList.map((patient) => ({
          value: patient.id,
          label: patient.username || patient.name,
        })),
      ]
    },
    { key: 'date_from', label: 'DATE FROM', type: 'date' }, // Example: filter by date range
    { key: 'date_to', label: 'DATE TO', type: 'date' },   // Example: filter by date range
    {
      key: 'status', label: 'STATUS', type: 'select', options: [
        { value: '', label: 'All Statuses' },
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' }
      ]
    },
  ], [patientsList]);


  function getData(perPage = itemsPerPage, page = currentPage, filters = {}) {
    setLoading(true);
    config.initAPI(token);

    const queryParams = new URLSearchParams({ perpage: perPage, page });
    // Add filter parameters to the query, ensuring they match backend expectations
    Object.keys(filters).forEach(key => {
      if (filters[key]) { // Add filter only if it has a value
        queryParams.append(key, filters[key]);
      }
    });

    config
      .getData(
        `/appointments/list?perpage=${perPage}&page=${page}&category_id=${filters.category_id || ""
        }&name=${filters.name || ""}&code=${filters.code || ""}&quantity=${filters.quantity || ""
        }&active=${filters.active || ""}`
      )
      .then((data) => {
        console.log("Appointments data:", data.data.patients);
        const today = new Date();
        const _data = data.data.data.map((item) => {
          // item.active = item.active === 1 ? "Yes" : "No";
          // let expiryDate = new Date(item.expiry_date);
          // const timeDiff = expiryDate.getTime() - today.getTime();
          // const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          // item.is_expired =
          //   dayDiff < 0
          //     ? "Expired"
          //     : dayDiff <= 7
          //     ? `Expired in ${dayDiff} days`
          //     : "No";
          return item;
        });
        setDataList(_data);
        setPatientsList(data.data.patients);
        setTotalItems(data.data.meta.total);
        setCurrentPage(data.data.meta.page);
        setItemsPerPage(data.data.meta.perpage);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        // toast.error("Failed to fetch appointments.");
        setLoading(false);
      });
  }

  useEffect(() => {
    getData(5,1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial fetch

  const handleViewDetail = (item) => {
    const mappedItem = {
      ...item,
      // Mock data for detail view if not present in item, adjust as needed
      consumptionHistory: item.consumptionHistory || [],
      additionHistory: item.additionHistory || [
        // { // Example structure if needed by EntityDetailDialog
        //   username: "System",
        //   additionQty: item.quantity || 0, // Example
        //   unitPrice: item.unitPrice || 0, // Example
        //   time: item.created_at || new Date().toISOString(), // Example
        // },
      ],
    };
    setSelectedItem(mappedItem);
    setIsDetailOpen(true);
  };

  const handleEdit = (itemToEdit) => {
    setSelectedItem(itemToEdit); // itemToEdit should have keys matching formFields
    setIsDetailOpen(false);
    onEditOpen();
  };

  const handleAddNew = () => {
    setSelectedItem(null); // Clear selected item for new entry
    onEditOpen();
  };

  const handleSave = (dataFromForm, isEditing) => {
    // dataFromForm should have keys matching formFields (e.g., patient_id, appointment_date)
    console.log("Saving appointment:", dataFromForm, "Is Editing:", isEditing);

    const endpoint = isEditing ? `/appointments/edit?id=${dataFromForm.id}` : "/appointments/create";

    config.postData(endpoint, dataFromForm)
      .then(response => {
        // toast.success(`Appointment ${isEditing ? 'updated' : 'created'} successfully!`);
        onEditOpenChange(false);
        getData(itemsPerPage, isEditing ? currentPage : 1); // Refresh list
      })
      .catch(error => {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} appointment:`, error);
        // toast.error(`Failed to ${isEditing ? 'update' : 'create'} appointment: ${error.message}`);
      });
  };

  const handleDelete = (itemToDelete) => {
    // Implement confirmation dialog before deleting if CrudTemplate doesn't provide one
    console.log("Deleting appointment:", itemToDelete);
    config.postData(`/appointments/delete?id=${itemToDelete.id}`, {}) // POST or DELETE method as per your API
      .then(() => {
        // toast.success("Appointment deleted successfully!");
        getData(itemsPerPage, currentPage); // Refresh list
      })
      .catch(error => {
        console.error("Error deleting appointment:", error);
        // toast.error(`Failed to delete appointment: ${error.message}`);
      });
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye", // Ensure you have these icons available
      handler: () => handleViewDetail(item),
    },
    // CrudTemplate often provides Edit/Delete buttons by default if onSave/onDelete are passed.
    // If not, or for more control:
    {
      label: "Edit",
      icon: "lucide:edit",
      handler: () => handleEdit(item),
    },
    {
      label: "Delete",
      icon: "lucide:trash-2",
      handler: () => handleDelete(item), // Ensure confirmation
      isDanger: true, // Optional: for styling delete button
    },
  ];

  return (
    <>
      <CrudTemplate
        title="Appointments"
        description="Manage upcoming and past appointments"
        icon="lucide:calendar-days" // Example icon
        loading={loading}
        columns={columns}
        data={dataList}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        initialFormData={initialAppointmentFormData}
        form={appointmentFormConfig}
        filterColumns={appointmentFilterColumns} // Use appointment-specific filters
        customRowActions={customActions} // Use if CrudTemplate default actions are not sufficient
        // onRowClick={handleViewDetail} // Can be enabled if desired
        onFilterChange={(filters) => {
          getData(itemsPerPage, 1, filters);
        }}
        onPerPageChange={(perPage) => {
          // setItemsPerPage(perPage); // itemsPerPage state is already managed by CrudTemplate or here
          getData(perPage, 1);
        }}
        onPaginate={(page, perpage) => {
          getData(perpage, page);
        }}
        onSave={(data, isEditingState) => handleSave(data, isEditingState)} // Pass isEditing state
        onDelete={handleDelete}
        onAdd={handleAddNew} // Handler for Add New button in CrudTemplate
      />
      {selectedItem !== undefined && ( // Check selectedItem to decide rendering dialogs
        <>
          <EntityDetailDialog
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            entity={selectedItem} // selectedItem here should be the full appointment object
            title={`Appointment Details`}
            onEdit={() => selectedItem && handleEdit(selectedItem)}
            entityType="appointment"
          // You might need to pass specific fields or a mapping function to EntityDetailDialog
          // if its internal structure is rigid.
          />
          <CrudDialog
            isOpen={isEditOpen}
            onOpenChange={onEditOpenChange}
            title={selectedItem?.id ? "Edit Appointment" : "Add New Appointment"}
            // formData should be the item to edit, or initial data for new entry
            formData={selectedItem || initialAppointmentFormData}
            form={appointmentFormConfig}
            onSave={(data) => handleSave(data, !!selectedItem?.id)}
          />
        </>
      )}
    </>
  );
}

export default AppointmentsPage;