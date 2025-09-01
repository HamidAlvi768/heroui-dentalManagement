import React, { useEffect, useState } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';
import { LucideActivity } from 'lucide-react';
import { useDisclosure } from "@heroui/react";
import { EntityDetailDialog } from '../../components/entity-detail-dialog';
import { CrudDialog } from '../../components/crud-dialog';
import { toast } from 'react-toastify';

const columns = [
  { key: 'name', label: 'NAME',
    render: (item) => (
      <div>
        <div className="font-medium">{item.name}</div>
      </div>
    )
   },
  { key: 'description', label: 'DESCRIPTION' },
  // { key: 'inventory_count', label: 'INVENTORY ITEMS' },
  { key: 'active', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  name: '',
  description: '',
  inventory_count:'',
  active: '',
};

const formFields = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { 
    key: 'active', 
    label: 'Status', 
    type: 'select', 
    required: true,
    options: [
      { value: '1', label: 'Active' },
      { value: '0', label: 'In Active' }
    ]
  },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
];

const categoryForm = {
  sections: [
    {
      fields: formFields
    }
  ]
};

// Filter columns
const filterColumns = [
  { key: 'name', label: 'NAME' },
    {
    key: 'active',
    label: 'STATUS',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'In Active' }
    ]
  },
];

function CategoriesPage() {

  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const handleViewDetail = (category) => {
  setSelectedCategory({
    ...category,
  });
  setIsDetailOpen(true);
  };
  const handleEdit = (category) => {
  setSelectedCategory(category); // pass doctor to edit form
  setIsDetailOpen(false);    // close detail dialog if it was open
  onEditOpen();              // open edit form modal
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

  function getData(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/categories/list?perpage=${perpage}&page=${page}&name=${filters.name || ''}&description=${filters.description || ''}&active=${filters.active || ''}`)
      .then(data => {
        const _data = data.data.data.map(item => {
          item.active = item.active === 1 ? 'Active' : 'In Active';
          return item;
        });
        setDataList(_data);
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

  return (<>
    <CrudTemplate
      title="Categories"
      description="Manage inventory categories"
      icon="lucide:boxes"
      loading={loading}
      columns={columns}
      data={dataList}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={categoryForm}
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
      onSave={async (data, isEditing) => {
        console.log('Save category:', data, 'isEditing:', isEditing);
        try {
          if (isEditing) {
            // Update existing category
            const response = await config.postData(`/categories/edit?id=${data.id}`, data);
            console.log('Category updated:', response.data);
            // Reload data to show updated information
            getData(itemsPerPage, currentPage);
            // Show toast message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Category updated successfully!');
            }
            return true; // Signal successful save
          } else {
            // Create new category
            const response = await config.postData('/categories/create', data);
            console.log('Category created:', response.data.category);
            // Reload data to show new item
            getData(itemsPerPage, 1);
            // Show toast message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Category created successfully!');
            }
            return true; // Signal successful save
          }
        } catch (error) {
          console.error('Error saving category:', error);
          // Show error message from API response if available
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error('Failed to save category');
          }
          return false;
        }
      }}
      onDelete={(item) => {
        config.postData(`/categories/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Category deleted:', response.data);
            // Reload data to show updated list
            getData(itemsPerPage, currentPage);
            // Show success message from API response
            if (response.data.message) {
              toast.success(response.data.message);
            } else {
              toast.success('Category deleted successfully!');
            }
          })
          .catch(error => {
            console.error('Error deleting Category:', error);
            // Show error message from API response if available
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(error.response.data.message);
            } else {
              toast.error('Failed to delete category');
            }
          });
        console.log('Delete category:', item);
      }}
      onClick={()=>{
        
      }}
    />
      {selectedCategory && (
        <>
          <EntityDetailDialog
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            entity={selectedCategory}
            entityType="category"
          />
          <CrudDialog
              isOpen={isEditOpen}
              onOpenChange={onEditOpenChange}
              title="Edit Item"
              formData={selectedCategory}
              form={categoryForm}
              onSave={handleSave}
            />
          </>
        )}
  </>);
}

export default CategoriesPage;