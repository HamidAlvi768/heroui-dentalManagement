import React from 'react';
import { Icon } from '@iconify/react';
import { config } from '../utills/config';

export function Header() {
  return (
    <header className="bg-primary h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <Icon icon="lucide:activity" className="text-white mr-2" width={24} />
        <span className="text-white text-xl font-semibold">{config.appname}</span>
      </div>
      <div className="flex items-center gap-6">
        <Icon icon="lucide:list-todo" className="text-white" width={20} />
        <Icon icon="lucide:calendar" className="text-white" width={20} />
        <div className="relative">
          <Icon icon="lucide:bell" className="text-white" width={20} />
          <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="bg-white/20 rounded-full p-2">
            <Icon icon="lucide:search" className="text-white" width={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-white/10 text-white placeholder-white/70 rounded-full py-1 px-4 outline-none w-40"
          />
        </div>
      </div>
    </header>
  );
} 