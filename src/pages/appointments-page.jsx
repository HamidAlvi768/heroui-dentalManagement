import React, { use, useEffect, useState } from "react";
import { CrudTemplate } from "../components/crud-template";
import { Avatar } from "@heroui/react";
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
    key: 'patient_id',
    label: 'Patient',
  },
  { key: 'scheduled_by', label: 'DOCTOR' },
  { key: 'appointment_date', label: 'DATE' },
  { key: 'appointment_reason', label: 'REASON' },
  { key: 'status', label: 'STATUS' },
  { key: 'notes', label: 'NOTES' },
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
  const [categoriesList, setCategoriesList] = useState([]);
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

  const handleViewDetail = (item) => {
    // Map the item data to match our detail view fields
    const mappedItem = {
      ...item,
      consumptionHistory: [], // Empty consumption history as specified
      additionHistory: [
        {
          username: "Safeer",
          additionQty: 21,
          unitPrice: 1,
          time: "2024-09-17 13:44:43",
        },
      ],
    };
    setSelectedItem(mappedItem);
    setIsDetailOpen(true);
  };

  const handleEdit = () => {
    // Convert the item data to match the form fields format
    setSelectedItem((prevItem) => ({
      ...prevItem,
      category: prevItem.category,
      subCategory: prevItem.subCategory,
      item: prevItem.item,
      quantity: prevItem.quantity,
      unitPrice: prevItem.unitPrice,
    }));
    setIsDetailOpen(false);
    onEditOpen();
  };

  const handleSave = (updatedData) => {
    // Here you would typically save to backend
    console.log("Saving item:", updatedData);
    onEditOpenChange(false);
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item),
    },
  ];

  const formFields = [
    {
      key: "patient_id",
      label: "Select Patient",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select Patient" },
        ...patientsList.map((patient) => ({
          value: patient.id,
          label: `${patient.username}`,
        })),
      ],
    },
    {
      key: "scheduled_by",
      label: "Scheduled By",
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
      key: "appointment_reason",
      label: "Reason for Appointment",
      type: "textarea",
      required: false,
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
      key: "notes",
      label: "Notes",
      type: "textarea",
      required: false,
    },
  ];

  const inventoryForm = {
    sections: [
      {
        title: "Appointment Item",
        fields: formFields,
      },
    ],
  };

  // Filter columns
  const filterColumns = [
    {
      key: "category_id",
      label: "Category",
      type: "select",
      options: [
        { value: "", label: "Select Category" },
        ...categoriesList.map((category) => ({
          value: category.id,
          label: category.name,
        })),
      ],
      required: true,
    },
    { key: "name", label: "NAME" },
    { key: "code", label: "CODE" },
    { key: "quantity", label: "QUANTITY" },
    {
      key: "active",
      label: "ACTIVE",
      type: "select",
      required: true,
      options: [
        { value: "1", label: "Yes" },
        { value: "0", label: "No" },
      ],
    },
  ];

  function getData(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config
      .getData(
        `/appointments/list?perpage=${perpage}&page=${page}&category_id=${filters.category_id || ""
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
        console.log(error);
      });
  }

  console.log("Patients List:", dataList);

  useEffect(() => {
    getData(5, 1);
  }, []);

  return (
    <>
      <CrudTemplate
        title="Appointment"
        description="Manage inventory"
        icon="lucide:boxes"
        loading={loading}
        columns={columns}
        data={dataList}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        initialFormData={initialFormData}
        form={inventoryForm}
        filterColumns={filterColumns}
        customRowActions={customActions}
        onRowClick={handleViewDetail}
        onFilterChange={(filters) => {
          console.log("Filters:", filters);
          getData(itemsPerPage, 1, filters);
        }}
        onPerPageChange={(perPage) => {
          getData(perPage, 1);
        }}
        onPaginate={(page, perpage) => {
          console.log("Page:", page, "Perpage:", perpage);
          getData(perpage, page);
        }}
        onSave={(data, isEditing) => {
          console.log("Save patient:", data, "isEditing:", isEditing);
          if (isEditing) {
            // Update existing Category
            config
              .postData(`/appointments/edit?id=${data.id}`, data)
              .then((response) => {
                console.log("Appointment updated:", response.data);
                setDataList(
                  dataList.map((item) => (item.id === data.id ? data : item))
                );
                toast.success("Appointment updated successfully!");
              })
              .catch((error) => {
                console.error("Error updating Category:", error);
              });
          } else {
            // Create new Category
            config
              .postData("/appointments/create", data)
              .then((response) => {
                console.log("Appointment created:", response.data.category);
                setDataList([...dataList, response.data.category]);
                toast.success("Appointment created successfully!");
              })
              .catch((error) => {
                console.error("Error creating Category:", error);
              });
          }
        }}
        onDelete={(item) => {
          config
            .postData(`/appointments/delete?id=${item.id}`, item)
            .then((response) => {
              console.log("Appointment deleted:", response.data);
              setDataList(
                dataList.filter((filterItem) => filterItem.id !== item.id)
              );
              toast.success("Appointment deleted successfully!");
            })
            .catch((error) => {
              console.error("Error deleting Category:", error);
            });
          console.log("Delete Item:", item);
        }}
      />
      {selectedItem && (
        <>
          <EntityDetailDialog
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            entity={selectedItem}
            title={selectedItem.item}
            onEdit={handleEdit}
            entityType="inventory"
          />
          <CrudDialog
            isOpen={isEditOpen}
            onOpenChange={onEditOpenChange}
            title="Edit Item"
            formData={selectedItem}
            form={inventoryForm}
            onSave={handleSave}
          />
        </>
      )}
    </>
  );
}

export default AppointmentsPage;
