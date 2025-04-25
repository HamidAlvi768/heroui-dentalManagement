import React from 'react';
import { CrudTemplate } from '../components/crud-template';

const columns = [
  {
    key: 'item',
    label: 'ITEM',
    render: (item) => (
      <div className="font-medium">{item.item}</div>
    )
  },
  { key: 'category', label: 'CATEGORY' },
  { key: 'subCategory', label: 'SUBCATEGORY' },
  { 
    key: 'quantity', 
    label: 'QUANTITY',
    render: (item) => (
      <div className="font-medium">{item.quantity}</div>
    )
  },
  { 
    key: 'unitPrice', 
    label: 'UNIT PRICE',
    render: (item) => (
      <div className="font-medium">
        PKR {item.unitPrice.toFixed(2)}
      </div>
    )
  },
  { key: 'actions', label: 'ACTIONS' }
];

const categories = [
  { value: 'medicines', label: 'Medicines' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'supplies', label: 'Supplies' }
];

const subCategories = {
  medicines: [
    { value: 'tablets', label: 'Tablets' },
    { value: 'syrups', label: 'Syrups' },
    { value: 'injections', label: 'Injections' }
  ],
  equipment: [
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'surgical', label: 'Surgical' },
    { value: 'laboratory', label: 'Laboratory' }
  ],
  supplies: [
    { value: 'disposable', label: 'Disposable' },
    { value: 'reusable', label: 'Reusable' },
    { value: 'stationary', label: 'Stationary' }
  ]
};

const initialFormData = {
  category: '',
  subCategory: '',
  item: '',
  quantity: 0,
  unitPrice: 0
};

const formFields = [
  { 
    key: 'category', 
    label: 'Category', 
    type: 'select', 
    required: true,
    options: categories
  },
  { 
    key: 'subCategory', 
    label: 'Sub Category', 
    type: 'select', 
    required: true,
    options: [] // Will be populated based on selected category
  },
  { 
    key: 'item', 
    label: 'Item', 
    type: 'text', 
    required: true 
  },
  { 
    key: 'quantity', 
    label: 'Quantity', 
    type: 'number',
    required: true,
    min: 0
  },
  { 
    key: 'unitPrice', 
    label: 'Unit Price', 
    type: 'number',
    required: true,
    min: 0,
    step: 0.01
  }
];

const mockData = [
  {
    id: '1',
    item: 'Paracetamol 500mg',
    category: 'Medicines',
    subCategory: 'Tablets',
    quantity: 1000,
    unitPrice: 0.15
  },
  {
    id: '2',
    item: 'Digital Thermometer',
    category: 'Equipment',
    subCategory: 'Diagnostic',
    quantity: 50,
    unitPrice: 12.99
  }
];

function InventoryPage() {
  return (
    <CrudTemplate
      title="Inventory"
      description="Manage hospital inventory and supplies"
      icon="lucide:package"
      columns={columns}
      data={mockData}
      initialFormData={initialFormData}
      formFields={formFields}
      addButtonLabel="Add Item"
    />
  );
}

export default InventoryPage;