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
import { Icon } from '@iconify/react';

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

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={Array.isArray(form.medicines) ? "5xl" : "3xl"}
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh] min-w-[900px]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Regular input fields in an auto-fit grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
                  {regularFields.map((field, index) => (
                    <div key={index} className="w-full">
                      {renderFormField(field)}
                    </div>
                  ))}
                </div>

                {/* Textarea fields */}
                {textareaFields.length > 0 && (
                  <div className="flex gap-4">
                    {textareaFields.map((field) => renderFormField(field, true))}
                  </div>
                )}

                {/* Medicine Entry Table for Prescription */}
                {Array.isArray(form.medicines) && (
                  <div>
                    <div className="font-semibold mb-2">Medicine Entry</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 border">Medicine Type</th>
                            <th className="p-2 border">Medicine Name</th>
                            <th className="p-2 border">Description</th>
                            <th className="p-2 border">Days</th>
                            <th className="p-2 border">Weeks</th>
                            <th className="p-2 border">Months</th>
                            <th className="p-2 border">Add/Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.medicines.map((med, idx) => (
                            <tr key={idx}>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.medicineType ? [med.medicineType] : []}
                                  onChange={e => {
                                    const value = e.target.value;
                                    setForm(prev => ({
                                      ...prev,
                                      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, medicineType: value } : m)
                                    }));
                                  }}
                                  className="w-32"
                                >
                                  <SelectItem value="tablet">Tablet</SelectItem>
                                  <SelectItem value="syrup">Syrup</SelectItem>
                                  <SelectItem value="injection">Injection</SelectItem>
                                  <SelectItem value="capsule">Capsule</SelectItem>
                                </Select>
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.medicineName ? [med.medicineName] : []}
                                  onChange={e => {
                                    const value = e.target.value;
                                    setForm(prev => ({
                                      ...prev,
                                      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, medicineName: value } : m)
                                    }));
                                  }}
                                  className="w-32"
                                >
                                  <SelectItem value="paracetamol">Paracetamol</SelectItem>
                                  <SelectItem value="amoxicillin">Amoxicillin</SelectItem>
                                  <SelectItem value="ibuprofen">Ibuprofen</SelectItem>
                                </Select>
                              </td>
                              <td className="p-2 border">
                                <Input
                                  size="sm"
                                  value={med.description || ''}
                                  onValueChange={value => setForm(prev => ({
                                    ...prev,
                                    medicines: prev.medicines.map((m, i) => i === idx ? { ...m, description: value } : m)
                                  }))}
                                  className="w-32"
                                />
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.days ? [med.days] : []}
                                  onChange={e => {
                                    const value = e.target.value;
                                    setForm(prev => ({
                                      ...prev,
                                      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, days: value } : m)
                                    }));
                                  }}
                                  className="w-20"
                                >
                                  {[...Array(15).keys()].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                </Select>
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.weeks ? [med.weeks] : []}
                                  onChange={e => {
                                    const value = e.target.value;
                                    setForm(prev => ({
                                      ...prev,
                                      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, weeks: value } : m)
                                    }));
                                  }}
                                  className="w-20"
                                >
                                  {[...Array(5).keys()].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                </Select>
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.months ? [med.months] : []}
                                  onChange={e => {
                                    const value = e.target.value;
                                    setForm(prev => ({
                                      ...prev,
                                      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, months: value } : m)
                                    }));
                                  }}
                                  className="w-20"
                                >
                                  {[...Array(3).keys()].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                </Select>
                              </td>
                              <td className="p-2 border text-center">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => {
                                    setForm(prev => ({
                                      ...prev,
                                      medicines: prev.medicines.filter((_, i) => i !== idx)
                                    }));
                                  }}
                                  className="text-danger"
                                >
                                  <Icon icon="lucide:trash-2" width={18} />
                                </Button>
                                {idx === form.medicines.length - 1 && (
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => {
                                      setForm(prev => ({
                                        ...prev,
                                        medicines: [
                                          ...prev.medicines,
                                          { medicineType: '', medicineName: '', description: '', days: '', weeks: '', months: '' }
                                        ]
                                      }));
                                    }}
                                    className="ml-2 text-success"
                                  >
                                    <Icon icon="lucide:plus" width={18} />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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