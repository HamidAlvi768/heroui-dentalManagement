import React from 'react';
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

const clinicInfo = {
  name: "AL-SHIFA DENTAL SPECIALISTS",
  address: "Office#1, City Plaza, F-10 Markaz, Islamabad",
  email: "info@alshifadentalspecialists.com",
  phone: "0516131786",
  logo: "https://img.heroui.chat/image/logo?w=64&h=64&u=1"
};

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
    case 'status':
      return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${value === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {value || 'Active'}
        </span>
      );
    case 'commission':
      return `${value}%`;
    default:
      return value;
  }
};

const renderList = (section, entity) => (
  <Card className="w-full">
  <CardBody className="p-4">
    <div className="flex items-center justify-between overflow-x-auto gap-x-4 min-w-0">
      {section.fields.map((field, index) => (
        <div key={index} className="flex items-center min-w-0 shrink-0">
          <span className="text-default-500 text-xs mr-1">{field.label}:</span>
          <span className="font-medium text-xs">
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
      <div className="font-medium mb-4">{section.title}</div>
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

const renderAppointmentDetails = (entity, onStatusChange) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-6">
      {/* Clinic Information */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <img src={clinicInfo.logo} alt="Clinic Logo" className="w-12 h-12" />
          <h3 className="font-semibold text-lg">{clinicInfo.name}</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <Icon icon="lucide:map-pin" width={16} className="text-default-400" />
            {clinicInfo.address}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="lucide:mail" width={16} className="text-default-400" />
            {clinicInfo.email}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="lucide:phone" width={16} className="text-default-400" />
            {clinicInfo.phone}
          </p>
        </div>
      </div>

      {/* Patient Quick Info */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Patient Information</h3>
        <div className="space-y-2 text-sm">
          <p className="flex items-center justify-between">
            <span className="text-default-500">Patient:</span>
            <span>{entity.patientName || entity.name}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-default-500">Gender:</span>
            <span>{entity.gender}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-default-500">Phone:</span>
            <span>{entity.phone}</span>
          </p>
        </div>
      </div>
    </div>

    {/* Appointment Details */}
    <div className="border rounded-lg p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Patient Details */}
          <div className="flex items-center gap-3">
            <Avatar 
              src={entity.patientAvatar || "https://img.heroui.chat/image/avatar?w=128&h=128&u=1"}
              size="lg"
            />
            <div>
              <h4 className="font-semibold">{entity.patientName || entity.name}</h4>
              <p className="text-sm text-default-500">MRN: {entity.mrnNumber || entity.mrn}</p>
              <p className="text-sm text-default-500">{entity.phone}</p>
            </div>
          </div>

          {/* Doctor Details */}
          <div className="flex items-center gap-3">
            <Avatar 
              src={entity.doctorAvatar || "https://img.heroui.chat/image/avatar?w=128&h=128&u=2"}
              size="lg"
            />
            <div>
              <h4 className="font-semibold">{entity.doctorName}</h4>
              <p className="text-sm text-default-500">Dental Specialist</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="flex justify-between">
            <span className="text-default-500">Appointment Number:</span>
            <span className="font-medium">{entity.aptNo}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-default-500">Date:</span>
            <span className="font-medium">
              {formatValue(entity.aptDate, 'date')}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-default-500">Time:</span>
            <span className="font-medium">
              {entity.startTime} - {entity.endTime}
            </span>
          </p>
          <p className="flex justify-between items-center">
            <span className="text-default-500">Status:</span>
            <Badge color={getStatusColor(entity.status)}>
              {entity.status}
            </Badge>
          </p>
        </div>
      </div>

      {/* Problem/Description */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Problem/Description</h4>
        <p className="text-default-500 text-sm">
          {entity.problem || 'No description provided'}
        </p>
      </div>

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
);

const entityConfigs = {
  appointment: {
    title: 'Appointment Details',
    renderBody: (entity, onStatusChange) => renderAppointmentDetails(entity, onStatusChange),
    footerActions: (onClose, handlePrint, onEdit, entity) => [
      { label: 'Close', color: 'default', variant: 'light', onPress: onClose },
      { label: 'Print', color: 'primary', onPress: handlePrint, icon: 'lucide:printer' },
      ...(onEdit ? [{
        label: 'Edit',
        color: 'primary',
        onPress: () => { onEdit(entity); onClose(); },
        icon: 'lucide:edit',
      }] : []),
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
    footerActions: (onClose, handlePrint, onEdit) => [
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
    footerActions: (onClose, handlePrint, onEdit) => [
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
    footerActions: (onClose, handlePrint) => [
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
    footerActions: (onClose, handlePrint, onEdit) => [
      { label: 'Close', color: 'primary', variant: 'light', onPress: onClose },
      ...(onEdit ? [{
        label: 'Edit Expense',
        color: 'primary',
        onPress: () => { onEdit(); onClose(); },
        icon: 'lucide:edit',
      }] : []),
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
      ...(onEdit ? [{
        label: 'Edit',
        color: 'primary',
        onPress: () => { onEdit(entity); onClose(); },
        icon: 'lucide:edit-2',
      }] : []),
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
}) {
  const handlePrint = () => {
    window.print();
  };

  const config = entityConfigs[entityType] || {
    title: title,
    sections: fields.length ? [{ type: 'list', fields }] : [],
    footerActions: (onClose, handlePrint, onEdit, entity) => [
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
                        {renderSection(section, entity)}
                      </div>
                    ))}
                  </div>
                )
              }
            </ModalBody>
            <ModalFooter>
              {config.footerActions(onClose, handlePrint, onEdit, entity).map((action, index) => (
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