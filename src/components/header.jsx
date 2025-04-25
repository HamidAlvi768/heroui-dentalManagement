import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StandaloneCalendar } from './standalone-calendar';
import config from '../config/config';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [tasks] = useState([
    { id: 1, title: 'Review patient reports', status: 'pending' },
    { id: 2, title: 'Update medical records', status: 'completed' },
    { id: 3, title: 'Schedule follow-ups', status: 'pending' }
  ]);
  const [notifications] = useState([
    { id: 1, message: 'New appointment request', time: '5m ago' },
    { id: 2, message: 'Patient records updated', time: '1h ago' }
  ]);

  const handleDateSelect = (date) => {
    console.log('Selected date:', date);
    navigate('/appointments', { state: { selectedDate: date } });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-primary h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <Icon icon="lucide:activity" className="text-white mr-2" width={24} />
        <span className="text-white text-xl font-semibold">{config.appName}</span>
      </div>
      <div className="flex items-center gap-6">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="hover:opacity-80 transition-opacity">
              <Icon icon="lucide:list-todo" className="text-white" width={20} />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Tasks" className="w-80">
            <DropdownItem isReadOnly className="gap-2">
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold">Tasks</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {tasks.filter(t => t.status === 'pending').length} pending
                </span>
              </div>
            </DropdownItem>
            {tasks.map(task => (
              <DropdownItem key={task.id} className="gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Icon 
                    icon={task.status === 'completed' ? 'lucide:check-circle' : 'lucide:circle'} 
                    className={task.status === 'completed' ? 'text-success' : 'text-primary'} 
                    width={16} 
                  />
                  <span className={task.status === 'completed' ? 'line-through text-default-400' : ''}>
                    {task.title}
                  </span>
                </div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="hover:opacity-80 transition-opacity">
              <Icon icon="lucide:calendar" className="text-white" width={20} />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Calendar" className="p-0 min-w-fit">
            <DropdownItem isReadOnly className="p-0">
              <StandaloneCalendar onSelect={handleDateSelect} />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="hover:opacity-80 transition-opacity relative">
              <Icon icon="lucide:bell" className="text-white" width={20} />
              <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Notifications" className="w-80">
            <DropdownItem isReadOnly>
              <span className="font-semibold">Notifications</span>
            </DropdownItem>
            {notifications.map(notification => (
              <DropdownItem key={notification.id} className="gap-2">
                <div className="flex flex-col w-full">
                  <span>{notification.message}</span>
                  <span className="text-xs text-default-400">{notification.time}</span>
                </div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <div className="border-l border-white/20 pl-6 ml-2">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right">
                  <div className="text-white font-medium">{user?.name || 'Dr. Charlotte'}</div>
                  <div className="text-white/70 text-sm">Neurologist</div>
                </div>
                <Avatar 
                  src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1" 
                  className="w-10 h-10"
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile actions">
              <DropdownItem onPress={() => navigate('/profile')}>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" width={16} />
                  <span>Profile</span>
                </div>
              </DropdownItem>
              <DropdownItem 
                className="text-danger" 
                color="danger"
                onPress={handleLogout}
              >
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:log-out" width={16} />
                  <span>Log Out</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}