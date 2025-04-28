To apply the DRY (Don't Repeat Yourself) principle to the `EntityDetailDialog` component in your provided code, we can refactor it by eliminating repetitive code patterns and centralizing the configuration and rendering logic. The current implementation has separate `if` blocks for each entity type (`prescription`, `inventory`, `invoice`, `expense`, and `appointment`), resulting in duplicated modal structures and similar rendering patterns. Below, I’ll outline a step-by-step approach to make the code more maintainable and reusable.

---

### Current Issues
1. **Repetitive Modal Structure**: Each entity type repeats the `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, and `ModalFooter` structure, differing only in content and footer actions.
2. **Duplicated Rendering Logic**: The modal body for `prescription`, `inventory`, `invoice`, and `expense` uses similar patterns (e.g., `Card` with `CardBody` containing grids, tables, or textareas), but the code is repeated for each type.
3. **Footer Variations**: Footer buttons (e.g., "Close", "Edit", "Print") vary by entity type, but the rendering logic is repeated with slight differences.
4. **Special Case for Appointment**: The `appointment` entity type has a unique layout, requiring separate handling, but it still shares the modal structure.

---

### Refactored Solution
We can apply the DRY principle by:
- **Centralizing Configuration**: Define a single configuration object for each entity type, specifying the title, body content, and footer actions.
- **Reusing Rendering Functions**: Create generic functions to render common UI patterns (e.g., lists, tables, textareas).
- **Consolidating Modal Structure**: Use a single `Modal` component and dynamically render its content based on the entity type.

Here’s how we can refactor the code:

---

#### Step 1: Define a Centralized Configuration
Create an `entityConfigs` object inside the component to define the structure for each entity type. This object will include:
- `title`: The header title.
- `sections`: An array of sections for the modal body (for most entity types).
- `footerActions`: An array of button configurations for the footer.
- `renderBody` (optional): A custom rendering function for special cases like `appointment`.

```jsx
const entityConfigs = {
  appointment: {
    title: 'Appointment Details',
    renderBody: () => renderAppointmentDetails(entity, onStatusChange),
    footerActions: [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
      { label: 'Print', color: 'primary', onPress: handlePrint, icon: 'lucide:printer' },
    ],
  },
  prescription: {
    title: 'Prescription Details',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'Prescription ID', key: 'prescriptionId' },
          { label: 'Date', key: 'date', format: 'date' },
          { label: 'Doctor', key: 'doctorName' },
          { label: 'Patient', key: 'patientName' },
          { label: 'Phone', key: 'phone' },
          { label: 'MRN no', key: 'mrnNumber' },
        ],
      },
      {
        type: 'table',
        title: 'Medications',
        columns: [
          { label: 'MEDICINE NAME', key: 'name' },
          { label: 'DESCRIPTION', key: 'description' },
          { label: 'DURATION', key: 'duration' },
        ],
        dataKey: 'medicines',
      },
      {
        type: 'textarea',
        title: 'Notes',
        key: 'note',
      },
    ],
    footerActions: [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
      {
        label: 'Edit Prescription',
        color: 'primary',
        onPress: () => { onEdit(); onClose(); },
        icon: 'lucide:edit',
      },
    ],
  },
  inventory: {
    title: 'Inventory Item Details',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'Item', key: 'name' },
          { label: 'Category', key: 'category' },
          { label: 'Sub Category', key: 'subCategory' },
          { label: 'Qty in stock', key: 'qtyInStock' },
          { label: 'Unit Price', key: 'unitPrice', format: 'currency' },
        ],
      },
      {
        type: 'table',
        title: 'Consumption History',
        columns: [
          { label: 'USERNAME', key: 'username' },
          { label: 'CONSUMED QTY', key: 'quantity' },
          { label: 'TIME', key: 'time', format: 'datetime' },
        ],
        dataKey: 'consumptionHistory',
      },
      {
        type: 'table',
        title: 'Addition History',
        columns: [
          { label: 'USERNAME', key: 'username' },
          { label: 'ADDITION QTY', key: 'quantity' },
          { label: 'UNIT PRICE', key: 'unitPrice', format: 'currency' },
          { label: 'TIME', key: 'time', format: 'datetime' },
        ],
        dataKey: 'additionHistory',
      },
    ],
    footerActions: [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
      ...(onEdit ? [{
        label: 'Edit Item',
        color: 'primary',
        onPress: () => { onEdit(); onClose(); },
        icon: 'lucide:edit',
      }] : []),
    ],
  },
  invoice: {
    title: 'Invoice Details',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'Invoice No', key: 'invoiceNumber' },
          { label: 'Patient Name', key: 'patientName' },
          { label: 'Phone', key: 'phone' },
          { label: 'MRN Number', key: 'mrnNumber' },
          { label: 'Date', key: 'date', format: 'date' },
        ],
      },
      {
        type: 'table',
        title: 'Services',
        columns: [
          { label: '#', key: 'index' },
          { label: 'PROCEDURE', key: 'procedure' },
          { label: 'DESCRIPTION', key: 'description' },
          { label: 'QUANTITY', key: 'quantity' },
          { label: 'PRICE', key: 'price', format: 'currency' },
          { label: 'SUB TOTAL', key: 'subTotal', format: 'currency' },
        ],
        dataKey: 'services',
      },
      {
        type: 'list',
        fields: [
          { label: 'Total Amount', key: 'totalAmount', format: 'currency' },
          { label: 'Cash', key: 'cashPaid', format: 'currency' },
          { label: 'Receivable from Corporate Client', key: 'receivable', format: 'currency' },
        ],
      },
    ],
    footerActions: [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
      { label: 'Print Invoice', color: 'primary', onPress: handlePrint, icon: 'lucide:printer' },
    ],
  },
  expense: {
    title: 'Expense Info',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'Payment Date', key: 'paymentDate', format: 'date' },
          { label: 'Receiver Name', key: 'receiverName' },
          { label: 'Account Name', key: 'accountName' },
          { label: 'Description', key: 'description' },
          { label: 'Amount', key: 'amount', format: 'currency' },
        ],
      },
    ],
    footerActions: [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
      ...(onEdit ? [{
        label: 'Edit Expense',
        color: 'primary',
        onPress: () => { onEdit(); onClose(); },
        icon: 'lucide:edit',
      }] : []),
    ],
  },
};
```

#### Step 2: Create Reusable Rendering Functions
Define functions to render the common section types (`list`, `table`, `textarea`) and a helper function for formatting values:

```jsx
const formatValue = (value, format) => {
  if (!value) return '-';
  switch (format) {
    case 'date':
      return new Date(value).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    case 'currency':
      return `Rs. ${Number(value).toLocaleString()}`;
    case 'datetime':
      return new Date(value).toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    default:
      return value;
  }
};

