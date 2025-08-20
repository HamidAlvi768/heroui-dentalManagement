import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';
import { LucideActivity } from 'lucide-react';
import { useDisclosure } from "@heroui/react";
import { EntityDetailDialog } from '../../components/entity-detail-dialog';
import { CrudDialog } from '../../components/crud-dialog';

const columns = [
  { key: 'name', label: 'NAME' },
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
      onSave={(data, isEditing) => {
        console.log('Save patient:', data, 'isEditing:', isEditing);
        if (isEditing) {
          // Update existing Category
          config.postData(`/categories/edit?id=${data.id}`, data)
            .then(response => {
              console.log('Category updated:', response.data);
              setDataList(dataList.map(item => item.id === data.id ? data : item));
              toast.success('Category updated successfully!');
            })
            .catch(error => {
              console.error('Error updating Category:', error);
            });
        } else {
          // Create new Category
          config.postData('/categories/create', data)
            .then(response => {
              console.log('Category created:', response.data.category);
              setDataList([ response.data.category, ...dataList]);
              toast.success('Category created successfully!');
            })
            .catch(error => {
              console.error('Error creating Category:', error);
            });
        }
      }}
      onDelete={(item) => {
        config.postData(`/categories/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Category deleted:', response.data);
            setDataList(dataList.filter(filterItem => filterItem.id !== item.id));
            toast.success('Category deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting Category:', error);
          });
        console.log('Delete patient:', item);
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
            onEdit={handleEdit}
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