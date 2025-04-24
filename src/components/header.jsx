import React from 'react';
import { Icon } from '@iconify/react';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';

export function Header() {
  return (
    <header className="bg-primary h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <Icon icon="lucide:activity" className="text-white mr-2" width={24} />
        <span className="text-white text-xl font-semibold">OREO</span>
      </div>
      <div className="flex items-center gap-6">
        <Icon icon="lucide:list-todo" className="text-white" width={20} />
        <Icon icon="lucide:calendar" className="text-white" width={20} />
        <div className="relative">
          <Icon icon="lucide:bell" className="text-white" width={20} />
          <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
        </div>
        <div className="border-l border-white/20 pl-6 ml-2">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right">
                  <div className="text-white font-medium">Dr. Charlotte</div>
                  <div className="text-white/70 text-sm">Neurologist</div>
                </div>
                <Avatar 
                  src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1" 
                  className="w-10 h-10"
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile actions">
              <DropdownItem>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" width={16} />
                  <span>Profile</span>
                </div>
              </DropdownItem>
              <DropdownItem>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:settings" width={16} />
                  <span>Settings</span>
                </div>
              </DropdownItem>
              <DropdownItem className="text-danger" color="danger">
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