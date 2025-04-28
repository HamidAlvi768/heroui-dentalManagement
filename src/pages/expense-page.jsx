import React, { useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';

// Table columns
const columns = [
  { key: 'accountName', label: 'ACCOUNT NAME' },
  { key: 'receiverName', label: 'RECEIVER NAME' },
  { key: 'paidBy', label: 'PAID BY' },
  { key: 'amount', label: 'AMOUNT' },
  { key: 'paymentDate', label: 'PAYMENT DATE' },
  { key: 'actions', label: 'ACTIONS' },
];

// Filter columns
const filterColumns = [
  { key: 'accountName', label: 'ACCOUNT NAME', type: 'select', options: [
    { value: 'office', label: 'Office' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'supplies', label: 'Supplies' },
  ] },
  { key: 'receiverName', label: 'RECEIVER NAME' },
  { key: 'paymentDate', label: 'PAYMENT DATE', type: 'date' },
];

// Add Expense form fields
const formFields = [
  { key: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
  { key: 'receiverName', label: 'Receiver Name', type: 'text', required: true },
  { key: 'accountName', label: 'Account Name', type: 'select', required: true, options: [
    { value: 'office', label: 'Office' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'supplies', label: 'Supplies' },
  ] },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  { key: 'paidBy', label: 'Paid By', type: 'text', required: true },
  { key: 'materialName', label: 'Material Name', type: 'text' },
  { key: 'paymentMethod', label: 'Payment Method', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const initialFormData = {
  paymentDate: '',
  receiverName: '',
  accountName: '',
  amount: '',
  paidBy: '',
  materialName: '',
  paymentMethod: '',
  description: '',
};

const mockData = [
  {
    id: '1',
    accountName: 'Office',
    receiverName: 'John Doe',
    paidBy: 'Jane Smith',
    amount: 500,
    paymentDate: '2024-06-01',
  },
  {
    id: '2',
    accountName: 'Utilities',
    receiverName: 'Electric Company',
    paidBy: 'Admin',
    amount: 1200,
    paymentDate: '2024-06-02',
  },
];

export default function ExpensePage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleViewDetail = (expense) => {
    const mappedExpense = {
      ...expense,
      paymentDate: expense.date,
      receiverName: expense.receiver,
      accountName: expense.account,
      amount: expense.amount
    };
    setSelectedExpense(mappedExpense);
    setIsDetailOpen(true);
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
        title="Expenses"
        icon="lucide:banknote"
        columns={columns}
        data={mockData}
        initialFormData={initialFormData}
        formFields={formFields}
        filterColumns={filterColumns}
        addButtonLabel="Add Expense"
        customRowActions={customActions}
        onRowClick={handleViewDetail}
      />
      {selectedExpense && (
        <EntityDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          entity={selectedExpense}
          title={`Expense Details - ${selectedExpense.receiverName}`}
          onEdit={() => console.log('Edit expense:', selectedExpense)}
          entityType="expense"
        />
      )}
    </>
  );
}