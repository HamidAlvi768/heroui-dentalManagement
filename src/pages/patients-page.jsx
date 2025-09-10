import React, { useEffect, useState, useMemo } from "react";
import { CrudTemplate } from "../components/crud-template";
import config from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDisclosure, Card, CardBody } from "@heroui/react";
import { CrudDialog } from "../components/crud-dialog";
import { toast } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Skeleton,
} from "@heroui/react";
import { PageTemplate } from "../components/page-template";
import { DataTable } from "../components/data-table";
import { Input, Select, SelectItem, Textarea } from "@heroui/react";

const initialFormData = {
  full_name: "",
  father_name: "",
  email: "",
  contact_number: "",
  gender: "",
  dob: "", // Changed from 'age' to 'dob' to match API
  address: "",
  notes: "",
  status: "active",
  medical_history: "",
  allergies: "",
};

const formFields = [
  { key: "full_name", label: "Full Name", type: "text", required: true },
  { key: "father_name", label: "Father Name", type: "text", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  {
    key: "contact_number",
    label: "Contact Number",
    type: "text",
    required: true,
  },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "male", label: "Male" }, // Changed to lowercase to match API
      { value: "female", label: "Female" }, // Changed to lowercase to match API
    ],
    required: true,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inActive", label: "In Active" },
    ],
  },
  {
    key: "dob",
    label: "Date of Birth",
    type: "date",
    required: true,
    max: new Date().toISOString().split("T")[0],
  },
  { key: "address", label: "Address", type: "textarea", required: true },
  { key: "notes", label: "Notes", type: "textarea" },
  { key: "medical_history", label: "Medical History", type: "textarea" },
  { key: "allergies", label: "Allergies", type: "textarea" },
];

// Edit form fields (same as create for patients)
const editFormFields = [...formFields];

const patientForm = {
  sections: [
    {
      fields: formFields,
    },
  ],
};

const editPatientForm = {
  sections: [
    {
      fields: editFormFields,
    },
  ],
};

// API Service for patients
const patientApiService = {
  // Get patients list
  getPatients: async (token, params = {}) => {
    const { perpage = 5, page = 1, filters = {} } = params;
    const queryParams = new URLSearchParams({
      perpage: perpage.toString(),
      page: page.toString(),
      ...(filters.full_name && { full_name: filters.full_name }),
      ...(filters.father_name && { father_name: filters.father_name }),
      ...(filters.email && { email: filters.email }),
      ...(filters.status && { status: filters.status }),
      ...(filters.contact_number && { contact_number: filters.contact_number }),
      ...(filters.gender && { gender: filters.gender }),
      ...(filters.doctor_id && { doctor_id: filters.doctor_id }),
      ...(filters.patient_id && { patient_id: filters.patient_id }),
    });

    return config.getData(`/patients/list?${queryParams.toString()}`);
  },

  // Create new patient
  createPatient: async (token, data) => {
    return config.postData("/patients/create", data);
  },

  // Update existing patient
  updatePatient: async (token, id, data) => {
    return config.postData(`/patients/edit?id=${id}`, data);
  },

  // Delete patient
  deletePatient: async (token, id) => {
    return config.postData(`/patients/delete?id=${id}`, { id: id });
  },

  // Get single patient details
  getPatientById: async (token, id) => {
    return config.getData(`/patients/view?id=${id}`);
  },

  // Get all doctors for filter dropdown
  getDoctors: async (token) => {
    return config.getData("/users/list?perpage=1000&page=1");
  },

  // Get all patients for filter dropdown
  getAllPatients: async (token) => {
    return config.getData("/patients/list?perpage=1000&page=1");
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

// Compact Patient Detail Modal with Shimmer Loading
const PatientDetailModal = ({
  isOpen,
  onOpenChange,
  patient,
  onEdit,
  isLoading,
}) => {
  if (!patient && !isLoading) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-primary-600 text-xl font-semibold">
                      {patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                    </span>
                  )}
                </div>
                <div>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold">
                        {patient?.full_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Patient ID: {patient?.id}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Personal Information Card */}
                <Card className="p-4">
                  <CardBody>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">
                      Personal Information
                    </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Full Name
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.full_name || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Father's Name
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.father_name || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Email
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.email || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Contact Number
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-28" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.contact_number || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Gender
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                          <p className="text-gray-900 capitalize">
                            {patient?.gender || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Date of Birth
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.dob_formatted || "Not specified"}
                          </p>
                      )}
                    </div>
                  </div>
                  </CardBody>
                </Card>

                {/* Address & Medical Information Card */}
                <Card className="p-4">
                  <CardBody>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">
                      Address & Medical Information
                    </h3>
                    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(20%,1fr))] gap-4">
                <div>
                        <label className="text-sm font-medium text-gray-600">
                          Address
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-64" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.address || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Medical History
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-64" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.medical_history ||
                              "No medical history recorded"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Allergies
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-64" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.allergies || "No allergies recorded"}
                          </p>
                      )}
                    </div>
                  </div>
                  </CardBody>
                </Card>

                {/* System Information Card */}
                <Card className="p-4">
                  <CardBody>
                    <h3 className="text-lg font-semibold mb-3 text-primary-600">
                      System Information
                    </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Status
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                          <p className="text-gray-900 capitalize">
                            {patient?.status || "Active"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Created By
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.created_by || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Created On
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.created_at_formatted || "Not specified"}
                          </p>
                      )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                          Last Updated
                        </label>
                      {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                          <p className="text-gray-900">
                            {patient?.updated_at_formatted || "Not specified"}
                          </p>
                      )}
                    </div>
                  </div>
                  </CardBody>
                </Card>
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
  );
};

