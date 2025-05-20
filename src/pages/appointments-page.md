``

import React, { useState, useEffect } from "react";
import { CrudTemplate } from "../components/crud-template";
import { EntityDetailDialog } from "../components/entity-detail-dialog";
import config from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";

// Filter columns
const filterColumns = [
  { key: "id", label: "ID" },
  { key: "patient_id", label: "Patient ID" },
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
    options: [
      { value: "Scheduled", label: "Scheduled" },
      { value: "Completed", label: "Completed" },
      { value: "Cancelled", label: "Cancelled" },
    ],
  },
];

const columns = [
  { key: "id", label: "ID" },
  { key: "patient_id", label: "Patient ID" },
  { key: "appointment_date", label: "Appointment Date" },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notes" },
  { key: "actions", label: "Actions" },
];

const initialFormData = {
  patient_id: "",
  scheduled_by: "",
  appointment_date: "",
  appointment_reason: "",
  status: "Scheduled",
  notes: "",
};

function AppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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

  const appointmentForm = {
    sections: [
      {
        title: "Appointment Info",
        fields: formFields,
      },
    ],
  };

  const fetchAppointments = () => {
    setLoading(true);
    config.initAPI(token);
    config
      .getData("/appointments/list")
      .then((response) => {
        setAppointments(response.data.data);
        setPatientsList(response.data.patients);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        setLoading(false);
      });
  };

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    const updatedAppointment = { ...selectedAppointment, status: newStatus };
    config
      .postData(
        `/appointments/edit?id=${selectedAppointment.id}`,
        updatedAppointment
      )
      .then(() => {
        setAppointments(
          appointments.map((app) =>
            app.id === selectedAppointment.id ? updatedAppointment : app
          )
        );
        toast.success("Appointment status updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating appointment status:", error);
        toast.error("Failed to update appointment status.");
      });
  };

  const handleSave = (data, isEditing) => {
    if (isEditing) {
      config
        .postData(`/appointments/edit?id=${data.id}`, data)
        .then(() => {
          setAppointments(
            appointments.map((app) => (app.id === data.id ? data : app))
          );
          toast.success("Appointment updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating appointment:", error);
          toast.error("Failed to update appointment.");
        });
    } else {
      config
        .postData("/appointments/create", data)
        .then((response) => {
          setAppointments([...appointments, response.data]);
          toast.success("Appointment created successfully!");
        })
        .catch((error) => {
          console.error("Error creating appointment:", error);
          toast.error("Failed to create appointment.");
        });
    }
  };

  const handleDelete = (appointment) => {
    config
      .postData(`/appointments/delete?id=${appointment.id}`)
      .then(() => {
        setAppointments(
          appointments.filter((app) => app.id !== appointment.id)
        );
        toast.success("Appointment deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment.");
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <>
      <CrudTemplate
        title="Appointments"
        description="Manage patient appointments"
        icon="lucide:calendar"
        columns={columns}
        data={appointments}
        loading={loading}
        initialFormData={initialFormData}
        form={appointmentForm}
        addButtonLabel="Add Appointment"
        filterColumns={filterColumns}
        customRowActions={(item) => [
          {
            label: "View Details",
            icon: "lucide:eye",
            handler: () => handleViewDetail(item),
          },
        ]}
        onRowClick={handleViewDetail}
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
      {selectedAppointment && (
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedAppointment}
          title={`Appointment Details - ${selectedAppointment.patient_id}`}
          onEdit={() => console.log("Edit appointment:", selectedAppointment)}
          onStatusChange={handleStatusChange}
          entityType="appointment"
        />
      )}
    </>
  );
}

export default AppointmentsPage;
``