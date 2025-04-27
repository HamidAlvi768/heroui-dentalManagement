import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import { useLocation } from 'react-router-dom';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="flex items-center gap-8">
        <Icon icon="lucide:activity" className="text-white mr-2" width={24} />
        <span className="text-white text-xl font-semibold">{config.appName}</span>
        {/* Nav items from sidebar */}
        <nav className="flex gap-2 ml-8">
          {[
            { icon: 'lucide:layout-dashboard', label: 'Dashboard', path: '/dashboard' },
            { icon: 'lucide:stethoscope', label: 'Doctors', path: '/doctors' },
            { icon: 'lucide:users', label: 'Patients', path: '/patients' },
            { icon: 'lucide:calendar', label: 'Appointments', path: '/appointments' },
            { icon: 'lucide:pill', label: 'Prescriptions', path: '/prescriptions' },
            { icon: 'lucide:package', label: 'Inventory', path: '/inventory' },
            { icon: 'lucide:file-text', label: 'Reports', path: '/reports' },
            { icon: 'lucide:receipt', label: 'Invoices', path: '/invoices' },
            { icon: 'lucide:users', label: 'Users', path: '/users' },
            { icon: 'lucide:settings', label: 'Settings', path: '/settings' },
          ].map((item) => (
            <a
              key={item.path}
              href="#"
              onClick={e => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-white/90 hover:bg-white/10 transition-colors ${location.pathname === item.path ? 'bg-white/20 text-white font-semibold' : ''}`}
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
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