import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export function DeleteDialog({ 
  isOpen, 
  onOpenChange, 
  itemType, 
  onConfirm 
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-danger/10">
                  <Icon icon="lucide:trash-2" className="text-danger" width={24} />
                </div>
                <span>Delete {itemType}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                color="danger" 
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 