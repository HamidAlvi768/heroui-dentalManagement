import React, { use, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardBody } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { get } from 'react-hook-form';
import config from '../config/config';
import { useAuth } from '../auth/AuthContext';
import {Button} from '@heroui/react';

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


  const entitiesSettingsSections = [
    // entities
    ...dataLis.map((entity) => ({
      items: entity.items ?? 0,
      title: entity.entity_name,
      description: `Manage ${entity.entity_name} settings`,
      icon: 'lucide:box', // Better icon for generic entities
      path: `/settings/generic-records/${entity.entity_type}`,
    })),
  ];

  const settingsSections = [
    {
      title: 'Categories',
      description: 'Create new inventory categories.',
      icon: 'lucide:boxes',
      path: '/settings/categories'
    },
    {
      title: 'Users',
      description: 'Create new users.',
      icon: 'lucide:users',
      path: '/settings/users'
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
              startContent={<Icon icon="lucide:list" width={16} />}
              onPress={() => navigate('/settings/entities')}
            >
              Entities List
            </Button>
               <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:list" width={16} />}
              onPress={() => navigate('/test')}
            >
              TESTING
            </Button>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <p className="text-muted-foreground mb-2">Entities Settings</p>
          </div>
        </div>

        {/* <Row> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entitiesSettingsSections.map((en) => (
            <Card
              key={en.title}
              className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardBody className="p-6" onClick={() => navigate(en.path)}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon icon={en.icon} className="text-primary w-6 h-6" />
                  </div>
                  <div className='w-full'>
                    <div className='flex justify-between'><h3 className="font-semibold mb-2">{en.title}</h3>
                      <small className='text-xs text-muted-foreground'>{en.items}</small>
                    </div>
                    <p className="text-sm text-muted-foreground">{en.description}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <br />
        <div className="row">
          <div className="col-md-12">
            <p className="text-muted-foreground mb-2">Static Settings</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        {/* </Row> */}
      </div>
    </div>
  );
}