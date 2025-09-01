import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Avatar,
  Card,
  CardBody,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Badge,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import PrintPreviewDialog from './print-preview-dialog';
import { toast } from 'react-toastify';
import { showToast } from '../utils/toast';
import CategoriesPage from '../pages/settings/categories-page';

const clinicInfo = {
  name: "J Dent Lite",
  address: "Office#1, City Plaza, F-10 Markaz, Islamabad",
  email: "info@jdentlite.com",
  phone: "0516131786",
  logo: "https://img.heroui.chat/image/logo?w=64&h=64&u=1"
};

const formatValue = (value, format) => {
  if (!value || value === '' || value === null || value === undefined) return '-';
  
  // Handle nested object properties
  if (typeof value === 'object' && value !== null) {
    return value.toString();
  }

  switch (format) {
    case 'date':
      try {
        // Check if value is valid and not empty
        if (!value || value === '-' || value === '') {
          return '-';
        }
        
        const date = new Date(value);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return '-';
        }
        
        return date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch (error) {
        return '-';
      }
    case 'currency':
      return `Rs. ${Number(value).toLocaleString()}`;
    case 'datetime':
      try {
        // Check if value is valid and not empty
        if (!value || value === '-' || value === '') {
          return '-';
        }
        
        const date = new Date(value);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return '-';
        }
        
        return date.toLocaleString('en-US', {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      } catch (error) {
        return '-';
      }
    case 'datetime_full':
      try {
        // Check if value is valid and not empty
        if (!value || value === '-' || value === '') {
          return '-';
        }
        
        const date = new Date(value);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return '-';
        }
        
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (error) {
        return '-';
      }
    case 'status':
      return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${value === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {value || 'Active'}
        </span>
      );
    case 'commission':
      return `${value}%`;
    case 'frequency':
      // Format frequency values for better display
      const frequencyMap = {
        'once_daily': 'Once daily',
        'twice_daily': 'Twice daily',
        'three_times_daily': 'Three times daily',
        'four_times_daily': 'Four times daily',
        'as_needed': 'As needed',
        'before_meals': 'Before meals',
        'after_meals': 'After meals',
        'at_bedtime': 'At bedtime'
      };
      return frequencyMap[value] || value;
    case 'diagnosis':
      // Format diagnosis values for better display
      const diagnosisMap = {
        'general': 'General Checkup',
        'followup': 'Follow-up Visit',
        'specialist': 'Specialist Consultation',
        'emergency': 'Emergency Visit',
        'routine': 'Routine Visit'
      };
      return diagnosisMap[value] || value;
    case 'duration':
      // Format duration values for better display
      if (value && !isNaN(value)) {
        return `${value} day${value > 1 ? 's' : ''}`;
      }
      return value;
    default:
      return value;
  }
};

// Add a helper function to get nested object values
const getNestedValue = (obj, path) => {
  const value = path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
  
  // Return "-" for null, undefined, or empty string values
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  return value;
};

const renderList = (section, entity) => (
  <Card className="w-full">
    <CardBody className="p-4">
      <div className="font-medium mb-4 text-default-700">{section.title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {section.fields.map((field, index) => {
          let value = getNestedValue(entity, field.key);
          
          // Apply transform if specified
          if (field.transform && typeof field.transform === 'function') {
            value = field.transform(value);
          }
          
          return (
            <div key={index} className="flex flex-col space-y-1">
              <span className="text-default-500 text-sm font-medium">{field.label}:</span>
              <span className="font-medium text-sm text-default-800">
                {formatValue(value, field.format)}
              </span>
            </div>
          );
        })}
      </div>
    </CardBody>
  </Card>
 );

const renderTable = (section, entity, prescriptionItems) => {
  console.log("Render Table Props:", { section, entity, prescriptionItems });
  console.log("DataKey:", section.dataKey);
  console.log("Items to render:", section.dataKey === 'prescriptionItems' ? prescriptionItems : entity[section.dataKey] || []);

  const itemsToRender = section.dataKey === 'prescriptionItems' ? prescriptionItems : entity[section.dataKey] || [];
  
  console.log("Items to render (final):", itemsToRender);
  console.log("Items length:", itemsToRender.length);
  console.log("Items type:", Array.isArray(itemsToRender));

  return (
    <Card>
      <CardBody className="p-4">
        <div className="font-medium mb-4">{section.title}</div>
        {itemsToRender.length === 0 ? (
          <div className="text-center py-8 text-default-500">
            <Icon icon="lucide:package" className="mx-auto mb-2" width={24} />
            <p>No {section.title.toLowerCase()} found</p>
            <p className="text-xs text-default-400 mt-1">Items array is empty</p>
          </div>
        ) : (
          <Table aria-label={`${section.title} table`}>
            <TableHeader>
              {section.columns.map((col, index) => (
                <TableColumn key={index} aria-label={col.label}>{col.label}</TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {itemsToRender.map((item, rowIndex) => {
                console.log("Rendering item:", item);
                return (
                  <TableRow key={rowIndex}>
                    {section.columns.map((col, colIndex) => {
                      const value = getNestedValue(item, col.key);
                      console.log(`Column ${col.key} value:`, value);
                      return (
                        <TableCell key={colIndex}>
                          {col.key === 'index' ? rowIndex + 1 : formatValue(value, col.format)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

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

const renderSection = (section, entity, prescriptionItems) => {
  switch (section.type) {
    case 'list':
      return renderList(section, entity);
    case 'table':
      return renderTable(section, entity, prescriptionItems);
    case 'textarea':
      return renderTextarea(section, entity);
    default:
      return null;
  }
};



//      start rendering here

const renderAppointmentDetails = (entity, onStatusChange) => (
  <div className="space-y-6">
    <div className="flex gap-10 border rounded-lg p-6">
      {/* Patient Quick Info */}          
        <div className="grid grid-cols-2 gap-y-2 gap-x-40 items-center overflow-x-hidden">
          <p className="flex flex-col  ">
            <span className="text-default-500">Patient</span>
            <span className='font-medium'>{entity.patientName || entity.name || '-'}</span>
          </p>
             <p className="flex flex-col  ">
            <span className="text-default-500">Doctor</span>
            <span className='font-medium'>{entity.doctorName || entity.name || '-'}</span>
          </p>
          <p className="flex flex-col ">
            <span className="text-default-500">Gender</span>
            <span className='font-medium'>{entity.gender || '-'}</span>
          </p>
          <p className="flex flex-col ">
            <span className="text-default-500">Phone</span>
            <span className='font-medium'>{entity.phone || '-'}</span>
          </p>
       

    {/* Appointment Details */}
          <p className="flex flex-col">
            <span className="text-default-500">Appointment Number</span>
            <span className="font-medium">{entity.aptNo || '-'}</span>
          </p>
          <p className="flex flex-col">
            <span className="text-default-500">Date</span>
            <span className="font-medium">
              {formatValue(entity.aptDate, 'date')}
            </span>
          </p>
          <p className="flex flex-col ">
            <span className="text-default-500">Time</span>
            <span className="font-medium">
              {entity.startTime} - {entity.endTime}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="text-default-500">Status</span>
            <Badge color={getStatusColor(entity.status)}>
              {entity.status || '-'}
            </Badge>
          </p>
                {/* Status Update */}
      {onStatusChange && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Update Status</h4>
          <Select
            size="sm"
            selectedKeys={[entity.status]}
            onChange={(e) => onStatusChange(e.target.value)}
            className="max-w-xs"
          >
            <SelectItem key="Scheduled">Scheduled</SelectItem>
            <SelectItem key="Checked In">Checked In</SelectItem>
            <SelectItem key="In Progress">In Progress</SelectItem>
            <SelectItem key="Completed">Completed</SelectItem>
            <SelectItem key="Cancelled">Cancelled</SelectItem>
          </Select>
        </div>
      )}
 </div>

    </div>
          {/* Problem/Description */}
      <div className="mx-6 my-2">
        <h4 className="font-medium mb-2">Reason</h4>
        <p className="text-default-500 text-sm">
          {entity.problem || 'No reason provided'}
        </p>
      </div>
  </div>
);

//            end  rendering 


const entityConfigs = {
  appointment: {
    title: 'Appointment Details',
    renderBody: (entity, onStatusChange) => renderAppointmentDetails(entity, onStatusChange),
    footerActions: (onClose,) => [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
    ],
  },
  prescription: {
    title: 'Prescription Details',
    sections: [
      {
        type: 'list',
        title: 'Prescription Information',
        fields: [
          { label: 'Doctor', key: 'doctor.username' },
          { label: 'Patient', key: 'patient.full_name' },
          { label: 'Diagnosis', key: 'diagnosis', format: 'diagnosis' },
          { label: 'Date', key: 'prescription_date', format: 'date' },
          { label: 'Notes', key: 'notes' },
        ],
      },
      {
        type: 'table',
        title: 'Medications',
        columns: [
          { label: 'MEDICINE NAME', key: 'medicine_name' },
          { label: 'DOSAGE', key: 'dosage' },
          { label: 'FREQUENCY', key: 'frequency', format: 'frequency' },
          { label: 'DURATION', key: 'duration', format: 'duration' },
          { label: 'INSTRUCTIONS', key: 'instructions' },
        ],
        dataKey: 'prescriptionItems',
      }
    ],
    footerActions: (onClose, handlePrint, onEdit) => [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
    ],
  },
  inventory: {
    title: 'Inventory Item Details',
    sections: [
      {
        type: 'list',
        title: 'Basic Information',
        fields: [
          { label: 'Item Name', key: 'name' },
          { label: 'Code', key: 'code' },
          { label: 'Description', key: 'description' },
          { label: 'Category', key: 'category_name' },
          { label: 'Category Description', key: 'category_description' },
        ],
      },
      {
        type: 'list',
        title: 'Pricing & Stock',
        fields: [
          { label: 'Cost Price', key: 'cost_price', format: 'currency' },
          { label: 'Selling Price', key: 'selling_price', format: 'currency' },
          { label: 'Quantity in Stock', key: 'quantity' },
          { label: 'Expiry Date', key: 'formatted_expiry_date' },
        ],
      },
      {
        type: 'list',
        title: 'System Information',
        fields: [
          { label: 'Status', key: 'active', format: 'status', transform: (value) => value === 1 ? 'Active' : 'Inactive' },
          { label: 'Created At', key: 'formatted_created_at' },
          { label: 'Updated At', key: 'formatted_updated_at' },
        ],
      },
      {
        type: 'table',
        title: 'Consumption History',
        columns: [
          { label: 'USERNAME', key: 'username' },
          { label: 'CONSUMED QTY', key: 'additionQty' },
          { label: 'TIME', key: 'time', format: 'datetime' },
        ],
        dataKey: 'consumptionHistory',
      },
      {
        type: 'table',
        title: 'Addition History',
        columns: [
          { label: 'USERNAME', key: 'username' },
          { label: 'ADDITION QTY', key: 'additionQty' },
          { label: 'UNIT PRICE', key: 'unitPrice', format: 'currency' },
          { label: 'TIME', key: 'time', format: 'datetime' },
        ],
        dataKey: 'additionHistory',
      },
    ],
    footerActions: (onClose, handlePrint, onEdit) => [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
    ],
  },
  invoice: {
    title: 'Invoice Details',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'Invoice No', key: 'invoiceNumber' },
          { label: 'Patient Name', key: 'patient.full_name' },
          { label: 'Phone', key: 'patient.contact_number' },
          { label: 'MRN Number', key: 'mrnNumber' },
          { label: 'Date', key: 'date', format: 'date' },
        ],
      },
      {
        type: 'table',
        title: 'Services',
        columns: [
          { label: '#', key: 'index' },
          // { label: 'PROCEDURE', key: 'procedure' },
          { label: 'DESCRIPTION', key: 'description' },
          { label: 'QUANTITY', key: 'quantity' },
          { label: 'PRICE', key: 'unit_price', format: 'currency' },
          { label: 'SUB TOTAL', key: 'total_price', format: 'currency' },
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
    footerActions: (onClose, handlePrint) => [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
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
    footerActions: (onClose, handlePrint, onEdit) => [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
    ],
  },

  category: {
    title: 'Category Info',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'NAME', key: 'name', fallback: 'Test User' },
          { label: 'DESCRIPTION', key: 'description', fallback: 'description' },
          { label: 'ACTIVE', key: 'active' },
        ],
      },
    ],
    footerActions: (onClose, handlePrint, onEdit, entity) => [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
    ],
  },

  user: {
    title: 'User Info',
    sections: [
      {
        type: 'list',
        title: 'Basic Information',
        fields: [
          { label: 'Username', key: 'username' },
          { label: 'Email', key: 'email' },
          { label: 'Role', key: 'role' },
          { label: 'Verified', key: 'verified', format: 'status' },
          { label: 'Created At', key: 'created_at', format: 'datetime' },
        ],
      },
      {
        type: 'list',
        title: 'Profile Details',
        fields: [
          { label: 'Gender', key: 'gender' },
          { label: 'Date of Birth', key: 'date_of_birth', format: 'date' },
          { label: 'Blood Group', key: 'blood_group' },
          { label: 'Phone', key: 'phone' },
          { label: 'Address', key: 'address' },
          { label: 'Specialization', key: 'specialization' },
          { label: 'Qualification', key: 'qualification' },
          { label: 'Experience (Years)', key: 'experience' },
          { label: 'Commission Percentage', key: 'commission_percentage' },
        ],
      },
    ],
    footerActions: (onClose, handlePrint, onEdit, entity) => [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
    ],
  },

  doctor: {
    title: 'Doctor Info',
    sections: [
      {
        type: 'list',
        fields: [
          { label: 'Name', key: 'name', fallback: 'Test User' },
          { label: 'Email', key: 'email', fallback: 'ptfty@chefalicious.com' },
          { label: 'Phone', key: 'phone' },
          { label: 'Address', key: 'address' },
          { label: 'Specialist', key: 'specialty' },
          { label: 'Designation', key: 'designation' },
          { label: 'Gender', key: 'gender' },
          { label: 'Blood Group', key: 'bloodGroup' },
          { label: 'Date of Birth', key: 'dob' },
          { label: 'Biography', key: 'biography' },
          { label: 'Status', key: 'status', format: 'status' },
          { label: 'Commission', key: 'commission', format: 'commission', fallback: '10' },
        ],
      },
      {
        type: 'table',
        title: 'Appointments',
        columns: [
          { label: 'APPOINTMENT ID', key: 'id' },
          { label: 'PATIENT', key: 'patient' },
          { label: 'STATUS', key: 'status' },
          { label: 'PROBLEM', key: 'problem' },
          { label: 'START TIME', key: 'startTime' },
          { label: 'END TIME', key: 'endTime' },
          { label: 'DATE', key: 'date' },
        ],
        dataKey: 'appointments',
        defaultData: [
          {
            id: 'APT250465',
            patient: 'test Patient',
            status: 'Checked In',
            problem: '',
            startTime: '10:00:00',
            endTime: '11:15:00',
            date: '26-Apr-2025',
          },
        ],
      },
    ],
    footerActions: (onClose, handlePrint, onEdit, entity) => [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
    ],
  },
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'checked in':
      return 'success';
    case 'scheduled':
      return 'primary';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
};

const renderHeader = (title, icon = "lucide:info") => (
  <div className="flex items-center gap-2 border-b pb-4 pt-4">
    <Icon icon={icon} className="text-primary" width={24} height={24} />
    <span className="text-xl font-semibold">{title}</span>
  </div>
);

export function EntityDetailDialog({
  isOpen,
  onOpenChange,
  entity = {},
  fields = [],
  title = 'Details',
  onEdit,
  entityType,
  onStatusChange,
  prescriptionItems,
  loading,
}) {
  console.log("EntityDetailDialog Props:", {
    entity,
    entityType,
    prescriptionItems,
    isOpen,
    loading
  });
  console.log("Entity object:", entity);
  console.log("Prescription items:", prescriptionItems);
  console.log("Entity type:", entityType);

  // Print preview dialog state
  const [isPrintPreviewOpen, setPrintPreviewOpen] = useState(false);

  // Open print preview for invoice or prescription, otherwise fallback to window.print
  const handlePrint = () => {
    if (entityType === 'invoice' || entityType === 'prescription') {
      setPrintPreviewOpen(true);
    } else {
      window.print();
    }
  };

  const config = entityConfigs[entityType] || {
    title: title,
    sections: fields.length ? [{ type: 'list', fields }] : [],
    footerActions: (onClose, handlePrint, onEdit, entity) => [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
    ],
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-2">
                {renderHeader(config.title)}
              </ModalHeader>
              <ModalBody>
                {config.renderBody ? 
                  config.renderBody(entity, onStatusChange) : 
                  (
                    <div className="space-y-6">
                      {config.sections.map((section, index) => (
                        <div key={index}>
                          {renderSection(section, entity, prescriptionItems)}
                        </div>
                      ))}
                    </div>
                  )
                }
              </ModalBody>
              <ModalFooter>
                {config.footerActions(onClose, handlePrint,onEdit, entity).map((action, index) => (
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
      {/* Print Preview Dialog for Invoice or Prescription */}
      {(entityType === 'invoice' || entityType === 'prescription') && (
        <PrintPreviewDialog
          isOpen={isPrintPreviewOpen}
          onClose={() => setPrintPreviewOpen(false)}
          entity={entity}
          type={entityType}
        />
      )}
    </>
  );
}