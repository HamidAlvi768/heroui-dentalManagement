import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';

const columns = [
  { key: 'entity_name', label: 'ENTITY NAME' },
  { key: 'entity_type', label: 'TYPE' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  entity_name: '',
  entity_type: '',
  active: '',
};

const formFields = [
  { key: 'entity_name', label: 'Entity Name', type: 'text', required: true },
  { key: 'entity_type', label: 'Entity Type', type: 'text', required: true, readonly: true },
  { key: 'active', label: 'Active', type: 'select', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }], required: true },
];

// Filter columns
const filterColumns = [
  { key: 'entity_name', label: 'Entity Name', type: 'text', required: true },
  { key: 'entity_type', label: 'Entity Type', type: 'text', required: true, readonly: 'readonly' },
  { key: 'active', label: 'Active', type: 'select', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }], required: true },
];

function EntitiesPage() {

  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState(initialFormData);

  function getDataList(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/genericentities/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _datalist = data.data.data.map(item => {
          item.verified = item.verified === 1 ? 'Yes' : 'No';
          return item;
        });
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

  return (
    <CrudTemplate
      title="Entities Types"
      description="Manage entities records"
      icon="lucide:blocks"
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
        const entity_name = inputFormData.entity_name.toLowerCase().replace(/ /g, '_');
        inputFormData.entity_type = entity_name;
        setFormData(inputFormData);
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
          config.postData(`/genericentities/edit?id=${data.id}`, data)
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
          config.postData('/genericentities/create', data)
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
        config.postData(`/genericentities/delete?id=${item.id}`, item)
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

export default EntitiesPage;