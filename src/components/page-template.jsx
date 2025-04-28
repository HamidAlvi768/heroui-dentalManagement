import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { Header } from './header';

export function PageTemplate({
  title,
  icon,
  children,
  onAddNew,
  addButtonLabel = "Add New"
}) {
  return (
    <div className="min-h-screen bg-content2">
      <Header />

      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Icon icon={icon} className="text-primary" width={24} />
              <h1 className="text-2xl font-semibold">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
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