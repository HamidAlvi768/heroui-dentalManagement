import React, { use, useEffect, useMemo, useCallback, memo } from 'react';
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

export const DataTable = memo(({
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
  filterLoading = false, // New prop for filter button loading state
}) => {
  const [filterInputs, setFilterInputs] = React.useState({});
  const [activeFilters, setActiveFilters] = React.useState({});
  const [page, setPage] = React.useState(currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = React.useState(rowsPerPage || 5);
  const [tableData, setTableData] = React.useState([]); // Ensure data is always an array
  const [isApplyingFilters, setIsApplyingFilters] = React.useState(false);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Reset filter loading state when external filterLoading changes
  useEffect(() => {
    if (!filterLoading) {
      console.log('DataTable: filterLoading is false, resetting isApplyingFilters');
      setIsApplyingFilters(false);
    }
  }, [filterLoading]);

  // Additional effect to ensure isApplyingFilters is reset when data changes (indicating successful filter)
  useEffect(() => {
    if (isApplyingFilters && data && data.length >= 0) {
      // Data has been updated, reset the applying state
      console.log('DataTable: Data updated, resetting isApplyingFilters');
      setIsApplyingFilters(false);
    }
  }, [data, isApplyingFilters]);

  // Memoize computed values
  const pages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);

  const rowsPerPageOptions = useMemo(() => [
    { value: 3, label: '3 per page' },
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
  ], []);

  // Memoize filterable columns
  const filterableColumns = useMemo(() => filterColumns || [], [filterColumns]);

  // Memoize handlers
  const handleInputChange = useCallback((key, value) => {
    setFilterInputs(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterInputs({});
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  }, [onFilterChange]);

  const applyFilters = useCallback(() => {
    console.log('DataTable: applyFilters called, setting isApplyingFilters to true');
    setIsApplyingFilters(true);
    setActiveFilters(filterInputs);
    if (onFilterChange) {
      onFilterChange(filterInputs);
    }
  }, [filterInputs, onFilterChange]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    if (onPaginate) {
      onPaginate(newPage);
    }
  }, [onPaginate]);

  const handlePerPageChange = useCallback((newPerPage) => {
    setItemsPerPage(newPerPage);
    setPage(1);
    if (onPerPageChange) {
      onPerPageChange(newPerPage);
    }
  }, [onPerPageChange]);

  const handleEdit = useCallback((item) => {
    if (onEdit) {
      onEdit(item);
    }
  }, [onEdit]);

  const handleDelete = useCallback((item) => {
    if (onDelete) {
      onDelete(item);
    }
  }, [onDelete]);

  const handleView = useCallback((item) => {
    if (onView) {
      onView(item);
    }
  }, [onView]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    }
  }, [onExport]);

  // Memoize filter input renderer
  const renderFilterInput = useCallback((column) => {
    if (column.type === 'select' && column.options) {
      return (
        <Select
          label={column.label}
          placeholder={`Filter by ${column.label.toLowerCase()}`}
          selectedKeys={filterInputs[column.key] ? [filterInputs[column.key]] : []}
          onSelectionChange={(keys) => handleInputChange(column.key, Array.from(keys)[0])}
          size="sm"
          className="w-full"
          isDisabled={isApplyingFilters || filterLoading}
        >
          {column.options.map((option) => (
            <SelectItem key={option.value || option} value={option.value || option}>
              {option.label || option}
            </SelectItem>
          ))}
        </Select>
      );
    }

    if (column.type === 'date') {
      return (
        <Input
          label={column.label}
          type="date"
          value={filterInputs[column.key] || ''}
          onChange={(e) => handleInputChange(column.key, e.target.value)}
          size="sm"
          className="w-full"
          isDisabled={isApplyingFilters || filterLoading}
        />
      );
    }

    return (
      <Input
        label={column.label}
        placeholder={`Filter by ${column.label.toLowerCase()}`}
        value={filterInputs[column.key] || ''}
        onChange={(e) => handleInputChange(column.key, e.target.value)}
        size="sm"
        className="w-full"
        isDisabled={isApplyingFilters || filterLoading}
      />
    );
  }, [filterInputs, handleInputChange, isApplyingFilters, filterLoading]);

  const renderCell = useCallback((item, columnKey) => {
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
              color={button.isDanger ? 'danger' : (button.color || 'primary')}
              onPress={() => button.handler ? button.handler(item) : button.onClick(item)}
              title={button.label}
            >
              <Icon icon={button.icon} width={16} />
            </Button>
          ))}
          {typeof customActions === 'function' && customActions(item).map((button, index) => (
            <Button
              key={index}
              isIconOnly
              variant="light"
              size="sm"
              color={button.isDanger ? 'danger' : (button.color || 'primary')}
              onPress={() => button.handler(item)}
              title={button.label}
            >
              <Icon icon={button.icon} width={16} />
            </Button>
          ))}
          {onView && (
            <Button isIconOnly variant="light" size="sm" onPress={() => handleView(item)} title="View">
              <Icon icon="lucide:eye" width={16} />
            </Button>
          )}
          {onEdit && (
            <Button isIconOnly variant="light" size="sm" onPress={() => handleEdit(item)} title="Edit">
              <Icon icon="lucide:edit" width={16} />
            </Button>
          )}
          {onDelete && (
            <Button isIconOnly variant="light" size="sm" color="danger" onPress={() => handleDelete(item)} title="Delete">
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
  }, [columns, customActions, onView, onEdit, onDelete, handleView, handleEdit, handleDelete]);

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
                    isLoading={isApplyingFilters || filterLoading}
                    startContent={!isApplyingFilters && !filterLoading ? <Icon icon="lucide:trash-2" width={16} /> : undefined}
                    onPress={clearFilters}
                    disabled={isApplyingFilters || filterLoading}
                  >
                    {isApplyingFilters || filterLoading ? 'Clearing...' : 'Clear Filters'}
                  </Button>
                )}
                <Button
                  size="sm"
                  color="primary"
                  isLoading={isApplyingFilters || filterLoading}
                  startContent={!isApplyingFilters && !filterLoading ? <Icon icon="lucide:filter" width={16} /> : undefined}
                  onPress={applyFilters}
                  disabled={isApplyingFilters || filterLoading}
                >
                  {isApplyingFilters || filterLoading ? 'Applying...' : 'Apply Filters'}
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
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
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
              onPress={handleExport}
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
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
});

DataTable.displayName = 'DataTable';