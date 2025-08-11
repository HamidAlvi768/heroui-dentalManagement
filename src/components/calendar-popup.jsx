import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { Calendar } from "@heroui/react";
import { format } from "date-fns";

export function CalendarPopup({ isOpen, onOpenChange, onSelect }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    if (onSelect) {
      onSelect(date);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="text-xl">Select Date</div>
              {selectedDate && (
                <div className="text-sm text-default-500">
                  {format(selectedDate, "MMMM d, yyyy")}
                </div>
              )}
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  className="rounded-lg border"
                  showOutsideDays={false}
                  fixedWeeks
                  initialFocus
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}