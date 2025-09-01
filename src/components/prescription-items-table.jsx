import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';

export function PrescriptionItemsTable({
  value = [],
  onChange,
  inventoryItems = [],
  disabled = false
}) {
  const [items, setItems] = useState(value && value.length > 0 ? value : [{
    medicine_type: '',
    medicine_id: '',
    medicine_name: '',
    description: '',
    dosage: '',
    frequency: '',
    duration: ''
  }]);

  useEffect(() => {
    if (value && value.length > 0) {
      setItems(value);
    } else if (items.length === 0) {
      // Ensure there's always at least one row
      setItems([{
        medicine_type: '',
        medicine_id: '',
        medicine_name: '',
        description: '',
        dosage: '',
        frequency: '',
        duration: ''
      }]);
    }
  }, [value]);

  const handleAddRow = () => {
    const newItem = {
      medicine_type: '',
      medicine_id: '',
      medicine_name: '',
      description: '',
      dosage: '',
      frequency: '',
      duration: ''
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleRemoveRow = (index) => {
    // Don't allow removing the first row
    if (index === 0) return;
    
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    setItems(newItems);
    onChange?.(newItems);
  };

  return (
    <div className="space-y-4 w-full relative overflow-visible">
      <div className="border border-default-200 rounded-lg w-full overflow-hidden">
        <Table aria-label="Prescription medications table" className="w-full" layout="fixed">
          <TableHeader>
            <TableColumn width="15%" className="bg-default-50 text-default-700 font-medium" aria-label="Medicine Type">Medicine Type</TableColumn>
            <TableColumn width="20%" className="bg-default-50 text-default-700 font-medium" aria-label="Medicine Name">Medicine Name</TableColumn>
            <TableColumn width="20%" className="bg-default-50 text-default-700 font-medium" aria-label="Description">Description</TableColumn>
            <TableColumn width="15%" className="bg-default-50 text-default-700 font-medium" aria-label="Dosage">Dosage</TableColumn>
            <TableColumn width="15%" className="bg-default-50 text-default-700 font-medium" aria-label="Frequency">Frequency</TableColumn>
            <TableColumn width="15%" className="bg-default-50 text-default-700 font-medium" aria-label="Duration">Duration</TableColumn>
            <TableColumn width="10%" className="bg-default-50 text-default-700 font-medium" aria-label="Actions">Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index} className="hover:bg-default-50">
                <TableCell className="py-3">
                  <Select
                    size="sm"
                    placeholder="Select Type"
                    selectedKeys={item.medicine_type ? [item.medicine_type] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleUpdateItem(index, 'medicine_type', selectedKey);
                    }}
                    isDisabled={disabled}
                    className="w-full"
                    aria-label={`Select medicine type for row ${index + 1}`}
                    popoverProps={{
                      placement: "bottom-start",
                      offset: 10,
                      container: "parent",
                      className: "z-[9999]"
                    }}
                  >
                    <SelectItem key="tablet" value="tablet">Tablet</SelectItem>
                    <SelectItem key="syrup" value="syrup">Syrup</SelectItem>
                    <SelectItem key="injection" value="injection">Injection</SelectItem>
                    <SelectItem key="capsule" value="capsule">Capsule</SelectItem>
                    <SelectItem key="cream" value="cream">Cream</SelectItem>
                    <SelectItem key="drops" value="drops">Drops</SelectItem>
                  </Select>
                </TableCell>
                
                <TableCell className="py-3">
                  <Select
                    size="sm"
                    placeholder="Select Medicine"
                    selectedKeys={item.medicine_id ? [item.medicine_id] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      // Find the inventory item by ID and get its name
                      const selectedInventoryItem = inventoryItems.find(invItem => invItem.id == selectedKey);
                      if (selectedInventoryItem) {
                        // Store both ID and name for better tracking
                        handleUpdateItem(index, 'medicine_id', selectedKey);
                        handleUpdateItem(index, 'medicine_name', selectedInventoryItem.name);
                      }
                    }}
                    isDisabled={disabled}
                    className="w-full"
                    aria-label={`Select medicine for row ${index + 1}`}
                    popoverProps={{
                      placement: "bottom-start",
                      offset: 10,
                      container: "parent",
                      className: "z-[9999]"
                    }}
                  >
                    {inventoryItems.map((invItem) => (
                      <SelectItem key={invItem.id} value={invItem.id}>
                        {invItem.name} ({invItem.code})
                      </SelectItem>
                    ))}
                  </Select>
                </TableCell>
                
                <TableCell className="py-3">
                  <Input
                    size="sm"
                    placeholder="Description/Instructions"
                    value={item.description || ''}
                    onValueChange={(value) => handleUpdateItem(index, 'description', value)}
                    isDisabled={disabled}
                    className="w-full"
                    aria-label={`Enter description for row ${index + 1}`}
                   />
                </TableCell>
                
                <TableCell className="py-3">
                  <Input
                    size="sm"
                    placeholder="e.g., 1 tablet, 5ml"
                    value={item.dosage || ''}
                    onValueChange={(value) => handleUpdateItem(index, 'dosage', value)}
                    isDisabled={disabled}
                    className="w-full"
                    aria-label={`Enter dosage for row ${index + 1}`}
                  />
                </TableCell>
                
                <TableCell className="py-3">
                  <Select
                    size="sm"
                    placeholder="Select Frequency"
                    selectedKeys={item.frequency ? [item.frequency] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleUpdateItem(index, 'frequency', selectedKey);
                    }}
                    isDisabled={disabled}
                    className="w-full"
                    aria-label={`Select frequency for row ${index + 1}`}
                    popoverProps={{
                      placement: "bottom-start",
                      offset: 10,
                      container: "parent",
                      className: "z-[9999]"
                    }}
                  >
                    <SelectItem key="once_daily" value="once_daily">Once daily</SelectItem>
                    <SelectItem key="twice_daily" value="twice_daily">Twice daily</SelectItem>
                    <SelectItem key="three_times_daily" value="three_times_daily">Three times daily</SelectItem>
                    <SelectItem key="four_times_daily" value="four_times_daily">Four times daily</SelectItem>
                    <SelectItem key="as_needed" value="as_needed">As needed</SelectItem>
                    <SelectItem key="before_meals" value="before_meals">Before meals</SelectItem>
                    <SelectItem key="after_meals" value="after_meals">After meals</SelectItem>
                    <SelectItem key="at_bedtime" value="at_bedtime">At bedtime</SelectItem>
                  </Select>
                </TableCell>
                
                <TableCell className="py-3">
                  <Input
                    size="sm"
                    placeholder="e.g., 7 days, 2 weeks, 1 month"
                    value={item.duration || ''}
                    onValueChange={(value) => handleUpdateItem(index, 'duration', value)}
                    isDisabled={disabled}
                    className="w-full"
                    aria-label={`Enter duration for row ${index + 1}`}
                  />
                </TableCell>
                
                <TableCell className="py-3">
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Tooltip content="Remove row">
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRemoveRow(index)}
                          disabled={disabled}
                          isIconOnly
                          className="min-w-8 w-8 h-8"
                          aria-label={`Remove medicine row ${index + 1}`}
                        >
                          <Icon icon="lucide:trash-2" width={14} />
                        </Button>
                      </Tooltip>
                    )}
                    {index === items.length - 1 && (
                      <Tooltip content="Add row">
                        <Button
                          size="sm"
                          variant="light"
                          color="success"
                          onPress={handleAddRow}
                          disabled={disabled}
                          isIconOnly
                          className="min-w-8 w-8 h-8"
                          aria-label="Add new medicine row"
                        >
                          <Icon icon="lucide:plus" width={14} />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