// Invoice Creation Modal Component
const InvoiceCreationModal = ({ isOpen, onOpenChange, patient, onClose }) => {
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    date: "",
    procedures: [
      {
        category: "",
        procedure: "",
        description: "",
        quantity: 1,
        price: "",
        subTotal: 0,
      },
    ],
    discount: 0,
    paid: 0,
    total_amount: 0,
    after_discount: 0,
    balance: 0,
    payment_method: "cash",
  });
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Initialize form data when patient changes
  useEffect(() => {
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        patient_id: patient.id,
        date: new Date().toISOString().split("T")[0],
      }));
    }
  }, [patient]);

  // Debug logging for props
  useEffect(() => {
    console.log("InvoiceCreationModal props - categories:", categories);
    console.log("InvoiceCreationModal props - procedures:", procedures);
    console.log("InvoiceCreationModal props - patients:", patient);
    console.log("InvoiceCreationModal props - doctors:", doctors);
  }, [categories, procedures, patient, doctors]);

  // Debug logging for form data changes
  useEffect(() => {
    console.log("Form data updated:", formData);
    console.log(
      "Discount value:",
      formData.discount,
      "Type:",
      typeof formData.discount
    );
  }, [formData]);

  // Fetch doctors, categories, and procedures
  useEffect(() => {
    if (isOpen && token) {
      config.initAPI(token);

      // Fetch doctors
      config
        .getData("/users/list?role=doctor")
        .then((response) => {
          console.log("Doctors API response:", response);
          if (response.data && response.data.data) {
            const doctorOptions = response.data.data.map((doctor) => ({
              key: doctor.id,
              value: doctor.id,
              label: doctor.username,
            }));
            console.log("Setting doctors:", doctorOptions);
            setDoctors(doctorOptions);
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where response.data is directly an array
            const doctorOptions = response.data.map((doctor) => ({
              key: doctor.id,
              value: doctor.id,
              label: doctor.username,
            }));
            console.log("Setting doctors (direct array):", doctorOptions);
            setDoctors(doctorOptions);
          } else {
            // Fallback to hardcoded doctors if API doesn't return data
            const fallbackDoctors = [
              { key: "1", value: "1", label: "Dr. Smith" },
              { key: "2", value: "2", label: "Dr. Johnson" },
              { key: "3", value: "3", label: "Dr. Williams" },
            ];
            console.log("Setting fallback doctors:", fallbackDoctors);
            setDoctors(fallbackDoctors);
          }
        })
        .catch((error) => {
          console.error("Error fetching doctors:", error);
          // Set fallback doctors on error
          const fallbackDoctors = [
            { key: "1", value: "1", label: "Dr. Smith" },
            { key: "2", value: "2", label: "Dr. Johnson" },
            { key: "3", value: "3", label: "Dr. Williams" },
          ];
          console.log("Setting fallback doctors on error:", fallbackDoctors);
          setDoctors(fallbackDoctors);
        });

      // Fetch categories
      config
        .getData("/procedures/categories")
        .then((response) => {
          console.log("Categories API response:", response);
          if (response.data && response.data.categories) {
            const categoryOptions = response.data.categories.map((cat) => ({
              key: cat.id || cat.value,
              value: cat.id || cat.value,
              label: cat.name || cat.label,
            }));
            console.log("Setting categories:", categoryOptions);
            setCategories(categoryOptions);
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where response.data is directly an array
            const categoryOptions = response.data.map((cat) => ({
              key: cat.id || cat.value,
              value: cat.id || cat.value,
              label: cat.name || cat.label,
            }));
            console.log("Setting categories (direct array):", categoryOptions);
            setCategories(categoryOptions);
          } else {
            // Fallback to hardcoded categories if API doesn't return data
            const fallbackCategories = [
              {
                key: "consultation",
                value: "consultation",
                label: "Consultation",
              },
              { key: "surgery", value: "surgery", label: "Surgery" },
              { key: "lab", value: "lab", label: "Lab" },
              { key: "treatment", value: "treatment", label: "Treatment" },
              {
                key: "examination",
                value: "examination",
                label: "Examination",
              },
            ];
            console.log("Setting fallback categories:", fallbackCategories);
            setCategories(fallbackCategories);
          }
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
          // Set fallback categories on error
          const fallbackCategories = [
            {
              key: "consultation",
              value: "consultation",
              label: "Consultation",
            },
            { key: "surgery", value: "surgery", label: "Surgery" },
            { key: "lab", value: "lab", label: "Lab" },
            { key: "treatment", value: "treatment", label: "Treatment" },
            { key: "examination", value: "examination", label: "Examination" },
          ];
          console.log(
            "Setting fallback categories on error:",
            fallbackCategories
          );
          setCategories(fallbackCategories);
        });

      // Fetch procedures
      config
        .getData("/procedures/list")
        .then((response) => {
          console.log("Procedures API response:", response);
          if (response.data && response.data.procedures) {
            const procedureOptions = response.data.procedures.map((proc) => ({
              key: proc.id || proc.value,
              value: proc.id || proc.value,
              label: proc.name || proc.label,
            }));
            console.log("Setting procedures:", procedureOptions);
            setProcedures(procedureOptions);
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where response.data is directly an array
            const procedureOptions = response.data.map((proc) => ({
              key: proc.id || proc.value,
              value: proc.id || proc.value,
              label: proc.name || proc.label,
            }));
            console.log("Setting procedures (direct array):", procedureOptions);
            setProcedures(procedureOptions);
          } else {
            // Fallback to hardcoded procedures if API doesn't return data
            const fallbackProcedures = [
              {
                key: "initial_consultation",
                value: "initial_consultation",
                label: "Initial Consultation",
              },
              {
                key: "followup_visit",
                value: "followup_visit",
                label: "Follow-up Visit",
              },
              { key: "root_canal", value: "root_canal", label: "Root Canal" },
              {
                key: "dental_cleaning",
                value: "dental_cleaning",
                label: "Dental Cleaning",
              },
              { key: "xray", value: "xray", label: "X-Ray" },
              { key: "filling", value: "filling", label: "Dental Filling" },
              {
                key: "extraction",
                value: "extraction",
                label: "Tooth Extraction",
              },
            ];
            console.log("Setting fallback procedures:", fallbackProcedures);
            setProcedures(fallbackProcedures);
          }
        })
        .catch((error) => {
          console.error("Error fetching procedures:", error);
          // Set fallback procedures on error
          const fallbackProcedures = [
            {
              key: "initial_consultation",
              value: "initial_consultation",
              label: "Initial Consultation",
            },
            {
              key: "followup_visit",
              value: "followup_visit",
              label: "Follow-up Visit",
            },
            { key: "root_canal", value: "root_canal", label: "Root Canal" },
            {
              key: "dental_cleaning",
              value: "dental_cleaning",
              label: "Dental Cleaning",
            },
            { key: "xray", value: "xray", label: "X-Ray" },
            { key: "filling", value: "filling", label: "Dental Filling" },
            {
              key: "extraction",
              value: "extraction",
              label: "Tooth Extraction",
            },
          ];
          console.log(
            "Setting fallback procedures on error:",
            fallbackProcedures
          );
          setProcedures(fallbackProcedures);
        });
    }
  }, [isOpen, token]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleProcedureChange = (index, key, value) => {
    const newProcedures = [...formData.procedures];
    newProcedures[index] = { ...newProcedures[index], [key]: value };

    // Calculate subtotal
    if (key === "quantity" || key === "price") {
      const qty =
        key === "quantity"
          ? Number(value)
          : Number(newProcedures[index].quantity);
      const price =
        key === "price" ? Number(value) : Number(newProcedures[index].price);
      newProcedures[index].subTotal = qty * price;
    }

    setFormData((prev) => ({ ...prev, procedures: newProcedures }));
  };

  const addProcedure = () => {
    setFormData((prev) => ({
      ...prev,
      procedures: [
        ...prev.procedures,
        {
          category: "",
          procedure: "",
          description: "",
        quantity: 1,
          price: "",
          subTotal: 0,
        },
      ],
    }));
  };

  const removeProcedure = (index) => {
    if (formData.procedures.length > 1) {
      setFormData((prev) => ({
        ...prev,
        procedures: prev.procedures.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotals = () => {
    const total = formData.procedures.reduce((sum, proc) => {
      const qty = Number(proc.quantity) || 0;
      const price = Number(proc.price) || 0;
      return sum + qty * price;
    }, 0);

    const discount = Number(formData.discount) || 0;
    const afterDiscount = total - total * (discount / 100);
    const paid = Number(formData.paid) || 0;
    const balance = afterDiscount - paid;

    return { total, afterDiscount, balance };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const transformedData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        invoice_date: formData.date,
        items: formData.procedures.map((proc) => ({
          item_type: proc.procedure || proc.category || "",
          item_description: proc.description,
          quantity: Number(proc.quantity) || 0,
          unit_price: Number(proc.price) || 0,
          discount: 0,
          total_price: Number(proc.subTotal) || 0,
        })),
        total_amount: calculateTotals().total,
        discount_amount: calculateTotals().total * (formData.discount / 100),
        net_amount: calculateTotals().afterDiscount,
        paid: Number(formData.paid) || 0,
        balance: calculateTotals().balance,
        payment_method: formData.payment_method,
        notes: "",
      };

      const response = await config.postData(
        "/invoices/create",
        transformedData
      );

      if (response.data.success) {
        toast.success("Invoice created successfully!");
        onClose();
        // Reset form
        setFormData({
          patient_id: "",
          doctor_id: "",
          date: "",
          procedures: [
            {
              category: "",
              procedure: "",
              description: "",
              quantity: 1,
              price: "",
              subTotal: 0,
            },
          ],
          discount: 0,
          paid: 0,
          total_amount: 0,
          after_discount: 0,
          balance: 0,
          payment_method: "cash",
        });
      } else {
        toast.error(response.data.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const { total, afterDiscount, balance } = calculateTotals();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-semibold">
            Create Invoice for {patient?.full_name}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Patient & Doctor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient
                </label>
                <Input
                  value={patient?.full_name || ""}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Choose Doctor *
                </label>
                <Select
                  selectedKeys={formData.doctor_id ? [formData.doctor_id] : []}
                  onSelectionChange={(keys) =>
                    handleInputChange("doctor_id", Array.from(keys)[0])
                  }
                  className="w-full"
                >
                  {console.log("Rendering doctor options:", doctors)}
                  {doctors && doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <SelectItem key={doctor.value} value={doctor.value}>
                        {doctor.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-doctors" value="">
                      No doctors available
                    </SelectItem>
                  )}
                </Select>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Procedures Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Procedures & Services</h3>
                <Button
                  size="sm"
                  color="primary"
                  variant="light"
                  onPress={addProcedure}
                  startContent={<span className="text-lg">+</span>}
                >
                  Add Row
                </Button>
              </div>

              <div className="space-y-4">
                {formData.procedures.map((proc, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Procedure {index + 1}</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="success"
                          variant="light"
                          onPress={addProcedure}
                          startContent={<span className="text-lg">+</span>}
                          title="Add new row below"
                        />
                        {formData.procedures.length > 1 && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => removeProcedure(index)}
                            startContent={<span className="text-lg">−</span>}
                            title="Remove this row"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <Select
                          selectedKeys={proc.category ? [proc.category] : []}
                          onSelectionChange={(keys) =>
                            handleProcedureChange(
                              index,
                              "category",
                              Array.from(keys)[0]
                            )
                          }
                          className="w-full"
                        >
                          {console.log(
                            "Rendering category options:",
                            categories
                          )}
                          {categories && categories.length > 0 ? (
                            categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-categories" value="">
                              No categories available
                            </SelectItem>
                          )}
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Procedure *
                        </label>
                        <Select
                          selectedKeys={proc.procedure ? [proc.procedure] : []}
                          onSelectionChange={(keys) =>
                            handleProcedureChange(
                              index,
                              "procedure",
                              Array.from(keys)[0]
                            )
                          }
                          className="w-full"
                        >
                          {console.log(
                            "Rendering procedure options:",
                            procedures
                          )}
                          {procedures && procedures.length > 0 ? (
                            procedures.map((procItem) => (
                              <SelectItem
                                key={procItem.value}
                                value={procItem.value}
                              >
                                {procItem.label}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-procedures" value="">
                              No procedures available
                            </SelectItem>
                          )}
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={proc.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            // Ensure quantity is at least 1 and not negative
                            const validValue = Math.max(1, Math.abs(value));
                            handleProcedureChange(
                              index,
                              "quantity",
                              validValue
                            );
                          }}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={proc.price}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            // Ensure price is at least 0 and not negative
                            const validValue = Math.max(0, Math.abs(value));
                            handleProcedureChange(index, "price", validValue);
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={proc.description}
                        onChange={(e) =>
                          handleProcedureChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Enter procedure description"
                        className="w-full"
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-medium">
                        Subtotal: ${proc.subTotal || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Payment Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <Select
                    selectedKeys={[formData.payment_method]}
                    onSelectionChange={(keys) =>
                      handleInputChange("payment_method", Array.from(keys)[0])
                    }
                    className="w-full"
                  >
                    <SelectItem key="cash" value="cash">
                      Cash
                    </SelectItem>
                    <SelectItem key="online" value="online">
                      Online
                    </SelectItem>
                    <SelectItem key="bank_transfer" value="bank_transfer">
                      Bank Transfer
                    </SelectItem>
                    <SelectItem key="cheque" value="cheque">
                      Cheque
                    </SelectItem>
                    <SelectItem key="credit_card" value="credit_card">
                      Credit Card
                    </SelectItem>
                    <SelectItem key="debit_card" value="debit_card">
                      Debit Card
                    </SelectItem>
                    <SelectItem key="other" value="other">
                      Other
                    </SelectItem>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <Select
                    selectedKeys={
                      formData.discount !== undefined &&
                      formData.discount !== null
                        ? [formData.discount.toString()]
                        : ["0"]
                    }
                    onSelectionChange={(keys) => {
                      const selectedValue = Array.from(keys)[0];
                      console.log(
                        "Discount selected:",
                        selectedValue,
                        "Type:",
                        typeof selectedValue
                      );
                      handleInputChange(
                        "discount",
                        selectedValue ? parseInt(selectedValue) : 0
                      );
                    }}
                    className="w-full"
                    placeholder="Select discount percentage"
                  >
                    {Array.from({ length: 101 }, (_, i) => (
                      <SelectItem key={i.toString()} value={i.toString()}>
                        {i}%
                      </SelectItem>
                    ))}
                  </Select>
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-1">
                    Current discount value:{" "}
                    {formData.discount !== undefined
                      ? formData.discount
                      : "Not set"}{" "}
                    (Type: {typeof formData.discount})
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paid}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      // Ensure paid amount is at least 0 and not negative
                      const validValue = Math.max(0, Math.abs(value));
                      handleInputChange("paid", validValue);
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Calculated Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-lg">${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">After Discount:</span>
                  <span className="font-bold text-lg">${afterDiscount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Balance:</span>
                  <span className="font-bold text-lg">${balance}</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            disabled={loading || !formData.doctor_id || !formData.date}
            startContent={
              loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : null
            }
          >
            {loading ? "Creating Invoice..." : "Create Invoice"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

function PatientsPage() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    doctors: [],
    patients: [],
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();

  // Invoice modal states
  const {
    isOpen: isInvoiceModalOpen,
    onOpen: onInvoiceModalOpen,
    onOpenChange: onInvoiceModalOpenChange,
  } = useDisclosure();
  const [patientForInvoice, setPatientForInvoice] = useState(null);

  // Define columns inside component to access state variables
  const columns = [
    {
      key: "mrn_number",
      label: "MRN",
      render: (item) => (
        <div>
          <div className="font-medium">{item.mrn_number}</div>
        </div>
      ),
    },
    {
      key: "full_name",
      label: "FULL NAME",
      render: (item) => (
        <div>
          <div className="font-medium">{item.full_name}</div>
        </div>
      ),
    },
    { key: "father_name", label: "FATHER NAME" },
    { key: "email", label: "EMAIL" },
    { key: "contact_number", label: "CONTACT NUMBER" },
    { key: "gender", label: "GENDER" },
    {
      key: "dob",
      label: "DATE OF BIRTH",
      render: (item) => {
        if (!item.dob || item.dob === "0000-00-00") return "N/A";
        try {
          return new Date(item.dob).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch (e) {
          return item.dob;
        }
      },
    },
    {
      key: "active",
      label: "STATUS",
      render: (item) => (
        <div>
          <div className="font-medium">
            {item.active === 1 ? "Active" : "Inactive"}
        </div>
        </div>
      ),
    },
    {
      key: "invoice",
      label: "INVOICE",
      render: (item) => (
        <Button
          size="sm"
          color="primary"
          variant="light"
          onPress={() => {
            setPatientForInvoice(item);
            onInvoiceModalOpen();
          }}
          startContent={<span>📄</span>}
          className="text-xs"
        >
          Create Invoice
        </Button>
      ),
    },
    { key: "actions", label: "ACTIONS" },
  ];

  // Dynamic filter columns with options
  const filterColumns = useMemo(
    () => [
      { key: "mrn_number", label: "MRN" },
      { key: "full_name", label: "FULL NAME" },
      { key: "email", label: "EMAIL" },
      {
        key: "active",
        label: "STATUS",
        type: "select",
      options: [
          { value: "1", label: "Active" },
          { value: "0", label: "Inactive" },
        ],
      },
      {
        key: "gender",
        label: "GENDER",
        type: "select",
      options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      {
        key: "doctor_id",
        label: "DOCTOR",
        type: "select",
        placeholder: "Select Doctor",
      options: filterOptionsLoading
          ? [{ value: "", label: "Loading doctors..." }]
        : filterOptions.doctors.length > 0
          ? filterOptions.doctors
          : [{ value: "", label: "No doctors available" }],
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
    ],
    [filterOptions.doctors, filterOptions.patients, filterOptionsLoading]
  );

  // Centralized function to fetch patients
  const fetchPatients = async (
    perpage = itemsPerPage,
    page = 1,
    filters = {},
    isFiltering = false
  ) => {
    try {
      if (isFiltering) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }

      const response = await patientApiService.getPatients(token, {
        perpage,
        page,
        filters,
      });

      // Validate response
      const validatedResponse = validateApiResponse(response, "fetch patients");

      const patientsData = validatedResponse.data.data.map((patient) => ({
        ...patient,
        verified: patient.verified === 1 ? "Active" : "Inactive",
      }));

      setPatients(patientsData);
      setTotalItems(validatedResponse.data.meta.total);
      setCurrentPage(validatedResponse.data.meta.page);
      setItemsPerPage(validatedResponse.data.meta.perpage);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error(error.message || "Error fetching patients");
    } finally {
      if (isFiltering) {
        setFilterLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Function to populate filter options
  const populateFilterOptions = async () => {
    try {
      setFilterOptionsLoading(true);

      // Fetch doctors for filter dropdown
      const doctorsResponse = await patientApiService.getDoctors(token);
      if (doctorsResponse.data && doctorsResponse.data.success) {
        const doctorsOptions = doctorsResponse.data.data.map((doctor) => ({
          value: doctor.id,
          label: doctor.username || doctor.full_name || `Doctor ${doctor.id}`,
        }));
        setFilterOptions((prev) => ({ ...prev, doctors: doctorsOptions }));
      } else {
        console.warn("Failed to fetch doctors for filters");
        setFilterOptions((prev) => ({ ...prev, doctors: [] }));
      }

      // Fetch patients for filter dropdown
      const patientsResponse = await patientApiService.getAllPatients(token);
      if (patientsResponse.data && patientsResponse.data.success) {
        const patientsOptions = patientsResponse.data.data.map((patient) => ({
          value: patient.id,
          label: patient.full_name || `Patient ${patient.id}`,
        }));
        setFilterOptions((prev) => ({ ...prev, patients: patientsOptions }));
      } else {
        console.warn("Failed to fetch patients for filters");
        setFilterOptions((prev) => ({ ...prev, patients: [] }));
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Error fetching filter options");
      // Set empty arrays on error to prevent undefined options
      setFilterOptions((prev) => ({ ...prev, doctors: [], patients: [] }));
    } finally {
      setFilterOptionsLoading(false);
    }
  };

  const handleViewDetail = async (patient) => {
    try {
      setViewDetailLoading(true);
      // Show modal immediately with loading state and basic data from list
      setSelectedPatient({
        ...patient,
        // Show basic info while loading
        full_name: patient.full_name,
        email: patient.email,
        status: patient.status,
      });
      setIsDetailOpen(true);

      // Fetch detailed patient information using view API
      const response = await patientApiService.getPatientById(
        token,
        patient.id
      );
      if (response.data && response.data.success) {
        // Extract patient data from the response
        const patientData = response.data.data.patient;

        // Create detailed patient object with proper data structure
        const detailedPatient = {
          ...patientData,
          // Ensure ID is preserved from the original patient object
          id: patient.id || patientData.id,
          // Add default values for fields not in API response
          notes: "", // Not in API response, keep empty
          status: "active", // Not in API response, default to active
          // Format the date for better display
          dob_formatted:
            patientData.dob && patientData.dob !== "0000-00-00"
              ? new Date(patientData.dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Not specified",
          // Add created/updated info for display
          created_at_formatted: patientData.created_at
            ? new Date(patientData.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not specified",
          updated_at_formatted: patientData.updated_at
            ? new Date(patientData.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not specified",
        };

        setSelectedPatient(detailedPatient);
        console.log(
          "Detailed patient data set for view modal:",
          detailedPatient
        );
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("Error fetching patient details");
    } finally {
      setViewDetailLoading(false);
    }
  };

  const handleEdit = async (patient) => {
    try {
      console.log("handleEdit called with patient:", patient);

      // Ensure we have the correct ID for the API call
      const patientId = patient.id || patient.user_id;
      if (!patientId) {
        console.error("No valid ID found for patient:", patient);
        toast.error("Cannot edit patient: Invalid ID");
        return;
      }

      console.log("Calling view API for patient ID:", patientId);

      // Fetch fresh patient data using view API for editing
      const response = await patientApiService.getPatientById(token, patientId);
      console.log("View API response:", response);

      if (response.data && response.data.success) {
        const patientData = response.data.data.patient;

        // Create complete patient object for editing with all necessary fields
        const completePatientData = {
          ...patientData,
          // Ensure we have all the fields needed for the edit form
          full_name: patient.full_name || patientData.full_name || "", // From list API or view API
          email: patient.email || patientData.email || "", // From list API or view API
          status: patient.status || patientData.status || "active", // From list API or view API
          // Ensure all other fields are present with proper defaults
          father_name: patientData.father_name || "",
          contact_number: patientData.contact_number || "",
          gender: patientData.gender || "",
          dob:
            patientData.dob && patientData.dob !== "0000-00-00"
            ? patientData.dob
              : "",
          address: patientData.address || "",
          notes: patientData.notes || "", // May not be in API response
          medical_history: patientData.medical_history || "",
          allergies: patientData.allergies || "",
        };

        console.log("Complete patient data for editing:", completePatientData);

        // Set the complete data for editing
        setSelectedPatient(completePatientData);
        setIsDetailOpen(false);
        onEditOpen();
      }
    } catch (error) {
      console.error("Error fetching patient data for editing:", error);
      toast.error("Error fetching patient data for editing");
    }
  };

  // Separate function for handling table row edits (direct edit without view modal)
  const handleTableEdit = async (patient) => {
    try {
      console.log("handleTableEdit called with patient:", patient);

      // Open modal immediately with loading state
      setSelectedPatient({ ...patient, isLoading: true });
      onEditOpen();

      // Ensure we have the correct ID for the API call
      const patientId = patient.id || patient.user_id;
      if (!patientId) {
        console.error("No valid ID found for patient:", patient);
        toast.error("Cannot edit patient: Invalid ID");
        return;
      }

      console.log("Calling view API for patient ID:", patientId);

      // Fetch fresh patient data using view API for editing
      const response = await patientApiService.getPatientById(token, patientId);
      console.log("View API response:", response);

      if (response.data && response.data.success) {
        const patientData = response.data.data.patient;

        // Create complete patient object for editing with all necessary fields
        const completePatientData = {
          ...patientData,
          // Ensure we have all the fields needed for the edit form
          username: patient.username || patientData.username || "", // From list API or view API
          email: patient.email || patientData.email || "", // From list API or view API
          status: patient.status || patientData.status || "Active", // From list API or view API
          role: "patient", // Always set role for patient
          // Ensure password field exists but is empty for editing
          password: "", // Empty for edit form
          // Format dates for form inputs
          dob:
            patientData.dob && patientData.dob !== "0000-00-00"
            ? patientData.dob
              : "",
          // Ensure all other fields are present
          gender: patientData.gender || "",
          contact_number: patientData.contact_number || "",
          address: patientData.address || "",
          medical_history: patientData.medical_history || "",
          allergies: patientData.allergies || "",
          isLoading: false, // Mark as loaded
        };

        console.log(
          "Complete patient data for table editing:",
          completePatientData
        );

        // Update the selected patient with complete data
        setSelectedPatient(completePatientData);
      }
    } catch (error) {
      console.error("Error fetching patient data for table editing:", error);
      toast.error("Error fetching patient data for editing");
      // Set error state
      setSelectedPatient({ ...patient, isLoading: false, hasError: true });
    }
  };

  // Function to handle quick date range filters
  const handleQuickDateRange = (quickRange, currentFilters) => {
    const today = new Date();
    const newFilters = { ...currentFilters };

    switch (quickRange) {
      case "today":
        const todayStr = today.toISOString().split("T")[0];
        newFilters.date_from = todayStr;
        newFilters.date_to = todayStr;
        break;
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        newFilters.date_from = tomorrowStr;
        newFilters.date_to = tomorrowStr;
        break;
      case "this_week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        newFilters.date_from = startOfWeek.toISOString().split("T")[0];
        newFilters.date_to = endOfWeek.toISOString().split("T")[0];
        break;
      case "next_week":
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        newFilters.date_from = nextWeekStart.toISOString().split("T")[0];
        newFilters.date_to = nextWeekEnd.toISOString().split("T")[0];
        break;
      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        newFilters.date_from = startOfMonth.toISOString().split("T")[0];
        newFilters.date_to = endOfMonth.toISOString().split("T")[0];
        break;
      case "this_year":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        newFilters.date_from = startOfYear.toISOString().split("T")[0];
        newFilters.date_to = endOfYear.toISOString().split("T")[0];
        break;
      default:
        // Custom date range - keep existing filters
        break;
    }

    // Clear quick range filter after applying
    newFilters.quick_date_range = "";

    return newFilters;
  };

  // Custom save handler that prevents immediate state update in CrudTemplate
  const handleSaveWrapper = async (formData, isEditing) => {
    try {
      setOperationLoading(true);

      if (isEditing) {
        // Update existing patient - remove empty password field
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password || dataToUpdate.password.trim() === "") {
          delete dataToUpdate.password;
        }

        const response = await patientApiService.updatePatient(
          token,
          formData.id,
          dataToUpdate
        );
        validateApiResponse(response, "update patient");
        toast.success("Patient updated successfully!");
        // Refresh the list to show updated data
        await fetchPatients(itemsPerPage, currentPage);
        // Close the edit dialog only on success
        onEditOpenChange(false);
        return true; // Indicate success
      } else {
        // Create new patient - add role field
        const createData = {
          ...formData,
          role: "patient", // Virtual field added to payload
        };

        const response = await patientApiService.createPatient(
          token,
          createData
        );
        validateApiResponse(response, "create patient");
        toast.success(response.data.message || "Patient created successfully!");
        // Refresh the list to show new data - don't manually update state
        await fetchPatients(itemsPerPage, 1); // Reset to first page for new items
        return true; // Indicate success
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error(error.message || "Error saving patient");
      // Don't close dialog on error - return false to indicate failure
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (patient) => {
    try {
      setOperationLoading(true);
      // Send only the ID in the payload for delete operation
      const response = await patientApiService.deletePatient(token, patient.id);
      validateApiResponse(response, "delete patient");
      toast.success("Patient deleted successfully!");
      // Refresh the list to show updated data - don't manually remove from UI
      await fetchPatients(itemsPerPage, currentPage);
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(error.message || "Error deleting patient");
    } finally {
      setOperationLoading(false);
    }
  };

  const customActions = (item) => [
    {
      label: "Create Invoice",
      icon: "lucide:file-plus",
      handler: () => {
        setPatientForInvoice(item);
        onInvoiceModalOpen();
        console.log("Create invoice for patient:", item);
      },
    },
  ];

  // Initialize API configuration and fetch patients on component mount
  useEffect(() => {
    if (token) {
      config.initAPI(token);
      fetchPatients();
      populateFilterOptions(); // Populate filter options on mount
    }
  }, [token]);

  // Refresh filter options when token changes
  useEffect(() => {
    if (token) {
      populateFilterOptions();
    }
  }, [token]);

  // Function to clear all filters and refresh data
  const clearFilters = () => {
    fetchPatients(itemsPerPage, 1, {});
    populateFilterOptions(); // Refresh filter options as well
  };

  return (
    <>
    <CrudTemplate
      title="Patients"
      description="Manage patients records"
      icon="lucide:users"
        loading={
          loading || operationLoading || filterLoading || filterOptionsLoading
        }
      columns={columns}
      data={patients}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={patientForm}
      filterColumns={filterColumns}
      customRowActions={customActions}
      onRowClick={handleViewDetail}
      disableAutoStateUpdate={false}
      disableAutoDeleteUpdate={false}
      addButtonLabel="Add Patient"
      customEditHandler={handleTableEdit}
      onFilterChange={(filters) => {
          console.log("Filters:", filters);
        // Handle quick date range filters
          if (filters.quick_date_range && filters.quick_date_range !== "") {
            const processedFilters = handleQuickDateRange(
              filters.quick_date_range,
              filters
            );
          fetchPatients(itemsPerPage, 1, processedFilters, true);
        } else {
          fetchPatients(itemsPerPage, 1, filters, true);
        }
      }}
      onPerPageChange={(perPage) => {
        fetchPatients(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
          console.log("Page:", page, "Perpage:", perpage);
        fetchPatients(perpage, page);
      }}
      onSave={handleSaveWrapper}
        onDelete={handleDelete}
      />

    {selectedPatient && (
      <>
        <PatientDetailModal
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          patient={selectedPatient}
          isLoading={viewDetailLoading}
        />
        <CrudDialog
          isOpen={isEditOpen && !!selectedPatient}
          onOpenChange={onEditOpenChange}
          title="Edit Patient"
          formData={selectedPatient}
          formFields={editFormFields}
          form={editPatientForm}
          onSave={handleSaveWrapper}
          operationLoading={operationLoading}
        />
      </>
    )}

    {patientForInvoice && (
      <InvoiceCreationModal
        isOpen={isInvoiceModalOpen}
        onOpenChange={onInvoiceModalOpenChange}
        patient={patientForInvoice}
        onClose={() => {
          setPatientForInvoice(null);
          onInvoiceModalOpenChange(false);
        }}
      />
    )}
    </>
  );
}

export default PatientsPage;
