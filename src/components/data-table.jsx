import React from 'react';
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
  CardBody
} from '@heroui/react';
import { Icon } from '@iconify/react';

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView
}) {
  const [filters, setFilters] = React.useState({});
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
  const rowsPerPageOptions = [
    { value: 5, label: '5 per page' },
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' }
  ];

  // Filter data based on all filter values
  const filteredData = React.useMemo(() => {
    if (Object.keys(filters).length === 0) return data;
    
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key]?.toString().toLowerCase();
        return itemValue?.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  // Calculate pagination
  const pages = Math.ceil(filteredData.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  // Get filterable columns (excluding actions column)
  const filterableColumns = columns.filter(col => col.key !== 'actions');

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Render cell content based on column configuration
  const renderCell = (item, columnKey) => {
    const column = columns.find(col => col.key === columnKey);
    
    if (columnKey === 'actions') {
      return (
        <div className="flex justify-end">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" size="sm">
                <Icon icon="lucide:more-vertical" width={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Actions">
              {onView && (
                <DropdownItem onPress={() => onView(item)}>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:eye" width={16} />
                    <span>View</span>
                  </div>
                </DropdownItem>
              )}
              {onEdit && (
                <DropdownItem onPress={() => onEdit(item)}>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:edit" width={16} />
                    <span>Edit</span>
                  </div>
                </DropdownItem>
              )}
              {onDelete && (
                <DropdownItem 
                  className="text-danger" 
                  color="danger" 
                  onPress={() => onDelete(item)}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:trash-2" width={16} />
                    <span>Delete</span>
                  </div>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
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
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterableColumns.map((column) => (
              <div key={column.key}>
                <Input
                  label={column.label}
                  placeholder={`Filter by ${column.label.toLowerCase()}`}
                  value={filters[column.key] || ''}
                  onValueChange={(value) => handleFilterChange(column.key, value)}
                  size="sm"
                  isClearable
                  startContent={<Icon icon="lucide:search" className="text-default-400" width={16} />}
                />
              </div>
            ))}
          </div>
          {Object.keys(filters).length > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                size="sm"
                color="danger"
                variant="light"
                startContent={<Icon icon="lucide:trash-2" width={16} />}
                onPress={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="bg-content1 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Select 
            size="sm"
            selectedKeys={[rowsPerPage.toString()]}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="w-40"
          >
            {rowsPerPageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<Icon icon="lucide:download" width={16} />}
            onPress={() => {
              // Export functionality can be added here
              console.log('Export data');
            }}
          >
            Export
          </Button>
        </div>
        
        <Table 
          aria-label="Data table"
          bottomContent={
            pages > 1 ? (
              <div className="flex w-full justify-between items-center">
                <div className="text-small text-default-400">
                  {`${Math.min((page - 1) * rowsPerPage + 1, filteredData.length)} - ${Math.min(page * rowsPerPage, filteredData.length)} of ${filteredData.length} entries`}
                </div>
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={setPage}
                />
              </div>
            ) : null
          }
          classNames={{
            wrapper: "min-h-[400px]",
          }}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody emptyContent="No records found" items={items}>
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
    </div>
  );
}