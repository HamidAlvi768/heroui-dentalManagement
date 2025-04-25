import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import config from '../config/config';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const currentPath = location.pathname;

  // Add responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setIsOpen(false); // Close sidebar by default on mobile
      } else {
        setIsMobile(false);
        setIsOpen(true);
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // Mobile toggle button (always visible on mobile)
  const MobileToggleButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-divider shadow-md transition-all duration-300 hover:bg-accent"
    >
      <Icon icon="lucide:menu" className="text-muted-foreground" width={20} />
    </button>
  );

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && !isOpen && <MobileToggleButton />}
      
      {/* Overlay for mobile - with fade transition */}
      {isMobile && (
        <div 
          onClick={() => setIsOpen(false)}
          className={`
            fixed inset-0 bg-black/50 z-40
            transition-opacity duration-300 ease-in-out
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        />
      )}
      
      {/* Sidebar - with slide transition */}
      <div className={`
        ${isMobile ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64')}
        border-r border-divider
        bg-card
        text-card-foreground
        flex
        flex-col
        h-full
        transition-all
        duration-300
        ease-in-out
        ${isMobile ? 'fixed z-50' : 'relative'}
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
      `}>
        <div className="p-4 flex items-center">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider">
              <Icon icon="lucide:activity" className="text-primary" />
              <span className="font-medium">{config.appName}</span>
            </div>
          )}
          
          {/* Desktop collapse button */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg hover:bg-accent transition-colors duration-200 ${isCollapsed ? '' : 'ml-auto'}`}
            >
              <Icon
                icon={isCollapsed ? "lucide:chevron-right" : "lucide:chevron-left"}
                className="text-muted-foreground"
                width={20}
              />
            </button>
          )}
          
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-accent ml-auto transition-colors duration-200"
            >
              <Icon
                icon="lucide:x"
                className="text-muted-foreground"
                width={20}
              />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="py-2">
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
                        if (isMobile) setIsOpen(false); // Close sidebar after navigation on mobile
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3 
                        hover:bg-accent transition-colors duration-200
                        ${currentPath === item.path ? 'text-primary border-l-4 border-primary bg-accent/50' : 'text-foreground'}
                        ${(!isMobile && isCollapsed) ? 'justify-center' : ''}
                      `}
                      title={(!isMobile && isCollapsed) ? item.label : undefined}
                    >
                      <Icon icon={item.icon} width={20} />
                      {((!isCollapsed || isMobile)) && 
                        <span className="transition-opacity duration-200">{item.label}</span>
                      }
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}