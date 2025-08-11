import React, { useState, useEffect } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';

// Table columns
const columns = [
  { key: 'invoice_number', label: 'INVOICE NUMBER' },
  {
    key: 'patient',
    label: 'PATIENT',
    render: (item) => item.patient?.full_name || ''
  },
  {
    key: 'doctor',
    label: 'DOCTOR',
    render: (item) => item.doctor?.username || ''
  },
  { key: 'invoice_date', label: 'DATE' },
  { key: 'total_amount', label: 'TOTAL' },
  { key: 'discount_amount', label: 'DISCOUNT' },
  { key: 'net_amount', label: 'AFTER DISCOUNT' },
  { key: 'paid', label: 'PAID' },
  // { key: 'balance', label: 'BALANCE' },
  { key: 'actions', label: 'ACTIONS' },
];

// Filter columns
const filterColumns = [
  { key: 'patient', label: 'PATIENT', type: 'select', options: [
    { value: 'P1001', label: 'John Doe' },
    { value: 'P1002', label: 'Jane Smith' },
  ] },
  { key: 'doctor', label: 'DOCTOR', type: 'select', options: [
    { value: 'D1001', label: 'Dr. John Smith' },
    { value: 'D1002', label: 'Dr. Sarah Johnson' },
  ] },
  { key: 'invoiceNumber', label: 'INVOICE NUMBER' },
  { key: 'startDate', label: 'START DATE', type: 'date' },
  { key: 'endDate', label: 'END DATE', type: 'date' },
];

// Add Invoice form fields
const formFields = [
  { key: 'date', label: 'Invoice Date', type: 'date', required: true },
  { key: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'consultation', label: 'Consultation' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'lab', label: 'Lab' },
  ] },
  { key: 'procedure', label: 'Procedure (CPT)', type: 'select', required: true, options: [
    { value: '99213', label: '99213 - Office Visit' },
    { value: '93000', label: '93000 - ECG' },
  ] },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number', required: true, min: 1, default: 1 },
  { key: 'price', label: 'Price', type: 'number', required: true },
  { key: 'discount', label: 'Discount (%)', type: 'number', required: false },
  { key: 'paid', label: 'Paid', type: 'number', required: false },
];

const initialFormData = {
  patient_id: '',
  doctor_id: '',
  date: '',
  procedures: [
    {
      category: '',
      procedure: '',
      description: '',
      quantity: 1,
      price: '',
      subTotal: ''
    }
  ],
  discount: '',
  paid: '',
};

const mockData = [
  {
    id: '1',
    patient: 'John Doe',
    doctor: 'Dr. John Smith',
    date: '2025-05-01',
    total: 1000,
    discount: 10,
    afterDiscount: 900,
    paid: 900,
    due: 0,
  },
  {
    id: '2',
    patient: 'Jane Smith',
    doctor: 'Dr. Sarah Johnson',
    date: '2025-05-02',
    total: 2000,
    discount: 5,
    afterDiscount: 1900,
    paid: 1000,
    due: 900,
  },
];

const invoiceForm = {
  sections: [
    {
      fields: [
        {
          key: 'patient_id',
          label: 'Choose Patient',
          type: 'select',
          required: true,
          options: [] // Will be populated from API
        },
        {
          key: 'doctor_id',
          label: 'Choose Doctor',
          type: 'select',
          required: true,
          options: [] // Will be populated from API
        },
        {
          key: 'date',
          label: 'Invoice Date',
          type: 'date',
          required: true
        }
      ]
    },
    {
      fields: [
        { key: 'procedures', type: 'procedures-table' }
      ]
    },
    {
      title: 'Payment Details',
      fields: [
        {
          key: 'total_amount',
          label: 'Total Amount',
          type: 'number',
          readOnly: true,
          calculate: (formData) => {
            return (formData.procedures || []).reduce((sum, proc) => {
              const qty = Number(proc.quantity) || 0;
              const price = Number(proc.price) || 0;
              return sum + (qty * price);
            }, 0);
          }
        },
        {
          key: 'discount',
          label: 'Discount (%)',
          type: 'number',
          required: false
        },
        {
          key: 'after_discount',
          label: 'Amount After Discount',
          type: 'number',
          readOnly: true,
          calculate: (formData) => {
            const total = (formData.procedures || []).reduce((sum, proc) => {
              const qty = Number(proc.quantity) || 0;
              const price = Number(proc.price) || 0;
              return sum + (qty * price);
            }, 0);
            const discount = Number(formData.discount) || 0;
            return total - (total * (discount / 100));
          }
        },
        {
          key: 'paid',
          label: 'Amount Paid',
          type: 'number',
          required: false
        },
        {
          key: 'balance',
          label: 'Balance',
          type: 'number',
          readOnly: true,
          calculate: (formData) => {
            const total = (formData.procedures || []).reduce((sum, proc) => {
              const qty = Number(proc.quantity) || 0;
              const price = Number(proc.price) || 0;
              return sum + (qty * price);
            }, 0);
            const discount = Number(formData.discount) || 0;
            const afterDiscount = total - (total * (discount / 100));
            const paid = Number(formData.paid) || 0;
            return afterDiscount - paid;
          }
        }
      ]
    }
  ]
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    'INV-' +
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    '-' +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds()) +
    '-' +
    Math.floor(Math.random() * 1000)
  );
};

