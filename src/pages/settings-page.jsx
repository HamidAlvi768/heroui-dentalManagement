import React, { use, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardBody } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { get } from 'react-hook-form';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import {
  Button,
} from '@heroui/react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [dataLis, setDataList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { token } = useAuth();

  function getDataList(perpage = 5, page = 1, filters = {}) {
    setLoading(true);
    config.initAPI(token);
    config.getData(`/genericentities/list?perpage=${perpage}&page=${page}&username=${filters.username || ''}&email=${filters.email || ''}&role=${filters.role || ''}&verified=${filters.verified || ''}`)
      .then(data => {
        const _datalist = data.data.data.map(item => {
          item.verified = item.verified === 1 ? 'Yes' : 'No';
          return item;
        });
        setDataList(_datalist);
        setLoading(false);

      })
      .catch(error => {
        console.log(error);
      });
  }

  useEffect(() => {
    getDataList(100, 1);

  }, []);


  const settingsSections = [
    // entities
    ...dataLis.map((entity) => ({
      title: entity.entity_name,
      description: `Manage ${entity.entity_name} settings`,
      icon: 'lucide:box', // Better icon for generic entities
      path: `/settings/generic-records/${entity.entity_type}`,
    })),
    {
      title: 'Users',
      description: 'Create and configure new system entities',
      icon: 'lucide:users',
      path: '/users'
    },
    {
      title: 'Application Settings',
      description: 'Configure your website name, contact details, and branding',
      icon: 'lucide:settings-2', // More detailed settings icon
      path: '/settings/application'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <div className="w-full flex justify-between mb-6" >
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground">Manage your system settings</p>
          </div>
          <div className="">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:plus" width={16} />}
              onPress={() => navigate('/settings/entities')}
            >
              Add New Entity
            </Button>
          </div>
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