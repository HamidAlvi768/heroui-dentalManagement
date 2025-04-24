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
  Textarea
} from '@heroui/react';

export function CrudDialog({
  isOpen,
  onOpenChange,
  title,
  formData,
  formFields,
  onSave
}) {
  const [form, setForm] = React.useState(formData || {});

  // Update form when formData changes (e.g., when editing different items)
  React.useEffect(() => {
    if (formData) {
      setForm(formData);
    }
  }, [formData]);

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  // Render different form field types based on configuration
  const renderFormField = (field) => {
    const { key, label, type, options, required, placeholder } = field;
    
    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            key={key}
            label={label}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            type={type}
            value={form[key] || ''}
            onValueChange={(value) => handleChange(key, value)}
            isRequired={required}
            className="mb-4"
          />
        );
      
      case 'select':
        return (
          <Select
            key={key}
            label={label}
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
            selectedKeys={form[key] ? [form[key]] : []}
            onChange={(e) => handleChange(key, e.target.value)}
            isRequired={required}
            className="mb-4"
          >
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );
      
      case 'checkbox':
        return (
          <Checkbox
            key={key}
            isSelected={form[key] || false}
            onValueChange={(value) => handleChange(key, value)}
            className="mb-4"
          >
            {label}
          </Checkbox>
        );
      
      case 'textarea':
        return (
          <Textarea
            key={key}
            label={label}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            value={form[key] || ''}
            onValueChange={(value) => handleChange(key, value)}
            isRequired={required}
            className="mb-4"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              {formFields?.map(renderFormField)}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}