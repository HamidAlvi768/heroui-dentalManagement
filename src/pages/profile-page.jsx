import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem } from '@heroui/react';
import { Header } from '@/components/header';
import { useAuth } from '@/auth/AuthContext';
import config from '@/config/config';
import { showToast } from '@/utils/toast';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    education: '',
    gender: '',
    dateOfBirth: '',
    commissionPercentage: '',
    id: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch profile data from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      config.initAPI(token);
      const response = await config.getData('/users/profile');
      
      if (response.data && response.data.success) {
        const profileData = response.data.data;
        
        // Map API response to form data based on actual API structure
        const mappedData = {
          name: profileData.username || 'Not specified',
          email: profileData.email || 'Not specified',
          role: 'User', // This might come from user context or different API
          phone: profileData.phone || 'Not specified',
          address: profileData.address || 'Not specified',
          specialization: profileData.specialization || 'Not specified',
          experience: profileData.experience || 'Not specified',
          education: profileData.qualification || 'Not specified',
          // Additional fields from API - normalize gender values
          gender: profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1).toLowerCase() : 'Not specified',
          dateOfBirth: profileData.date_of_birth || 'Not specified',
          commissionPercentage: profileData.commission_percentage || '0.00',
          // Store user ID for updates
          id: profileData.id || profileData.user_id || null
        };
        
        console.log('Profile data received:', profileData);
        console.log('Mapped gender value:', mappedData.gender);
        
        setFormData(mappedData);
        setOriginalData(mappedData);
      } else {
        showToast.error(response.data?.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast.error('Error fetching profile data');
      
      // Set default data if API fails
      const defaultData = {
        name: user?.name || 'Not specified',
        email: user?.email || 'Not specified',
        role: 'Not specified',
        phone: 'Not specified',
        address: 'Not specified',
        specialization: 'Not specified',
        experience: 'Not specified',
        education: 'Not specified',
        gender: 'Not specified',
        dateOfBirth: 'Not specified',
        commissionPercentage: '0.00',
        id: null
      };
      setFormData(defaultData);
      setOriginalData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  // Save profile data to API
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get the user ID from the original data (from API response)
      const userId = originalData?.id || originalData?.user_id;
      if (!userId) {
        showToast.error('Cannot update profile: User ID not found');
        return;
      }
      
      // Prepare data for API (map form fields back to API format)
      const apiData = {
        username: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.education,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        commission_percentage: formData.commissionPercentage
      };
      
      // Use the same edit API pattern as doctors page
      const response = await config.postData(`/users/edit?id=${userId}`, apiData);
      
      if (response.data && response.data.success) {
        showToast.success('Profile updated successfully!');
        setOriginalData({ ...formData });
        setIsEditing(false);
        // Refresh profile data to get updated information
        await fetchProfile();
      } else {
        showToast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing and restore original data
  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fetch profile data on component mount
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div className="">
              <h1 className="text-2xl font-semibold">Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
            <Button
              variant="outline"
              className="ml-auto btn bg-primary text-white"
              onClick={() => window.history.back()}
            >Back</Button>
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-default-500">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
          <Button
            variant="outline"
            className="ml-auto btn bg-primary text-white"
            onClick={() => window.history.back()}
          >Back</Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile Details Card - Full Width */}
          <Card className="w-full">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                                             <Button
                         variant="bordered"
                         color="default"
                         onClick={handleCancel}
                         disabled={saving}
                         className="border-gray-300 text-gray-600 hover:bg-gray-50"
                       >
                         <Icon icon="lucide:x" width={16} className="mr-2" />
                         Cancel
                       </Button>
                       <Button
                         color="primary"
                         variant="solid"
                         onClick={handleSave}
                         disabled={saving}
                         className="font-medium px-6"
                       >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icon icon="lucide:check" width={16} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                                         <Button
                       color="primary"
                       variant="solid"
                       onClick={() => setIsEditing(true)}
                       className="font-medium px-6"
                     >
                      <Icon icon="lucide:edit" width={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={!isEditing}
                  selectedKeys={formData.gender ? [formData.gender] : []}
                >
                  <SelectItem key="Not specified" value="Not specified">Not specified</SelectItem>
                  <SelectItem key="Male" value="Male">Male</SelectItem>
                  <SelectItem key="Female" value="Female">Female</SelectItem>
                  <SelectItem key="Other" value="Other">Other</SelectItem>
                </Select>
                
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth !== 'Not specified' ? formData.dateOfBirth : ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Specialization"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Experience"
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Education/Qualification"
                  value={formData.education}
                  onChange={(e) => handleChange('education', e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="Commission Percentage"
                  value={formData.commissionPercentage}
                  onChange={(e) => handleChange('commissionPercentage', e.target.value)}
                  disabled={true}
                  description="This field is managed by the system"
                />
                <div className="col-span-full">
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}