import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from '@heroui/react';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StandaloneCalendar } from './standalone-calendar'; // Import the new component
import config from '../config/config';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { isOpen: isCalendarOpen, onOpen: onCalendarOpen, onOpenChange: onCalendarOpenChange } = useDisclosure();
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
      {/* Rest of your header code... */}
      
      <div className="flex items-center gap-6">
        {/* Other buttons... */}
        
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
        
        {/* Rest of your header code... */}
      </div>
    </header>
  );
}