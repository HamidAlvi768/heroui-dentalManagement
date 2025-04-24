import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const currentPath = location.pathname;

  const menuItems = [
    { icon: 'lucide:layout-dashboard', label: 'Dashboard', path: '/' },
    { icon: 'lucide:stethoscope', label: 'Doctors', path: '/doctors' },
    { icon: 'lucide:users', label: 'Patients', path: '/patients' },
    { icon: 'lucide:calendar', label: 'Appointments', path: '/appointments' },
    { icon: 'lucide:pill', label: 'Prescriptions', path: '/prescriptions' },
    { icon: 'lucide:package', label: 'Inventory', path: '/inventory' },
    { icon: 'lucide:file-text', label: 'Reports', path: '/reports' },
    { type: 'divider' },
    { icon: 'lucide:settings', label: 'Settings', path: '/settings' }
    
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-divider bg-card text-card-foreground flex flex-col h-full transition-all duration-300`}>
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider">
            <Icon icon="lucide:activity" className="text-primary" />
            <span className="font-medium">Oreo</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-accent ${isCollapsed ? '' : 'ml-auto'}`}
        >
          <Icon 
            icon={isCollapsed ? "lucide:chevron-right" : "lucide:chevron-left"} 
            className="text-muted-foreground" 
            width={20} 
          />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="py-2">
          {!isCollapsed && (
            <div className="px-4 py-2 text-xs text-muted-foreground font-semibold">-- MAIN</div>
          )}
          <ul className="space-y-1">
            {menuItems.map((item) => 
              item.type === 'divider' ? (
                <li key="divider" className="my-2 border-t border-divider" />
              ) : (
                <li key={item.path}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-accent ${
                      currentPath === item.path ? 'text-primary border-l-4 border-primary bg-accent/50' : 'text-foreground'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon icon={item.icon} width={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}