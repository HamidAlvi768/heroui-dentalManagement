import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Textarea,
  Autocomplete,
  AutocompleteItem
} from '@heroui/react';
import { PrescriptionItemsTable } from './prescription-items-table';
import { ProceduresTable } from './procedures-table';

export function CrudDialog({
  isOpen,
  onOpenChange,
  title,
  formData,
  form,
  formFields,
  onSave,
  onInputChange,
  operationLoading = false, // New prop for operation loading state
  inventoryItems = [], // New prop for inventory items
  categories = [], // New prop for procedure categories
  procedures = [], // New prop for procedures
}) {
  // Always render the modal, even if formFields are empty
  // This ensures the modal opens and shows appropriate content
  
  const defaultFormState = React.useMemo(() => {
    if (!formFields || formFields.length === 0) return {};
    
    return formFields.reduce((acc, field) => {
      acc[field.key] = field.defaultValue || '';
      return acc;
    }, {});
  }, [formFields]);
  
  const [formState, setFormState] = React.useState(formData || defaultFormState);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (formData) {
      // If we're transitioning from loading to loaded, update the form state
      if (formData.isLoading === false && formData.hasError !== true) {
        setFormState(formData);
      }
      // If we're starting to load, keep the current form state but mark as loading
      else if (formData.isLoading === true) {
        // Keep current state but don't update with incomplete data
        setFormState(prev => ({ ...prev, isLoading: true }));
      }
    } else {
      // If formData is null/undefined (create mode), use default state
      setFormState(defaultFormState);
    }
  }, [formData, defaultFormState]);

  // Reset form state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      // Reset form state to default when modal closes
      setFormState(defaultFormState);
      setErrors({});
    }
  }, [isOpen, defaultFormState]);

  const handleChange = (key, value) => {
    const newForm = {
      ...formState,
      [key]: value
    };
    setFormState(newForm);
    if (onInputChange) {
      onInputChange(newForm);
    }
  };

  const clearFieldError = (key, value) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const strValue = (value ?? "").toString().trim();
      if (strValue === "") return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleSubmit = async () => {
    console.log('CrudDialog: Form submission started', { formState, formFields });
    
    // Only validate if we have formFields
    if (formFields && formFields.length > 0) {
      const newErrors = {};
      formFields.forEach(field => {
        if (field.required && !formState[field.key]?.toString().trim()) {
          newErrors[field.key] = `${field.label} is required`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        console.log('CrudDialog: Validation errors found', newErrors);
        setErrors(newErrors);
        return;
      }
    }
    
    const mode = formState.id ? 'update' : 'create';
    console.log('CrudDialog: Submitting form in mode', mode);
    
    try {
      // Call onSave and check if it was successful
      const result = await onSave(formState, mode);
      console.log('CrudDialog: onSave result', result);
      
      // If onSave returns true or doesn't return false, close the modal
      if (result !== false) {
        console.log('CrudDialog: Closing modal after successful submission');
        onOpenChange(false);
      } else {
        console.log('CrudDialog: Keeping modal open due to failed submission');
      }
    } catch (error) {
      console.error('CrudDialog: Error in form submission:', error);
      // Don't close modal on error
    }
  };

  const renderFormField = (field, isInRow = false) => {
    const { 
      key, 
      label, 
      type, 
      value, 
      options, 
      required, 
      placeholder, 
      disabled, 
      readonly, 
      className,
      calculate,
      readOnly,
    } = field;

    // Validate required field properties
    if (!key || !type) {
      return null;
    }

    // Check if we're in loading state
    const isLoading = formData?.isLoading === true;

    const commonProps = {
      label,
      size: "sm",
      labelPlacement: "outside",
      placeholder: placeholder || (label ? label.toLowerCase() : ''),
      isRequired: required,
      isDisabled: disabled || readonly || readOnly || isLoading,
      isReadOnly: readonly || readOnly || isLoading,
      classNames: {
        base: "w-full",
        input: "text-sm",
        label: "text-sm font-medium",
      },
    };

    const calculatedValue = calculate ? calculate(formState) : undefined;
    
    let displayValue;
    if (type === 'select') {
      displayValue = calculatedValue !== undefined ? calculatedValue : (value || formState[key] || '');
      if (displayValue === '') {
        displayValue = undefined;
      }
    } else {
      displayValue = calculatedValue !== undefined ? calculatedValue : (value || (formState[key] || ''));
    }

    // If loading, show shimmer effect
    if (isLoading) {
      return (
        <div className={`flex-1 min-w-[200px] ${className || ''}`}>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'hidden':
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
      case 'datetime-local':
      case 'password':
      case 'search':
      case 'url':
      case 'time':
      case 'week':
      case 'month':
      case 'color':
      case 'range':
      case 'file':
        return (
          <div className={`flex-1 min-w-[200px] ${className || ''}`}>
            <Input
              {...commonProps}
              type={type}
              value={displayValue}
              onValueChange={(value) => {
                if (!readonly && !readOnly) {
                  handleChange(key, value);
                  clearFieldError(key, value);
                }
              }}
              max={type === "date" ? field.max : undefined}
              min={type === "date" ? field.min : (type === "number" ? "0" : undefined)}
              classNames={{
                ...commonProps.classNames,
                input: `${commonProps.classNames.input} ${(readonly || readOnly) ? 'bg-default-100' : ''}`,
              }}
              className={`${errors[field.key] ? 'border-red-500' : ''}`}
              aria-label={label}
            />
            {errors?.[field.key] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[field.key]}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className={`flex-1 ${className || ''}`}>
            <Select
              className="form-select"
              style={{ width: 'fit-content', minWidth: '100%' }}
              {...commonProps}
              selectedKeys={displayValue && displayValue !== '' ? [displayValue] : []}
              onSelectionChange={(keys) => {
                if (!readonly && !readOnly) {
                  const selectedValue = Array.from(keys)[0];
                  handleChange(key, selectedValue);
                  clearFieldError(key, selectedValue);
                }
              }}
              classNames={{
                ...commonProps.classNames,
                trigger: `${commonProps.classNames.input} ${(readonly || readOnly) ? 'bg-default-100' : ''}`,
                base: "w-auto",
                listbox: "w-auto min-w-fit",
              }}
              aria-label={label}
            >
              {Array.isArray(options) && options.length > 0 ? (
                options.map((option) => (
                  <SelectItem key={option.value ?? option} value={option.value ?? option}>
                    {option.label ?? option}
                  </SelectItem>
                ))
              ) : (
                <SelectItem key="no-options" value="">
                  No options available
                </SelectItem>
              )}
            </Select>
            {errors?.[field.key] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className={`flex-1 min-w-[200px] ${className || ''}`}>
            <Checkbox
              isSelected={displayValue || false}
              onValueChange={(value) => {
                if (!readonly && !readOnly) {
                  handleChange(key, value);
                  clearFieldError(key, value);
                }
              }}
              isDisabled={readonly || readOnly}
              aria-label={label}
            >
              {label}
            </Checkbox>
            {errors?.[field.key] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className={`w-full col-span-full ${className || ''}`}>
            <Textarea
              {...commonProps}
              value={displayValue}
              onValueChange={(value) => {
                if (!readonly && !readOnly) {
                  handleChange(key, value);
                  clearFieldError(key, value);
                }
              }}
              minRows={3}
              classNames={{
                ...commonProps.classNames,
                input: `${commonProps.classNames.input} ${(readonly || readOnly) ? 'bg-default-100' : ''}`,
              }}
              aria-label={label}
            />
            {errors?.[field.key] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'prescription-items-table':
        return (
          <div className={`w-full ${className || ''}`}>
            <PrescriptionItemsTable
              value={displayValue}
              onChange={(value) => {
                if (!readonly || !readOnly) {
                  handleChange(key, value);
                }
              }}
              disabled={readonly || readOnly}
              inventoryItems={inventoryItems}
            />
            {errors?.[field.key] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      case 'procedures-table':
        return (
          <div className={`w-full ${className || ''}`}>
            <ProceduresTable
              value={displayValue}
              onChange={(value) => {
                if (!readonly && !readOnly) {
                  handleChange(key, value);
                }
              }}
              disabled={readonly || readOnly}
              categories={categories}
              procedures={procedures}
              tableColumns={field.tableColumns}
            />
            {errors?.[field.key] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSections = () => {
    
    // If no formFields or empty, show loading state
    if (!formFields || formFields.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-default-500">Loading form fields...</p>
          </div>
        </div>
      );
    }

    // Check if formFields have valid structure
    const hasValidFields = formFields.every(field => 
      field && 
      typeof field === 'object' && 
      field.key && 
      field.type && 
      field.label
    );
    
    if (!hasValidFields) {
      return (
        <div className="text-center py-8">
          <p className="text-danger">Invalid form configuration. Please check the form fields.</p>
          <pre className="text-xs mt-2 text-left bg-gray-100 p-2 rounded">
            {JSON.stringify(formFields, null, 2)}
          </pre>
        </div>
      );
    }

    // If formData is loading, show shimmer effect for all fields
    if (formData?.isLoading === true) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {formFields.map((field, idx) => (
            <div key={`${field.key || idx}-${idx}`} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      );
    }

    // If there was an error loading the data, show error message
    if (formData?.hasError === true) {
      return (
        <div className="text-center py-8">
          <div className="text-danger mb-4">
            <p className="text-lg font-semibold">Error Loading Data</p>
            <p className="text-sm">Failed to load the data for editing. Please try again.</p>
          </div>
          <Button 
            color="primary" 
            variant="light" 
            onPress={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (!form?.sections || !Array.isArray(form.sections)) {
      // If no form sections, render formFields directly
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {formFields.map((field, idx) => {
            // Safety check for field data
            if (!field || typeof field !== 'object') {
              return null;
            }
            
            return (
              <div key={`${field.key || idx}-${idx}-${isOpen}`}>
                {renderFormField(field, false)}
              </div>
            );
          })}
        </div>
      );
    }
    
    return form.sections.map((section, sectionIdx) => {
      if (!section?.fields || !Array.isArray(section.fields)) {
        return null;
      }
      
      return (
        <div key={section.title || sectionIdx} className="mb-6">
          {section.title && <div className="font-semibold text-lg mb-2">{section.title}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {section.fields.map((field, idx) => {
              // Safety check for field data
              if (!field || typeof field !== 'object') {
                return null;
              }
              
              // Special handling for prescription-items-table to span full width
              if (field.type === 'prescription-items-table') {
                return (
                  <div key={`${field.key || idx}-${idx}-${isOpen}`} className="col-span-full">
                    {renderFormField(field, false)}
                  </div>
                );
              }

              // Special handling for procedures-table to span full width
              if (field.type === 'procedures-table') {
                return (
                  <div key={`${field.key || idx}-${idx}-${isOpen}`} className="col-span-full">
                    {renderFormField(field, false)}
                  </div>
                );
              }

              // Special handling for textarea to span full width
              if (field.type === 'textarea') {
                return (
                  <div key={`${field.key || idx}-${idx}-${isOpen}`} className="col-span-full">
                    {renderFormField(field, false)}
                  </div>
                );
              }
              
              return (
                <div key={`${field.key || idx}-${idx}-${isOpen}`}>
                  {renderFormField(field, false)}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {title}
            {formData?.isLoading === true && (
              <div className="flex items-center gap-2 text-sm text-default-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading data...</span>
              </div>
            )}
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[70vh] overflow-y-auto p-6">
          {renderSections()}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit}
            isDisabled={formData?.isLoading === true || formData?.hasError === true || operationLoading === true}
          >
            {operationLoading ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
