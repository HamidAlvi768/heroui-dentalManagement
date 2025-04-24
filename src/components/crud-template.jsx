import React from 'react';
import { PageTemplate } from './page-template';
import { DataTable } from './data-table';
import { CrudDialog } from './crud-dialog';
import { DeleteDialog } from './delete-dialog';
import { useDisclosure } from '@heroui/react';

export function CrudTemplate({
  title,
  description,
  icon,
  columns,
  data,
  initialFormData,
  formFields,
  onSave,
  onDelete,
  addButtonLabel = "Add New"
}) {
  const [items, setItems] = React.useState(data || []);
  const [currentItem, setCurrentItem] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onOpenChange: onDeleteOpenChange 
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = React.useState(null);

  const handleAddNew = () => {
    setCurrentItem(initialFormData);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    const updatedItems = items.filter(i => i.id !== itemToDelete.id);
    setItems(updatedItems);
    if (onDelete) onDelete(itemToDelete);
    setItemToDelete(null);
  };

  const handleView = (item) => {
    // View functionality can be added here
    console.log("View item:", item);
  };

  const handleSave = (formData) => {
    let updatedItems;
    
    if (isEditing) {
      // Update existing item
      updatedItems = items.map(item => 
        item.id === formData.id ? { ...item, ...formData } : item
      );
    } else {
      // Add new item with a generated ID
      const newItem = {
        ...formData,
        id: Date.now().toString(),
      };
      updatedItems = [...items, newItem];
    }
    
    setItems(updatedItems);
    onClose();
    if (onSave) onSave(formData, isEditing);
  };

  return (
    <PageTemplate
      title={title}
      description={description}
      icon={icon}
      onAddNew={handleAddNew}
      addButtonLabel={addButtonLabel}
    >
      <DataTable
        columns={columns}
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
      
      <CrudDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={isEditing ? `Edit ${title.slice(0, -1)}` : `Add New ${title.slice(0, -1)}`}
        formData={currentItem}
        formFields={formFields}
        onSave={handleSave}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        itemType={title.slice(0, -1)}
        onConfirm={confirmDelete}
      />
    </PageTemplate>
  );
}