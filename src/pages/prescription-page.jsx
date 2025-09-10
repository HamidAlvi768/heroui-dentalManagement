import React, { use, useEffect, useState } from "react";
import { CrudTemplate } from "../components/crud-template";
import { CrudDialog } from "../components/crud-dialog";
import { useDisclosure } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Badge,
} from "@heroui/react";
import config from "../config/config.js";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { filter } from "lodash";
import useFormData from "../hooks/useFormData";
import { Activity } from "lucide-react";

// Base filter columns structure
const baseFilterColumns = [
  {
    key: "diagnosis",
    label: "DIAGNOSIS",
    type: "select",
    placeholder: "Select Diagnosis",
    options: [
      { value: "", label: "All Diagnoses" },
      { value: "general", label: "General Checkup" },
      { value: "followup", label: "Follow-up" },
      { value: "specialist", label: "Specialist Consultation" },
      { value: "emergency", label: "Emergency" },
      { value: "routine", label: "Routine Visit" },
    ],
  },
  {
    key: "doctor_id",
    label: "DOCTOR",
    type: "select",
    placeholder: "Select Doctor",
    options: [{ value: "", label: "All Doctors" }],
  },
  {
    key: "patient_id",
    label: "PATIENT",
    type: "select",
    placeholder: "Select Patient",
    options: [{ value: "", label: "All Patients" }],
  },
  {
    key: "quick_date_range",
    label: "QUICK FILTERS",
    type: "select",
    placeholder: "Quick date filters",
    options: [
      { value: "", label: "Custom Date Range" },
      { value: "today", label: "Today" },
      { value: "tomorrow", label: "Tomorrow" },
      { value: "this_week", label: "This Week" },
      { value: "next_week", label: "Next Week" },
      { value: "this_month", label: "This Month" },
      { value: "this_year", label: "This Year" },
    ],
  },
];

const columns = [
  {
    key: "diagnosis",
    label: "DIAGNOSIS",
    render: (item) => (
      <div>
        <div className="font-medium">{item.diagnosis}</div>
        <div className="text-default-500 text-xs">{item.description}</div>
      </div>
    ),
  },
  { key: "doctorName", label: "DOCTOR" },
  { key: "patientName", label: "PATIENT" },
  {
    key: "date",
    label: "DATE",
    render: (item) => {
      if (!item.date) return "N/A";
      try {
        return new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return item.date;
      }
    },
  },
  { key: "actions", label: "ACTIONS" },
];

