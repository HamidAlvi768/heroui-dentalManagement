import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { Header } from './header';
import { ArrowLeft, Component } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from './ui/breadcrumbs';
export function PageTemplate({
  title,
  icon,
  children,
  onAddNew,
  addButtonLabel = "Add New",
  backButton = false,
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-content2">
      <Header />
      <Breadcrumbs />
     <div className="bg-white shadow-md rounded-2xl mx-6 p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center">
                {/* ✅ Render back button if enabled */}
              {backButton && (
                <button className='mr-2' onClick={() => navigate(-1)} onPress={backButton}>
                  <ArrowLeft className="w-6 h-6 text-primary" />
                </button>
              )}
              <Icon icon={icon} className="text-primary mr-2" width={24} />
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