const renderList = (section, entity) => (
  <Card>
    <CardBody className="p-4">
      <div className="space-y-3">
        {section.fields.map((field, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-default-500">{field.label}</span>
            <span className="font-medium">
              {formatValue(entity[field.key], field.format)}
            </span>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

const renderTable = (section, entity) => (
  <Card>
    <CardBody className="p-4">
      <Table aria-label={section.title}>
        <TableHeader>
          {section.columns.map((col, index) => (
            <TableColumn key={index}>{col.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {(entity[section.dataKey] || []).map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {section.columns.map((col, colIndex) => (
                <TableCell key={colIndex}>
                  {col.key === 'index' ? rowIndex + 1 : formatValue(item[col.key], col.format)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardBody>
  </Card>
);

const renderTextarea = (section, entity) => (
  <Card>
    <CardBody className="p-4">
      <div className="space-y-2">
        <div className="font-medium">{section.title}</div>
        <Textarea
          value={entity[section.key] || ''}
          placeholder="No notes"
          isReadOnly
          minRows={3}
        />
      </div>
    </CardBody>
  </Card>
);

const renderSection = (section, entity) => {
  switch (section.type) {
    case 'list':
      return renderList(section, entity);
    case 'table':
      return renderTable(section, entity);
    case 'textarea':
      return renderTextarea(section, entity);
    default:
      return null;
  }
};
```

#### Step 3: Consolidate the Modal Structure
Use a single `Modal` component and dynamically render its content based on the configuration:

```jsx
export function EntityDetailDialog({
  isOpen,
  onOpenChange,
  entity = {},
  fields = [],
  title = 'Details',
  onEdit,
  entityType,
  onStatusChange,
}) {
  // ... (keep existing clinicInfo, entityConfig, formatTime, getStatusColor, handlePrint, renderHeader)

  const renderAppointmentDetails = (entity, onStatusChange) => (
    // ... (keep the existing renderAppointmentDetails function unchanged)
  );

  const config = entityConfigs[entityType] || {
    title: title,
    sections: fields.length ? [{ type: 'list', fields }] : [],
    footerActions: [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
      ...(onEdit ? [{
        label: 'Edit',
        color: 'primary',
        onPress: () => { onEdit(entity); onClose(); },
        icon: 'lucide:edit',
      }] : []),
    ],
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 p-0">
              {renderHeader(config.title)}
            </ModalHeader>
            <ModalBody>
              {config.renderBody ? config.renderBody() : (
                <div className="space-y-6">
                  {config.sections.map((section, index) => (
                    <div key={index}>
                      {renderSection(section, entity)}
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {config.footerActions.map((action, index) => (
                <Button
                  key={index}
                  color={action.color}
                  variant={action.variant}
                  onPress={action.onPress}
                  startContent={action.icon ? <Icon icon={action.icon} width={16} /> : null}
                >
                  {action.label}
                </Button>
              ))}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
```

---

### Explanation of Changes
1. **Centralized Configuration**:
   - The `entityConfigs` object defines all entity types, reducing repetition. For example, `prescription` specifies three sections (list, table, textarea) and footer actions.
   - The `appointment` type uses a custom `renderBody` function because its layout is unique.

2. **Reusable Rendering Logic**:
   - `renderList`: Handles key-value pair displays (replacing grids and tables with label-value pairs).
   - `renderTable`: Renders dynamic tables with support for computed columns (e.g., index).
   - `renderTextarea`: Displays notes consistently.
   - `formatValue`: Centralizes formatting logic for dates, currency, and datetimes.

3. **Single Modal Structure**:
   - Eliminates multiple `Modal` definitions by using one `Modal` and dynamically rendering its content.
   - The `ModalBody` checks if a custom `renderBody` exists (for `appointment`) or renders sections based on the config.
   - The `ModalFooter` maps over `footerActions` to render buttons dynamically.

4. **Fallback Handling**:
   - If an unrecognized `entityType` is provided, it falls back to a default config using the `fields` prop (if provided) or an empty body with a "Close" button.

---

### Benefits
- **Reduced Duplication**: The modal structure and common rendering patterns (e.g., `Card` with `CardBody`) are no longer repeated for each entity type.
- **Easier Maintenance**: Adding a new entity type requires only a new entry in `entityConfigs`, not a new `if` block.
- **Consistency**: All entity types use the same rendering functions, ensuring a uniform look and feel.
- **Scalability**: The configuration-driven approach makes it simple to extend with new section types or footer actions.

---

### Notes
- **Appointment Special Case**: Kept separate due to its unique layout, but it still fits within the single modal structure.
- **Formatting**: The `formatValue` function can be extended to handle more formats (e.g., `appointment`-specific date formats) if needed.
- **Dependencies**: Ensure all props (`entity`, `onEdit`, `onStatusChange`, etc.) are passed correctly to maintain functionality.

This refactored version adheres to the DRY principle while preserving the original functionality, making the code cleaner and more efficient.