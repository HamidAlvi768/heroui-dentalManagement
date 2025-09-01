import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { Icon } from "@iconify/react";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useAuthRedirect";
import config from "../config/config";
import { useLocation } from "react-router-dom";
import useFormData from "../hooks/useFormData";

export const Header = memo(() => {
  const dynamicFormData = useFormData();
  const { user } = useAuth();
  const { handleLogout } = useLogout("/login");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Memoize notifications to prevent recreation on every render
  const notifications = useMemo(() => [
    { id: 1, message: "New appointment request", time: "5m ago" },
    { id: 2, message: "Patient records updated", time: "1h ago" },
  ], []);
  
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const navRef = useRef(null);

  // Store the scroll position in session storage to persist between route changes
  const navScrollPositionKey = "nav-scroll-position";

  // Memoize navigation items to prevent recreation
  const navigationItems = useMemo(() => [
    { label: "Doctors", path: "/doctors" },
    { label: "Patients", path: "/patients" },
    { label: "Appointments", path: "/appointments" },
    { label: "Prescriptions", path: "/prescriptions" },
    { label: "Inventory", path: "/inventory" },
    { label: "Invoices", path: "/invoices" },
    { label: "Settings", path: "/settings" },
  ], []);

  // Memoize update arrows function
  const updateArrows = useCallback(() => {
    if (navRef.current) {
      setShowLeftArrow(navRef.current.scrollLeft > 0);
      setShowRightArrow(navRef.current.scrollLeft + navRef.current.offsetWidth < navRef.current.scrollWidth - 1);
    }
  }, []);

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    if (navRef.current) {
      sessionStorage.setItem(navScrollPositionKey, navRef.current.scrollLeft.toString());
      updateArrows();
    }
  }, [updateArrows]);

  // Memoize navigation handler
  const handleNavigation = useCallback((e, path) => {
    e.preventDefault();
    // Save the current scroll position explicitly before navigation
    if (navRef.current) {
      sessionStorage.setItem(
        navScrollPositionKey,
        navRef.current.scrollLeft.toString()
      );
    }
    navigate(path);
  }, [navigate]);

  // Memoize scroll with animation function
  const scrollWithAnimation = useCallback((amount) => {
    const nav = navRef.current;
    if (!nav) return;

    // Temporarily enable smooth scrolling
    nav.style.scrollBehavior = "smooth";
    nav.scrollBy({ left: amount });

    // Reset scroll behavior after animation
    setTimeout(() => {
      nav.style.scrollBehavior = "auto";
    }, 300); // slightly longer than the animation duration
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Restore the previous scroll position when component mounts
    // without animation by temporarily removing smooth scrolling
    const originalScrollBehavior = nav.style.scrollBehavior;
    nav.style.scrollBehavior = "auto";

    const savedScrollPosition = sessionStorage.getItem(navScrollPositionKey);
    if (savedScrollPosition) {
      nav.scrollLeft = parseInt(savedScrollPosition, 10);
    }

    // Restore the original scroll behavior
    setTimeout(() => {
      nav.style.scrollBehavior = originalScrollBehavior;
    }, 0);

    updateArrows();
    nav.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateArrows);

    return () => {
      nav.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [handleScroll, updateArrows]);

  // Listen for auth events (unauthorized/forbidden)
  useEffect(() => {
    const handleAuthEvent = (event) => {
      if (event.type === 'auth:unauthorized' || event.type === 'auth:forbidden') {
        // Redirect to login using React Router
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('auth:unauthorized', handleAuthEvent);
    window.addEventListener('auth:forbidden', handleAuthEvent);

    return () => {
      window.removeEventListener('auth:unauthorized', handleAuthEvent);
      window.removeEventListener('auth:forbidden', handleAuthEvent);
    };
  }, [navigate]);

  return (
    <header className="bg-primary h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/dashboard")}
        >
          <img 
            src={dynamicFormData.logo}
            alt="Logo"
            className="text-white mr-2" 
            width={20}
          />
          <span className="text-white text-xl font-semibold">
            {dynamicFormData.websiteName}
          </span>
        </div>

        {/* Scrollable Nav Tabs */}
        <div className="relative w-[70vw] max-w-5xl">
          {showLeftArrow && (
            <button
              className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-primary via-primary/80 to-transparent"
              style={{ display: "flex", alignItems: "center" }}
              onClick={() => scrollWithAnimation(-200)}
            >
              <Icon
                icon="lucide:chevron-left"
                className="text-white"
                width={24}
              />
            </button>
          )}
          <nav
            id="nav-slider"
            ref={navRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide"
            style={{ scrollBehavior: "auto" }}
          >
            {navigationItems.map((item) => (
              <a
                key={item.path}
                href="#"
                onClick={(e) => handleNavigation(e, item.path)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-white text-primary"
                    : "bg-primary/80 text-white/90 hover:bg-white/10"
                }`}
                style={{
                  minWidth: "max-content",
                  padding: "8px 16px",
                  textAlign: "center",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {showRightArrow && (
            <button
              className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-primary via-primary/80 to-transparent"
              style={{ display: "flex", alignItems: "center" }}
              onClick={() => scrollWithAnimation(200)}
            >
              <Icon
                icon="lucide:chevron-right"
                className="text-white"
                width={24}
              />
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
            {notifications.map((notification) => (
              <DropdownItem key={notification.id} className="gap-2">
                <div className="flex flex-col w-full">
                  <span>{notification.message}</span>
                  <span className="text-xs text-default-400">
                    {notification.time}
                  </span>
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
                  <div className="text-white font-medium">
                    {user?.username || "User"}
                  </div>
                  <div className="text-white/70 text-sm">
                    ({user?.role || "User"})
                  </div>
                </div>
                <Avatar
                  src={dynamicFormData.logo}
                  alt="Image"
                  className="w-10 h-10"
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile actions">
              <DropdownItem onPress={() => navigate("/profile")}>
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
});

Header.displayName = 'Header';
