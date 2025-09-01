import React, { use, useEffect, useState } from 'react';
import { CrudTemplate } from '../../components/crud-template';
import { EntityDetailDialog } from '../../components/entity-detail-dialog';
import { Avatar } from '@heroui/react';
import config from '../../config/config';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-toastify';

const columns = [
  { key: 'username', label: 'USER NAME',
    render: (item) => (
      <div>
        <div className="font-medium">{item.username}</div>
      </div>
    )
   },
  { key: 'email', label: 'EMAIL' },
  { key: 'role', label: 'ROLE' },
  { key: 'active', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' }
];

const initialFormData = {
  username: '',
  email: '',
  password: '',
  role: '',
};

const formFields = [
  { key: 'username', label: 'User Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'password', label: 'Password', type: 'text', required: true },
  { key: 'role', label: 'Role', type: 'select', options: ['Admin', 'Moderator', 'Doctor', 'User'], required: true },
];

const userForm = {
  sections: [
    {
      fields: formFields
    }
  ]
};

// Filter columns
const filterColumns = [
  { key: 'username', label: 'USER NAME' },
  { key: 'email', label: 'EMAIL' },
  {
    key: 'role', label: 'ROLE', type: 'select', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'patient', label: 'Patient' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'user', label: 'User' }
    ]
  },
  {
    key: 'active', label: 'STATUS', type: 'select', options: [
      { value: 1, label: 'Active' },
      { value: 0, label: 'Inactive' }
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function getUsers(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/users/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _users = data.data.data.map(user => {
          user.verified = user.verified === 1 ? 'Active' : 'Inactive';
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

  const handleViewDetail = (user) => {
    // Set loading state for detail view
    setDetailLoading(true);
    
    // Call the user detail API
    config.initAPI(token);
    config.getData(`/users/view-full?id=${user.id}`)
      .then(response => {
        console.log("Full API Response:", response);
        
        if (response.data && response.data.success && response.data.data) {
          const userData = response.data.data.user;
          const profileData = response.data.data.profile || {};
          
          // Combine user and profile data for display
          const combinedUserData = {
            ...userData,
            ...profileData,
            // Map verified field to display format
            verified: userData.verified === 1 ? 'Active' : 'Inactive',
            // Handle empty profile fields - show "-" for missing data
            gender: profileData?.gender || '-',
            date_of_birth: profileData?.date_of_birth || '-',
            blood_group: profileData?.blood_group || '-',
            phone: profileData?.phone || '-',
            address: profileData?.address || '-',
            specialization: profileData?.specialization || '-',
            qualification: profileData?.qualification || '-',
            experience: profileData?.experience || '-',
            commission_percentage: profileData?.commission_percentage || '-'
          };
          
          console.log("Combined User Data:", combinedUserData);
          
          // Set the selected user and open the modal
          setSelectedUser(combinedUserData);
          setIsDetailOpen(true);
          toast.success('User details loaded successfully');
        } else {
          console.error('Failed to fetch user details:', response.data?.message);
          toast.error(response.data?.message || 'Failed to fetch user details');
        }
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        toast.error('Failed to fetch user details. Please try again.');
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const customActions = (item) => [
    {
      label: "View Details",
      icon: "lucide:eye",
      handler: () => handleViewDetail(item)
    }
  ];

  return (
    <>
      <CrudTemplate
      title="Users"
      description="Manage users records"
      icon="lucide:users"
      loading={loading}
      columns={columns}
      data={users}
      totalItems={totalItems}
      formFields={formFields}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      initialFormData={initialFormData}
      form={userForm}
      filterColumns={filterColumns}
      customRowActions={customActions}
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
      onSave={async (data, isEditing) => {
        console.log('Save user:', data, 'isEditing:', isEditing);
        try {
          if (isEditing) {
            // Update existing user
            const response = await config.postData(`/users/edit?id=${data.id}`, data);
            console.log('User updated:', response.data);
            toast.success('User updated successfully!');
            // Refresh the users list
            getUsers(itemsPerPage, currentPage);
            return true; // Signal successful save
          } else {
            // Create new user
            const response = await config.postData('/users/create', data);
            if (response.data.success == true) {
              toast.success(response.data.message);
              // Refresh the users list
              getUsers(itemsPerPage, currentPage);
              return true; // Signal successful save
            } else {
              toast.error(response.data.message);
              return false;
            }
          }
        } catch (error) {
          console.error('Error saving user:', error);
          toast.error('Failed to save user. Please try again.');
          return false;
        }
      }}
      onDelete={(item) => {
        setDeleteLoading(true);
        config.postData(`/users/delete?id=${item.id}`, item)
          .then(response => {
            console.log('User deleted:', response.data);
            toast.success('User deleted successfully!');
            // Refresh the users list
            getUsers(itemsPerPage, currentPage);
          })
          .catch(error => {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user. Please try again.');
          })
          .finally(() => {
            setDeleteLoading(false);
          });
        console.log('Delete patient:', item);
      }}
      operationLoading={deleteLoading}
    />
    
    {selectedUser && (
      <EntityDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        entity={selectedUser}
        title="User Details"
        entityType="user"
        loading={detailLoading}
              />
      )}
    </>
  );
}

export default UsersPage;