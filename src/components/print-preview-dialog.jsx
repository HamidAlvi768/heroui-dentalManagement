import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import config from '../config/config';
import useFormData from '../hooks/useFormData';

// Print-optimized Appointment Layout
function AppointmentPrintView({ entity }) {
  const dynamicFormData = useFormData();
  if (!entity) return null;
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    try {
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (e) {
      return timeString;
    }
  };

  // Helper function to get status badge class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'status-scheduled';
      case 'checked in':
        return 'status-checked-in';
      case 'in progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-scheduled';
    }
  };

  return (
    <div className="print-appointment p-8 bg-white text-black min-w-[700px] max-w-[900px] mx-auto h-auto">
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #00a59e', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#00a59e', margin: '0 0 6px 0' }}>APPOINTMENT</h2>
        <p style={{ fontSize: '14px', color: '#69717D', fontWeight: '500', margin: '0' }}>
          APT-{entity.id || 'N/A'}
        </p>
        <p style={{ fontSize: '10px', color: '#69717D', margin: '4px 0 0 0' }}>
          Date: {formatDate(entity.appointment_date)}
        </p>
      </div>

      {/* Clinic Information */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#00a59e', margin: '0 0 8px 0' }}>Clinic Information</h3>
        <div style={{ background: '#F4F4F5', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #00a59e' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#11181C', marginBottom: '4px' }}>{dynamicFormData.websiteName || 'J Dent Lite'}</div>
          <div style={{ fontSize: '10px', color: '#69717D', lineHeight: '1.4' }}>
            Office#1, City Plaza, F-10 Markaz, Islamabad<br />
            Email: info@jdentlite.com | Phone: 0516131786
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#00a59e', margin: '0 0 8px 0' }}>Patient Information</h3>
        <div style={{ background: '#F4F4F5', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #00a59e' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Name:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_name || 'Not specified'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Gender:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_gender || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Phone:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_phone || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Email:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_email || 'Not specified'}</span>
            </div>

          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Address:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_address || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#00a59e', margin: '0 0 8px 0' }}>Appointment Details</h3>
        <div style={{ background: '#F4F4F5', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #00a59e' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Appointment ID:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>APT-{entity.id || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Doctor:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.doctor_name || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Date:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{formatDate(entity.appointment_date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Time:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{formatTime(entity.appointment_time)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Status:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.status || 'Not specified'}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', padding: '8px', borderRadius: '16px', fontWeight: 'bold', fontSize: '10px', background: '#E3F2FD', color: '#1976D2', border: '2px solid #2196F3' }}>
            📅 {entity.status?.toUpperCase() || 'SCHEDULED'}
          </div>
        </div>
      </div>



      {/* Medical History & Allergies */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#00a59e', margin: '0 0 8px 0' }}>Medical Information</h3>
        <div style={{ background: '#F4F4F5', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #00a59e' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Medical History:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_medical_history || 'Not specified'}</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
              <span style={{ color: '#69717D', fontWeight: '500', fontSize: '12px' }}>Allergies:</span>
              <span style={{ color: '#11181C', fontWeight: '600', fontSize: '12px' }}>{entity.patient_allergies || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div style={{ background: '#F4F4F5', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #00a59e' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#00a59e', margin: '0 0 8px 0' }}>Notes</h3>
        <p style={{ color: '#11181C', lineHeight: '1.4', fontSize: '12px', margin: '0' }}>
          {entity.notes || 'Please arrive 15 minutes before your scheduled appointment time. Bring your insurance card and any relevant medical records. If you need to reschedule, please call at least 24 hours in advance.'}
        </p>
      </div>
    </div>
  );
}

// Print-optimized Invoice Layout
function InvoicePrintView({ entity }) {
  const dynamicFormData = useFormData();
  if (!entity) return null;
  return (
    <div className="print-invoice p-8 bg-white text-black min-w-[700px] max-w-[900px] mx-auto h-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
        <img 
          src = {dynamicFormData.favicon}
          alt = "Logo"
          className="text-primary mr-2" width={24} />          
          <span className="text-2xl font-bold">{dynamicFormData.websiteName}</span>
        </div>
        <div />
      </div>
      <div className="mb-6 flex justify-between">
        <div className=""> <span className="font-semibold">Patient: </span> {entity.patientName}</div>
        <div className="text-sm text-gray-600">Phone: {entity.phone}</div>
        <div className="text-sm text-gray-600">MRN: {entity.mrnNumber}</div>
      </div>
      <div className="mb-6">
        <div className="font-semibold">Invoice No:</div>
        <div>{entity.invoiceNumber}</div>
      </div>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">#</th>
            <th className="border px-2 py-1 text-left">Procedure</th>
            <th className="border px-2 py-1 text-left">Description</th>
            <th className="border px-2 py-1 text-left">Qty</th>
            <th className="border px-2 py-1 text-left">Price</th>
            <th className="border px-2 py-1 text-left">Sub Total</th>
          </tr>
        </thead>
        <tbody>
          {(entity.services || []).map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{item.procedure}</td>
              <td className="border px-2 py-1">{item.description}</td>
              <td className="border px-2 py-1">{item.quantity}</td>
              <td className="border px-2 py-1">Rs. {Number(item.price).toLocaleString()}</td>
              <td className="border px-2 py-1">Rs. {Number(item.subTotal).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end gap-1">
        <div>Total Amount: <span className="font-semibold">Rs. {Number(entity.totalAmount).toLocaleString()}</span></div>
        <div>Cash Paid: <span className="font-semibold">Rs. {Number(entity.cashPaid).toLocaleString()}</span></div>
        {entity.receivable && (
          <div>Receivable from Corporate Client: <span className="font-semibold">Rs. {Number(entity.receivable).toLocaleString()}</span></div>
        )}
      </div>
      <div className="mt-8 text-xs text-gray-500 text-center">Thank you for your visit!</div>
    </div>
  );
}

// Print-optimized Prescription Layout
function PrescriptionPrintView({ entity }) {
  if (!entity) return null;
  return (
    <div className="print-invoice p-8 bg-white text-black min-w-[700px] max-w-[900px] mx-auto h-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
         <img 
          src={dynamicFormData.logo}
          alt="Logo"
          className="text-white mr-2" width={20}
          />
          <span className="text-white text-xl font-semibold">
          {dynamicFormData.websiteName}
          </span>
        </div>
        <div />
      </div>
      <div className="mb-6 flex justify-between">
        <div className="font-semibold">Patient:</div>
        <div>{entity.patientName}</div>
        <div className="text-sm text-gray-600">Phone: {entity.phone}</div>
        <div className="text-sm text-gray-600">MRN: {entity.mrnNumber}</div>
      </div>
      <div className="mb-6">
        <div className="font-semibold">Prescription ID:</div>
        <div>{entity.prescriptionId}</div>
      </div>
      <div className="mb-6">
        <div className="font-semibold">Doctor:</div>
        <div>{entity.doctorName}</div>
      </div>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">#</th>
            <th className="border px-2 py-1 text-left">Medicine Name</th>
            <th className="border px-2 py-1 text-right">Description</th>
            <th className="border px-2 py-1 text-left">Duration</th>
          </tr>
        </thead>
        <tbody>
          {(entity.medicines || []).map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1 text-right">{item.description}</td>
              <td className="border px-2 py-1">{item.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {entity.note && (
        <div className="mb-6">
          <div className="font-semibold">Notes:</div>
          <div className="text-sm text-gray-700 whitespace-pre-line">{entity.note}</div>
        </div>
      )}
      <div className="mt-8 text-xs text-gray-500 text-center">Get well soon!</div>
    </div>
  );
}

export default function PrintPreviewDialog({ isOpen, onClose, entity, type }) {
  // Only invoice and prescription supported for now
  return (
    <>
      <style>{`
        @media print {
          html, body {
            all: unset !important;
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-width: 0 !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
          /* Aggressive reset for all modal elements */
          .heroui-modal, .heroui-modal-content, .heroui-modal-body, .heroui-modal-header, .heroui-modal-footer, .heroui-modal__backdrop {
            all: unset !important;
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Remove scrollbars from any wrapper inside ModalBody */
          .heroui-modal-body > * {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          /* Print-invoice and print-appointment container styles */
          .print-invoice, .print-appointment {
            overflow: visible !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #000 !important;
            padding: 0.5in !important;
            page-break-inside: avoid !important;
          }
          /* Hide modal action buttons in print */
          .print-preview-actions,
          .heroui-modal-footer, .heroui-modal__footer, .heroui-modal__close, .heroui-modal__header, .heroui-modal__actions, .heroui-modal__closeButton, .heroui-modal__close-button, .heroui-modal__close-btn, .heroui-modal__closeIcon, .heroui-modal__close-icon {
            display: none !important;
          }
        }
      `}</style>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" scrollBehavior="inside" hideCloseButton>
        <ModalContent className="shadow-none border-none">
          {() => (
            <>
              {/* <ModalHeader className="flex flex-col gap-1 py-2">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:printer" className="text-primary" width={24} height={24} />
                  <span className="text-xl font-semibold">Print Preview</span>
                </div>
              </ModalHeader> */}
              <ModalBody>
                {type === 'invoice' && <InvoicePrintView entity={entity} />}
                {type === 'prescription' && <PrescriptionPrintView entity={entity} />}
                {type === 'appointment' && <AppointmentPrintView entity={entity} />}
              </ModalBody>
              <div className="print-preview-actions flex justify-end gap-2 px-6 pb-6">
                <Button color="default" variant="light" onPress={onClose}>Close</Button>
                <Button color="primary" onPress={() => window.print()} startContent={<Icon icon="lucide:printer" width={16} />}>Print</Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}