const transformFormData = (formData) => {
  // Calculate total_amount
  const total_amount = (formData.procedures || []).reduce((sum, proc) => {
    const qty = Number(proc.quantity) || 0;
    const price = Number(proc.price) || 0;
    return sum + qty * price;
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
    invoice_date: formData.date || formData.invoice_date || '',
    total_amount,
    discount_amount,
    net_amount,
    paid,
    balance,
    items: (formData.procedures || []).map(proc => ({
      item_type: proc.procedure || proc.category || '',
      item_description: proc.description,
      quantity: Number(proc.quantity) || 0,
      unit_price: Number(proc.price) || 0,
      discount: 0,
      total_price: (Number(proc.quantity) || 0) * (Number(proc.price) || 0)
    })),
    notes: formData.notes || null,
    payment_method: formData.payment_method || null,
  };
};

const mapInvoiceItemsToServices = (items) =>
  (items || []).map((item, idx) => ({
    index: idx + 1,
    procedure: item.item_type || '',
    description: item.item_description || '',
    quantity: Number(item.quantity) || 0,
    price: Number(item.unit_price) || 0,
    subTotal: Number(item.total_price) || 0,
    unit_price: Number(item.unit_price) || 0,
    total_price: Number(item.total_price) || 0,
  }));

export default function InvoicesPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const { token } = useAuth();

  // Fetch patients and doctors for dropdowns
  useEffect(() => {
    // Fetch patients
    config.initAPI(token);
    config.getData('/patients/list')
      .then(response => {
        const patientOptions = response.data.data.map(patient => ({
          key: patient.id,
          value: patient.id,
          label: patient.full_name
        }));
        setPatients(patientOptions);
      })
      .catch(error => console.error('Error fetching patients:', error));

    // Fetch doctors
    config.getData(`/users/list?role=doctor`)
      .then(response => {
        const doctorOptions = response.data.data.map(doctor => ({
          key: doctor.id,
          value: doctor.id,
          label: doctor.username
        }));
        console.log("doctor options",doctorOptions)
        setDoctors(doctorOptions);
      })
      .catch(error => console.error('Error fetching doctors:', error));

    // Fetch categories and procedures
    config.getData('/procedures/categories')
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(error => console.error('Error fetching categories:', error));

    config.getData('/procedures/list')
      .then(response => {
        setProcedures(response.data.procedures);
      })
      .catch(error => console.error('Error fetching procedures:', error));
  }, []);

  // Update form options when data is fetched
  useEffect(() => {
    if (invoiceForm.sections) {
      // Update patient options
      const patientField = invoiceForm.sections[0].fields.find(f => f.key === 'patient_id');
      if (patientField) {
        patientField.options = patients;
      }

      // Update doctor options
      const doctorField = invoiceForm.sections[0].fields.find(f => f.key === 'doctor_id');
      if (doctorField) {
        doctorField.options = doctors;
      }
    }
  }, [patients, doctors]);

  const handleViewDetail = (invoice) => {
    // Map the invoice data to match the expected format for the modal
    const mappedInvoice = {
      ...invoice,
      invoiceNumber: invoice.invoice_number,
      patientName: invoice.patient?.full_name,
      services: mapInvoiceItemsToServices(invoice.items),
      totalAmount: Number(invoice.total_amount) || 0,
      cashPaid: Number(invoice.paid) || 0,
      receivable: Number(invoice.balance) || 0,
      date: invoice.invoice_date,
    };
    setSelectedInvoice(mappedInvoice);
    setIsDetailOpen(true);
  };


  function getData(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/invoices/list`)
      .then(data => {
        const today = new Date();
        const _data = data.data.data.map(item => {
          item.active = item.active === 1 ? 'Yes' : 'No';
          let expiryDate = new Date(item.expiry_date);
          const timeDiff = expiryDate.getTime() - today.getTime();
          const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          item.is_expired = dayDiff < 0 ? 'Expired' : dayDiff <= 7 ? `Expired in ${dayDiff} days` : 'No';
          return item;
        });
        setDataList(_data);
        console.log("Data List:", _data);
        setCategoriesList(data.data.categories);
        setTotalItems(data.data.meta.total);
        setCurrentPage(data.data.meta.page);
        setItemsPerPage(data.data.meta.perpage);
        setLoading(false);

      })
      .catch(error => {
        console.log(error);
      });
  }

  useEffect(() => {
    getData(5, 1);
  }, []);

  // const customActions = [
  //   {
  //     label: "Print",
  //     icon: "lucide:printer",
  //     onClick: (item) => {
  //       navigate(`/invoices/${item.id}`, { state: { item } });
  //       console.log("Print action clicked");
  //     },
  //   },
  // ];

  return (
    <>
      <CrudTemplate
        title="Invoices"
        icon="lucide:receipt"
        columns={columns}
        data={dataList}
        initialFormData={initialFormData}
        form={invoiceForm}
        formFields={formFields}
        filterColumns={filterColumns}
        addButtonLabel="Add Invoice"
        // customActions={customActions}
        onRowClick={handleViewDetail}
        onSave={(data, isEditing) => {
          const transformedData = transformFormData(data);
          if (isEditing) {
            config.postData(`/invoices/edit?id=${data.id}`, transformedData)
              .then(response => {
                if (response.data.success) {
                  setDataList(dataList.map(invoice =>
                    invoice.id === data.id ? { ...invoice, ...response.data.invoice } : invoice
                  ));
                  if (typeof toast !== 'undefined') toast.success(response.data.message || 'Invoice updated successfully!');
                } else {
                  if (typeof toast !== 'undefined') toast.error(response.data.message || 'Failed to update invoice');
                }
              })
              .catch(error => {
                console.error('Error updating invoice:', error);
                if (typeof toast !== 'undefined') toast.error('Failed to update invoice');
              });
          } else {
            config.postData('/invoices/create', transformedData)
              .then(response => {
                if (response.data.success) {
                  setDataList([...dataList, response.data.invoice]);
                  if (typeof toast !== 'undefined') toast.success(response.data.message || 'Invoice created successfully!');
                } else {
                  if (typeof toast !== 'undefined') toast.error(response.data.message || 'Failed to create invoice');
                }
              })
              .catch(error => {
                console.error('Error creating invoice:', error);
                if (typeof toast !== 'undefined') toast.error('Failed to create invoice');
              });
          }
        }}
        onDelete={(item) => {
          config.postData('/invoices/delete', { id: item.id })
            .then(response => {
              if (response.data.success) {
                setDataList(dataList.filter(invoice => invoice.id !== item.id));
                if (typeof toast !== 'undefined') toast.success('Invoice deleted successfully!');
              } else {
                if (typeof toast !== 'undefined') toast.error(response.data.message || 'Failed to delete invoice');
              }
            })
            .catch(error => {
              console.error('Error deleting invoice:', error);
              if (typeof toast !== 'undefined') toast.error('Failed to delete invoice');
            });
        }}
      />
      {selectedInvoice && (
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedInvoice}
          title={`Invoice Details - ${selectedInvoice.invoiceNumber}`}
          onEdit={() => {
            setSelectedInvoice({ ...selectedInvoice, date: selectedInvoice.invoice_date });
          }}
          entityType="invoice"
        />
      )}
    </>
  );
}