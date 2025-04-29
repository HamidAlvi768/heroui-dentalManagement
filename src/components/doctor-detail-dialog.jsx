import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tab,
  Tabs,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react';
import { Icon } from '@iconify/react';

export function DoctorDetailDialog({ isOpen, onOpenChange, doctor, onEdit }) {
  const [selectedTab, setSelectedTab] = React.useState('appointments');

  // Fallback helpers
  const fallback = (val, fallbackText = 'Not provided (-)') => val ? val : fallbackText;
  const fallbackBio = (val) => val ? val : 'No value entered';
  const fallbackSpecialist = (val) => val ? val : 'No value entered';

  // Status pill
  const statusPill = (status) => (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{status}</span>
  );

  // Sample appointments data
  const appointments = [
    {
      id: 'APT250465',
      patient: 'test Patient',
      status: 'Checked In',
      problem: '',
      startTime: '10:00:00',
      endTime: '11:15:00',
      date: '26-Apr-2025',
    },
  ];

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 border-b pb-2">
              <Icon icon="lucide:user" className="text-primary" width={22} />
              <span className="text-lg font-semibold">Doctor Info</span>
            </ModalHeader>
            <ModalBody>
              {/* Doctor Info Table */}
              <div className="mb-6">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <tbody>
                    <tr>
                      <td className="font-medium py-2 px-4 bg-gray-50 w-1/4">Name</td>
                      <td className="py-2 px-4">{fallback(doctor?.name, 'Test User')}</td>
                      <td className="font-medium py-2 px-4 bg-gray-50 w-1/4">Email</td>
                      <td className="py-2 px-4">{fallback(doctor?.email, 'ptfty@chefalicious.com')}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2 px-4 bg-gray-50">Phone</td>
                      <td className="py-2 px-4">{fallback(doctor?.phone)}</td>
                      <td className="font-medium py-2 px-4 bg-gray-50">Address</td>
                      <td className="py-2 px-4">{fallback(doctor?.address)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2 px-4 bg-gray-50">Specialist</td>
                      <td className="py-2 px-4">{fallbackSpecialist(doctor?.specialty)}</td>
                      <td className="font-medium py-2 px-4 bg-gray-50">Designation</td>
                      <td className="py-2 px-4">{fallback(doctor?.designation)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2 px-4 bg-gray-50">Gender</td>
                      <td className="py-2 px-4">{fallback(doctor?.gender)}</td>
                      <td className="font-medium py-2 px-4 bg-gray-50">Blood Group</td>
                      <td className="py-2 px-4">{fallback(doctor?.bloodGroup)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2 px-4 bg-gray-50">Date of Birth</td>
                      <td className="py-2 px-4">{fallback(doctor?.dob)}</td>
                      <td className="font-medium py-2 px-4 bg-gray-50">Biography</td>
                      <td className="py-2 px-4">{fallbackBio(doctor?.biography)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-2 px-4 bg-gray-50">Status</td>
                      <td className="py-2 px-4">{statusPill(doctor?.status || 'Active')}</td>
                      <td className="font-medium py-2 px-4 bg-gray-50">Commission</td>
                      <td className="py-2 px-4">{doctor?.commission ? doctor.commission + '%' : '10%'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Related Modules Tabs */}
              <div>
                <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab} variant="underlined" className="mb-4">
                  <Tab key="appointments" title="Appointments" />
                  <Tab key="exams" title="Exam & Investigations" />
                  <Tab key="treatment" title="Treatment Plans" />
                  <Tab key="prescriptions" title="Prescriptions" />
                </Tabs>
                {selectedTab === 'appointments' && (
                  <Table aria-label="Appointments table">
                    <TableHeader>
                      <TableColumn>APPOINTMENT ID</TableColumn>
                      <TableColumn>PATIENT</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>PROBLEM</TableColumn>
                      <TableColumn>START TIME</TableColumn>
                      <TableColumn>END TIME</TableColumn>
                      <TableColumn>DATE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt) => (
                        <TableRow key={apt.id}>
                          <TableCell>{apt.id}</TableCell>
                          <TableCell>{apt.patient}</TableCell>
                          <TableCell>{apt.status}</TableCell>
                          <TableCell>{apt.problem || '-'}</TableCell>
                          <TableCell>{apt.startTime}</TableCell>
                          <TableCell>{apt.endTime}</TableCell>
                          <TableCell>{apt.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {/* Other tabs can be filled in as needed */}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>Close</Button>
              {onEdit && (
                <Button 
                  color="primary"
                  onPress={() => {
                    onEdit(doctor);
                    onClose();
                  }}
                  startContent={<Icon icon="lucide:edit-2" width={16} />}
                >
                  Edit
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}