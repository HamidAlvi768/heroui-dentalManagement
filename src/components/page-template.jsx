import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';

export function PageTemplate({
  title,
  description,
  icon,
  children,
  onAddNew,
  addButtonLabel = "Add New"
}) {
  return (
    <div className="min-h-screen bg-content2">
      <header className="bg-primary h-16 flex items-center justify-between px-6">
        <div className="flex items-center">
          <Icon icon="lucide:activity" className="text-white mr-2" width={24} />
          <span className="text-white text-xl font-semibold">OREO</span>
        </div>
        <div className="flex items-center gap-6">
          <Icon icon="lucide:move-horizontal" className="text-white" width={20} />
          <Icon icon="lucide:calendar" className="text-white" width={20} />
          <Icon icon="lucide:mail" className="text-white" width={20} />
          <Icon icon="lucide:image" className="text-white" width={20} />
          <div className="relative">
            <Icon icon="lucide:bell" className="text-white" width={20} />
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
          </div>
          <Icon icon="lucide:flag" className="text-white" width={20} />
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
          <div className="flex items-center gap-2 ml-4">
            <Icon icon="lucide:power" className="text-white" width={20} />
            <Icon icon="lucide:settings" className="text-white" width={20} />
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Icon icon={icon} className="text-primary" width={24} />
              <h1 className="text-2xl font-semibold">{title}</h1>
            </div>
            <p className="text-default-500 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-default-100 rounded-full px-4 py-1">
              <Icon icon="lucide:home" className="text-primary" width={16} />
              <span className="text-default-700">Oreo</span>
              <span className="text-default-400">/</span>
              <span className="text-default-700">{title}</span>
            </div>
            {onAddNew && (
              <Button color="primary" startContent={<Icon icon="lucide:plus" />} onPress={onAddNew}>
                {addButtonLabel}
              </Button>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}