import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, Card, CardBody, Button, Input, Textarea } from '@heroui/react';
import { Header } from '@/components/header';
import { useAuth } from '@/auth/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Charlotte',
    email: user?.email || 'charlotte@hospital.com',
    role: 'Neurologist',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Center St, New York, NY 10001',
    bio: 'Experienced neurologist with over 10 years of practice in diagnosing and treating neurological disorders.',
    specialization: 'Neurology',
    experience: '10 years',
    education: 'MD - Neurology, Harvard Medical School',
    avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save the data to your backend
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
          <div className="flex items-center gap-2 bg-card rounded-full px-4 py-1">
            <Icon icon="lucide:home" className="text-primary" width={16} />
            <span className="text-foreground">Al Shifa</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">Profile</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1">
            <CardBody className="text-center p-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Avatar
                  src={formData.avatar}
                  className="w-32 h-32"
                />
                {isEditing && (
                  <Button
                    isIconOnly
                    className="absolute bottom-0 right-0 rounded-full"
                    size="sm"
                  >
                    <Icon icon="lucide:camera" width={16} />
                  </Button>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-1">{formData.name}</h2>
              <p className="text-muted-foreground">{formData.role}</p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Years</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Profile Details Card */}
          <Card className="lg:col-span-2">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Personal Information</h3>
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
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  label="Education"
                  value={formData.education}
                  onChange={(e) => handleChange('education', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="col-span-full">
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-span-full">
                  <Textarea
                    label="Bio"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
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