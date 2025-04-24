import React from 'react';
import { CrudTemplate } from '../components/crud-template';

// Sample data for inventory
const inventoryData = [
  {
    id: '1',
    itemName: 'Disposable Surgical Masks',
    category: 'Personal Protective Equipment',
    quantity: 2500,
    unit: 'pieces',
    threshold: 500,
    supplier: 'MedSupply Inc.',
    lastRestocked: '2025-04-15',
    expiryDate: '2026-04-15',
    status: 'In Stock',
    location: 'Storage Room A, Shelf 2'
  },
  {
    id: '2',
    itemName: 'Amoxicillin 500mg',
    category: 'Medication',
    quantity: 350,
    unit: 'bottles',
    threshold: 50,
    supplier: 'PharmaCorp',
    lastRestocked: '2025-04-10',
    expiryDate: '2025-10-10',
    status: 'In Stock',
    location: 'Pharmacy Storage, Cabinet 3'
  },
  {
    id: '3',
    itemName: 'Infusion Pumps',
    category: 'Equipment',
    quantity: 12,
    unit: 'units',
    threshold: 3,
    supplier: 'MedTech Solutions',
    lastRestocked: '2025-03-20',
    expiryDate: 'N/A',
    status: 'Low Stock',
    location: 'Equipment Room, Section B'
  },
  {
    id: '4',
    itemName: 'Surgical Gloves (Size M)',
    category: 'Personal Protective Equipment',
    quantity: 75,
    unit: 'boxes',
    threshold: 100,
    supplier: 'SafeGuard Medical',
    lastRestocked: '2025-04-05',
    expiryDate: '2026-04-05',
    status: 'Low Stock',
    location: 'Storage Room B, Shelf 1'
  }
];

// Table columns configuration
const columns = [
  {
    key: 'itemName',
    label: 'ITEM NAME',
    render: (item) => (
      <div>
        <div className="font-medium">{item.itemName}</div>
        <div className="text-default-500 text-xs">{item.category}</div>
      </div>
    )
  },
  {
    key: 'quantity',
    label: 'QUANTITY',
    render: (item) => (
      <div>
        <div className="font-medium">{item.quantity} {item.unit}</div>
        <div className="text-default-500 text-xs">Threshold: {item.threshold}</div>
      </div>
    )
  },
  { key: 'supplier', label: 'SUPPLIER' },
  { key: 'expiryDate', label: 'EXPIRY DATE' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' }
];

// Form fields for add/edit dialog
const formFields = [
  { key: 'itemName', label: 'Item Name', type: 'text', required: true },
  { key: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'Medication', label: 'Medication' },
    { value: 'Personal Protective Equipment', label: 'Personal Protective Equipment' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Supplies', label: 'Supplies' },
    { value: 'Laboratory', label: 'Laboratory' }
  ]},
  { key: 'quantity', label: 'Quantity', type: 'number', required: true },
  { key: 'unit', label: 'Unit', type: 'text', required: true },
  { key: 'threshold', label: 'Low Stock Threshold', type: 'number', required: true },
  { key: 'supplier', label: 'Supplier', type: 'text', required: true },
  { key: 'lastRestocked', label: 'Last Restocked Date', type: 'date' },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
  { key: 'location', label: 'Storage Location', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'Out of Stock', label: 'Out of Stock' },
    { value: 'Discontinued', label: 'Discontinued' }
  ]}
];

// Initial form data for new inventory items
const initialFormData = {
  itemName: '',
  category: '',
  quantity: 0,
  unit: '',
  threshold: 0,
  supplier: '',
  lastRestocked: '',
  expiryDate: '',
  status: 'In Stock',
  location: ''
};

function InventoryPage() {
  return (
    <CrudTemplate
      title="Inventory"
      description="Manage hospital inventory and supplies"
      icon="lucide:package"
      columns={columns}
      data={inventoryData}
      initialFormData={initialFormData}
      formFields={formFields}
      addButtonLabel="Add Item"
    />
  );
}

export default InventoryPage;