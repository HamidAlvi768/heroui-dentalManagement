import React, { use, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Pagination,
  Select,
  SelectItem,
  Card,
  CardBody,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { set } from 'date-fns';

export function DataTable({
  loading,
  title,
  columns,
  data, // Provide default empty array
  customActions,
  totalItems,
  currentPage,
  rowsPerPage,
  onEdit,
  onDelete,
  onView,
  onPerPageChange,
  onPaginate,
  onExport,
  filterColumns,
  onFilterChange,
}) {
  const [filterInputs, setFilterInputs] = React.useState({});
  const [activeFilters, setActiveFilters] = React.useState({});
  const [page, setPage] = React.useState(currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = React.useState(rowsPerPage || 5);
  const [tableData, setTableData] = React.useState([]); // Ensure data is always an array

 useEffect(() => {
  setTableData(data);
 }, [data]);

  const pages = Math.ceil(totalItems / itemsPerPage);

  const rowsPerPageOptions = [
    { value: 3, label: '3 per page' },
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
  ];

  const handleInputChange = (key, value) => {
    setFilterInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilterInputs({});
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const applyFilters = () => {
    setActiveFilters(filterInputs);
    if (onFilterChange) {
      onFilterChange(filterInputs);
    }
  };

  const filterableColumns = filterColumns || [];

  const renderFilterInput = (column) => {
    if (column.type === 'select' && column.options) {
      return (
        <Select
          label={column.label}
          placeholder={`Filter by ${column.label.toLowerCase()}`}
          selectedKeys={filterInputs[column.key] ? [filterInputs[column.key]] : []}
          onSelectionChange={(keys) => handleInputChange(column.key, Array.from(keys)[0])}
          size="sm"
          className="w-full"
        >
          {column.options.map((option) => (
            <SelectItem key={option.value || option} value={option.value || option}>
              {option.label || option}
            </SelectItem>
          ))}
        </Select>
      );
    }

    return (
      <Input
        type={column.type || 'text'}
        label={column.label}
        placeholder={`Filter by ${column.label.toLowerCase()}`}
        value={filterInputs[column.key] || ''}
        onValueChange={(value) => handleInputChange(column.key, value)}
        size="sm"
        isClearable
        startContent={<Icon icon="lucide:search" className="text-default-400" width={16} />}
      />
    );
  };

  const renderCell = (item, columnKey) => {
    const column = columns.find(col => col.key === columnKey);

    if (columnKey === 'actions') {
      return (
        <div className="flex gap-2 justify-start">
          {Array.isArray(customActions) && customActions.map((button, index) => (
            <Button
              key={index}
              isIconOnly
              variant="light"
              size="sm"
              color={button.color || 'primary'}
              onPress={() => button.onClick(item)}
              title={button.label}
            >
              <Icon icon={button.icon} width={16} />
            </Button>
          ))}
          {onView && (
            <Button isIconOnly variant="light" size="sm" onPress={() => onView(item)} title="View">
              <Icon icon="lucide:eye" width={16} />
            </Button>
          )}
          {onEdit && (
            <Button isIconOnly variant="light" size="sm" onPress={() => onEdit(item)} title="Edit">
              <Icon icon="lucide:edit" width={16} />
            </Button>
          )}
          {onDelete && (
            <Button isIconOnly variant="light" size="sm" color="danger" onPress={() => onDelete(item)} title="Delete">
              <Icon icon="lucide:trash-2" width={16} />
            </Button>
          )}
        </div>
      );
    }

    if (column && column.render) {
      return column.render(item);
    }

    return item[columnKey];
  };

  return (
    <div className="space-y-4">
      {filterableColumns.length > 0 && (
        <Card>
          <CardBody>
            <div className="space-y-2">
              <div className="flex gap-4 pb-2">
                {filterableColumns.map((column) => (
                  <div key={column.key} className="flex-1">
                    {renderFilterInput(column)}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                {Object.keys(filterInputs).length > 0 && (
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    startContent={<Icon icon="lucide:trash-2" width={16} />}
                    onPress={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  size="sm"
                  color="primary"
                  startContent={<Icon icon="lucide:filter" width={16} />}
                  onPress={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="bg-content1 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-default-400">
              Showing {itemsPerPage} of {totalItems} records
            </span>
            <Select
              size="sm"
              selectedKeys={[itemsPerPage.toString()]}
              onChange={(e) => {
                setPage(page);
                setItemsPerPage(Number(e.target.value));
                onPerPageChange?.(Number(e.target.value));
              }}
              className="w-40"
            >
              {rowsPerPageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          {onExport && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:download" width={16} />}
              onPress={onExport}
            >
              Export
            </Button>
          )}
        </div>

        <div className="min-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              {columns.map((column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              ))}
            </TableHeader>
            <TableBody 
              emptyContent="No records found" 
              items={tableData}
              isLoading={loading}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              total={pages}
              page={page}
              onChange={(newPage) => {
                setPage(newPage);
                onPaginate?.(newPage, itemsPerPage);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}