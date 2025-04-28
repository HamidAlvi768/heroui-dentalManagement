import React, { useState, useRef, useEffect } from 'react';
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const navRef = useRef(null);
  
  // Store the scroll position in session storage to persist between route changes
  const navScrollPositionKey = 'nav-scroll-position';

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    
    // Restore the previous scroll position when component mounts
    // without animation by temporarily removing smooth scrolling
    const originalScrollBehavior = nav.style.scrollBehavior;
    nav.style.scrollBehavior = 'auto';
    
    const savedScrollPosition = sessionStorage.getItem(navScrollPositionKey);
    if (savedScrollPosition) {
      nav.scrollLeft = parseInt(savedScrollPosition, 10);
    }
    
    // Restore the original scroll behavior
    setTimeout(() => {
      nav.style.scrollBehavior = originalScrollBehavior;
    }, 0);
    
    const updateArrows = () => {
      setShowLeftArrow(nav.scrollLeft > 0);
      setShowRightArrow(nav.scrollLeft + nav.offsetWidth < nav.scrollWidth - 1);
    };
    
    // Save the current scroll position whenever it changes
    const handleScroll = () => {
      sessionStorage.setItem(navScrollPositionKey, nav.scrollLeft.toString());
      updateArrows();
    };
    
    updateArrows();
    nav.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateArrows);
    
    return () => {
      nav.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleNavigation = (e, path) => {
    e.preventDefault();
    // Save the current scroll position explicitly before navigation
    if (navRef.current) {
      sessionStorage.setItem(navScrollPositionKey, navRef.current.scrollLeft.toString());
    }
    navigate(path);
  }

  // Function to scroll with animation (for arrow buttons only)
  const scrollWithAnimation = (amount) => {
    const nav = navRef.current;
    if (!nav) return;
    
    // Temporarily enable smooth scrolling
    nav.style.scrollBehavior = 'smooth';
    nav.scrollBy({ left: amount });
    
    // Reset scroll behavior after animation
    setTimeout(() => {
      nav.style.scrollBehavior = 'auto';
    }, 300); // slightly longer than the animation duration
  };

  return (
    <header className="bg-primary h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <Icon icon="lucide:activity" className="text-white mr-2" width={24} />
        <span className="text-white text-xl font-semibold">{config.appName}</span>
        {/* Scrollable Nav Tabs */}
        <div className="relative w-[70vw] max-w-5xl">
          {showLeftArrow && (
            <button
              className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-primary via-primary/80 to-transparent"
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => scrollWithAnimation(-200)}
            >
              <Icon icon="lucide:chevron-left" className="text-white" width={24} />
            </button>
          )}
          <nav
            id="nav-slider"
            ref={navRef}
            className="flex gap-2 ml-8 overflow-x-auto scrollbar-hide px-8"
            style={{ scrollBehavior: 'auto' }} 
          >
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Doctors', path: '/doctors' },
              { label: 'Patients', path: '/patients' },
              { label: 'Appointments', path: '/appointments' },
              { label: 'Prescriptions', path: '/prescriptions' },
              { label: 'Inventory', path: '/inventory' },
              { label: 'Reports', path: '/reports' },
              { label: 'Invoices', path: '/invoices' },
              { label: 'Expenses', path: '/expenses' },
              { label: 'Users', path: '/users' },
              { label: 'Settings', path: '/settings' },
            ].map((item) => (
              <a
                key={item.path}
                href="#"
                onClick={(e) => handleNavigation(e, item.path)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${location.pathname === item.path ? 'bg-white text-primary' : 'bg-primary/80 text-white/90 hover:bg-white/10'}`}
                style={{ 
                  minWidth: 'max-content', 
                  padding: '8px 16px',
                  textAlign: 'center' 
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {showRightArrow && (
            <button
              className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-primary via-primary/80 to-transparent"
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => scrollWithAnimation(200)}
            >
              <Icon icon="lucide:chevron-right" className="text-white" width={24} />
            </button>
          )}
        </div>
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