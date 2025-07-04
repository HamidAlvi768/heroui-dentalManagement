import React from "react";
import { PageTemplate } from "./page-template";
import { DataTable } from "./data-table";
import { CrudDialog } from "./crud-dialog";
import { DeleteDialog } from "./delete-dialog";
import { useDisclosure } from "@heroui/react";
import { showToast } from "../utils/toast";

export function CrudTemplate({
  title,
  icon,
  loading,
  columns,
  data,
  customActions,
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
  addButtonLabel = "Add New",
  DetailDialog, // New prop for custom detail dialog
  customRowActions, // New prop for custom row actions
  onRowClick, // New prop for row click handling
  onFilterChange,
  onInputChange,
  form,
}) {
  const [items, setItems] = React.useState(data);
  const [currentItem, setCurrentItem] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const [itemToDelete, setItemToDelete] = React.useState(null);
  const [viewItem, setViewItem] = React.useState(null);

  React.useEffect(() => {
    setItems(data);
  }, [data]);

  const handleAddNew = () => {
    setCurrentItem(initialFormData);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (item) => {
    console.log("🔍 EDIT CLICKED - Raw item data:", item);
    console.log("🔍 Item keys:", Object.keys(item));
    console.log("🔍 Item values:", Object.values(item));
    setCurrentItem(item);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    const updatedItems = items.filter((i) => i.id !== itemToDelete.id);
    setItems(updatedItems);
    if (onDelete) onDelete(itemToDelete);
    setItemToDelete(null);
    showToast.success(`${title.slice(0, -1)} deleted successfully`);
  };

  const handleView = (item) => {
    if (onRowClick) {
      onRowClick(item);
    } else {
      setViewItem(item);
    }
  };

  const handlePerPageChange = (perPage) => {
    onPerPageChange(perPage);
  };

  const handlePaginate = (page, perPage) => {
    onPaginate(page, perPage);
  };

  const handleSave = (formData) => {
    let updatedItems;

    if (isEditing) {
      updatedItems = items.map((item) =>
        item.id === formData.id ? { ...item, ...formData } : item
      );
      showToast.success(`${title.slice(0, -1)} updated successfully`);
    } else {
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

  // Add a function to process form fields and handle calculated values
  const processFormFields = React.useCallback((fields) => {
    if (!fields) return fields;

    return fields.map((field) => {
      // If the field has a calculate function, ensure it's read-only
      if (field.calculate) {
        return {
          ...field,
          readOnly: true,
          readonly: true, // Support both readOnly and readonly for backward compatibility
        };
      }
      return field;
    });
  }, []);

  // Process form sections if they exist
  const processedForm = React.useMemo(() => {
    if (!form) return form;

    return {
      ...form,
      sections: form.sections?.map((section) => ({
        ...section,
        fields: processFormFields(section.fields),
      })),
    };
  }, [form, processFormFields]);

  // Process formFields if they exist
  const processedFormFields = React.useMemo(() => {
    if (!formFields) return formFields;
    return processFormFields(formFields);
  }, [formFields, processFormFields]);

  console.log("Items:", items);

  return (
    <PageTemplate
      title={title}
      icon={icon}
      onAddNew={handleAddNew}
      addButtonLabel={addButtonLabel}
    >
      <DataTable
        loading={loading}
        columns={columns}
        data={items}
        customActions={customActions}
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
        customRowActions={customRowActions}
        onFilterChange={(filters) => {
          onFilterChange(filters);
        }}
      />
      <CrudDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={
          isEditing
            ? `Edit ${title.slice(0, -1)}`
            : `Add New ${title.slice(0, -1)}`
        }
        formData={currentItem}
        form={processedForm || undefined}
        formFields={!processedForm ? processedFormFields : undefined}
        onSave={handleSave}
        onInputChange={onInputChange}
      />
      {DetailDialog && !onRowClick && viewItem && (
        <DetailDialog
          isOpen={!!viewItem}
          onOpenChange={() => setViewItem(null)}
          item={viewItem}
          onEdit={handleEdit}
        />
      )}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        itemType={title.slice(0, -1)}
        onConfirm={confirmDelete}
      />
    </PageTemplate>
  );
}
