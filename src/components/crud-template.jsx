import React from 'react';
import { PageTemplate } from './page-template';
import { DataTable } from './data-table';
import { CrudDialog } from './crud-dialog';
import { DeleteDialog } from './delete-dialog';
import { useDisclosure } from '@heroui/react';
import { showToast } from '../utils/toast';

export function CrudTemplate({
  title,
  icon,
  columns,
  data,
  totalItems,
  currentPage,
  itemsPerPage,
  initialFormData,
  formFields,
  onSave,
  onPerPageChange,
  onPaginate,
  onExport,
  onDelete,
  filterColumns,
  addButtonLabel = "Add New"
}) {
  const [items, setItems] = React.useState(data);
  const [currentItem, setCurrentItem] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = React.useState(null);

  React.useEffect(() => {
    setItems(data);
  }, [data]);

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
    showToast.success(`${title.slice(0, -1)} deleted successfully`);
  };

  const handleView = (item) => {
    // View functionality can be added here
    console.log("View item:", item);
  };

  const handlePerPageChange = (perPage) => {
    onPerPageChange(perPage);
  };
  const handlePaginate = (page, perPage) => {
    onPaginate(page, perPage);
  }

  const handleSave = (formData) => {
    let updatedItems;

    if (isEditing) {
      // Update existing item
      updatedItems = items.map(item =>
        item.id === formData.id ? { ...item, ...formData } : item
      );
      showToast.success(`${title.slice(0, -1)} updated successfully`);
    } else {
      // Add new item with a generated ID
      const newItem = {
        ...formData,
        id: Date.now().toString(),
      };
      updatedItems = [...items, newItem];
      showToast.success(`${title.slice(0, -1)} created successfully`);
    }

    setItems(updatedItems);
    onClose();
    if (onSave) onSave(formData, isEditing);
    setCurrentItem(null);
    setIsEditing(false);
  };

  return (
    <PageTemplate
      title={title}
      icon={icon}
      onAddNew={handleAddNew}
      addButtonLabel={addButtonLabel}
    >
      <DataTable
        columns={columns}
        data={items}
        totalItems={totalItems}
        currentPage={currentPage}
        rowsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onPerPageChange={handlePerPageChange}
        onPaginate={handlePaginate}
        onExport={onExport}
        filterColumns={filterColumns}
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