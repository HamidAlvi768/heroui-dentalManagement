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

  const renderFormField = (field, isInRow = false) => {
    const { key, label, type, options, required, placeholder } = field;

    const commonProps = {
      key,
      label,
      size: "sm",
      labelPlacement: "outside",
      placeholder: placeholder || `Enter ${label.toLowerCase()}`,
      isRequired: required,
      classNames: {
        base: "w-full",
        input: "text-sm",
        label: "text-sm font-medium"
      }
    };

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <div className="flex-1 min-w-[200px]">
            <Input
              {...commonProps}
              type={type}
              value={form[key] || ''}
              onValueChange={(value) => handleChange(key, value)}
            />
          </div>
        );

      case 'select':
        return (
          <div className="flex-1 min-w-[200px]">
            <Select
              {...commonProps}
              selectedKeys={form[key] ? [form[key]] : []}
              onChange={(e) => handleChange(key, e.target.value)}
            >
              {options?.map((option) => (
                <SelectItem key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex-1 min-w-[200px]">
            <Checkbox
              isSelected={form[key] || false}
              onValueChange={(value) => handleChange(key, value)}
            >
              {label}
            </Checkbox>
          </div>
        );

      case 'textarea':
        return (
          <div className={isInRow ? "flex-1" : "w-full col-span-3"}>
            <Textarea
              {...commonProps}
              value={form[key] || ''}
              onValueChange={(value) => handleChange(key, value)}
              minRows={3}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Separate regular fields from textarea fields
  const { regularFields, textareaFields } = formFields?.reduce((acc, field) => {
    if (field.type === 'textarea') {
      acc.textareaFields.push(field);
    } else {
      acc.regularFields.push(field);
    }
    return acc;
  }, { regularFields: [], textareaFields: [] }) || { regularFields: [], textareaFields: [] };

  // Group regular fields into rows of 3
  const regularRows = [];
  for (let i = 0; i < regularFields.length; i += 3) {
    regularRows.push(regularFields.slice(i, i + 3));
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Regular input fields in rows of 3 */}
                {regularRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-3 gap-4">
                    {row.map((field) => renderFormField(field))}
                  </div>
                ))}

                {/* Textarea fields in a single row */}
                {textareaFields.length > 0 && (
                  <div className="flex gap-4">
                    {textareaFields.map((field) => renderFormField(field, true))}
                  </div>
                )}
              </div>
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