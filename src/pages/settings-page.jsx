import React from 'react';
import { Icon } from '@iconify/react';
import { Card, CardBody } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';

export default function SettingsPage() {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: 'Application Settings',
      description: 'Configure your website name, contact details, and branding',
      icon: 'lucide:settings',
      path: '/settings/application'
    },
    {
      title: 'Configuration Settings',
      description: 'Configure system preferences and general configurations',
      icon: 'lucide:sliders',
      path: '/settings/configuration'
    },
    {
      title: 'Add New Entity',
      description: 'Create and configure new system entities',
      icon: 'lucide:plus-circle',
      path: '/settings/new-entity'
    },
    {
      title: 'Users',
      description: 'Create and configure new system entities',
      icon: 'lucide:plus-circle',
      path: '/settings/users'
    },
    {
      title: 'Categories',
      description: 'Create and configure new system entities',
      icon: 'lucide:plus-circle',
      path: '/settings/users'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your system settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section) => (
            <Card 
              key={section.title}
              className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardBody className="p-6" onClick={() => navigate(section.path)}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon icon={section.icon} className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}