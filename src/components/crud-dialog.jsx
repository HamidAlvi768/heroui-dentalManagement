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
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Add custom styles to fix autocomplete hover issues
import './CrudDialogStyles.css';
import { toast } from 'react-toastify';

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

// Add procedure categories with descriptions
const procedureCategories = [
  { label: "Consultation", key: "consultation", description: "Doctor consultation and examination" },
  { label: "Surgery", key: "surgery", description: "Surgical procedures and operations" },
  { label: "Lab", key: "lab", description: "Laboratory tests and diagnostics" },
  { label: "Treatment", key: "treatment", description: "Medical treatments and procedures" }
];

// Add common procedures with descriptions
const commonProcedures = [
  { label: "Initial Consultation", key: "initial_consult", description: "First visit consultation", category: "consultation" },
  { label: "Follow-up Visit", key: "follow_up", description: "Follow-up consultation", category: "consultation" },
  { label: "Root Canal", key: "root_canal", description: "Root canal treatment", category: "surgery" },
  { label: "Dental Cleaning", key: "cleaning", description: "Professional dental cleaning", category: "treatment" },
  { label: "X-Ray", key: "xray", description: "Dental X-ray imaging", category: "lab" }
];

export function CrudDialog({
  isOpen,
  onOpenChange,
  title,
  formData,
  form,
  formFields,
  onSave,
  onInputChange,
}) {
  const defaultFormState = (formFields || []).reduce((acc, field) => {
      acc[field.key] = ''; // or field.defaultValue if you have one
      return acc;
    }, {});
  const [formState, setFormState] = React.useState(formData || defaultFormState);

  React.useEffect(() => {
    if (formData) {
      setFormState(formData);
    }
  }, [formData]);

  const handleChange = (key, value) => {
    console.log("FORM KE VALUE", key, value)
    const newForm = {
      ...formState,
      [key]: value
    };
    console.log("FORM DATA ", newForm)
    setFormState(newForm);
    if (onInputChange) {
      onInputChange(newForm);
    }
  };

const [errors, setErrors] = React.useState({});
const handleSubmit = () => {
  const newErrors = {};
  (formFields || []).forEach(field => {
    if (field.required && !formState[field.key]?.toString().trim()) {
      newErrors[field.key] = `${field.label} is required`;
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  // Determine mode and save
  const mode = formState.id ? 'update' : 'create';
  onSave(formState, mode);
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
      pattern,
    } = field;

    // Define commonProps without the key
    const commonProps = {
      label,
      size: "sm",
      labelPlacement: "outside",
      placeholder: placeholder || `${label.toLowerCase()}`,
      isRequired: required,
      isDisabled: disabled || readonly || readOnly,
      isReadOnly: readonly || readOnly,
      classNames: {
        base: "w-full",
        input: "text-sm",
        label: "text-sm font-medium",
      },
    };

    // Calculate value if calculate function is provided
    const calculatedValue = calculate ? calculate(formState) : undefined;
    const displayValue = calculatedValue !== undefined ? calculatedValue : (value || (formState[key] || ''));

    // Check if we should use Autocomplete instead of Select
    const shouldUseAutocomplete = type === 'select' && options && options.length > 3;

    if (shouldUseAutocomplete) {
      return (
        <div className={`flex-1 min-w-[200px] ${className || ''}`}>
          <Autocomplete
            {...commonProps}
            value={displayValue}
            onInputChange={(v) => {
              if (!readonly && !readOnly) {
                console.log("SELECTED...");
                handleChange(key, v);
              }
            }}
            onSelectionChange={(v) => {
              if (!readonly && !readOnly) {
                console.log("SELECTED...");
                handleChange(key, v);
              }
            }}
            options={options}
            getOptionLabel={(option) => option.label || option}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) =>
                (option.label || option)
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              )
            }
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
      const validators = {
        username: (value) => value.replace(/[^A-Za-z ]/g, ""), 
        name: (value) => value.replace(/[^A-Za-z ]/g, ""),
        description : (value) => value.replace(/[^A-Za-z ]/g, ""),
        full_name: (value) => value.replace(/[^A-Za-z ]/g, ""),
        father_name: (value) => value.replace(/[^A-Za-z ]/g, ""), 
        contact_number: (value) => value.replace(/[^0-9]/g, ""),       
        phone: (value) => value.replace(/[^0-9]/g, ""),        
        email: (value) => value.trim(),                        
        // aur bhi fields add kar sakte ho
      };
      const clearFieldError = (key, value) => {
        setErrors((prev) => {
          if (!prev[key]) return prev; // nothing to clear

          const strValue = (value ?? "").toString().trim();
          if (strValue === "") return prev; // still empty → keep error

          // remove error
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      };
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
                  const validator = validators[key]; // current field ke liye validator dhundo
                  const newValue = validator ? validator(value) : value; // agar validator mila to apply karo warna original value
                  handleChange(key, newValue);
                  clearFieldError(key, value);
                                           }
                                         }}
              max={type === "date" ? field.max : undefined} // Apply only for past date inputs
              min={type === "date" ? field.min : undefined} // Apply only for future date inputs
              // required={formFields.required === false}
              classNames={{
                ...commonProps.classNames,
                input: `${commonProps.classNames.input} ${(readonly || readOnly) ? 'bg-default-100' : ''}`,
              }}
              className={`trigger: ${errors[field.key] ? 'border-red-500' : ''}`}
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
          <div className={`flex-1 min-w-[200px] ${className || ''}`}>
            <Select
            className="form-select w-full"
              {...commonProps}
              selectedKeys={displayValue ? [displayValue] : []}
              onChange={(e) => {
                if (!readonly && !readOnly) {
                  handleChange(key, e.target.value);
                  clearFieldError(key, e.target.value);
                }
              }}
              classNames={{
                ...commonProps.classNames,
                trigger: `${commonProps.classNames.input} ${(readonly || readOnly) ? 'bg-default-100' : ''}`,
              }}
            >
              {options?.map((option) => (
                <SelectItem key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
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
          <div className={`${isInRow ? "flex-1" : "w-full col-span-3"} ${className || ''}`}>
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

  // Handle medicine type change with specific index
  const handleMedicineTypeChange = (idx, key) => {
    setFormState(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, medicineType: key } : m)
    }));
  };

  // Handle medicine name change with specific index
  const handleMedicineNameChange = (idx, key) => {
    setFormState(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, medicineName: key } : m)
    }));
  };

  // Handle medicine description change
  const handleDescriptionChange = (idx, value) => {
    setFormState(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, description: value } : m)
    }));
  };

  // Handle time period changes (days, weeks, months)
  const handleTimePeriodChange = (idx, field, value) => {
    setFormState(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === idx ? { ...m, [field]: value } : m)
    }));
  };

  // Add new medicine row
  const addMedicineRow = () => {
    setFormState(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicineType: '', medicineName: '', description: '', days: '', weeks: '', months: '' }
      ]
    }));
  };

  // Remove medicine row
  const removeMedicineRow = (idx) => {
    setFormState(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };

  // Handle procedure category change
  const handleProcedureCategoryChange = (idx, key) => {
    setFormState(prev => ({
      ...prev,
      procedures: prev.procedures.map((p, i) => i === idx ? { ...p, category: key } : p)
    }));
  };

  // Handle procedure change
  const handleProcedureChange = (idx, key) => {
    const selectedProcedure = commonProcedures.find(p => p.key === key);
    setFormState(prev => ({
      ...prev,
      procedures: prev.procedures.map((p, i) => i === idx ? { 
        ...p, 
        procedure: key,
        description: selectedProcedure?.description || '',
        price: selectedProcedure?.price || ''
      } : p)
    }));
  };

  // Handle procedure description change
  const handleProcedureDescriptionChange = (idx, value) => {
    setFormState(prev => ({
      ...prev,
      procedures: prev.procedures.map((p, i) => i === idx ? { ...p, description: value } : p)
    }));
  };

  // Handle quantity change and calculate subtotal
  const handleQuantityChange = (idx, value) => {
    setFormState(prev => ({
      ...prev,
      procedures: prev.procedures.map((p, i) => i === idx ? { 
        ...p, 
        quantity: value,
        subTotal: (value * (p.price || 0)).toString()
      } : p)
    }));
  };

  // Handle price change and calculate subtotal
  const handlePriceChange = (idx, value) => {
    setFormState(prev => ({
      ...prev,
      procedures: prev.procedures.map((p, i) => i === idx ? { 
        ...p, 
        price: value,
        subTotal: ((p.quantity || 1) * value).toString()
      } : p)
    }));
  };

  // Add new procedure row
  const addProcedureRow = () => {
    setFormState(prev => ({
      ...prev,
      procedures: [
        ...prev.procedures,
        { category: '', procedure: '', description: '', quantity: 1, price: '', subTotal: '' }
      ]
    }));
  };

  // Remove procedure row
  const removeProcedureRow = (idx) => {
    setFormState(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== idx)
    }));
  };

  // Render all sections
  const renderSections = () => {
    if (!form?.sections) return null;
    return form.sections.map((section, sectionIdx) => (
      <div key={section.title || sectionIdx} className="mb-6">
        {section.title && <div className="font-semibold text-lg mb-2">{section.title}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {section.fields.map((field, idx) => {
            if (field.type === 'medicines-table') {
              // Render the custom medicines table
              return (
                <div key={field.key} className="col-span-3">
                  {/* Medicines Table (copy from previous implementation) */}
                  {Array.isArray(formState.medicines) && (
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
                            {formState.medicines.map((med, idx) => (
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
                                    renderValue={(items) => {
                                    return items.map((item) => (
                                      <span key={item.key} className="text-center">
                                        {item.key}
                                      </span>
                                    ));
                                    }}
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
                                        renderValue={(items) => {
                                      return items.map((item) => (
                                        <span key={item.key} className="text-center">
                                          {item.key}
                                        </span>
                                      ));
                                    }}
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
                                        renderValue={(items) => {
                                      return items.map((item) => (
                                        <span key={item.key} className="text-center">
                                          {item.key}
                                        </span>
                                      ));
                                    }}
                                  >
                                    {[...Array(3).keys()].map(i =>
                                      <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                                    )}
                                  </Select>
                                </td>
                                <td className="p-2 border text-center">
                                  {formState.medicines.length > 1 && (
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
                                  {idx === formState.medicines.length - 1 && (
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
              );
            }
            if (field.type === 'procedures-table') {
              return (
                <div key={field.key} className="col-span-3">
                  {Array.isArray(formState.procedures) && (
                    <div>
                      <div className="font-semibold mb-2">Procedure Entry</div>
                      <div>
                        <table className="w-full table-auto border text-xs">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-1 border whitespace-nowrap">Category</th>
                              <th className="p-1 border whitespace-nowrap">Procedure (CPT)</th>
                              <th className="p-1 border whitespace-nowrap">Description</th>
                              <th className="p-1 border whitespace-nowrap">Quantity</th>
                              <th className="p-1 border whitespace-nowrap">Price</th>
                              <th className="p-1 border whitespace-nowrap">Subtotal</th>
                              <th className="p-1 border whitespace-nowrap">Add/Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formState.procedures.map((proc, idx) => (
                              <tr key={`proc-row-${idx}`}
                                  className="align-top">
                                <td className="p-1 border w-1/6 min-w-0">
                                  <div className="flex min-w-0">
                                    <Autocomplete
                                      size="sm"
                                      defaultItems={procedureCategories}
                                      selectedKey={proc.category}
                                      onSelectionChange={(key) => handleProcedureCategoryChange(idx, key)}
                                      className="flex-1 min-w-0"
                                      popoverProps={{ placement: 'bottom', classNames: { content: 'z-[1000]' } }}
                                      classNames={{ input: 'text-xs', listbox: 'text-xs' }}
                                    >
                                      {(item) => (
                                        <AutocompleteItem key={item.key} textValue={item.label}>
                                          <span className="truncate">{item.label}</span>
                                        </AutocompleteItem>
                                      )}
                                    </Autocomplete>
                                  </div>
                                </td>
                                <td className="p-1 border w-1/6 min-w-0">
                                  <div className="flex min-w-0">
                                    <Autocomplete
                                      size="sm"
                                      defaultItems={commonProcedures.filter(p => !proc.category || p.category === proc.category)}
                                      selectedKey={proc.procedure}
                                      onSelectionChange={(key) => handleProcedureChange(idx, key)}
                                      className="flex-1 min-w-0"
                                      popoverProps={{ placement: 'bottom', classNames: { content: 'z-[1000]' } }}
                                      classNames={{ input: 'text-xs', listbox: 'text-xs' }}
                                    >
                                      {(item) => (
                                        <AutocompleteItem key={item.key} textValue={item.label}>
                                          <span className="truncate">{item.label}</span>
                                        </AutocompleteItem>
                                      )}
                                    </Autocomplete>
                                  </div>
                                </td>
                                <td className="p-1 border w-1/5 min-w-0">
                                  <Input
                                    size="sm"
                                    value={proc.description || ''}
                                    onValueChange={(value) => handleProcedureDescriptionChange(idx, value)}
                                    className="w-full min-w-0 text-xs"
                                    classNames={{ input: 'text-xs' }}
                                  />
                                </td>
                                <td className="p-1 border w-1/12 min-w-0">
                                  <Input
                                    size="sm"
                                    type="number"
                                    value={proc.quantity || 1}
                                    onValueChange={(value) => handleQuantityChange(idx, value)}
                                    className="w-full min-w-0 text-xs"
                                    min={1}
                                    classNames={{ input: 'text-xs' }}
                                  />
                                </td>
                                <td className="p-1 border w-1/12 min-w-0">
                                  <Input
                                    size="sm"
                                    type="number"
                                    value={proc.price || ''}
                                    onValueChange={(value) => handlePriceChange(idx, value)}
                                    className="w-full min-w-0 text-xs"
                                    min={0}
                                    classNames={{ input: 'text-xs' }}
                                  />
                                </td>
                                <td className="p-1 border w-1/12 min-w-0">
                                  <Input
                                    size="sm"
                                    type="number"
                                    value={proc.subTotal || ''}
                                    isReadOnly
                                    className="w-full min-w-0 text-xs"
                                    classNames={{ input: 'text-xs' }}
                                  />
                                </td>
                                <td className="p-1 border w-1/12 min-w-0 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {formState.procedures.length > 1 && (
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => removeProcedureRow(idx)}
                                        className="text-danger"
                                      >
                                        <Icon icon="lucide:trash-2" width={16} />
                                      </Button>
                                    )}
                                    {idx === formState.procedures.length - 1 && (
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={addProcedureRow}
                                        className="ml-1 text-success"
                                      >
                                        <Icon icon="lucide:plus" width={16} />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            // Render normal fields
            return (
              <div key={field.key} className="w-full" style={{ display: field.type === "hidden" ? "none" : "" }}>
                {renderFormField(field)}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
            <Modal
              isOpen={isOpen}
              onOpenChange={(open)=>{
                if(!open) setFormState(defaultFormState);
                onOpenChange(open);}
              }
              size={Array.isArray(formState.medicines) ? "5xl" : "3xl"}
              scrollBehavior="inside"
              classNames={{
                base: "max-h-[90vh] min-w-[900px]"
              }}
            >


    <ModalContent>
              {(onClose) => { const handleClose = () => {
                  setFormState(defaultFormState);
                  // setErrors({});
                  onClose();
                };
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                    <ModalBody>
                      <div className="space-y-6">
                        {renderSections()}
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={handleClose}>
                        Cancel
                      </Button>
                      <Button color="primary" onPress={handleSubmit}>
                        {formState.id ? 'Update' : 'Save'}
                      </Button>
                    </ModalFooter>
                  </>
                );
              }}
      </ModalContent>

    </Modal>
  );
}