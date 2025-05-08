import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../components/crud-template';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import { EntityDetailDialog } from '../components/entity-detail-dialog';
import { useNavigate } from 'react-router-dom';
import { form } from '@heroui/theme';

const columns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
  // { key: 'role', label: 'ROLE' },
  { key: 'verified', label: 'VERIFIED' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  role: 'doctor',
  username: '',
  email: '',
  password: '',
  gender: '',
  date_of_birth: '',
  blood_group: '',
  phone: '',
  address: '',
  specialization: '',
  qualification: '',
  experience: '',
  commission_percentage: '',
};

const formFields = [
  { key: 'role', label: 'Role', type: 'hidden', required: true },
  { key: 'username', label: 'Username', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'text', required: true },
  {
    key: 'gender', label: 'Gender', type: 'select', options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Unknown', label: 'Unknown' }
    ]
  },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { key: 'blood_group', label: 'Blood Group', type: 'select', options: [{ value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' }, { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' }, { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }, { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }] },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'specialization', label: 'Specialization', type: 'text' },
  { key: 'qualification', label: 'Qualification', type: 'text' },
  { key: 'experience', label: 'Experience', type: 'number' },
  {
    key: 'commission_percentage', label: 'Commission Percentage', type: 'select', options: [
      { value: '0', label: '0%' },
      { value: '10', label: '10%' },
      { value: '20', label: '20%' },
      { value: '30', label: '30%' },
      { value: '40', label: '40%' },
      { value: '50', label: '50%' },
      { value: '60', label: '60%' },
      { value: '70', label: '70%' },
      { value: '80', label: '80%' },
      { value: '90', label: '90%' },
      { value: '100', label: '100%' }
    ]
  },
];

// Filter columns
const filterColumns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
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
        console.log("FORM DATA", data)
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
              console.log('User created:', response.data.success);
              if (response.data.success == true) {
                setUsers([...users, response.data.user]);
                toast.success(response.data.message);
              } else {
                toast.error(response.data.message);
              }
            })
            .catch(error => {
              console.error('Error creating user:', error);
              toast.error('Error creating doctor.');
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