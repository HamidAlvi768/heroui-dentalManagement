import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import { Avatar } from '@heroui/react';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { showToast } from '../utils/toast';

const columns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
  { key: 'role', label: 'ROLE' },
  { key: 'verified', label: 'VERIFIED' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  username: '',
  email: '',
  password: '',
  role: '',
};

const formFields = [
  { key: 'username', label: 'username', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'text', required: true },
  { key: 'role', label: 'Role', type: 'select', options: ['Admin', 'Moderator', 'Doctor', 'User'], required: true },
];

// Filter columns
const filterColumns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
  {
    key: 'role', label: 'ROLE', type: 'select', options: [
      { value: 'Admin', label: 'Admin' },
      { value: 'Moderator', label: 'Moderator' },
      { value: 'Doctor', label: 'Doctor' },
      { value: 'User', label: 'User' }
    ]
  },
  {
    key: 'verified', label: 'VERIFIED', type: 'select', options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
];

function UsersPage() {

  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  function getUsers(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/users/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _users = data.data.data.map(user => {
          user.verified = user.verified === 1 ? 'Yes' : 'No';
          return user;
        });
        setUsers(_users);
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
    getUsers(5, 1);
  }, []);

  return (
    <CrudTemplate
      title="Users"
      description="Manage users records"
      icon="lucide:users"
      loading={loading}
      columns={columns}
      data={users}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      formFields={formFields}
      filterColumns={filterColumns}
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
          config.postData(`/users/edit?id=${data.id}`, data)
            .then(response => {
              console.log('User updated:', response.data);
              setUsers(users.map(user => user.id === data.id ? data : user));
              toast.success('User updated successfully!');
            })
            .catch(error => {
              console.error('Error updating user:', error);
            });
        } else {
          // Create new user
          config.postData('/users/create', data)
            .then(response => {
              if (response.data.success == true) {
                setUsers([...users, response.data.user]);
                toast.success(response.data.message);
              } else {
                toast.error(response.data.message);
              }
            })
            .catch(error => {
              console.error('Error creating user:', error);
            });
        }
      }}
      onDelete={(item) => {
        config.postData(`/users/delete?id=${item.id}`, item)
          .then(response => {
            console.log('User deleted:', response.data);
            setUsers(users.filter(user => user.id !== item.id));
            toast.success('User deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting user:', error);
          });
        console.log('Delete patient:', item);
      }}
    />
  );
}

export default UsersPage;