import React, { useState , useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardBody, Button, Input, Avatar } from '@heroui/react';
import { useAuth } from '@/auth/AuthContext';
import { Header } from '@/components/header';

export default function ApplicationSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => {
   const saved = localStorage.getItem('formData');
  return saved
    ? JSON.parse(saved)
    : {
    websiteName: 'JDent Lite',
    registrationNumber: 'REG123456789',
    contactEmail: 'contact@dentaldoc.com',
    contactPhone: '+1 (555) 123-4567',
    whatsappNumber: '+1 (555) 987-6543',
    address: '123 Medical Center Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    logo: 'https://api.iconify.design/lucide:activity.svg?width=32&height=32',
    favicon: 'https://api.iconify.design/lucide:activity.svg?width=32&height=32'
  };
});

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  useEffect(() => {
  localStorage.setItem('formData', JSON.stringify(formData));
}, [formData]);

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleFileChange = (key) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(key, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Application Settings</h1>
            <p className="text-muted-foreground">Manage your website configuration</p>
          </div>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => window.history.back()}
          >
            <Icon icon="lucide:arrow-left" className="mr-2" width={16} />
            Back to Settings
          </Button>
        </div>

        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Website Configuration</h3>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Icon icon="lucide:check" width={16} className="mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:edit" width={16} className="mr-2" />
                    Edit Settings
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Input
                label="Website Name"
                value={formData.websiteName}
                onChange={(e) => handleChange('websiteName', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                disabled={!isEditing}
              />

              {/* Contact Information */}
              <Input
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="WhatsApp Number"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                disabled={!isEditing}
              />

              {/* Address Information */}
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled={!isEditing}
              />

              {/* Logo & Favicon */}
              <div className="col-span-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo</label>
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={formData.logo}
                        className="w-20 h-20"
                      />
                      {isEditing && (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange('logo')}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Button
                            as="label"
                            htmlFor="logo-upload"
                            variant="outline"
                          >
                            <Icon icon="lucide:upload" width={16} className="mr-2" />
                            Upload Logo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Favicon</label>
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={formData.favicon}
                        className="w-8 h-8"
                      />
                      {isEditing && (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange('favicon')}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <Button
                            as="label"
                            htmlFor="favicon-upload"
                            variant="outline"
                          >
                            <Icon icon="lucide:upload" width={16} className="mr-2" />
                            Upload Favicon
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}