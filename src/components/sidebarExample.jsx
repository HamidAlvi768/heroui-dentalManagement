import React from 'react';
import { Icon } from '@iconify/react';
import { Avatar } from '@heroui/react';

export function Sidebar({ onNavigate, activePage = 'dashboard' }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { icon: 'lucide:layout-dashboard', label: 'Dashboard', key: 'dashboard' },
    { icon: 'lucide:calendar', label: 'Appointment', key: 'appointments' },
    { icon: 'lucide:stethoscope', label: 'Doctors', key: 'doctors' },
    { icon: 'lucide:users', label: 'Patients', key: 'patients' }
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-divider bg-content1 flex flex-col h-full transition-all duration-300`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <span className="font-medium">J Dent Lite</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-default-100"
        >
          <Icon 
            icon={isCollapsed ? "lucide:chevron-right" : "lucide:chevron-left"} 
            className="text-default-500" 
            width={20} 
          />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="py-2">
          {!isCollapsed && (
            <div className="px-4 py-2 text-xs text-default-500 font-semibold">-- MAIN</div>
          )}
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
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon icon={item.icon} width={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}