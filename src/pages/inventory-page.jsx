import React, { useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { CrudDialog } from '../components/crud-dialog';
import { useDisclosure } from '@heroui/react';
import { toast } from 'react-toastify';

const columns = [
  { key: 'category_name', label: 'CATEGORY',
    render: (item) => (
      <div>
        <div className="font-medium">{item.category_name}</div>
      </div>
    )
   },
  { key: 'code', label: 'CODE' },
  { key: 'name', label: 'NAME' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'cost_price', label: 'COST PRICE' },
  { key: 'selling_price', label: 'SELLING PRICE' },
  { key: 'quantity', label: 'QUANTITY' },
  { key: 'expiry_date', label: 'EXPIRY DATE' },
  { key: 'is_expired', label: 'Expired' },
  { key: 'active', label: 'ACTIVE',
    render: (item) => (
      <div>
        <div className="font-medium">{item.active}</div>
      </div>
    )
  },
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
  const [filterLoading, setFilterLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const handleViewDetail = async (item) => {
    try {
      setLoading(true);
      // Call view API to get detailed inventory information
      const response = await config.getData(`/inventory/view?id=${item.id}`);
      console.log('Inventory view response:', response.data);
      
      if (response.data.success) {
        // Map the API response data to match our detail view fields
        // Note: API returns "dat" instead of "data" based on the response structure
        const inventoryData = response.data.dat || response.data.data;
        
        if (inventoryData) {
          const mappedItem = {
            ...inventoryData,
            // Map category information
            category_name: inventoryData.category?.name || 'N/A',
            category_description: inventoryData.category?.description || 'N/A',
            // Add consumption and addition history if available in future
            consumptionHistory: response.data.consumptionHistory || [],
            additionHistory: response.data.additionHistory || [],
            // Format dates for display
            formatted_created_at: inventoryData.created_at ? new Date(inventoryData.created_at).toLocaleDateString() : 'N/A',
            formatted_updated_at: inventoryData.updated_at ? new Date(inventoryData.updated_at).toLocaleDateString() : 'N/A',
            formatted_expiry_date: inventoryData.expiry_date ? new Date(inventoryData.expiry_date).toLocaleDateString() : 'N/A'
          };
          setSelectedItem(mappedItem);
          setIsDetailOpen(true);
        } else {
          toast.error('No inventory data received from API');
        }
      } else {
        toast.error(response.data.message || 'Failed to load inventory details');
      }
    } catch (error) {
      console.error('Error loading inventory details:', error);
      toast.error('Failed to load inventory details');
    } finally {
      setLoading(false);
    }
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
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'code', label: 'Code', type: 'text', required: true },
    { key: 'cost_price', label: 'Cost Price', type: 'number', required: true, min: 0, step: 0.01 },
    { key: 'selling_price', label: 'Selling Price', type: 'number', required: true, min: 0, step: 0.01 },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true, min: 1, step: 1 },
    { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true, min: new Date().toISOString().split("T")[0] },
    {
      key: 'active',
      label: 'Active',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' }
      ]
    },
    { key: 'description', label: 'Description', type: 'textarea', required: true },

  ];

  const inventoryForm = {
    sections: [
      {

        fields: formFields
      }
    ]
  };

  // Filter columns
  const filterColumns = [
    { key: 'category_id', label: 'CATEGORY', type: 'select', options: [{ value: '', label: 'Select Category' }, ...categoriesList.map(category => ({ value: category.id, label: category.name }))], required: true },
    { key: 'name', label: 'NAME' },
    { key: 'code', label: 'CODE' },
    { key: 'quantity', label: 'QUANTITY', type: 'number', min: 0, step: 1 },
    {
      key: 'active',
      label: 'ACTIVE',
      type: 'select',
      required: true,
      options: [
              { value: '1', label: 'Active' },
      { value: '0', label: 'Inactive' }
      ]
    },
    {
      key: 'quick_date_range',
      label: 'QUICK FILTERS',
      type: 'select',
      placeholder: 'Quick date filters',
      options: [
        { value: '', label: 'Custom Date Range' },
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'this_week', label: 'This Week' },
        { value: 'next_week', label: 'Next Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'this_year', label: 'This Year' }
      ]
    },
  ];

  // Function to handle quick date range filters
  const handleQuickDateRange = (quickRange, currentFilters) => {
    const today = new Date();
    const newFilters = { ...currentFilters };

    switch (quickRange) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        newFilters.date_from = todayStr;
        newFilters.date_to = todayStr;
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        newFilters.date_from = tomorrowStr;
        newFilters.date_to = tomorrowStr;
        break;
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        newFilters.date_from = startOfWeek.toISOString().split('T')[0];
        newFilters.date_to = endOfWeek.toISOString().split('T')[0];
        break;
      case 'next_week':
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        newFilters.date_from = nextWeekStart.toISOString().split('T')[0];
        newFilters.date_to = nextWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        newFilters.date_from = startOfMonth.toISOString().split('T')[0];
        newFilters.date_to = endOfMonth.toISOString().split('T')[0];
        break;
      case 'this_year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        newFilters.date_from = startOfYear.toISOString().split('T')[0];
        newFilters.date_to = endOfYear.toISOString().split('T')[0];
        break;
      default:
        // Custom date range - keep existing filters
        break;
    }

    // Clear quick range filter after applying
    newFilters.quick_date_range = '';

    return newFilters;
  };

  function getData(perpage = 5, page = 1, filters = {}, isFiltering = false) {
    if (isFiltering) {
      setFilterLoading(true);
    } else {
      setLoading(true);
    }

    config.initAPI(token);
    config.getData(`/inventory/list?perpage=${perpage}&page=${page}&category_id=${filters.category_id || ''}&name=${filters.name || ''}&code=${filters.code || ''}&quantity=${filters.quantity || ''}&active=${filters.active || ''}`)
      .then(data => {
        const today = new Date();
        const _data = data.data.data.map(item => {
          item.active = item.active === 1 ? 'Active' : 'Inactive';
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
        if (isFiltering) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }

      })
      .catch(error => {
        console.log(error);
        if (isFiltering) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
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
      loading={loading || filterLoading}
      columns={columns}
      data={dataList}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={inventoryForm}
      filterColumns={filterColumns}
      customRowActions={customActions}
      onRowClick={handleViewDetail}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        // Handle quick date range filters
        if (filters.quick_date_range && filters.quick_date_range !== '') {
          const processedFilters = handleQuickDateRange(filters.quick_date_range, filters);
          getData(itemsPerPage, 1, processedFilters, true);
        } else {
          getData(itemsPerPage, 1, filters, true);
        }
      }}
      onPerPageChange={(perPage) => {
        getData(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        getData(perpage, page);
      }}
      onSave={async (data, isEditing) => {
        console.log('Save inventory:', data, 'isEditing:', isEditing);
        try {
          if (isEditing) {
            // Update existing inventory item
            const response = await config.postData(`/inventory/edit?id=${data.id}`, data);
            console.log('Inventory updated:', response.data);
            // Reload data to show updated information
            getData(itemsPerPage, currentPage);
            // Show toast message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Inventory updated successfully!');
            }
            return true; // Signal successful save
          } else {
            // Create new inventory item
            const response = await config.postData('/inventory/create', data);
            console.log('Inventory created:', response.data.category);
            // Reload data to show new item
            getData(itemsPerPage, 1);
            // Show toast message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Inventory created successfully!');
            }
            return true; // Signal successful save
          }
        } catch (error) {
          console.error('Error saving inventory:', error);
          // Show error message from API response if available
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Failed to save inventory');
          }
          return false;
        }
      }}
      onDelete={(item) => {
        config.postData(`/inventory/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Inventory deleted:', response.data);
            // Reload data to show updated list
            getData(itemsPerPage, currentPage);
            // Show success message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Inventory deleted successfully!');
            }
          })
          .catch(error => {
            console.error('Error deleting inventory:', error);
            // Show error message from API response if available
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(error.response.data.message);
            } else {
              toast.error('Failed to delete inventory');
            }
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