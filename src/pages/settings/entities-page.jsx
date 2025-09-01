import React, { useEffect, useState } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';
import { toast } from 'react-toastify';

const columns = [
  {
    key: 'entity_name', label: 'ENTITY NAME',
    render: (item) => (
      <div>
        <div className="font-medium">{item.entity_name}</div>
      </div>
    )
  },
  { key: 'entity_type', label: 'TYPE' },
  // { key: 'items', label: 'ITEMS' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  entity_name: '',
  active: '',
  description: '',
};

// Form fields will be defined inside the component to access the slug generation function

// Entity form will be defined inside the component

// Filter columns
const filterColumns = [
  { key: 'entity_name', label: 'Entity Name', type: 'text', required: true, className: 'col-span-2' },
  { key: 'active', label: 'Active', type: 'select', options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }], required: true, className: 'col-span-1' },
];

function EntitiesPage() {

  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState(initialFormData);



  // Define form fields inside component
  const formFields = [
    { 
      key: 'entity_name', 
      label: 'Entity Name', 
      type: 'text', 
      required: true, 
      className: 'col-span-2',
      placeholder: 'Enter entity name (e.g., Patient, Doctor, Medicine)'
    },
    { 
      key: 'active', 
      label: 'Active', 
      type: 'select', 
      options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }], 
      required: true, 
      className: 'col-span-1' 
    },
    { 
      key: 'description', 
      label: 'Description', 
      type: 'textarea', 
      required: false, 
      className: 'col-span-full',
      placeholder: 'Optional description for this entity type'
    },
  ];

  // Define entity form inside component
  const entityForm = {
    sections: [
      {
        title: 'Entity Information',
        fields: formFields,
        className: 'grid grid-cols-3 gap-6 auto-rows-auto'
      }
    ]
  };

  function getDataList(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/genericentities/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _datalist = data.data.data.map(item => {
          item.active = item.active === 1 ? 'Active' : 'Inactive';
          return item;
        });
        console.log(_datalist)
        setDataList(_datalist);
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
    getDataList(5, 1);
  }, []);

  // Reset form data when component mounts or when needed
  useEffect(() => {
    setFormData(initialFormData);
  }, []);

  return (
    <CrudTemplate
      title="Entities Types"
      description="Manage entities records"
      icon="lucide:blocks"
      loading={loading}
      columns={columns}
      data={dataList}
      formFields={formFields}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      formData={formData}
      form={entityForm}
      filterColumns={filterColumns}
      onInputChange={(inputFormData) => {
        setFormData(inputFormData);
      }}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        getDataList(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        getDataList(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        getDataList(perpage, page);
      }}
      onSave={async (data, isEditing) => {
        try {
          if (isEditing) {
            // Update existing item
            const response = await config.postData(`/genericentities/edit?id=${data.id}`, data);
            console.log('Item updated:', response.data);
            // Reload data to show updated information
            getDataList(itemsPerPage, currentPage);
            // Show toast message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Item updated successfully!');
            }
            return true; // Signal successful save
          } else {
            // Create new item
            const response = await config.postData('/genericentities/create', data);
            console.log('Item created:', response.data.item);
            // Reload data to show new item
            getDataList(itemsPerPage, 1);
            // Show toast message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Item created successfully!');
            }
            return true; // Signal successful save
          }
        } catch (error) {
          console.error('Error saving item:', error);
          // Show error message from API response if available
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Failed to save item');
          }
          return false;
        }
      }}
      onDelete={(item) => {
        config.postData(`/genericentities/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Item deleted:', response.data.success);
            if (response.data.success === true) {
              // Reload data to show updated list
              getDataList(itemsPerPage, currentPage);
              // Show success message from API response
              if (response.data.message) {
                toast.success(response.data.message);
              } else {
                toast.success('Item deleted successfully!');
              }
            }
            else {
              // Show error message from API response
              if (response.data.message) {
                toast.error(response.data.message);
              } else {
                toast.error('Failed to delete item');
              }
            }
          })
          .catch(error => {
            console.error('Error deleting item:', error);
            // Show error message from API response if available
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(error.response.data.message);
            } else {
              toast.error('Failed to delete item');
            }
          });
      }}
    />
  );
}

export default EntitiesPage;