import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { Header } from './header';

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
      <Header />

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
              <span className="text-default-700">Al Shifa</span>
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