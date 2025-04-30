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
import { Icon } from '@iconify/react';

// Add custom styles to fix autocomplete hover issues
import './CrudDialogStyles.css';

// Define medicine types with descriptions
const medicineTypes = [
  { label: "Tablet", key: "tablet", description: "Solid dosage form containing medication" },
  { label: "Syrup", key: "syrup", description: "Liquid medication usually containing sugar" },
  { label: "Injection", key: "injection", description: "Medication administered via needle" },
  { label: "Capsule", key: "capsule", description: "Small case containing medicine dose" }
];

// Expanded list of medicines with descriptions
const medicineNames = [
  { label: "Paracetamol", key: "paracetamol", description: "Pain reliever and fever reducer" },
  { label: "Amoxicillin", key: "amoxicillin", description: "Antibiotic medication" },
  { label: "Ibuprofen", key: "ibuprofen", description: "Anti-inflammatory drug" },
  { label: "Aspirin", key: "aspirin", description: "Pain reliever and blood thinner" },
  { label: "Omeprazole", key: "omeprazole", description: "Reduces stomach acid production" },
  { label: "Cetirizine", key: "cetirizine", description: "Antihistamine for allergies" }
];

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

    // Check if we should use Autocomplete instead of Select
    const shouldUseAutocomplete = type === 'select' && options && options.length > 3;

    if (shouldUseAutocomplete) {
      // Convert options to format needed for Autocomplete if necessary
      // const autocompleteItems = options.map(option =>
      //   typeof option === 'object' ? option : { key: option, label: option }
      // );

      return (
        <div className="flex-1 min-w-[200px]">
          <Autocomplete
            {...commonProps}
            value={form[key] || ''} // Current selected value (string or object)
            onChange={(value) => handleChange(key, value)} // Handle selection change
            options={options} // List of options to filter
            getOptionLabel={(option) => option.label || option} // Display label for each option
            filterOptions={(options, { inputValue }) =>
              options.filter((option) =>
                (option.label || option)
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              )
            } // Filter logic
          >
            {options?.map((option) => (
              <AutocompleteItem
                key={option.value || option}
                value={option.value || option}
              >
                {option.label || option}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        </div>
      );
    }

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
      case 'datetime':
      case 'password':
      case 'search':
      case 'url':
      case 'time':
      case 'week':
      case 'month':
      case 'color':
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

  // Handle medicine type change with specific index
  const handleMedicineTypeChange = (idx, key) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, medicineType: key } : m)
    }));
  };

  // Handle medicine name change with specific index
  const handleMedicineNameChange = (idx, key) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, medicineName: key } : m)
    }));
  };

  // Handle medicine description change
  const handleDescriptionChange = (idx, value) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, description: value } : m)
    }));
  };

  // Handle time period changes (days, weeks, months)
  const handleTimePeriodChange = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, [field]: value } : m)
    }));
  };

  // Add new medicine row
  const addMedicineRow = () => {
    setForm(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicineType: '', medicineName: '', description: '', days: '', weeks: '', months: '' }
      ]
    }));
  };

  // Remove medicine row
  const removeMedicineRow = (idx) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };

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

                {/* Medicine Entry Table for Prescription with Autocomplete */}
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
                            <tr key={`med-row-${idx}`}>
                              <td className="p-2 border">
                                <Autocomplete
                                  id={`medicine-type-${idx}`}
                                  key={`medicine-type-${idx}`}
                                  size="sm"
                                  defaultItems={medicineTypes}
                                  selectedKey={med.medicineType}
                                  onSelectionChange={(key) => handleMedicineTypeChange(idx, key)}
                                  className="w-32 medicine-type-autocomplete"
                                  popoverProps={{
                                    shouldBlockScroll: true,
                                    placement: "bottom",
                                    offset: 10,
                                    classNames: {
                                      content: "z-[1000] medicine-type-popover",
                                      base: `medicine-type-${idx}-container`,
                                      trigger: `medicine-type-${idx}-trigger`
                                    }
                                  }}
                                  classNames={{
                                    listbox: `medicine-type-${idx}-listbox`,
                                    popover: `medicine-type-${idx}-popover-wrapper`,
                                    item: `medicine-type-${idx}-item`,
                                    itemWrapper: `medicine-type-${idx}-item-wrapper`,
                                    input: `medicine-type-${idx}-input`
                                  }}
                                >
                                  {(item) => (
                                    <AutocompleteItem key={item.key} textValue={item.label}>
                                      <div className="flex flex-col">
                                        <span>{item.label}</span>
                                        <span className="text-xs text-default-400">{item.description}</span>
                                      </div>
                                    </AutocompleteItem>
                                  )}
                                </Autocomplete>
                              </td>
                              <td className="p-2 border">
                                <Autocomplete
                                  id={`medicine-name-${idx}`}
                                  key={`medicine-name-${idx}`}
                                  size="sm"
                                  defaultItems={medicineNames}
                                  selectedKey={med.medicineName}
                                  onSelectionChange={(key) => handleMedicineNameChange(idx, key)}
                                  className="w-32 medicine-name-autocomplete"
                                  popoverProps={{
                                    shouldBlockScroll: true,
                                    placement: "bottom",
                                    offset: 10,
                                    classNames: {
                                      content: "z-[1000] medicine-name-popover",
                                      base: `medicine-name-${idx}-container`,
                                      trigger: `medicine-name-${idx}-trigger`
                                    }
                                  }}
                                  classNames={{
                                    listbox: `medicine-name-${idx}-listbox`,
                                    popover: `medicine-name-${idx}-popover-wrapper`,
                                    item: `medicine-name-${idx}-item`,
                                    itemWrapper: `medicine-name-${idx}-item-wrapper`,
                                    input: `medicine-name-${idx}-input`
                                  }}
                                >
                                  {(item) => (
                                    <AutocompleteItem key={item.key} textValue={item.label}>
                                      <div className="flex flex-col">
                                        <span>{item.label}</span>
                                        <span className="text-xs text-default-400">{item.description}</span>
                                      </div>
                                    </AutocompleteItem>
                                  )}
                                </Autocomplete>
                              </td>
                              <td className="p-2 border">
                                <Input
                                  size="sm"
                                  value={med.description || ''}
                                  onValueChange={(value) => handleDescriptionChange(idx, value)}
                                  className="w-32"
                                />
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.days ? [med.days] : []}
                                  onChange={(e) => handleTimePeriodChange(idx, 'days', e.target.value)}
                                  className="w-20"
                                  aria-label={`Days for medicine ${idx + 1}`}
                                >
                                  {[...Array(15).keys()].map(i =>
                                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                  )}
                                </Select>
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.weeks ? [med.weeks] : []}
                                  onChange={(e) => handleTimePeriodChange(idx, 'weeks', e.target.value)}
                                  className="w-20"
                                  aria-label={`Weeks for medicine ${idx + 1}`}
                                >
                                  {[...Array(5).keys()].map(i =>
                                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                  )}
                                </Select>
                              </td>
                              <td className="p-2 border">
                                <Select
                                  size="sm"
                                  selectedKeys={med.months ? [med.months] : []}
                                  onChange={(e) => handleTimePeriodChange(idx, 'months', e.target.value)}
                                  className="w-20"
                                  aria-label={`Months for medicine ${idx + 1}`}
                                >
                                  {[...Array(3).keys()].map(i =>
                                    <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                  )}
                                </Select>
                              </td>
                              <td className="p-2 border text-center">
                                {form.medicines.length > 1 && (
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => removeMedicineRow(idx)}
                                    className="text-danger"
                                  >
                                    <Icon icon="lucide:trash-2" width={18} />
                                  </Button>
                                )}
                                {idx === form.medicines.length - 1 && (
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={addMedicineRow}
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