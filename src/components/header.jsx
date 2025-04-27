import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, message: 'New appointment request', time: '5m ago' },
    { id: 2, message: 'Patient records updated', time: '1h ago' }
  ]);

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
                  <div className="text-white font-medium">{user?.username || 'User'}</div>
                  <div className="text-white/70 text-sm">({user?.role || 'User'})</div>
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