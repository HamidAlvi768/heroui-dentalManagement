import React, { useState, useEffect } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';
import { useLocation } from 'react-router-dom';

const columns = [
  { key: 'name', label: 'NAME' },
  { key: 'type', label: 'TYPE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'fields', label: 'FIELDS' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  name: '',
  type: '',
  description: '',
  fields: '',
  status: 'active'
};

const formFields = [
  { key: 'name', label: 'Entity Name', type: 'text', required: true },
  { 
    key: 'type', 
    label: 'Entity Type', 
    type: 'select', 
    required: true,
    options: [
      { value: 'basic', label: 'Basic Entity' },
      { value: 'document', label: 'Document Entity' },
      { value: 'relational', label: 'Relational Entity' }
    ]
  },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'fields', label: 'Fields Configuration', type: 'textarea', required: true },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select', 
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'draft', label: 'Draft' }
    ]
  }
];

const filterColumns = [
  { key: 'name', label: 'NAME' },
  { 
    key: 'type', 
    label: 'TYPE',
    type: 'select',
    options: [
      { value: 'basic', label: 'Basic Entity' },
      { value: 'document', label: 'Document Entity' },
      { value: 'relational', label: 'Relational Entity' }
    ]
  },
  { 
    key: 'status', 
    label: 'STATUS',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'draft', label: 'Draft' }
    ]
  }
];

function NewEntityPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const defaultEntities = [
    {
      id: 1,
      name: 'Customer Profile',
      type: 'basic',
      description: 'Basic customer information entity',
      fields: 'name, email, phone, address',
      status: 'active'
    },
    {
      id: 2,
      name: 'Invoice Document',
      type: 'document',
      description: 'Invoice document entity with file attachments',
      fields: 'invoice_number, date, total, attachments',
      status: 'active'
    },
    {
      id: 3,
      name: 'Product Category',
      type: 'relational',
      description: 'Product category with parent-child relationship',
      fields: 'name, parent_id, level, path',
      status: 'active'
    }
  ];

  function getData(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    // Simulating API call with default entities
    setTimeout(() => {
      const filteredData = defaultEntities.filter(item => {
        if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return false;
        }
        if (filters.type && item.type !== filters.type) {
          return false;
        }
        if (filters.status && item.status !== filters.status) {
          return false;
        }
        return true;
      });

      setDataList(filteredData);
      setTotalItems(filteredData.length);
      setCurrentPage(page);
      setItemsPerPage(perpage);
      setLoading(false);
    }, 500);

    // When API is ready, use this:
    // config.initAPI(token);
    // config.getData(`/entities/list?perpage=${perpage}&page=${page}&name=${filters.name || ''}&type=${filters.type || ''}&status=${filters.status || ''}`)
    //   .then(response => {
    //     setDataList(response.data.data);
    //     setTotalItems(response.data.meta.total);
    //     setCurrentPage(response.data.meta.page);
    //     setItemsPerPage(response.data.meta.perpage);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error('Error fetching entities:', error);
    //     setLoading(false);
    //   });
  }

  useEffect(() => {
    console.log('New Entity page mounted, location:', location.pathname);
    getData(5, 1);
  }, []);

  return (
    <CrudTemplate
      title="Entity Management"
      description="Create and manage system entities"
      icon="lucide:database"
      loading={loading}
      columns={columns}
      data={dataList}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      formFields={formFields}
      filterColumns={filterColumns}
      onFilterChange={(filters) => {
        getData(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        getData(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        getData(perpage, page);
      }}
      onSave={(data, isEditing) => {
        if (isEditing) {
          // Update existing entity
          const updatedList = dataList.map(item => 
            item.id === data.id ? { ...item, ...data } : item
          );
          setDataList(updatedList);
          showToast.success('Entity updated successfully!');

          // When API is ready:
          // config.postData(`/entities/edit?id=${data.id}`, data)
          //   .then(response => {
          //     setDataList(dataList.map(item => item.id === data.id ? data : item));
          //     showToast.success('Entity updated successfully!');
          //   })
          //   .catch(error => {
          //     console.error('Error updating entity:', error);
          //   });
        } else {
          // Create new entity
          const newEntity = {
            ...data,
            id: dataList.length + 1
          };
          setDataList([...dataList, newEntity]);
          showToast.success('Entity created successfully!');

          // When API is ready:
          // config.postData('/entities/create', data)
          //   .then(response => {
          //     setDataList([...dataList, response.data.entity]);
          //     showToast.success('Entity created successfully!');
          //   })
          //   .catch(error => {
          //     console.error('Error creating entity:', error);
          //   });
        }
      }}
      onDelete={(item) => {
        setDataList(dataList.filter(entity => entity.id !== item.id));
        showToast.success('Entity deleted successfully!');

        // When API is ready:
        // config.postData(`/entities/delete?id=${item.id}`, item)
        //   .then(response => {
        //     setDataList(dataList.filter(entity => entity.id !== item.id));
        //     showToast.success('Entity deleted successfully!');
        //   })
        //   .catch(error => {
        //     console.error('Error deleting entity:', error);
        //   });
      }}
    />
  );
}

export default NewEntityPage;