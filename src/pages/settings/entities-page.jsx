import React, { use, useEffect, useState } from 'react';
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
  { key: 'items', label: 'ITEMS' },
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

const entityForm = {
  sections: [
    {
      fields: formFields
    }
  ]
};

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
          item.active = item.active === 1 ? 'Yes' : 'No';
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

  return (
    <CrudTemplate
      title="Entities Types"
      description="Manage entities records"
      backButton
      loading={loading}
      columns={columns}
      data={dataList}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={formData}
      form={entityForm}
      filterColumns={filterColumns}
      onInputChange={(inputFormData) => {
        const entity_name = inputFormData.entity_name.toLowerCase().replace(/ /g, '_');
        inputFormData.entity_type = entity_name;
        setFormData(inputFormData);
        console.log('Form data:', formData);
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
      onSave={(data, isEditing) => {
        if (isEditing) {
          // Update existing item
          config.postData(`/genericentities/edit?id=${data.id}`, data)
            .then(response => {
              console.log('Item updated:', response.data);
              setDataList(dataList.map(item => item.id === data.id ? data : item));
              toast.success('Item updated successfully!');
            })
            .catch(error => {
              console.error('Error updating item:', error);
            });
        } else {
          // Create new item
          config.postData('/genericentities/create', data)
            .then(response => {
              console.log('Item created:', response.data.item);
              setDataList([...dataList, response.data.item]);
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
            console.log('Item deleted:', response.data.success);
            if (response.data.success === true) {
              setDataList(dataList.filter(item => item.id !== data.item.id));
              toast.success(response.data.message);
            }
            else {
              toast.error(response.data.message);
            }
          })
          .catch(error => {
            console.error('Error deleting item:', error);
          });
      }}
    />
  );
}

export default EntitiesPage;