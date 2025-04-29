import React, { useState, useEffect } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { showToast } from '../../utils/toast';

const columns = [
  { key: 'key', label: 'SETTING' },
  { key: 'value', label: 'VALUE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  key: '',
  value: '',
  description: ''
};

const formFields = [
  {
    key: 'key',
    label: 'Setting Key',
    type: 'select',
    required: true,
    options: [
      { value: 'date_format', label: 'Date Format' },
      { value: 'time_format', label: 'Time Format' },
      { value: 'timezone', label: 'Timezone' },
      { value: 'currency', label: 'Currency' },
      { value: 'language', label: 'Language' },
      { value: 'items_per_page', label: 'Items Per Page' },
      { value: 'session_timeout', label: 'Session Timeout' },
      { value: 'enable_notifications', label: 'Enable Notifications' }
    ]
  },
  {
    key: 'value',
    label: 'Value',
    type: 'text',
    required: true
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true
  }
];

const filterColumns = [
  { key: 'key', label: 'SETTING' }
];

function ConfigurationSettings() {
  const { token } = useAuth();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const defaultSettings = [
    {
      id: 1,
      key: 'date_format',
      value: 'DD-MM-YYYY',
      description: 'Default date format for the system'
    },
    {
      id: 2,
      key: 'time_format',
      value: '12h',
      description: 'Time format (12/24 hour)'
    },
    {
      id: 3,
      key: 'timezone',
      value: 'UTC+05:00',
      description: 'System timezone'
    },
    {
      id: 4,
      key: 'currency',
      value: 'PKR',
      description: 'Default currency for the system'
    },
    {
      id: 5,
      key: 'language',
      value: 'en',
      description: 'Default system language'
    }
  ];

  function getData(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    // Simulating API call with default settings
    setTimeout(() => {
      const filteredData = defaultSettings.filter(item => {
        if (filters.key && !item.key.toLowerCase().includes(filters.key.toLowerCase())) {
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
    // config.getData(`/settings/list?perpage=${perpage}&page=${page}&key=${filters.key || ''}`)
    //   .then(data => {
    //     setDataList(data.data.data);
    //     setTotalItems(data.data.meta.total);
    //     setCurrentPage(data.data.meta.page);
    //     setItemsPerPage(data.data.meta.perpage);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.log(error);
    //     setLoading(false);
    //   });
  }

  useEffect(() => {
    getData(5, 1);
  }, []);

  return (
    <CrudTemplate
      title="Configuration Settings"
      description="Manage system configuration settings"
      icon="lucide:settings"
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
          // Update existing setting
          const updatedList = dataList.map(item => 
            item.id === data.id ? { ...item, ...data } : item
          );
          setDataList(updatedList);
          showToast.success('Setting updated successfully!');

          // When API is ready:
          // config.postData(`/settings/edit?id=${data.id}`, data)
          //   .then(response => {
          //     setDataList(dataList.map(item => item.id === data.id ? data : item));
          //     showToast.success('Setting updated successfully!');
          //   })
          //   .catch(error => {
          //     console.error('Error updating setting:', error);
          //   });
        } else {
          // Create new setting
          const newSetting = {
            ...data,
            id: dataList.length + 1
          };
          setDataList([...dataList, newSetting]);
          showToast.success('Setting created successfully!');

          // When API is ready:
          // config.postData('/settings/create', data)
          //   .then(response => {
          //     setDataList([...dataList, response.data.setting]);
          //     showToast.success('Setting created successfully!');
          //   })
          //   .catch(error => {
          //     console.error('Error creating setting:', error);
          //   });
        }
      }}
      onDelete={(item) => {
        setDataList(dataList.filter(setting => setting.id !== item.id));
        showToast.success('Setting deleted successfully!');

        // When API is ready:
        // config.postData(`/settings/delete?id=${item.id}`, item)
        //   .then(response => {
        //     setDataList(dataList.filter(setting => setting.id !== item.id));
        //     showToast.success('Setting deleted successfully!');
        //   })
        //   .catch(error => {
        //     console.error('Error deleting setting:', error);
        //   });
      }}
    />
  );
}

export default ConfigurationSettings;