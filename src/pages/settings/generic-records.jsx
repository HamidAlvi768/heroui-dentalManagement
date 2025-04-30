import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';

const columns = [
  { key: 'entity_type', label: 'TYPE' },
  { key: 'label', label: 'LABEL' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  entity_type: '',
  entity_name: '',
  active: '',
};

// Filter columns
const filterColumns = [
  { key: 'entity_type', label: 'Entity Type', type: 'text', required: true, readonly: 'readonly' },
  { key: 'label', label: 'Label', type: 'text', required: true },
  { key: 'active', label: 'Active', type: 'select', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }], required: true },
];

function GenericRecordsPage() {

  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState(initialFormData);
  const [entities, setEntities] = useState([]);

  // get entityType variable form the url endpoint
  const entityType = window.location.pathname.split('/').pop(); // Get the last part of the URL
  const [entityTypeName, setEntityTypeName] = useState(entityType); // Set the entity type name from the URL

  initialFormData.entity_type = entityTypeName; // Set the initial form data entity type to the entity type name

  const formFields = [
    { key: 'entity_type', label: 'Entity Type', type: 'text', readonly: 'readonly', required: true, },
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'active', label: 'Active', type: 'select', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }], required: true },
  ];

  function getDataList(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/genericrecords/list?perpage=${perpage}&page=${page}&entity_type=${entityTypeName}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _datalist = data.data.data.map(item => {
          item.verified = item.verified === 1 ? 'Yes' : 'No';
          return item;
        });
        setDataList(_datalist);
        setEntities(data.data.entities);
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

  return (
    <CrudTemplate
      title="Generic Records"
      description="Manage generic records"
      icon="lucide:database" // Changed from "lucide:blocks" to "lucide:database"
      loading={loading}
      columns={columns}
      data={dataList}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={formData}
      formFields={formFields}
      filterColumns={filterColumns}
      onInputChange={(inputFormData) => {

        console.log('Form data:', formData);
      }}
      onFilterChange={(filters) => {
        console.log('Filters:', filters);
        getUsers(itemsPerPage, 1, filters);
      }}
      onPerPageChange={(perPage) => {
        getUsers(perPage, 1);
      }}
      onPaginate={(page, perpage) => {
        console.log('Page:', page, 'Perpage:', perpage);
        getUsers(perpage, page);
      }}
      onSave={(data, isEditing) => {
        console.log('Save patient:', data, 'isEditing:', isEditing);
        if (isEditing) {
          // Update existing user
          config.postData(`/genericrecords/edit?id=${data.id}`, data)
            .then(response => {
              console.log('Item updated:', response.data);
              setDataList(users.map(user => user.id === data.id ? data : user));
              toast.success('Item updated successfully!');
            })
            .catch(error => {
              console.error('Error updating user:', error);
            });
        } else {
          // Create new user
          config.postData('/genericrecords/create', data)
            .then(response => {
              console.log('Item created:', response.data.user);
              setDataList([...users, response.data.user]);
              toast.success('Item created successfully!');
            })
            .catch(error => {
              console.error('Error creating user:', error);
            });
        }
      }}
      onDelete={(item) => {
        config.postData(`/genericrecords/delete?id=${item.id}`, item)
          .then(response => {
            console.log('Item deleted:', response.data);
            setDataList(users.filter(user => user.id !== item.id));
            toast.success('Item deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting user:', error);
          });
        console.log('Delete patient:', item);
      }}
    />
  );
}

export default GenericRecordsPage;