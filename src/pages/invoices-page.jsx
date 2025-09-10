import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "../components/data-table";
import config from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { PageTemplate } from "../components/page-template";
import { DeleteDialog } from "../components/delete-dialog";
import useFormData from "../hooks/useFormData";
import { Activity, Building2 } from "lucide-react";

// Dynamic clinic branding will be used from useFormData hook

// Table columns
const columns = [
  {
    key: "invoice_number",
    label: "INVOICE NUMBER",
    render: (item) => (
      <div>
        <div className="font-medium">{item.invoice_number}</div>
      </div>
    ),
  },
  {
    key: "patient",
    label: "PATIENT",
    render: (item) => item.patient?.full_name || "",
  },
  {
    key: "doctor",
    label: "DOCTOR",
    render: (item) => item.doctor?.username || "",
  },
  {
    key: "invoice_date",
    label: "DATE",
    render: (item) => {
      if (!item.invoice_date) return "N/A";
      try {
        return new Date(item.invoice_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return item.invoice_date;
      }
    },
  },
  { key: "total_amount", label: "TOTAL" },
  { key: "paid", label: "PAID" },
  {
    key: "status",
    label: "STATUS",
    render: (item) => {
      const status =
        item.status ||
        calculateInvoiceStatus(
        Number(item.balance) || 0,
        Number(item.paid) || 0,
        Number(item.net_amount) || 0
      );
      const statusColors = {
        paid: "text-success-600 bg-success-100",
        pending: "text-warning-600 bg-warning-100",
        overdue: "text-danger-600 bg-danger-100",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[status] || "text-gray-600 bg-gray-100"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
  },
  },
  { key: "actions", label: "ACTIONS" },
];

// Base filter columns structure
const baseFilterColumns = [
  { key: "invoiceNumber", label: "INVOICE NUMBER" },
  {
    key: "patient",
    label: "PATIENT",
    type: "select",
    options: [{ value: "", label: "All Patients" }],
  },
  {
    key: "doctor",
    label: "DOCTOR",
    type: "select",
    options: [{ value: "", label: "All Doctors" }],
  },
  {
    key: "payment_method",
    label: "PAYMENT METHOD",
    type: "select",
    options: [
      { value: "", label: "All Methods" },
      { value: "cash", label: "Cash" },
      { value: "online", label: "Online" },
      { value: "bank_transfer", label: "Bank Transfer" },
      { value: "cheque", label: "Cheque" },
      { value: "credit_card", label: "Credit Card" },
      { value: "debit_card", label: "Debit Card" },
      { value: "other", label: "Other" },
    ],
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

const initialFormData = {
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
  discount: "0",
  paid: 0,
  total_amount: 0,
  after_discount: 0,
  balance: 0,
  payment_method: "cash",
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    "INV-" +
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    "-" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds()) +
    "-" +
    Math.floor(Math.random() * 1000)
  );
};

const transformFormData = (formData) => {
  // Calculate subtotals for each procedure
  const proceduresWithSubtotals = (formData.procedures || []).map((proc) => {
    const qty = Number(proc.quantity) || 0;
    const price = Number(proc.price) || 0;
    // Round subtotal to 2 decimal places
    const subTotal = Math.round(qty * price * 100) / 100;
    return { ...proc, subTotal };
  });

  // Calculate total_amount
  const total_amount = proceduresWithSubtotals.reduce((sum, proc) => {
    return sum + (Number(proc.subTotal) || 0);
  }, 0);

  // Calculate discount_amount
  const discount = Number(formData.discount) || 0;
  const discount_amount = total_amount * (discount / 100);

  // Calculate net_amount (after discount)
  const net_amount = total_amount - discount_amount;

  // Calculate balance
  const paid = Number(formData.paid) || 0;
  const balance = net_amount - paid;

  return {
    invoice_number: formData.invoice_number || generateInvoiceNumber(),
    patient_id: formData.patient_id,
    doctor_id: formData.doctor_id,
    invoice_date: formData.date || formData.invoice_date || "",
    total_amount: Math.round(total_amount * 100) / 100,
    discount_amount: Math.round(discount_amount * 100) / 100,
    net_amount: Math.round(net_amount * 100) / 100,
    paid: Math.round(paid * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    items: proceduresWithSubtotals.map((proc) => ({
      item_type: proc.procedure || "",
      item_description: proc.description,
      quantity: Number(proc.quantity) || 0,
      unit_price: Math.round((Number(proc.price) || 0) * 100) / 100,
      discount: 0,
      total_price: Math.round((Number(proc.subTotal) || 0) * 100) / 100,
    })),
    notes: formData.notes || null,
    payment_method: formData.payment_method || null,
  };
};

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
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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

// Helper function to calculate invoice status
const calculateInvoiceStatus = (balance, paid, netAmount) => {
  if (balance <= 0 || paid >= netAmount) {
    return "paid";
  } else if (balance > 0 && balance < netAmount) {
    return "pending";
  } else {
    return "overdue";
  }
};

// Helper function to check if amount falls within range
const isAmountInRange = (amount, range) => {
  if (!range || !amount) return true;

  const numAmount = Number(amount);
  switch (range) {
    case "0-100":
      return numAmount >= 0 && numAmount <= 100;
    case "100-500":
      return numAmount > 100 && numAmount <= 500;
    case "500-1000":
      return numAmount > 500 && numAmount <= 1000;
    case "1000-5000":
      return numAmount > 1000 && numAmount <= 5000;
    case "5000+":
      return numAmount > 5000;
    default:
      return true;
  }
};

const mapInvoiceItemsToServices = (items) =>
  (items || []).map((item, idx) => {
    // For edit form, we need to determine both category and procedure from item_type
    // The item_type contains the procedure, so we need to find which category it belongs to
    let category = "";
    let procedure = "";

    if (item.item_type) {
      // Find the category that contains this procedure
      const allProcedures = {
        consultation: [
          "initial_consultation",
          "followup_visit",
          "emergency_consultation",
        ],
        surgery: [
          "root_canal",
          "tooth_extraction",
          "dental_implant",
          "wisdom_teeth_removal",
        ],
        lab: ["xray", "blood_test", "urine_test", "biopsy"],
        treatment: ["dental_cleaning", "filling", "whitening", "braces"],
        examination: [
          "oral_examination",
          "periodontal_examination",
          "orthodontic_evaluation",
        ],
      };

      // Find which category contains this procedure
      for (const [catKey, procList] of Object.entries(allProcedures)) {
        if (procList.includes(item.item_type)) {
          category = catKey;
          procedure = item.item_type;
          break;
        }
      }
    }

    return {
      index: idx + 1,
      id: item.id,
      invoiceId: item.invoice_id,
      category: category || item.category || "",
      procedure: procedure || item.procedure || "",
      description: item.item_description || item.description || "",
      quantity: Number(item.quantity) || 0,
      price: Number(item.unit_price) || Number(item.price) || 0,
      subTotal: Number(item.total_price) || Number(item.subTotal) || 0,
      unit_price: Number(item.unit_price) || Number(item.price) || 0,
      total_price: Number(item.total_price) || Number(item.subTotal) || 0,
      discount: Number(item.discount) || 0,
      // Add additional fields that might be present
      item_id: item.id || item.item_id,
      notes: item.notes || item.item_notes,
      // Timestamps
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  });

// Invoice Form Component
const InvoiceForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  patients,
  doctors,
  categories,
  procedures,
  onCancelEdit,
  onSuccess,
}) => {
  // Define initial form data structure
  const initialFormData = {
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
    discount: "0",
    paid: 0,
    total_amount: 0,
    after_discount: 0,
    balance: 0,
    payment_method: "cash",
  };

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging for props
  useEffect(() => {
    console.log("InvoiceForm props - categories:", categories);
    console.log("InvoiceForm props - procedures:", procedures);
    console.log("InvoiceForm props - procedures type:", typeof procedures);
    console.log(
      "InvoiceForm props - procedures keys:",
      procedures ? Object.keys(procedures) : "no procedures"
    );
    console.log("InvoiceForm props - patients:", patients);
    console.log("InvoiceForm props - doctors:", doctors);
  }, [categories, procedures, patients, doctors]);

  // Debug logging for form data changes
  useEffect(() => {
    console.log("Form data updated:", formData);
    console.log(
      "Discount value:",
      formData.discount,
      "Type:",
      typeof formData.discount
    );
    console.log("Procedures in form data:", formData.procedures);
    if (formData.procedures && formData.procedures.length > 0) {
      console.log(
        "First procedure category:",
        formData.procedures[0]?.category
      );
      console.log(
        "First procedure procedure:",
        formData.procedures[0]?.procedure
      );
      console.log(
        "First procedure category type:",
        typeof formData.procedures[0]?.category
      );
      console.log(
        "First procedure procedure type:",
        typeof formData.procedures[0]?.procedure
      );
    }
  }, [formData]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setIsLoading(true);
      // Small delay to show loading state
      setTimeout(() => {
        // Ensure discount has a default value if not set
        const dataWithDefaults = {
          ...initialData,
          discount:
            initialData.discount !== undefined && initialData.discount !== null
              ? String(initialData.discount)
              : "0",
        };
        setFormData(dataWithDefaults);
        setErrors({});
        setIsLoading(false);
      }, 100);
    } else {
      // Ensure initial form data has proper defaults
      const defaultData = {
        ...initialData,
        discount: "0",
      };
      setFormData(defaultData);
      setErrors({});
      setIsLoading(false);
    }
  }, [initialData]);

  // Reset loading state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  // Reset form when modal opens for new invoice
  useEffect(() => {
    if (
      isOpen &&
      !isEditing &&
      (!initialData || Object.keys(initialData).length === 0)
    ) {
      // Reset form to initial state when opening for new invoice
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen, isEditing, initialData]);

  const handleInputChange = (key, value) => {
    let processedValue = value;

    // Prevent negative values for numeric fields
    if (key === "paid") {
      // Ensure paid amount is at least 0 and not negative
      processedValue = Math.max(0, Math.abs(parseFloat(value) || 0));
    }

    // Ensure discount is stored as string for Select component consistency
    if (key === "discount") {
      processedValue = String(value);
    }

    setFormData((prev) => ({ ...prev, [key]: processedValue }));

    // Clear error for this field if it exists and the field is now valid
    if (errors[key]) {
      let isValid = true;

      // Check specific validation rules for each field
      switch (key) {
        case "patient_id":
          isValid = value && value !== "";
          break;
        case "doctor_id":
          isValid = value && value !== "";
          break;
        case "date":
          isValid = value && value !== "";
          break;
        case "paid":
          isValid = value >= 0;
          break;
        default:
          isValid = true;
      }

      if (isValid) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
    }
  };

  const handleProcedureChange = (index, key, value) => {
    console.log("handleProcedureChange called:", { index, key, value });
    const newProcedures = [...formData.procedures];
    newProcedures[index] = { ...newProcedures[index], [key]: value };

    // If category changes, clear the procedure selection
    if (key === "category") {
      console.log("Category changed to:", value, "clearing procedure");
      newProcedures[index].procedure = "";
    }

    // Calculate subtotal
    if (key === "quantity" || key === "price") {
      const qty =
        key === "quantity"
          ? Number(value)
          : Number(newProcedures[index].quantity);
      const price =
        key === "price" ? Number(value) : Number(newProcedures[index].price);
      // Round subtotal to 2 decimal places
      newProcedures[index].subTotal = Math.round(qty * price * 100) / 100;
    }

    // Clear errors for this procedure field if it's now valid
    const errorKey = `procedure_${index}_${key}`;
    if (errors[errorKey]) {
      let isValid = true;

      // Check specific validation rules for procedure fields
      switch (key) {
        case "category":
          isValid = value && value !== "";
          break;
        case "procedure":
          isValid = value && value !== "";
          break;
        case "quantity":
          isValid = value && Number(value) >= 1;
          break;
        case "price":
          isValid = value && Number(value) >= 0;
          break;
        default:
          isValid = true;
      }

      if (isValid) {
        setErrors((prev) => ({ ...prev, [errorKey]: "" }));
      }
    }

    console.log("Updated procedures:", newProcedures);
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

    // Round all values to 2 decimal places
    return {
      total: Math.round(total * 100) / 100,
      afterDiscount: Math.round(afterDiscount * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    };
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.patient_id) newErrors.patient_id = "Patient is required";
    if (!formData.doctor_id) newErrors.doctor_id = "Doctor is required";
    if (!formData.date) newErrors.date = "Date is required";

    if (formData.procedures.length === 0) {
      newErrors.procedures = "At least one procedure is required";
    } else {
      formData.procedures.forEach((proc, index) => {
        if (!proc.category)
          newErrors[`procedure_${index}_category`] = "Category is required";
        if (!proc.procedure)
          newErrors[`procedure_${index}_procedure`] = "Procedure is required";
        if (!proc.quantity || proc.quantity < 1) {
          newErrors[`procedure_${index}_quantity`] =
            "Quantity must be at least 1";
        }
        if (!proc.price || proc.price < 0) {
          newErrors[`procedure_${index}_price`] = "Price must be at least 0";
        }
      });
    }

    // Validate paid amount
    if (formData.paid < 0) {
      newErrors.paid = "Paid amount cannot be negative";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    onSubmit(formData, () => {
      // Form submitted successfully, reset form and call success callback
      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsLoading(false);
  };

  const { total, afterDiscount, balance } = calculateTotals();

  // Helper function to get procedures for a specific category
  const getProceduresForCategory = (categoryKey) => {
    console.log("getProceduresForCategory called with:", categoryKey);
    console.log("procedures prop:", procedures);
    console.log("procedures type:", typeof procedures);
    console.log(
      "procedures keys:",
      procedures ? Object.keys(procedures) : "no procedures"
    );
    console.log("availableProcedures:", availableProcedures);

    if (
      !categoryKey ||
      !availableProcedures ||
      typeof availableProcedures !== "object"
    ) {
      console.log("Early return - invalid inputs");
      return [];
    }

    const categoryProcedures = availableProcedures[categoryKey] || [];
    console.log(
      "Found procedures for category",
      categoryKey,
      ":",
      categoryProcedures
    );
    return categoryProcedures;
  };

  // Fallback procedures if the main procedures are not loaded yet
  const fallbackProcedures = {
    consultation: [
      {
        key: "initial_consultation",
        value: "initial_consultation",
        label: "Initial Consultation",
        category: "consultation",
      },
      {
        key: "followup_visit",
        value: "followup_visit",
        label: "Follow-up Visit",
        category: "consultation",
      },
    ],
    surgery: [
      {
        key: "root_canal",
        value: "root_canal",
        label: "Root Canal",
        category: "surgery",
      },
      {
        key: "tooth_extraction",
        value: "tooth_extraction",
        label: "Tooth Extraction",
        category: "surgery",
      },
    ],
  };

  // Use fallback procedures if main procedures are not loaded
  const availableProcedures =
    procedures && Object.keys(procedures).length > 0
      ? procedures
      : fallbackProcedures;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          {isEditing ? "Edit Invoice" : "Create New Invoice"}
        </ModalHeader>
        <ModalBody>
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Loading invoice data...</p>
              </div>
            </div>
          )}
          <div className="space-y-6">
            {/* Invoice Number Section */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <Input
                  value={formData.invoice_number || ""}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
            )}

            {/* Patient, Doctor, Date Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Patient <span class="text-danger">*</span>
                </label>
                <Select
                  selectedKeys={
                    formData.patient_id ? [String(formData.patient_id)] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    handleInputChange("patient_id", value);

                    // Clear patient error if it exists and value is valid
                    if (errors.patient_id && value && value !== "") {
                      setErrors((prev) => ({ ...prev, patient_id: "" }));
                    }
                  }}
                  className="w-full"
                >
                  {console.log("Rendering patient options:", patients)}
                  {patients && patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient.value} value={patient.value}>
                        {patient.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-patients" value="">
                      No patients available
                    </SelectItem>
                  )}
                </Select>
                {errors.patient_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.patient_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Doctor <span class="text-danger">*</span>
                </label>
                <Select
                  selectedKeys={
                    formData.doctor_id ? [String(formData.doctor_id)] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    handleInputChange("doctor_id", value);

                    // Clear doctor error if it exists and value is valid
                    if (errors.doctor_id && value && value !== "") {
                      setErrors((prev) => ({ ...prev, doctor_id: "" }));
                    }
                  }}
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
                {errors.doctor_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.doctor_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date <span class="text-danger">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("date", value);

                    // Clear date error if it exists and value is valid
                    if (errors.date && value && value !== "") {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  }}
                  className="w-full"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Procedures Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Procedures & Services</h3>
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
                          Category <span class="text-danger">*</span>
                        </label>
                        <Select
                          selectedKeys={
                            proc.category ? [String(proc.category)] : []
                          }
                          onSelectionChange={(keys) =>
                            handleProcedureChange(
                              index,
                              "category",
                              Array.from(keys)[0]
                            )
                          }
                          className="w-full"
                          placeholder="Select category first"
                        >
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
                        {errors[`procedure_${index}_category`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`procedure_${index}_category`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Procedure <span class="text-danger">*</span>
                        </label>
                        <Select
                          selectedKeys={
                            proc.procedure ? [String(proc.procedure)] : []
                          }
                          onSelectionChange={(keys) =>
                            handleProcedureChange(
                              index,
                              "procedure",
                              Array.from(keys)[0]
                            )
                          }
                          className="w-full"
                          isDisabled={!proc.category}
                          placeholder={
                            proc.category
                              ? "Select procedure"
                              : "Select category first"
                          }
                        >
                          {(() => {
                            // Get procedures for the selected category
                            const categoryProcedures = getProceduresForCategory(
                              proc.category
                            );
                            console.log(
                              "Category procedures for",
                              proc.category,
                              ":",
                              categoryProcedures
                            );
                            console.log(
                              "Current proc.category:",
                              proc.category
                            );
                            console.log(
                              "Procedures prop in render:",
                              procedures
                            );

                            if (!proc.category) {
                              return (
                                <SelectItem key="no-category" value="">
                                  Please select a category first
                                </SelectItem>
                              );
                            }

                            if (categoryProcedures.length === 0) {
                              return (
                                <SelectItem key="no-procedures" value="">
                                  No procedures available for this category
                                </SelectItem>
                              );
                            }

                            return categoryProcedures.map((procItem) => (
                              <SelectItem
                                key={procItem.value}
                                value={procItem.value}
                              >
                                {procItem.label}
                              </SelectItem>
                            ));
                          })()}
                        </Select>
                        {errors[`procedure_${index}_procedure`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`procedure_${index}_procedure`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity <span className="text-danger">*</span>
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
                        {errors[`procedure_${index}_quantity`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`procedure_${index}_quantity`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price <span className="text-danger">*</span>
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
                        {errors[`procedure_${index}_price`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`procedure_${index}_price`]}
                          </p>
                        )}
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
                        Subtotal: $
                        {(Math.round((proc.subTotal || 0) * 100) / 100).toFixed(
                          2
                        )}
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
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0];
                      handleInputChange("payment_method", value);

                      // Clear payment method error if it exists
                      if (errors.payment_method) {
                        setErrors((prev) => ({ ...prev, payment_method: "" }));
                      }
                    }}
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
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="discount-select"
                  >
                    Discount (%)
                  </label>
                  <select
                    id="discount-select"
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    style={{
                      background: "#f4f4f5",
                      border: "1px solid #f4f4f5",
                    }}
                    value={
                      formData.discount !== undefined &&
                      formData.discount !== null
                        ? String(formData.discount)
                        : "0"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange("discount", value);

                      // Clear discount error if it exists and value is valid
                      if (
                        errors.discount &&
                        value !== undefined &&
                        value !== null &&
                        value !== ""
                      ) {
                        setErrors((prev) => ({ ...prev, discount: "" }));
                      }
                    }}
                  >
                    {Array.from({ length: 101 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}%
                      </option>
                    ))}
                  </select>
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
                  {errors.paid && (
                    <p className="text-red-500 text-xs mt-1">{errors.paid}</p>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("notes", value);

                    // Clear notes error if it exists (notes is optional)
                    if (errors.notes) {
                      setErrors((prev) => ({ ...prev, notes: "" }));
                    }
                  }}
                  placeholder="Enter any additional notes or comments"
                  className="w-full"
                  rows={3}
                />
              </div>

              {/* Calculated Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-lg">PKR {total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">After Discount:</span>
                  <span className="font-bold text-lg">PKR {afterDiscount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Balance:</span>
                  <span className="font-bold text-lg">PKR {balance}</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={isEditing ? onCancelEdit : onClose}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            disabled={isLoading}
            startContent={
              isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : null
            }
          >
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Invoice"
              : "Create Invoice"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Invoice Detail Modal Component - Unified with Print Preview
const InvoiceDetailModal = ({ isOpen, onClose, invoice, loading }) => {
  const dynamicFormData = useFormData();

  if (!invoice) return null;

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-unified-content");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${
            invoice.invoiceNumber || invoice.invoice_number
          }</title>
          <style>
            @page { 
              margin: 0; 
              size: A4;
            }
            
            @media print {
              body { 
                margin: 0 !important; 
                padding: 12px !important; 
                font-family: 'Arial', sans-serif !important;
                color: black !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .no-print { display: none !important; }
              
              /* Remove grayscale filter for print */
              #invoice-print-content {
                filter: none !important;
                -webkit-filter: none !important;
              }
  
              /* Force table header styles in print */
              table thead {
                background: #000000 !important;
                color: white !important;
              }
              
              table thead tr {
                background: #000000 !important;
                color: white !important;
              }
              
              table thead th {
                background: #000000 !important;
                color: white !important;
                border: 1px solid #000000 !important;
                font-weight: 600 !important;
              }
              
              /* Ensure table borders are visible */
              table, table tr, table td, table th {
                border-collapse: collapse !important;
              }
              
              /* Force body text to stay black */
              table tbody td {
                color: #000000 !important;
                border: 1px solid #cccccc !important;
              }
              
              /* Keep borders black */
              * {
                border-color: #000000 !important;
              }
              
              /* Preserve header colors specifically */
              table thead * {
                color: white !important;
                background: #000000 !important;
              }
            }
            
            @media screen {
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 12px; 
                background: white; 
              }
            }
            
            /* Universal styles that apply to both screen and print */
            body { 
              font-family: 'Arial', sans-serif !important; 
              margin: 0 !important; 
              padding: 12px !important; 
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .invoice-container { 
              max-width: 650px !important; 
              margin: 0 auto !important; 
            }
            
            table thead {
              background: #000000 !important;
              color: white !important;
            }
            
            table thead tr {
              background: #000000 !important;
              color: white !important;
            }
            
            table thead th {
              background: #000000 !important;
              color: white !important;
              border: 1px solid #000000 !important;
              font-weight: 600 !important;
            }
            
            table tbody td {
              color: #000000 !important;
              border: 1px solid #cccccc !important;
            }
            
            table {
              border-collapse: collapse !important;
            }
          </style>
        </head>
        <body>
          <div id="invoice-print-content" class="invoice-container" style="max-width: 650px; margin: 0 auto; padding: 20px; background: white; font-family: Arial, sans-serif;">
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent className="">
        <ModalHeader className="bg-white border-b border-gray-200">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 rounded-lg shadow-sm bg-primary/10 flex items-center justify-center">
                <i className="text-primary text-lg font-bold">i</i>
            </div>
              <h1 className="text-xl font-bold text-black">Invoice Detail</h1>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-black text-lg">Loading invoice details...</p>
              </div>
            </div>
          ) : (
            <div
              id="invoice-unified-content"
              className="invoice-container"
              style={{
                maxWidth: "650px",
                margin: "0 auto",
                padding: "20px",
                background: "white",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "6px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Clinic Branding & Invoice Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "2px solid #000000",
                    paddingBottom: "16px",
                    marginBottom: "20px",
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
                          marginRight: "16px",
                          background: "transparent",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "0px",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
              </div>

                      <div>
                        <h1
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#000000",
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
                        color: "#333333",
                        lineHeight: "1.4",
                      }}
                    >
                      <div style={{ marginBottom: "2px" }}>
                        Office#1, City Plaza, F-10 Markaz, Islamabad
                    </div>
                      <div>Clinic Contact: 0516131786</div>
                    </div>
                    </div>

                  {/* INVOICE Title - absolutely centered */}
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#000000",
                      margin: "0",
                      textTransform: "uppercase",
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: "0px",
                    }}
                  >
                    INVOICE
                  </h2>
                    </div>

                {/* Invoice Information Grid */}
                <div
                  style={{
                    background: "#ffff",
                    padding: "8px",
                    borderRadius: "6px",
                    borderLeft: "3px solid #000000",
                    border: "1px solid #cccccc",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    {/* Name */}
                    <div
                      style={{
                        display: "flex",
                        gap: "3px",
                        justifyContent: "start",
                      }}
                    >
                      <span
                        style={{
                          color: "#555555",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        Name:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        {invoice.patient?.fullName || "N/A"}
                      </span>
                  </div>

                    {/* MRN */}
                    <div
                      style={{
                        display: "flex",
                        gap: "3px",
                        justifyContent: "start",
                      }}
                    >
                      <span
                        style={{
                          color: "#555555",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        MRN:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        {invoice.patient?.mrnNumber || "N/A"}
                      </span>
                    </div>

                    {/* Contact */}
                    <div
                      style={{
                        display: "flex",
                        gap: "3px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          color: "#555555",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        Contact:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        {invoice.patient?.contactNumber || "N/A"}
                      </span>
                    </div>

                    {/* Doctor */}
                    <div
                      style={{
                        display: "flex",
                        gap: "3px",
                        justifyContent: "start",
                      }}
                    >
                      <span
                        style={{
                          color: "#555555",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        Doctor:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        {invoice.doctor?.username || "N/A"}
                      </span>
                    </div>

                    {/* Invoice Number */}
                    <div
                      style={{
                        display: "flex",
                        gap: "3px",
                        justifyContent: "start",
                      }}
                    >
                      <span
                        style={{
                          color: "#555555",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        Invoice #:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        {invoice.invoiceNumber ||
                          invoice.invoice_number ||
                          "N/A"}
                      </span>
                    </div>

                    {/* Invoice Date */}
                    <div
                      style={{
                        display: "flex",
                        gap: "3px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          color: "#555555",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        Date:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        {invoice.invoiceDate || invoice.invoice_date || "N/A"}
                      </span>
                    </div>
                </div>
              </div>

              {/* Invoice Items */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#000000",
                      margin: "8px 0",
                    }}
                  >
                    Invoice Items
                  </h3>
                  <div
                    style={{
                      background: "white",
                      border: "2px solid #000000",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead style={{ background: "#000000", color: "white" }}>
                        <tr>
                          <th
                            style={{
                              padding: "8px 8px",
                              textAlign: "left",
                              fontWeight: "600",
                              fontSize: "10px",
                              border: "1px solid #000000",
                            }}
                          >
                            #
                          </th>
                          <th
                            style={{
                              padding: "8px 8px",
                              textAlign: "left",
                              fontWeight: "600",
                              fontSize: "10px",
                              border: "1px solid #000000",
                            }}
                          >
                            Description
                          </th>
                          <th
                            style={{
                              padding: "8px 8px",
                              textAlign: "left",
                              fontWeight: "600",
                              fontSize: "10px",
                              border: "1px solid #000000",
                            }}
                          >
                            Qty
                          </th>
                          <th
                            style={{
                              padding: "8px 8px",
                              textAlign: "left",
                              fontWeight: "600",
                              fontSize: "10px",
                              border: "1px solid #000000",
                            }}
                          >
                            Price
                          </th>
                          <th
                            style={{
                              padding: "8px 8px",
                              textAlign: "left",
                              fontWeight: "600",
                              fontSize: "10px",
                              border: "1px solid #000000",
                            }}
                          >
                            Disc.
                          </th>
                          <th
                            style={{
                              padding: "8px 8px",
                              textAlign: "left",
                              fontWeight: "600",
                              fontSize: "10px",
                              border: "1px solid #000000",
                            }}
                          >
                            Total
                          </th>
                      </tr>
                    </thead>
                      <tbody>
                      {invoice.services && invoice.services.length > 0 ? (
                        invoice.services.map((item, index) => (
                            <tr
                              key={index}
                              style={{
                                background:
                                  index % 2 === 0 ? "white" : "#f8f8f8",
                              }}
                            >
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #cccccc",
                                  fontSize: "10px",
                                  color: "#000000",
                                  fontWeight: "500",
                                }}
                              >
                                {item.index}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #cccccc",
                                  fontSize: "10px",
                                  color: "#000000",
                                }}
                              >
                                {item.description || "No description"}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #cccccc",
                                  fontSize: "10px",
                                  color: "#000000",
                                }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #cccccc",
                                  fontSize: "10px",
                                  color: "#000000",
                                }}
                              >
                                PKR {parseFloat(item.unit_price)}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #cccccc",
                                  fontSize: "10px",
                                  color: "#000000",
                                }}
                              >
                                PKR {parseFloat(item.discount)}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #cccccc",
                                  fontSize: "10px",
                                  color: "#000000",
                                  fontWeight: "bold",
                                }}
                              >
                                PKR {parseFloat(item.total_price)}
                              </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                            <td
                              colSpan="6"
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#000000",
                                fontSize: "10px",
                                border: "1px solid #000000",
                              }}
                            >
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
                <div
                  style={{
                    background: "#ffff",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid #000000",
                    marginBottom: "20px",
                  }}
                >
                  {/* First Row: Subtotal, Amount Paid, Discount */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          marginRight: "8px",
                        }}
                      >
                        Subtotal:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        PKR {Math.round(invoice.totalAmount || 0)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          marginRight: "8px",
                        }}
                      >
                        Amount Paid:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        PKR {Math.round(invoice.paid || 0)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "end",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          marginRight: "8px",
                        }}
                      >
                        Discount:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        -PKR {Math.round(invoice.discountAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Second Row: Balance and Net Amount */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          marginRight: "8px",
                        }}
                      >
                        Balance:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        PKR {Math.round(invoice.balance || 0)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "600",
                          marginRight: "8px",
                        }}
                      >
                        Net Amount:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          fontWeight: "bold",
                          fontSize: "12px",
                          textDecoration: "underline",
                        }}
                      >
                        PKR {Math.round(invoice.netAmount || 0)}
                      </span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {invoice.notes && (
                  <div
                    style={{
                      background: "#ffff",
                      padding: "16px",
                      borderRadius: "6px",
                      borderLeft: "3px solid #000000",
                      border: "1px solid #cccccc",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#000000",
                        margin: "0 0 8px 0",
                      }}
                    >
                      Notes
                    </h3>
                    <p
                      style={{
                        color: "#000000",
                        lineHeight: "1.4",
                        fontSize: "12px",
                        margin: "0",
                      }}
                    >
                      {invoice.notes}
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
                Print Invoice
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function InvoicesPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [procedures, setProcedures] = useState({});
  const [filterColumns, setFilterColumns] = useState(baseFilterColumns);
  const [currentFilters, setCurrentFilters] = useState({});
  const { token } = useAuth();

  // Modal states
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Custom close handler to reset form state
  const handleFormClose = () => {
    onFormClose();
    // Reset editing state when closing modal
    setIsEditing(false);
    setEditingInvoice(null);
  };

  // Monitor modal state changes to ensure proper form state
  useEffect(() => {
    if (!isFormOpen) {
      // Modal is closed, ensure editing state is reset
      setIsEditing(false);
      setEditingInvoice(null);
    }
  }, [isFormOpen]);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Memoized filter columns
  const memoizedFilterColumns = useMemo(() => {
    console.log("Building memoized filter columns with:", {
      patients: patients.length,
      doctors: doctors.length,
    });

    if (patients.length === 0 && doctors.length === 0) {
      console.log("No patients or doctors, returning base filter columns");
      return baseFilterColumns.map((filter) => {
        if (filter.key === "patient") {
          return {
            ...filter,
            options: [{ value: "", label: "Loading patients..." }],
            disabled: true,
          };
        }
        if (filter.key === "doctor") {
          return {
            ...filter,
            options: [{ value: "", label: "Loading doctors..." }],
            disabled: true,
          };
        }
        return filter;
      });
    }

    const result = baseFilterColumns.map((filter) => {
      if (filter.key === "patient") {
        const patientOptions = [
          { value: "", label: "All Patients" },
          ...patients.map((patient) => ({
            key: patient.key,
            value: patient.value,
            label: patient.label,
          })),
        ];
        console.log("Patient filter options:", patientOptions);
        return {
          ...filter,
          options: patientOptions,
          disabled: false,
        };
      }
      if (filter.key === "doctor") {
        const doctorOptions = [
          { value: "", label: "All Doctors" },
          ...doctors.map((doctor) => ({
            key: doctor.key,
            value: doctor.value,
            label: doctor.label,
          })),
        ];
        console.log("Doctor filter options:", doctorOptions);
        return {
          ...filter,
          options: doctorOptions,
          disabled: false,
        };
      }
      return filter;
    });

    console.log("Final memoized filter columns:", result);
    return result;
  }, [patients, doctors]);

  // Update filter columns when memoized columns change
  useEffect(() => {
    setFilterColumns(memoizedFilterColumns);
  }, [memoizedFilterColumns]);

  // Fetch patients and doctors for dropdowns
  useEffect(() => {
    if (!token) return;

    // Fetch patients
    config.initAPI(token);
    config
      .getData("/patients/list")
      .then((response) => {
        console.log("Patients API response:", response);
        if (response.data && response.data.data) {
          const patientOptions = response.data.data.map((patient) => ({
            key: patient.id,
            value: patient.id,
            label: patient.full_name,
          }));
          console.log("Setting patients:", patientOptions);
          setPatients(patientOptions);
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where response.data is directly an array
          const patientOptions = response.data.map((patient) => ({
            key: patient.id,
            value: patient.id,
            label: patient.full_name,
          }));
          console.log("Setting patients (direct array):", patientOptions);
          setPatients(patientOptions);
        } else {
          // Fallback to hardcoded patients if API doesn't return data
          const fallbackPatients = [
            { key: "1", value: "1", label: "Sample Patient 1" },
            { key: "2", value: "2", label: "Sample Patient 2" },
            { key: "3", value: "3", label: "Sample Patient 3" },
          ];
          console.log("Setting fallback patients:", fallbackPatients);
          setPatients(fallbackPatients);
        }
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        // Set fallback patients on error
        const fallbackPatients = [
          { key: "1", value: "1", label: "Sample Patient 1" },
          { key: "2", value: "2", label: "Sample Patient 2" },
          { key: "3", value: "3", label: "Sample Patient 3" },
        ];
        console.log("Setting fallback patients on error:", fallbackPatients);
        setPatients(fallbackPatients);
      });

    // Fetch doctors
    config
      .getData(`/users/list?role=doctor`)
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

    // Set default categories and procedures with parent-child relationship
    const defaultCategories = [
      { key: "consultation", value: "consultation", label: "Consultation" },
      { key: "surgery", value: "surgery", label: "Surgery" },
      { key: "lab", value: "lab", label: "Lab" },
      { key: "treatment", value: "treatment", label: "Treatment" },
      { key: "examination", value: "examination", label: "Examination" },
    ];
    console.log("Setting default categories:", defaultCategories);
    console.log(
      "Category values:",
      defaultCategories.map((cat) => cat.value)
    );
    setCategories(defaultCategories);

    // Procedures organized by category
    const defaultProceduresByCategory = {
      consultation: [
        {
          key: "initial_consultation",
          value: "initial_consultation",
          label: "Initial Consultation",
          category: "consultation",
        },
        {
          key: "followup_visit",
          value: "followup_visit",
          label: "Follow-up Visit",
          category: "consultation",
        },
        {
          key: "emergency_consultation",
          value: "emergency_consultation",
          label: "Emergency Consultation",
          category: "consultation",
        },
      ],
      surgery: [
        {
          key: "root_canal",
          value: "root_canal",
          label: "Root Canal",
          category: "surgery",
        },
        {
          key: "tooth_extraction",
          value: "tooth_extraction",
          label: "Tooth Extraction",
          category: "surgery",
        },
        {
          key: "dental_implant",
          value: "dental_implant",
          label: "Dental Implant",
          category: "surgery",
        },
        {
          key: "wisdom_teeth_removal",
          value: "wisdom_teeth_removal",
          label: "Wisdom Teeth Removal",
          category: "surgery",
        },
      ],
      lab: [
        { key: "xray", value: "xray", label: "X-Ray", category: "lab" },
        {
          key: "blood_test",
          value: "blood_test",
          label: "Blood Test",
          category: "lab",
        },
        {
          key: "urine_test",
          value: "urine_test",
          label: "Urine Test",
          category: "lab",
        },
        { key: "biopsy", value: "biopsy", label: "Biopsy", category: "lab" },
      ],
      treatment: [
        {
          key: "dental_cleaning",
          value: "dental_cleaning",
          label: "Dental Cleaning",
          category: "treatment",
        },
        {
          key: "filling",
          value: "filling",
          label: "Dental Filling",
          category: "treatment",
        },
        {
          key: "whitening",
          value: "whitening",
          label: "Teeth Whitening",
          category: "treatment",
        },
        {
          key: "braces",
          value: "braces",
          label: "Braces Installation",
          category: "treatment",
        },
      ],
      examination: [
        {
          key: "oral_examination",
          value: "oral_examination",
          label: "Oral Examination",
          category: "examination",
        },
        {
          key: "periodontal_examination",
          value: "periodontal_examination",
          label: "Periodontal Examination",
          category: "examination",
        },
        {
          key: "orthodontic_evaluation",
          value: "orthodontic_evaluation",
          label: "Orthodontic Evaluation",
          category: "examination",
        },
      ],
    };
    console.log(
      "Setting default procedures by category:",
      defaultProceduresByCategory
    );
    setProcedures(defaultProceduresByCategory);
  }, [token]);

  // Debug useEffect to log when currentFilters change
  useEffect(() => {
    console.log("Current filters updated:", currentFilters);
  }, [currentFilters]);

  // Debug useEffect to log when procedures state changes
  useEffect(() => {
    console.log("Procedures state updated:", procedures);
    console.log("Procedures type:", typeof procedures);
    console.log(
      "Procedures keys:",
      procedures ? Object.keys(procedures) : "no procedures"
    );
  }, [procedures]);

  // Cleanup effect to reset loading states when component unmounts
  useEffect(() => {
    return () => {
      setFilterLoading(false);
      setLoading(false);
    };
  }, []);

  // Debug effect to monitor filter state changes
  useEffect(() => {
    console.log("Current filters updated:", currentFilters);
    console.log("Filter loading state:", filterLoading);
  }, [currentFilters, filterLoading]);

  // Monitor filter loading state for debugging
  useEffect(() => {
    if (filterLoading) {
      console.log("Filter loading state is true");
    } else {
      console.log("Filter loading state is false");
    }
  }, [filterLoading]);

  const handleViewDetail = useCallback(
    (invoice) => {
    // Call the invoice view API to get complete details
    setViewLoading(true);
    config.initAPI(token);
      config
        .getData(`/invoices/view?id=${invoice.id}`)
        .then((response) => {
          console.log("Invoice view API response:", response);
        setViewLoading(false);
        if (response.data && response.data.success) {
          const invoiceData = response.data.data;

          // Map the invoice data to match the expected format for the modal
          const mappedInvoice = {
            ...invoiceData,
            // Basic invoice info
            invoiceNumber: invoiceData.invoice_number,
            invoiceDate: invoiceData.invoice_date,
            totalAmount: Number(invoiceData.total_amount) || 0,
            discountAmount: Number(invoiceData.discount_amount) || 0,
            netAmount: Number(invoiceData.net_amount) || 0,
            paid: Number(invoiceData.paid) || 0,
            balance: Number(invoiceData.balance) || 0,
            paymentMethod: invoiceData.payment_method,
            notes: invoiceData.notes,

            // Patient information
            patient: {
              id: invoiceData.patient?.id,
              mrnNumber: invoiceData.patient?.mrn_number,
              fullName: invoiceData.patient?.full_name,
              fatherName: invoiceData.patient?.father_name,
              email: invoiceData.patient?.email,
              contactNumber: invoiceData.patient?.contact_number,
              gender: invoiceData.patient?.gender,
              dob: invoiceData.patient?.dob,
              address: invoiceData.patient?.address,
              medicalHistory: invoiceData.patient?.medical_history,
                allergies: invoiceData.patient?.allergies,
            },

            // Doctor information
            doctor: {
              id: invoiceData.doctor?.id,
                username: invoiceData.doctor?.username,
            },

            // Invoice items/services
            services: mapInvoiceItemsToServices(invoiceData.items),

            // Timestamps
            createdAt: invoiceData.created_at,
            updatedAt: invoiceData.updated_at,

            // Raw data for detailed display
              rawData: invoiceData,
          };

          setSelectedInvoice(mappedInvoice);
          setIsDetailOpen(true);
        } else {
            toast.error(
              response.data?.message || "Failed to fetch invoice details"
            );
        }
      })
        .catch((error) => {
          console.error("Error fetching invoice details:", error);
        setViewLoading(false);
          toast.error("Failed to fetch invoice details");

        // Fallback to basic invoice data if API fails
        const mappedInvoice = {
          ...invoice,
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoice.invoice_date,
          patientName: invoice.patient?.full_name,
          doctorName: invoice.doctor?.username,
          services: mapInvoiceItemsToServices(invoice.items),
          totalAmount: Number(invoice.total_amount) || 0,
          discountAmount: Number(invoice.discount_amount) || 0,
          netAmount: Number(invoice.net_amount) || 0,
          paid: Number(invoice.paid) || 0,
          balance: Number(invoice.balance) || 0,
          date: invoice.invoice_date,
          paymentMethod: invoice.payment_method,
          notes: invoice.notes,
            rawData: invoice,
        };
        setSelectedInvoice(mappedInvoice);
        setIsDetailOpen(true);
      });
    },
    [token]
  );

  const getData = useCallback(
    (perpage = 5, page = 1, filters = {}, isFiltering = false) => {
    if (!token) return;

    if (isFiltering) {
      setFilterLoading(true);
    } else {
      setLoading(true);
    }

    // Build query parameters for filtering - only send parameters that backend supports
    // Based on inventory page pattern, only send basic parameters to backend
    const queryParams = new URLSearchParams({
      perpage: perpage.toString(),
      page: page.toString(),
      ...(filters.invoiceNumber && { invoice_number: filters.invoiceNumber }),
      ...(filters.patient && { patient_id: filters.patient }),
        ...(filters.doctor && { doctor_id: filters.doctor }),
    });

    // Add date range parameters if they exist (these might be supported by backend)
      if (filters.startDate)
        queryParams.append("start_date", filters.startDate);
      if (filters.endDate) queryParams.append("end_date", filters.endDate);

    // Log the filters being applied
      console.log("=== FILTER DEBUG START ===");
      console.log("Filters being applied to API:", filters);
      console.log("Query parameters built:", queryParams.toString());
      console.log(
        "Query params object:",
        Object.fromEntries(queryParams.entries())
      );
      console.log(
        "Final API URL will be:",
        `/invoices/list${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`
      );

    config.initAPI(token);
      const url = `/invoices/list${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      console.log("Calling invoices API with URL:", url);
      console.log("Filters applied:", filters);
      console.log("=== FILTER DEBUG END ===");

      config
        .getData(url)
        .then((data) => {
          console.log("Invoices API response:", data);
        
        // Validate response structure before processing
        if (!data || !data.data || !Array.isArray(data.data.data)) {
            console.error("Invalid API response structure:", data);
            throw new Error("Invalid response from server");
        }

          let _data = data.data.data.map((item) => ({
          ...item,
            active: item.active === 1 ? "Active" : "Inactive",
          status: calculateInvoiceStatus(
            Number(item.balance) || 0,
            Number(item.paid) || 0,
            Number(item.net_amount) || 0
            ),
        }));

        // Apply client-side filtering for filters not supported by backend
        // Note: status, payment_method, and amount_range are always client-side filtered
        // Date range might be handled by backend, but we'll also apply it client-side for consistency
          if (
            filters.status ||
            filters.payment_method ||
            filters.amount_range ||
            filters.startDate ||
            filters.endDate
          ) {
            console.log("Applying client-side filters:", {
              status: filters.status,
              payment_method: filters.payment_method,
              amount_range: filters.amount_range,
              startDate: filters.startDate,
              endDate: filters.endDate,
            });
            _data = _data.filter((item) => {
            // Status filter
            if (filters.status && item.status !== filters.status) {
              return false;
            }

            // Payment method filter
              if (
                filters.payment_method &&
                item.payment_method !== filters.payment_method
              ) {
              return false;
            }

            // Amount range filter
              if (
                filters.amount_range &&
                !isAmountInRange(item.net_amount, filters.amount_range)
              ) {
              return false;
            }

            // Date range filter (applied client-side for consistency)
            if (filters.startDate || filters.endDate) {
              const invoiceDate = new Date(item.invoice_date);
                const startDate = filters.startDate
                  ? new Date(filters.startDate)
                  : null;
                const endDate = filters.endDate
                  ? new Date(filters.endDate)
                  : null;

              if (startDate && invoiceDate < startDate) {
                return false;
              }
              if (endDate && invoiceDate > endDate) {
                return false;
              }
            }

            return true;
          });
            console.log(
              "Client-side filtering applied. Filtered data count:",
              _data.length
            );
        }

        // Update state with new data
        setDataList(_data);
        setTotalItems(data.data.meta?.total || 0);
        setCurrentPage(data.data.meta?.page || 1);
        setItemsPerPage(data.data.meta?.perpage || 5);

        // Reset loading states after successful data processing
          console.log("Data processed successfully, resetting loading states");
        if (isFiltering) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
      })
        .catch((error) => {
          console.error("Error fetching invoices:", error);
        
        // Always reset loading states on error
        if (isFiltering) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
        
        // Show error toast for filter failures
        if (isFiltering) {
            toast.error("Failed to apply filters. Please try again.");
        } else {
            toast.error("Failed to fetch invoices. Please try again.");
        }
      });
    },
    [token]
  );

  // Initial data fetch
  useEffect(() => {
    getData(5, 1);
  }, [getData]);

  // Function to clear all filters and refresh data
  const clearFilters = () => {
    console.log("Clearing all filters");

    // Reset filter loading state immediately
    setFilterLoading(false);

    // Clear current filters
    setCurrentFilters({});

    // Reset to first page when clearing filters
    setCurrentPage(1);

    // Call getData without filter loading state
    getData(itemsPerPage, 1, {}, false);

    // Show success message
    toast.success("Filters cleared successfully");
  };

  // Function to export filtered data
  const exportFilteredData = () => {
    const csvContent = [
      // CSV header
      [
        "Invoice Number",
        "Patient",
        "Doctor",
        "Date",
        "Total Amount",
        "Discount",
        "Net Amount",
        "Paid",
        "Status",
        "Payment Method",
      ].join(","),
      // CSV data rows
      ...dataList.map((item) =>
        [
          item.invoice_number || "",
          item.patient?.full_name || "",
          item.doctor?.username || "",
          item.invoice_date || "",
        item.total_amount || 0,
        item.discount_amount || 0,
        item.net_amount || 0,
        item.paid || 0,
          item.status || "",
          item.payment_method || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invoices_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = useCallback(
    (filters) => {
      console.log("=== HANDLE FILTER CHANGE DEBUG START ===");
      console.log("handleFilterChange called with filters:", filters);
      console.log("Filter keys:", Object.keys(filters));
      console.log("Filter values:", Object.values(filters));

    // Store the current filters for pagination
    setCurrentFilters(filters);

    // Use filters directly without transformation - send IDs to API
    const apiFilters = { ...filters };
      console.log("API filters prepared:", apiFilters);

    // Handle quick date range filters
      if (filters.quick_date_range && filters.quick_date_range !== "") {
        const processedFilters = handleQuickDateRange(
          filters.quick_date_range,
          apiFilters
        );
        console.log("Quick date range processed:", processedFilters);
      getData(itemsPerPage, 1, processedFilters, true);
    } else {
        console.log("Applying filters directly to API:", apiFilters);
      getData(itemsPerPage, 1, apiFilters, true);
    }
      console.log("=== HANDLE FILTER CHANGE DEBUG END ===");
    },
    [patients, doctors, itemsPerPage, getData]
  );

  const handleCreateInvoice = () => {
    // Ensure we're in create mode and clear any previous data
    setIsEditing(false);
    setEditingInvoice(null);
    onFormOpen();
  };

  const handleCancelEdit = () => {
    handleFormClose();
  };

  const handleEditInvoice = async (invoice) => {
    console.log("Edit invoice clicked for:", invoice);
    try {
      setIsEditing(true);
      setEditingInvoice(null); // Clear previous data
      onFormOpen(); // Open modal for editing

      // Call the invoice view API to get complete details
      const response = await config.getData(`/invoices/view?id=${invoice.id}`);
      console.log("Edit invoice view API response:", response);
      console.log("Raw invoice data:", response.data?.data);
      console.log("Raw items data:", response.data?.data?.items);
      if (response.data?.data?.items && response.data.data.items.length > 0) {
        console.log("First item raw data:", response.data.data.items[0]);
        console.log(
          "First item keys:",
          Object.keys(response.data.data.items[0])
        );
        console.log(
          "First item category field:",
          response.data.data.items[0].category
        );
        console.log(
          "First item procedure field:",
          response.data.data.items[0].procedure
        );
        console.log(
          "First item item_type field:",
          response.data.data.items[0].item_type
        );
        console.log(
          "First item item_description field:",
          response.data.data.items[0].item_description
        );
        console.log(
          "First item quantity field:",
          response.data.data.items[0].quantity
        );
        console.log(
          "First item unit_price field:",
          response.data.data.items[0].unit_price
        );
        console.log(
          "First item total_price field:",
          response.data.data.items[0].total_price
        );
        console.log(
          "First item discount field:",
          response.data.data.items[0].discount
        );
        console.log(
          "First item notes field:",
          response.data.data.items[0].notes
        );
        console.log(
          "First item created_at field:",
          response.data.data.items[0].created_at
        );
        console.log(
          "First item updated_at field:",
          response.data.data.items[0].updated_at
        );
      }

      if (response.data && response.data.success) {
        const invoiceData = response.data.data;

        // Map the invoice data to match the form structure
        const mappedInvoice = {
          id: invoiceData.id,
          patient_id: invoiceData.patient_id || invoiceData.patient?.id,
          doctor_id: invoiceData.doctor_id || invoiceData.doctor?.id,
          date: invoiceData.invoice_date || invoiceData.date,
          procedures: mapInvoiceItemsToServices(
            invoiceData.items || invoiceData.procedures || []
          ),
          discount: Number(invoiceData.discount) || 0,
          paid: Number(invoiceData.paid) || 0,
          total_amount: Number(invoiceData.total_amount) || 0,
          after_discount: Number(invoiceData.net_amount) || 0,
          balance: Number(invoiceData.balance) || 0,
          payment_method: invoiceData.payment_method || "cash",
          notes: invoiceData.notes || "",
          invoice_number:
            invoiceData.invoice_number || invoiceData.invoice_number,
        };

        // Debug the mapped procedures
        console.log(
          "Mapped procedures before setting:",
          mappedInvoice.procedures
        );
        if (mappedInvoice.procedures && mappedInvoice.procedures.length > 0) {
          mappedInvoice.procedures.forEach((proc, idx) => {
            console.log(`Procedure ${idx + 1}:`, {
              category: proc.category,
              procedure: proc.procedure,
              categoryType: typeof proc.category,
              procedureType: typeof proc.procedure,
              originalItem: invoiceData.items?.[idx],
              originalItemKeys: invoiceData.items?.[idx]
                ? Object.keys(invoiceData.items[idx])
                : [],
              originalItemItemType: invoiceData.items?.[idx]?.item_type,
              originalItemDescription:
                invoiceData.items?.[idx]?.item_description,
            });
          });
        }

        console.log("Mapped invoice data for editing:", mappedInvoice);
        console.log("Mapped procedures:", mappedInvoice.procedures);
        console.log(
          "First procedure category:",
          mappedInvoice.procedures[0]?.category
        );
        console.log(
          "First procedure procedure:",
          mappedInvoice.procedures[0]?.procedure
        );
        setEditingInvoice(mappedInvoice);
      } else {
        // Fallback to basic invoice data if API fails
        console.warn("View API failed, using fallback data for editing");
        const fallbackInvoice = {
          ...invoice,
          date: invoice.invoice_date,
          procedures: mapInvoiceItemsToServices(invoice.items || []),
          discount: Number(invoice.discount) || 0,
          paid: Number(invoice.paid) || 0,
          total_amount: Number(invoice.total_amount) || 0,
          after_discount: Number(invoice.net_amount) || 0,
          balance: Number(invoice.balance) || 0,
          payment_method: invoice.payment_method || "cash",
          notes: invoice.notes || "",
        };
        setEditingInvoice(fallbackInvoice);
        toast.warning(
          "Using limited data for editing. Some fields may not be available."
        );
      }
    } catch (error) {
      console.error("Error fetching invoice details for editing:", error);
      toast.error("Failed to fetch invoice details for editing");

      // Fallback to basic invoice data on error
      const fallbackInvoice = {
        ...invoice,
        date: invoice.invoice_date,
        procedures: mapInvoiceItemsToServices(invoice.items || []),
        discount: Number(invoice.discount) || 0,
        paid: Number(invoice.paid) || 0,
        total_amount: Number(invoice.total_amount) || 0,
        after_discount: Number(invoice.net_amount) || 0,
        balance: Number(invoice.balance) || 0,
        payment_method: invoice.payment_method || "cash",
        notes: invoice.notes || "",
      };
      setEditingInvoice(fallbackInvoice);
    }
  };

  const handleFormSubmit = (formData, onSuccess) => {
    const transformedData = transformFormData(formData);

    if (isEditing) {
      config
        .postData(`/invoices/edit?id=${editingInvoice.id}`, transformedData)
        .then((response) => {
          if (response.data.success) {
            setDataList((prevList) =>
              prevList.map((invoice) =>
                invoice.id === editingInvoice.id
                  ? { ...invoice, ...response.data.invoice }
                  : invoice
              )
            );
            toast.success(
              response.data.message || "Invoice updated successfully!"
            );
            getData(itemsPerPage, currentPage);
            if (onSuccess) onSuccess();
          } else {
            toast.error(response.data.message || "Failed to update invoice");
          }
        })
        .catch((error) => {
          console.error("Error updating invoice:", error);
          toast.error("Failed to update invoice");
        });
    } else {
      config
        .postData("/invoices/create", transformedData)
        .then((response) => {
          if (response.data.success) {
            toast.success(
              response.data.message || "Invoice created successfully!"
            );
            getData(itemsPerPage, 1);
            if (onSuccess) onSuccess();
          } else {
            toast.error(response.data.message || "Failed to create invoice");
          }
        })
        .catch((error) => {
          console.error("Error creating invoice:", error);
          toast.error("Failed to create invoice");
        });
    }
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!invoiceToDelete) return;

    setDeleteLoading(true);
    config
      .postData("/invoices/delete", { id: invoiceToDelete.id })
      .then((response) => {
        if (response.data.success) {
          setDataList((prevList) =>
            prevList.filter((inv) => inv.id !== invoiceToDelete.id)
          );
          toast.success("Invoice deleted successfully!");
          setIsDeleteModalOpen(false);
          setInvoiceToDelete(null);
        } else {
          toast.error(response.data.message || "Failed to delete invoice");
        }
      })
      .catch((error) => {
        console.error("Error deleting invoice:", error);
        toast.error("Failed to delete invoice");
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleDeleteConfirm = () => {
    confirmDelete();
  };

  const customActions = [
    {
      label: "View",
      icon: "lucide:eye",
      onClick: handleViewDetail,
      color: "black",
      isDanger: false,
    },
    {
      label: "Edit",
      icon: "lucide:edit",
      onClick: handleEditInvoice,
      color: "black",
      isDanger: false,
    },
    {
      label: "Delete",
      icon: "lucide:trash",
      onClick: handleDeleteInvoice,
      color: "danger",
      isDanger: true,
    },
  ];

  return (
    <PageTemplate>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Manage patient invoices and billing</p>
          </div>
          <div className="flex gap-3">
            <Button
              color="primary"
              onPress={handleCreateInvoice}
              disabled={filterLoading}
            >
              Add Invoice
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={dataList}
          loading={loading || filterLoading}
          filterColumns={filterColumns}
          onFilterChange={handleFilterChange}
          customActions={customActions}
          pagination={{
            total: totalItems,
            page: currentPage,
            perPage: itemsPerPage,
            disabled: filterLoading, // Disable pagination when filters are loading
            onPageChange: (page) => {
              console.log("Page changed to:", page);
              setCurrentPage(page);
              // Apply current filters to new page
              if (Object.keys(currentFilters).length > 0) {
                console.log(
                  "Applying current filters to new page:",
                  currentFilters
                );
                // Use filters directly without transformation - send IDs to API
                getData(itemsPerPage, page, currentFilters, true);
              } else {
                getData(itemsPerPage, page, {}, false);
              }
            },
            onPerPageChange: (perPage) => {
              console.log("Per page changed to:", perPage);
              setItemsPerPage(perPage);
              setCurrentPage(1); // Reset to first page when changing items per page
              getData(perPage, 1, {}, false);
            },
          }}
        />

        {/* Invoice Form Modal */}
        <InvoiceForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={editingInvoice || initialFormData}
          isEditing={isEditing}
          patients={patients}
          doctors={doctors}
          categories={categories}
          procedures={procedures}
          onCancelEdit={handleCancelEdit}
          onSuccess={handleFormClose}
        />

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <InvoiceDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            invoice={selectedInvoice}
            loading={viewLoading}
          />
        )}

        {/* Confirm Delete Modal */}
        <DeleteDialog
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          itemType="Invoice"
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageTemplate>
  );
}
