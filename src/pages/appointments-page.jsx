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
  const [doctorsList, setDoctorsList] = useState([]);
  // const [categoriesList, setCategoriesList] = useState([]); // For the old inventory-style filters

  // Define formFields for Appointments (as provided in the original code)
  // These keys (e.g., patient_id) are expected in your API data items.
  const formFields = useMemo(() => {
    //console doctor id
    console.log("Doctors List in formFields:", doctorsList);
    console.log('Form Fields - Doctor Options:', doctorsList.map(d => ({ id: d.id, username: d.username })));
    return [
      {
        key: "patient_id",
        label: "Select Patient",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Select Patient" },
          ...patientsList.map((patient) => ({
            value: patient.id,
            label: `${patient.username || patient.name}`,
          })),
        ],
      },
      {
        key: "doctor_id",
        label: "Select Doctor",
        type: "select",
        required: true,
        options: [
          { value: "", label: "Select Doctor" },
          ...doctorsList.map((doctor) => ({
            value: doctor.id,
            label: `${doctor.name || doctor.username}`,
          })),
        ],
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
    ];
  }, [patientsList, doctorsList]);

  const columns = useMemo(() => {
    console.log('Current dataList:', dataList);
    console.log('Patients List:', patientsList);
    console.log('Doctors List:', doctorsList);
    
    return [
      {
        key: 'patient_id',
        label: 'PATIENT',
        render: (item) => {
          console.log('Rendering patient column for item:', item);
          const patient = patientsList.find(p => p.id === item.patient_id);
          return patient ? (patient.username || patient.name) : (item.patient_name || item.patient_id || 'N/A');
        }
      },
      {
        key: 'doctor_id',
        label: 'DOCTOR',
        render: (item) => {
          console.log('Rendering doctor column for item:', item);
          const doctor = doctorsList.find(d => d.id === item.doctor_id);
          return doctor ? (doctor.name || doctor.username) : (item.doctor_name || item.doctor_id || 'N/A');
        }
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
      { key: 'actions', label: 'ACTIONS' }
    ];
  }, [patientsList, doctorsList, dataList]);

  const initialAppointmentFormData = {
    patient_id: '',
    doctor_id: '',
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
      type: 'select',
      options: [
        { value: "", label: "All Patients" },
        ...patientsList.map((patient) => ({
          value: patient.id,
          label: patient.username || patient.name,
        })),
      ]
    },
    {
      key: 'doctor_id',
      label: 'DOCTOR',
      type: 'select',
      options: [
        { value: "", label: "All Doctors" },
        ...doctorsList.map((doctor) => ({
          value: doctor.id,
          label: doctor.name || doctor.username,
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
  ], [patientsList, doctorsList]);


  function getData(perPage = itemsPerPage, page = currentPage, filters = {}) {
    setLoading(true);
    config.initAPI(token);

    const queryParams = new URLSearchParams({ perpage: perPage, page });
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
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
        console.log("Raw API Response:", data.data);
        const _data = data.data.patients.map((item) => {
          console.log("Processing appointment item:", item);
          return item;
        });
        console.log("Processed appointments data:", _data);
        setDataList(_data);
        setPatientsList(data.data.patients || []);
        setDoctorsList(data.data.doctors || []);
        setTotalItems(data.data.meta.total);
        setCurrentPage(data.data.meta.page);
        setItemsPerPage(data.data.meta.perpage);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        setLoading(false);
      });
  }

  useEffect(() => {
    getData(5,1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial fetch

  useEffect(() => {
    // Log patientsList to check structure and keys
    if (patientsList && patientsList.length > 0) {
      console.log('Sample patient object:', patientsList[0]);
      console.log('All patient keys:', Object.keys(patientsList[0]));
    } else {
      console.log('patientsList is empty or not loaded');
    }
  }, [patientsList]);

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
    console.log('Form Data Received:', {
      raw: dataFromForm,
      doctor_id: dataFromForm.doctor_id,
      doctor_id_type: typeof dataFromForm.doctor_id,
      doctor_id_value: dataFromForm.doctor_id
    });

    // Validate required fields before proceeding
    if (!dataFromForm.patient_id || !dataFromForm.doctor_id) {
      console.error('Required fields missing:', {
        patient_id: dataFromForm.patient_id,
        doctor_id: dataFromForm.doctor_id,
        formData: dataFromForm
      });
      return;
    }

    // Create payload with proper type conversion
    const payload = {
      ...dataFromForm,
      patient_id: parseInt(dataFromForm.patient_id, 10),
      doctor_id: parseInt(dataFromForm.doctor_id, 10),
      // Ensure other fields are properly formatted
      appointment_date: dataFromForm.appointment_date,
      appointment_reason: dataFromForm.appointment_reason || '',
      status: dataFromForm.status || 'Scheduled',
      notes: dataFromForm.notes || ''
    };

    console.log('Processed Payload:', {
      raw: payload,
      doctor_id: payload.doctor_id,
      doctor_id_type: typeof payload.doctor_id
    });

    // Remove any undefined or null values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        console.log(`Removing ${key} from payload because it's ${payload[key]}`);
        delete payload[key];
      }
    });

    const endpoint = isEditing ? `/appointments/edit?id=${dataFromForm.id}` : "/appointments/create";
    console.log('Final Payload:', payload);

    config.postData(endpoint, payload)
      .then(response => {
        console.log('API Response:', response);
        if (response.success) {
          onEditOpenChange(false);
          getData(itemsPerPage, isEditing ? currentPage : 1);
        } else {
          console.error('API Error:', response.message);
        }
      })
      .catch(error => {
        console.error(`Error ${isEditing ? 'updating' : 'creating'} appointment:`, error);
        console.error('Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
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