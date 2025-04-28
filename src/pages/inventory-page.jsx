import React, { useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { CrudDialog } from '../components/crud-dialog';
import { useDisclosure } from '@heroui/react';

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

// Filter columns
const filterColumns = [
  { key: 'item', label: 'ITEM' },
  { key: 'category', label: 'CATEGORY', type: 'select', options: categories },
  { key: 'subCategory', label: 'SUBCATEGORY', type: 'select', options: Object.values(subCategories).flat() },
  { key: 'minQuantity', label: 'MIN QUANTITY', type: 'number' },
  { key: 'maxQuantity', label: 'MAX QUANTITY', type: 'number' },
];

function InventoryPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

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
          time: "2024-09-17 13:44:43"
        }
      ]
    };
    setSelectedItem(mappedItem);
    setIsDetailOpen(true);
  };

  const handleEdit = () => {
    // Convert the item data to match the form fields format
    setSelectedItem(prevItem => ({
      ...prevItem,
      category: prevItem.category,
      subCategory: prevItem.subCategory,
      item: prevItem.item,
      quantity: prevItem.quantity,
      unitPrice: prevItem.unitPrice
    }));
    setIsDetailOpen(false);
    onEditOpen();
  };

  const handleSave = (updatedData) => {
    // Here you would typically save to backend
    console.log('Saving item:', updatedData);
    onEditOpenChange(false);
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
        title="Inventory"
        icon="lucide:package"
        columns={columns}
        data={mockData}
        initialFormData={initialFormData}
        formFields={formFields}
        filterColumns={filterColumns}
        addButtonLabel="Add Item"
        customRowActions={customActions}
        onRowClick={handleViewDetail}
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
            formFields={formFields}
            onSave={handleSave}
          />
        </>
      )}
    </>
  );
}

export default InventoryPage;