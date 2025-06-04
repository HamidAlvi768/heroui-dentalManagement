import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { CrudDialog } from '../components/crud-dialog';
import { useDisclosure } from '@heroui/react';

const columns = [
  { key: 'category_name', label: 'Category' },
  { key: 'code', label: 'CODE' },
  { key: 'name', label: 'NAME' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'cost_price', label: 'COST PRICE' },
  { key: 'selling_price', label: 'SELLING PRICE' },
  { key: 'quantity', label: 'QUANTITY' },
  { key: 'expiry_date', label: 'EXPIRY DATE' },
  { key: 'is_expired', label: 'Expired' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  category_id: '',
  name: '',
  description: '',
  code: '',
  cost_price: '',
  selling_price: '',
  expiry_date: '',
  quantity: '',
  active: '',
};


function InventoryPage() {

  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
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

  const formFields = [
    { key: 'category_id', label: 'Category', type: 'select', options: [{ value: '', label: 'Select Category' }, ...categoriesList.map(category => ({ value: category.id, label: category.name }))], required: true },
    { key: 'name', label: 'name', type: 'text', required: true },
    { key: 'code', label: 'Code', type: 'text', required: true },
    { key: 'cost_price', label: 'Cost Price', type: 'number', required: true },
    { key: 'selling_price', label: 'Selling Price', type: 'number', required: true },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true },
    { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    {
      key: 'active',
      label: 'Active',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' }
      ]
    },
  ];

  const inventoryForm = {
    sections: [
      {
        title: 'Inventory Item',
        fields: formFields
      }
    ]
  };

  // Filter columns
  const filterColumns = [
    { key: 'category_id', label: 'Category', type: 'select', options: [{ value: '', label: 'Select Category' }, ...categoriesList.map(category => ({ value: category.id, label: category.name }))], required: true },
    { key: 'name', label: 'NAME' },
    { key: 'code', label: 'CODE' },
    { key: 'quantity', label: 'QUANTITY' },
    {
      key: 'active',
      label: 'ACTIVE',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' }
      ]
    },
  ];

  function getData(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/inventory/list?perpage=${perpage}&page=${page}&category_id=${filters.category_id || ''}&name=${filters.name || ''}&code=${filters.code || ''}&quantity=${filters.quantity || ''}&active=${filters.active || ''}`)
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
    console.log('useEffect');
    getData(5, 1);
  }, []);

  return <>
    <CrudTemplate
      title="Inventory"
      description="Manage inventory"
      icon="lucide:boxes"
      loading={loading}
      columns={columns}
      data={dataList}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={inventoryForm}
      filterColumns={filterColumns}
      customRowActions={customActions}
      onRowClick={handleViewDetail}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        getData(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        getData(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        getData(perpage, page);
      }}
      onSave={(data, isEditing) => {
        console.log('Save patient:', data, 'isEditing:', isEditing);
        if (isEditing) {
          // Update existing Category
          config.postData(`/inventory/edit?id=${data.id}`, data)
            .then(response => {
              console.log('Inventory updated:', response.data);
              setDataList(dataList.map(item => item.id === data.id ? data : item));
              toast.success('Inventory updated successfully!');
            })
            .catch(error => {
              console.error('Error updating Category:', error);
            });
        } else {
          // Create new Category
          config.postData('/inventory/create', data)
            .then(response => {
              console.log('Inventory created:', response.data.category);
              setDataList([...dataList, response.data.category]);
              toast.success('Inventory created successfully!');
            })
            .catch(error => {
              console.error('Error creating Category:', error);
            });
        }
      }}
      onDelete={(item) => {
        config.postData(`/inventory/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Inventory deleted:', response.data);
            setDataList(dataList.filter(filterItem => filterItem.id !== item.id));
            toast.success('Inventory deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting Category:', error);
          });
        console.log('Delete Item:', item);
      }}
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
          form={inventoryForm}
          onSave={handleSave}
        />
      </>
    )}
  </>
}

export default InventoryPage;