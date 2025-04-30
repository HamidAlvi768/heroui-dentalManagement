import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { useNavigate } from 'react-router-dom';

const columns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
  // { key: 'role', label: 'ROLE' },
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
  { key: 'username', label: 'Username', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'text', required: true },
  // { key: 'role', label: 'Role', type: 'select', options: ['Admin', 'Moderator', 'Doctor', 'User'], required: true },
];

// Filter columns
const filterColumns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
  // {
  //   key: 'role', label: 'ROLE', type: 'select', options: [
  //     { value: 'Admin', label: 'Admin' },
  //     { value: 'Moderator', label: 'Moderator' },
  //     { value: 'Doctor', label: 'Doctor' },
  //     { value: 'User', label: 'User' }
  //   ]
  // },
  {
    key: 'verified', label: 'VERIFIED', type: 'select', options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
];

function DoctorsPage() {

  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  const handleViewDetail = (doctor) => {
    setSelectedDoctor({
      ...doctor,
      appointments: [
        {
          id: 'APT250465',
          patient: 'test Patient',
          status: 'Checked In',
          problem: '',
          startTime: '10:00:00',
          endTime: '11:15:00',
          date: '26-Apr-2025',
        },
      ]
    });
    setIsDetailOpen(true);
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item)
    }
  ];


  function getUsers(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/users/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || 'doctor'}&verified=${filters.verified || ''}`)
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

  return (<>
    <CrudTemplate
      title="Doctors"
      description="Manage doctors records"
      icon="lucide:users"
      loading={loading}
      columns={columns}
      data={users}
      totalItems={totalItems}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      formFields={formFields}
      filterColumns={filterColumns} customRowActions={customActions}
      onRowClick={handleViewDetail}
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
              toast.success('Doctor updated successfully!');
            })
            .catch(error => {
              console.error('Error updating user:', error);
            });
        } else {
          // Create new user
          config.postData('/users/create', data)
            .then(response => {
              console.log('User created:', response.data.user);
              setUsers([...users, response.data.user]);
              toast.success('User created successfully!');
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
            toast.success('Doctor deleted successfully!');
          })
          .catch(error => {
            console.error('Error deleting user:', error);
          });
        console.log('Delete patient:', item);
      }} />
    {selectedDoctor && (
      <EntityDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        entity={selectedDoctor}
        entityType="doctor"
        onEdit={() => console.log('Edit doctor:', selectedDoctor)}
      />
    )}
  </>)
}

export default DoctorsPage;