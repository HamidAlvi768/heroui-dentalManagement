import React from 'react';
import { Icon } from '@iconify/react';
import { Avatar } from '@heroui/react';

export function Sidebar({ onNavigate, activePage = 'dashboard' }) {
  const menuItems = [
    { icon: 'lucide:layout-dashboard', label: 'Dashboard', key: 'dashboard' },
    { icon: 'lucide:calendar', label: 'Appointment', key: 'appointments' },
    { icon: 'lucide:stethoscope', label: 'Doctors', key: 'doctors' },
    { icon: 'lucide:users', label: 'Patients', key: 'patients' }
  ];

  return (
    <div className="w-64 border-r border-divider bg-content1 flex flex-col h-full">
      <div className="p-4 flex items-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider">
          <Icon icon="lucide:home" className="text-default-500" />
          <span className="font-medium">Oreo</span>
        </div>
        <div className="ml-4 text-default-500">Doctor</div>
      </div>

      <div className="border-t border-b border-divider py-6 px-4 flex flex-col items-center">
        <Avatar 
          src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1" 
          className="w-24 h-24 mb-4"
        />
        <h3 className="text-lg font-semibold">Dr. Charlotte</h3>
        <p className="text-default-500 text-sm">Neurologist</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="py-2">
          <div className="px-4 py-2 text-xs text-default-500 font-semibold">-- MAIN</div>
          <ul>
            {menuItems.map((item) => (
              <li key={item.key}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.key);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-default-100 ${
                    activePage === item.key ? 'text-primary border-l-4 border-primary' : 'text-default-700'
                  }`}
                >
                  <Icon icon={item.icon} width={20} />
                  <span>{item.label}</span>
                  {['doctors', 'patients', 'payments', 'departments', 'authentication'].includes(item.key) && (
                    <Icon icon="lucide:chevron-right" className="ml-auto" width={16} />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}