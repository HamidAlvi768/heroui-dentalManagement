import React, { useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';

// Table columns
const columns = [
  { key: 'patient', label: 'PATIENT' },
  { key: 'doctor', label: 'DOCTOR' },
  { key: 'date', label: 'DATE' },
  { key: 'total', label: 'TOTAL' },
  { key: 'discount', label: 'DISCOUNT' },
  { key: 'afterDiscount', label: 'AFTER DISCOUNT' },
  { key: 'paid', label: 'PAID' },
  { key: 'due', label: 'DUE' },
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
  date: '',
  category: '',
  procedure: '',
  description: '',
  quantity: 1,
  price: '',
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
      title: 'Invoice Info',
      fields: formFields
    }
  ]
};

export default function InvoicesPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleViewDetail = (invoice) => {
    // Map the invoice data to match the expected format
    const mappedInvoice = {
      ...invoice,
      invoiceNumber: invoice.id,
      patientName: invoice.patient,
      services: [
        {
          procedure: 'Service-1',
          description: 'Medical service',
          quantity: 1,
          price: invoice.total,
          subTotal: invoice.total
        }
      ],
      totalAmount: invoice.total,
      cashPaid: invoice.paid,
      receivable: invoice.due
    };
    setSelectedInvoice(mappedInvoice);
    setIsDetailOpen(true);
  };

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
        data={mockData}
        initialFormData={initialFormData}
        form={invoiceForm}
        filterColumns={filterColumns}
        addButtonLabel="Add Invoice"
        // customActions={customActions}
        onRowClick={handleViewDetail}
      />
      {selectedInvoice && (
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedInvoice}
          title={`Invoice Details - ${selectedInvoice.invoiceNumber}`}
          onEdit={() => console.log('Edit invoice:', selectedInvoice)}
          entityType="invoice"
        />
      )}
    </>
  );
}