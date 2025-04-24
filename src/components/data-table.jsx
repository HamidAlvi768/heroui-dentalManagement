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
  Pagination
} from '@heroui/react';
import { Icon } from '@iconify/react';

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView
}) {
  const [filterValue, setFilterValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5;

  // Filter data based on search input
  const filteredData = React.useMemo(() => {
    if (!filterValue) return data;
    
    return data.filter(item => {
      return Object.values(item).some(
        value => 
          value && 
          typeof value === 'string' && 
          value.toLowerCase().includes(filterValue.toLowerCase())
      );
    });
  }, [data, filterValue]);

  // Calculate pagination
  const pages = Math.ceil(filteredData.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return filteredData.slice(start, end);
  }, [filteredData, page]);

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
    <div className="bg-content1 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">All Records</h3>
        <div className="w-64">
          <Input
            placeholder="Search..."
            startContent={<Icon icon="lucide:search" className="text-default-400" width={16} />}
            value={filterValue}
            onValueChange={setFilterValue}
            size="sm"
            isClearable
            onClear={() => setFilterValue('')}
          />
        </div>
      </div>
      
      <Table 
        aria-label="Data table"
        bottomContent={
          pages > 1 ? (
            <div className="flex justify-center">
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
  );
}