const initialFormData = {
  doctor: "",
  patient_id: "",
  diagnosis: "",
  prescription_date: new Date().toISOString().split("T")[0], // Set today's date as default
  notes: "",
  prescription_items: [
    {
      medicine_type: "",
      medicine_id: "",
      medicine_name: "",
      description: "",
      dosage: "",
      frequency: "",
      duration: "",
    },
  ],
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
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [formLoading, setFormLoading] = useState(true);
  const [filterColumns, setFilterColumns] = useState(baseFilterColumns);

  // Define prescriptionForm with sections for CrudDialog
  const prescriptionForm = React.useMemo(
    () => ({
    sections: [
      {
          title: "Basic Information",
        fields: [
          {
              key: "doctor",
              label: "Select Doctor",
              type: "select",
            required: true,
            disabled: formLoading || doctors.length === 0,
              options:
                doctors.length > 0
                  ? doctors.map((doctor) => ({
              key: doctor.id,
              value: doctor.id,
                      label: doctor.full_name || doctor.username,
                    }))
                  : [
                      {
                        key: "",
                        value: "",
                        label: formLoading
                          ? "Loading doctors..."
                          : "No doctors available",
                      },
                    ],
            },
            {
              key: "patient_id",
              label: "Select Patient",
              type: "select",
            required: true,
            disabled: formLoading || patients.length === 0,
              options:
                patients.length > 0
                  ? patients.map((patient) => ({
              key: patient.id,
              value: patient.id,
                      label: patient.full_name,
                    }))
                  : [
                      {
                        key: "",
                        value: "",
                        label: formLoading
                          ? "Loading patients..."
                          : "No patients available",
                      },
                    ],
            },
            {
              key: "diagnosis",
              label: "Diagnosis Type",
              type: "select",
            required: true,
            options: [
                { key: "general", value: "general", label: "General Checkup" },
                { key: "followup", value: "followup", label: "Follow-up" },
                {
                  key: "specialist",
                  value: "specialist",
                  label: "Specialist Consultation",
                },
                { key: "emergency", value: "emergency", label: "Emergency" },
                { key: "routine", value: "routine", label: "Routine Visit" },
              ],
            },
            {
              key: "prescription_date",
              label: "Prescription Date",
              type: "date",
            required: true,
          },
          {
              key: "notes",
              label: "Clinical Notes",
              type: "textarea",
              placeholder:
                "Enter any additional clinical notes, instructions, or observations...",
              required: false,
            },
          ],
        },
        {
          title: "Medications",
        fields: [
          {
              key: "prescription_items",
              label: "Add Prescription Items",
              type: "prescription-items-table",
            required: false,
              helpText: "Select medicines and treatments from inventory",
            },
          ],
        },
      ],
    }),
    [doctors, patients, formLoading]
  );

  // Define formFields for backward compatibility (if needed)
  const formFields = React.useMemo(
    () => [
      {
        key: "doctor",
        label: "Select Doctor",
        type: "select",
      required: true,
      disabled: formLoading || doctors.length === 0,
        options:
          doctors.length > 0
            ? doctors.map((doctor) => ({
        key: doctor.id,
        value: doctor.id,
                label: doctor.full_name || doctor.username,
              }))
            : [
                {
                  key: "",
                  value: "",
                  label: formLoading
                    ? "Loading doctors..."
                    : "No doctors available",
                },
              ],
      },
      {
        key: "patient_id",
        label: "Select Patient",
        type: "select",
      required: true,
      disabled: formLoading || patients.length === 0,
        options:
          patients.length > 0
            ? patients.map((patient) => ({
        key: patient.id,
        value: patient.id,
                label: patient.full_name,
              }))
            : [
                {
                  key: "",
                  value: "",
                  label: formLoading
                    ? "Loading patients..."
                    : "No patients available",
                },
              ],
      },
      {
        key: "diagnosis",
        label: "Diagnosis Type",
        type: "select",
      required: true,
      options: [
          { key: "general", value: "general", label: "General Checkup" },
          { key: "followup", value: "followup", label: "Follow-up" },
          {
            key: "specialist",
            value: "specialist",
            label: "Specialist Consultation",
          },
          { key: "emergency", value: "emergency", label: "Emergency" },
          { key: "routine", value: "routine", label: "Routine Visit" },
        ],
      },
      {
        key: "prescription_date",
        label: "Prescription Date",
        type: "date",
      required: true,
    },
    {
        key: "notes",
        label: "Clinical Notes",
        type: "textarea",
        placeholder:
          "Enter any additional clinical notes, instructions, or observations...",
        required: false,
      },
    ],
    [doctors, patients, formLoading]
  );

  // Function to handle quick date range filters
  const handleQuickDateRange = (quickRange, currentFilters) => {
    const today = new Date();
    const newFilters = { ...currentFilters };

    switch (quickRange) {
      case "today":
        const todayStr = today.toISOString().split("T")[0];
        newFilters.startDate = todayStr;
        newFilters.endDate = todayStr;
        break;
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        newFilters.startDate = tomorrowStr;
        newFilters.endDate = tomorrowStr;
        break;
      case "this_week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        newFilters.startDate = startOfWeek.toISOString().split("T")[0];
        newFilters.endDate = endOfWeek.toISOString().split("T")[0];
        break;
      case "next_week":
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        newFilters.startDate = nextWeekStart.toISOString().split("T")[0];
        newFilters.endDate = nextWeekEnd.toISOString().split("T")[0];
        break;
      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        newFilters.startDate = startOfMonth.toISOString().split("T")[0];
        newFilters.endDate = endOfMonth.toISOString().split("T")[0];
        break;
      case "this_year":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        newFilters.startDate = startOfYear.toISOString().split("T")[0];
        newFilters.endDate = endOfYear.toISOString().split("T")[0];
        break;
      default:
        // Custom date range - keep existing filters
        break;
    }

    // Clear quick range filter after applying
    newFilters.quick_date_range = "";

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
      prescription_items: (formData.prescription_items || []).map((item) => ({
        medicine_type: item.medicine_type || "",
        medicine_name: item.medicine_name || "", // Store the medicine name, not ID
        instructions: item.description || "", // Map description to instructions for API
        dosage: item.dosage || "",
        frequency: item.frequency || "",
        duration: item.duration || "",
      })),
    };

    return transformedData;
  };

  function getPrescriptions(
    perpage = 5,
    page = 1,
    filters = {},
    isFiltering = false
  ) {
    if (isFiltering) {
      setFilterLoading(true);
    } else {
      setLoading(true);
    }

    if (
      filters.diagnosis === "[object Object]" ||
      filters.doctor_id === "[object Object]" ||
      filters.patient_id === "[object Object]" ||
      filters.quick_date_range === "[object Object]"
    ) {
      filters = {};
    }

    config.initAPI(token);
    config
      .getData(
        `/prescriptions/list?perpage=${perpage}&page=${page}&diagnosis=${
          filters.diagnosis || ""
        }&doctro_id=${filters.doctor_id || ""}&patient_id=${
          filters.patient_id || ""
        }`
      )
      .then((response) => {
        // Check if response exists and has the expected structure
        if (!response || !response.data) {
          console.error("Invalid response structure:", response);
          toast.error("Invalid response from server");
          if (isFiltering) {
            setFilterLoading(false);
          } else {
            setLoading(false);
          }
          return;
        }

        const { success, message, data, meta } = response.data;

        if (!success) {
          console.error("Error in prescription data:", message);
          toast.error(message || "Failed to fetch prescriptions");
          if (isFiltering) {
            setFilterLoading(false);
          } else {
            setLoading(false);
          }
          return;
        }

        // Ensure data is properly structured for the table
        const formattedData = data.map((prescription) => ({
          ...prescription,
          id: prescription.id || prescription._id, // Ensure id exists
          key: prescription.id || prescription._id, // Add key for React
          diagnosis: prescription.diagnosis || "",
          doctorName: prescription.doctor?.username || "",
          patientName: prescription.patient?.full_name || "",
          date: prescription.prescription_date || "",
          description: prescription.description || "",
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
      .catch((error) => {
        console.error("Error fetching prescriptions:", error);
        toast.error("Failed to fetch prescriptions. Please try again.");
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
    config
      .getData(`/patients/list`)
      .then((response) => {
        if (response.data && response.data.success) {
          setPatients(response.data.data);
          console.log("patient list", response.data.data);
        } else {
          console.error("Failed to fetch patients:", response.data?.message);
        }
      })
      .catch((error) => console.error("Error fetching patients:", error));

    //call the doctor list api
    config.initAPI(token);
    config
      .getData(`/users/list?role=doctor`)
      .then((response) => {
        if (response.data && response.data.success) {
          setDoctors(response.data.data);
          console.log("doctor list", response.data.data);
        } else {
          console.error("Failed to fetch doctors:", response.data?.message);
        }
      })
      .catch((error) => console.error("Error fetching doctors:", error));

    //call the inventory list api
    config.initAPI(token);
    config
      .getData(`/inventory/list?perpage=100&active=1`)
      .then((response) => {
        if (response.data && response.data.success) {
          setInventoryItems(response.data.data);
          console.log("inventory list", response.data.data);
        } else {
          console.error("Failed to fetch inventory:", response.data?.message);
        }
      })
      .catch((error) => console.error("Error fetching inventory:", error));
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
      const updatedFilterColumns = baseFilterColumns.map((filter) => {
        if (filter.key === "doctor_id") {
          return {
            ...filter,
            options: [
              { value: "", label: "All Doctors" },
              ...doctors.map((doctor) => ({
                key: doctor.id,
                value: doctor.id,
                label: doctor.full_name || doctor.username,
              })),
            ],
          };
        }
        if (filter.key === "patient_id") {
          return {
            ...filter,
            options: [
              { value: "", label: "All Patients" },
              ...patients.map((patient) => ({
                key: patient.id,
                value: patient.id,
                label: patient.full_name,
              })),
            ],
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
    config
      .getData(`/prescriptions/view?id=${prescription.id}`)
      .then((response) => {
        console.log("Full API Response:", response);

        // Check if we have data in the nested structure, regardless of success status
        if (
          response.data &&
          response.data.data &&
          response.data.data.prescription
        ) {
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
            toast.error("Invalid prescription data received");
            setDetailLoading(false);
            return;
          }

          // Combine all data into a single prescription object
          const completePrescription = {
            ...prescriptionData,
            // Ensure we have all required fields
            id: prescriptionData.id || prescription.id,
            diagnosis: prescriptionData.diagnosis || "",
            prescription_date: prescriptionData.prescription_date || "",
            notes: prescriptionData.notes || "",
            // Map the fields to match what the EntityDetailDialog expects
            prescribed_by: prescriptionData.prescribed_by,
            patient_id: prescriptionData.patient_id,
            created_at: prescriptionData.created_at,
            updated_at: prescriptionData.updated_at,
            // Only include essential doctor and patient information
            doctor: {
              username: doctorData.username || "Unknown Doctor",
            },
            patient: {
              full_name: patientData.full_name || "Unknown Patient",
            },
          };

          // Set the prescription items and selected prescription
          setPrescriptionItems(prescriptionItemsData);
          setSelectedPrescription(completePrescription);
          setIsDetailOpen(true);

          // Show success message if we have data
          if (prescriptionData.id) {
            toast.success("Prescription details loaded successfully");
          }
        } else {
          console.error(
            "Failed to fetch prescription details:",
            response.data?.message
          );
          toast.error(
            response.data?.message || "Failed to fetch prescription details"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching prescription details:", error);
        toast.error("Failed to fetch prescription details. Please try again.");
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const handleEdit = () => {
    // Transform prescription items to match form structure
    const transformedPrescription = {
      ...selectedPrescription,
      prescription_items: prescriptionItems.map((item) => ({
        medicine_type: item.medicine_type || "",
        medicine_id: "", // Will be set when medicine is selected
        medicine_name: item.medicine_name || "", // This should already be the name from API
        description: item.instructions || "", // Map instructions to description
        dosage: item.dosage || "",
        frequency: item.frequency || "",
        duration: item.duration || "",
      })),
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
      config
        .postData(
          `/prescriptions/edit?id=${selectedPrescription.id}`,
          transformedData
        )
        .then((response) => {
          setSaveLoading(false);
          if (response.data && response.data.success) {
            // Refresh the prescriptions list with current filters and page
            getPrescriptions(itemsPerPage, currentPage, {});
            toast.success("Prescription updated successfully!");
            onEditOpenChange(false);
          } else {
            toast.error(
              response.data?.message || "Failed to update prescription"
            );
          }
        })
        .catch((error) => {
          setSaveLoading(false);
          console.error("Error updating prescription:", error);
          toast.error("Failed to update prescription");
        });
    }
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item),
    },
    {
      label: "Create Invoice",
      icon: "lucide:file-plus",
      handler: () => {
        navigate(`/invoices/${item.id}`, { state: { prescription: item } });
      },
    },
  ];

  // Prescription Detail Modal Component
  const PrescriptionDetailModal = ({
    isOpen,
    onClose,
    prescription,
    prescriptionItems,
    loading,
  }) => {
    const dynamicFormData = useFormData();

    if (!prescription) return null;

    const handlePrint = () => {
      const printContent = document.getElementById("prescription-unified-content");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Prescription - ${prescription.id}</title>
            <style>
              @page { 
                margin: 0; 
                size: A4;
              }
              
              @media print {
                body { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                  font-family: 'Arial', sans-serif !important;
                  color: black !important;
                  background: white !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                .no-print { display: none !important; }
                
                /* Force table header styles in print */
                table thead {
                  background: black !important;
                  color: white !important;
                }
                
                table thead tr {
                  background: black !important;
                  color: white !important;
                }
                
                table thead th {
                  background: black !important;
                  color: white !important;
                  border: 1px solid black !important;
                }
                
                /* Ensure table borders are visible */
                table, table tr, table td, table th {
                  border-collapse: collapse !important;
                  border: 1px solid black !important;
                }
                
                /* Force all black text to stay black */
                * {
                  color: black !important;
                }
                
                table thead * {
                  color: white !important;
                }
              }
              
              @media screen {
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  background: white; 
                }
              }
              
              /* Universal styles that apply to both screen and print */
              body { 
                font-family: 'Arial', sans-serif !important; 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              table thead {
                background: black !important;
                color: white !important;
              }
              
              table thead tr {
                background: black !important;
                color: white !important;
              }
              
              table thead th {
                background: black !important;
                color: white !important;
                border: 1px solid black !important;
                font-weight: 700 !important;
              }
              
              table tbody td {
                color: black !important;
                border: 1px solid black !important;
              }
              
              table {
                border-collapse: collapse !important;
              }
            </style>
          </head>
          <body>
            <div id="prescription-print-content" class="prescription-container" style="max-width: 650px; margin: 0 auto; padding: 20px; background: white; font-family: Arial, sans-serif;">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="bg-white border-b border-gray-200">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 rounded-lg shadow-sm bg-primary/10 flex items-center justify-center">
                  <i className="text-primary text-lg font-bold">i</i>
                </div>
                <h1 className="text-xl font-bold text-black">
                  Prescription Detail
                </h1>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-black text-lg">
                    Loading prescription details...
                  </p>
                </div>
              </div>
            ) : (
              <div
                id="prescription-unified-content"
                className="prescription-container"
                style={{
                  maxWidth: "650px",
                  margin: "0 auto",
                  padding: "20px",
                  background: "white",
                  fontFamily: "Arial, sans-serif",
                  color: "black",
                }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "0px",
                    padding: "20px",
                    marginBottom: "10px",
                  }}
                >
                  {/* Clinic Branding & Prescription Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "3px solid black",
                      paddingBottom: "16px",
                      marginBottom: "10px",
                      position: "relative",
                    }}
                  >
                    {/* Branding Section */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            marginRight: "0px",
                            background: "transparent",
                            borderRadius: "0px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "0px",
                          }}
                        >
                          <Activity size={20} color="black" />
                        </div>

                        <div>
                          <h1
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "black",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {dynamicFormData.websiteName}
                          </h1>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "black",
                          lineHeight: "1.4",
                          fontWeight: "normal",
                        }}
                      >
                        <div style={{ marginBottom: "2px" }}>
                          Office#1, City Plaza, F-10 Markaz, Islamabad
                        </div>
                        <div>Clinic Contact: 0516131786</div>
                      </div>
                    </div>

                    {/* PRESCRIPTION Title - absolutely centered */}
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "black",
                        margin: "0",
                        textTransform: "uppercase",
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        top: "0px",
                        letterSpacing: "1px",
                      }}
                    >
                      PRESCRIPTION
                    </h2>
                  </div>

                  {/* Prescription Information */}
                  <div style={{ marginBottom: "10px" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "black",
                        margin: "8px 0",
                      }}
                    >
                      Prescription Information
                    </h3>
                    <div
                      style={{
                        background: "white",
                        padding: "8px",
                        border: "1px solid black",
                        borderLeft: "4px solid black",
                        borderRadius: "6px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "nowrap",
                          gap: "16px",
                          whiteSpace: "nowrap", // 👈 prevents breaking into two lines
                        }}
                      >
                        {/* Doctor */}
                        <div style={{ display: "flex", gap: "3px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500" }}>
                            Doctor:
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>
                            {prescription.doctor?.username || "N/A"}
                          </span>
                        </div>

                        {/* Patient */}
                        <div style={{ display: "flex", gap: "3px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500" }}>
                            Patient:
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>
                            {prescription.patient?.full_name || "N/A"}
                          </span>
                        </div>

                        {/* Diagnosis */}
                        <div style={{ display: "flex", gap: "3px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500" }}>
                            Diagnosis:
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>
                            {prescription.diagnosis || "N/A"}
                          </span>
                        </div>

                        {/* Date */}
                        <div style={{ display: "flex", gap: "3px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500" }}>
                            Date:
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>
                            {prescription.prescription_date || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medications Table */}
                  <div style={{ marginBottom: "10px" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "black",
                        margin: "8px 0",
                      }}
                    >
                      Medications
                    </h3>
                    <div
                      style={{
                        background: "white",
                        border: "2px solid black",
                        borderRadius: "6px",
                        overflow: "hidden",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "none",
                        }}
                      >
                        <thead style={{ background: "black", color: "white" }}>
                          <tr>
                            <th
                              style={{
                                padding: "8px 8px",
                                textAlign: "left",
                                fontWeight: "700",
                                fontSize: "10px",
                                border: "1px solid black",
                              }}
                            >
                              MEDICINE NAME
                            </th>
                            <th
                              style={{
                                padding: "8px 8px",
                                textAlign: "left",
                                fontWeight: "700",
                                fontSize: "10px",
                                border: "1px solid black",
                              }}
                            >
                              DOSAGE
                            </th>
                            <th
                              style={{
                                padding: "8px 8px",
                                textAlign: "left",
                                fontWeight: "700",
                                fontSize: "10px",
                                border: "1px solid black",
                              }}
                            >
                              FREQUENCY
                            </th>
                            <th
                              style={{
                                padding: "8px 8px",
                                textAlign: "left",
                                fontWeight: "700",
                                fontSize: "10px",
                                border: "1px solid black",
                              }}
                            >
                              DURATION
                            </th>
                            <th
                              style={{
                                padding: "8px 8px",
                                textAlign: "left",
                                fontWeight: "700",
                                fontSize: "10px",
                                border: "1px solid black",
                              }}
                            >
                              INSTRUCTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptionItems && prescriptionItems.length > 0 ? (
                            prescriptionItems.map((item, index) => (
                              <tr
                                key={index}
                                style={{
                                  background:
                                    index % 2 === 0 ? "white" : "#f5f5f5",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid black",
                                    fontSize: "10px",
                                    color: "black",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.medicine_name || "N/A"}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid black",
                                    fontSize: "10px",
                                    color: "black",
                                  }}
                                >
                                  {item.dosage || "N/A"}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid black",
                                    fontSize: "10px",
                                    color: "black",
                                  }}
                                >
                                  {item.frequency || "N/A"}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid black",
                                    fontSize: "10px",
                                    color: "black",
                                  }}
                                >
                                  {item.duration || "N/A"}
                                </td>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid black",
                                    fontSize: "10px",
                                    color: "black",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.instructions || "N/A"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                style={{
                                  padding: "20px",
                                  textAlign: "center",
                                  color: "black",
                                  fontSize: "10px",
                                }}
                              >
                                No medications found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {prescription.notes && (
                    <div
                      style={{
                        background: "white",
                        padding: "16px",
                        border: "1px solid black",
                        borderLeft: "4px solid black",
                        borderRadius: "6px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "black",
                          margin: "0 0 8px 0",
                        }}
                      >
                        Clinical Notes
                      </h3>
                      <p
                        style={{
                          color: "black",
                          lineHeight: "1.4",
                          fontSize: "12px",
                          margin: "0",
                        }}
                      >
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="bg-white border-t border-gray-200">
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  size="md"
                  color="secondary"
                  variant="light"
                  onPress={onClose}
                >
                  Close
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="md"
                  color="primary"
                  variant="solid"
                  onPress={handlePrint}
                  startContent={<span>🖨️</span>}
                >
                  Print Prescription
                </Button>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

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
          if (filters.quick_date_range && filters.quick_date_range !== "") {
            const processedFilters = handleQuickDateRange(
              filters.quick_date_range,
              transformedFilters
            );

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
            if (
              !transformedData.doctor ||
              !transformedData.patient_id ||
              !transformedData.diagnosis
            ) {
              toast.error("Please fill in all required fields");
              return false;
            }

            if (isEditing) {
              const response = await config.postData(
                `/prescriptions/edit?id=${data.id}`,
                transformedData
              );
              if (response.data && response.data.success) {
                // Refresh the prescriptions list to show updated data
                getPrescriptions(itemsPerPage, currentPage, {});
                toast.success("Prescription updated successfully!");
                return true; // Signal successful save
              } else {
                toast.error(
                  response.data?.message || "Failed to update prescription"
                );
                return false;
              }
            } else {
              const response = await config.postData(
                "/prescriptions/create",
                transformedData
              );
              if (response.data && response.data.success) {
                // Reset to first page and refresh the prescriptions list to show latest data
                setCurrentPage(1);
                getPrescriptions(itemsPerPage, 1, {});
                toast.success(
                  response.data.message || "Prescription created successfully!"
                );
                return true; // Signal successful save
              } else {
                toast.error(
                  response.data?.message || "Failed to create prescription"
                );
                return false;
              }
            }
          } catch (error) {
            console.error("Error saving prescription:", error);
            toast.error("Failed to save prescription");
            return false;
          } finally {
            setSaveLoading(false);
          }
        }}
        onDelete={(item) => {
          config
            .postData(
              "/prescriptions/delete",
              { id: item.id } // ✅ Send ID in request body
            )
            .then((response) => {
              if (response.data && response.data.success) {
                toast.success("Prescription deleted successfully!");
              } else {
                toast.error(
                  response.data?.message || "Failed to delete prescription"
                );
              }
              setPrescriptions(
                prescriptions.filter(
                  (prescription) => prescription.id !== item.id
                )
              );
            })
            .catch((error) => {
              console.error("Error deleting prescription:", error);
              toast.error("Failed to delete prescription");
            });
        }}
      />
      {selectedPrescription && (
        <>
          <PrescriptionDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            prescription={selectedPrescription}
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