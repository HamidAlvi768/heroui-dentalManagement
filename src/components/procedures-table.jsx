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
  Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';

export function ProceduresTable({
  value = [],
  onChange,
  disabled = false,
  categories = [],
  procedures = [],
  tableColumns = null
}) {
  // Debug logging
  console.log('ProceduresTable props:', { categories, procedures, tableColumns });
  const [items, setItems] = useState(value && value.length > 0 ? value : [{
    category: '',
    procedure: '',
    description: '',
    quantity: 1,
    price: '',
    subTotal: 0
  }]);

  useEffect(() => {
    if (value && value.length > 0) {
      setItems(value);
    } else if (items.length === 0) {
      // Ensure there's always at least one row
      setItems([{
        category: '',
        procedure: '',
        description: '',
        quantity: 1,
        price: '',
        subTotal: 0
      }]);
    }
  }, [value]);

  useEffect(() => {
    onChange?.(items);
  }, [items, onChange]);

  const handleAddRow = () => {
    const newItems = [...items, {
      category: '',
      procedure: '',
      description: '',
      quantity: 1,
      price: '',
      subTotal: 0
    }];
    setItems(newItems);
  };

  const handleRemoveRow = (index) => {
    // Don't allow removing the first row
    if (index === 0) return;
    
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleUpdateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    
    // Calculate subtotal when quantity or price changes
    if (key === 'quantity' || key === 'price') {
      const quantity = key === 'quantity' ? Number(value) : Number(newItems[index].quantity);
      const price = key === 'price' ? Number(value) : Number(newItems[index].price);
      newItems[index].subTotal = quantity * price;
    }
    
    setItems(newItems);
  };

  return (
          <div className="space-y-4 w-full">
        <div className="border rounded-lg w-full overflow-x-auto">
        <Table aria-label="Procedures table" className="w-full" layout="fit-content">
          <TableHeader>
            <TableColumn>Category</TableColumn>
            <TableColumn>Procedure (CPT)</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Price</TableColumn>
            <TableColumn>Subtotal</TableColumn>
            <TableColumn>Add/Remove</TableColumn>
          </TableHeader>
                      <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="whitespace-nowrap">
                  <Select
                    size="sm"
                    placeholder="Select Category"
                    selectedKeys={item.category ? [item.category] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleUpdateItem(index, 'category', selectedKey);
                    }}
                    isDisabled={disabled}
                    className="w-full min-w-[140px]"
                    popoverProps={{
                      placement: "bottom-start",
                      classNames: {
                        content: "min-w-[200px] z-50"
                      }
                    }}
                  >
                    {tableColumns && tableColumns.find(col => col.key === 'category')?.options ? 
                      // Use form configuration options
                      tableColumns.find(col => col.key === 'category').options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                      : categories.length > 0 ? 
                        // Use API data
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                        : 
                        // Fallback options
                        [
                          { value: 'consultation', label: 'Consultation' },
                          { value: 'surgery', label: 'Surgery' },
                          { value: 'lab', label: 'Lab' }
                        ].map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    }
                  </Select>
                </TableCell>
                
                <TableCell className="whitespace-nowrap">
                  <Select
                    size="sm"
                    placeholder="Select Procedure"
                    selectedKeys={item.procedure ? [item.procedure] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleUpdateItem(index, 'procedure', selectedKey);
                    }}
                    isDisabled={disabled}
                    className="w-full min-w-[160px]"
                    popoverProps={{
                      placement: "bottom-start",
                      classNames: {
                        content: "min-w-[250px] z-50"
                      }
                    }}
                  >
                    {tableColumns && tableColumns.find(col => col.key === 'procedure')?.options ? 
                      // Use form configuration options
                      tableColumns.find(col => col.key === 'procedure').options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                      : procedures.length > 0 ? 
                        // Use API data
                        procedures.map((proc) => (
                          <SelectItem key={proc.id} value={proc.id}>
                            {proc.code} - {proc.name}
                          </SelectItem>
                        ))
                        : 
                        // Fallback options
                        [
                          { value: '99213', label: '99213 - Office Visit' },
                          { value: '93000', label: '93000 - ECG' }
                        ].map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    }
                  </Select>
                </TableCell>
                
                <TableCell>
                  <Input
                    size="sm"
                    placeholder="Description"
                    value={item.description || ''}
                    onValueChange={(value) => handleUpdateItem(index, 'description', value)}
                    isDisabled={disabled}
                    className="w-full"
                   />
                </TableCell>
                
                <TableCell>
                  <Input
                    size="sm"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Quantity"
                    value={item.quantity || 1}
                    onValueChange={(value) => {
                      const numValue = parseInt(value) || 1;
                      // Ensure quantity is at least 1 and not negative
                      const validValue = Math.max(1, Math.abs(numValue));
                      handleUpdateItem(index, 'quantity', validValue);
                    }}
                    isDisabled={disabled}
                    className="w-full"
                  />
                </TableCell>
                
                <TableCell>
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={item.price || ''}
                    onValueChange={(value) => {
                      const numValue = parseFloat(value) || 0;
                      // Ensure price is at least 0 and not negative
                      const validValue = Math.max(0, Math.abs(numValue));
                      handleUpdateItem(index, 'price', validValue);
                    }}
                    isDisabled={disabled}
                    className="w-full"
                  />
                </TableCell>
                
                <TableCell>
                  <Input
                    size="sm"
                    type="number"
                    readOnly
                    value={item.subTotal || 0}
                    className="w-full bg-gray-50"
                  />
                </TableCell>
                
                <TableCell>
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
