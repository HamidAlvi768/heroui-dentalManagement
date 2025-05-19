import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import config from '../config/config';

// Print-optimized Invoice Layout
function InvoicePrintView({ entity }) {
  if (!entity) return null;
  return (
    <div className="print-invoice p-8 bg-white text-black min-w-[700px] max-w-[900px] mx-auto h-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:activity" className="text-primary mr-2" width={24} />
          <span className="text-2xl font-bold">{config.appName}</span>
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
          <Icon icon="lucide:activity" className="text-primary mr-2" width={24} />
          <span className="text-2xl font-bold">{config.appName}</span>
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
          /* Print-invoice container styles */
          .print-invoice {
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
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-2">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:printer" className="text-primary" width={24} height={24} />
                  <span className="text-xl font-semibold">Print Preview</span>
                </div>
              </ModalHeader>
              <ModalBody>
                {type === 'invoice' && <InvoicePrintView entity={entity} />}
                {type === 'prescription' && <PrescriptionPrintView entity={entity} />}
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