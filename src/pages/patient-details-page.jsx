import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageTemplate } from '../components/page-template';
import { Card, CardBody, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Badge, Tabs, Tab, Button} from '@heroui/react';
import { Icon } from '@iconify/react';

export default function PatientDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState('medical');
  const patient = location.state?.patient;

  if (!patient) {
    return <div>No patient data available</div>;
  }

  const patientFields = [
    { label: 'Name', key: 'name' },
    { label: 'MRN Number', key: 'mrn' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Gender', key: 'gender' },
    { label: 'CNIC', key: 'cnic' },
    { label: 'Blood Group', key: 'bloodGroup' },
    // { label: 'Date of Birth', key: 'dob' },
    { label: 'Age', key: 'age' },
    { label: 'BMI', key: 'bmi' },
    { label: 'Marital Status', key: 'maritalStatus' },
    { label: 'Insurance Company', key: 'insurance' },
    { label: 'Status', key: 'status' },
    { label: 'Address', key: 'address' }
  ];

  const renderPatientInfo = () => (
    <div className="flex justify-center">
    <Card className="mb-6 w-3/4">
      <CardBody className="p-6">
        <div className="flex items-start gap-6 ">
          <div className="shrink-0">
            <img 
              src={patient.avatar || "https://img.heroui.chat/image/avatar?w=128&h=128&u=1"} 
              alt={patient.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          </div>
          <div className="grow ">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {patientFields.map((field) => (
                <div key={field.key}>
                  <div className="text-sm text-default-500">{field.label}</div>
                  <div className="font-medium">
                    {field.key === 'status' ? (
                      <Badge color={patient[field.key] === 'Active' ? 'success' : 'default'}>
                        {patient[field.key] || '-'}
                      </Badge>
                    ) : (
                      patient[field.key] || '-'
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
    </div>
  );

  const renderAppointments = () => (
    <Card className="mb-6">
      <CardBody>
        <div className="font-medium mb-4">Appointments</div>
        <Table>
          <TableHeader>
            <TableColumn>Appointment ID</TableColumn>
            <TableColumn>Doctor</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Problem</TableColumn>
            <TableColumn>Start Time</TableColumn>
            <TableColumn>End Time</TableColumn>
            <TableColumn>Date</TableColumn>
          </TableHeader>
          <TableBody>
            {(patient.appointments || []).map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>{apt.id}</TableCell>
                <TableCell>{apt.doctor}</TableCell>
                <TableCell>
                  <Badge color={apt.status === 'Checked In' ? 'success' : 'default'}>
                    {apt.status}
                  </Badge>
                </TableCell>
                <TableCell>{apt.problem || '-'}</TableCell>
                <TableCell>{apt.startTime}</TableCell>
                <TableCell>{apt.endTime}</TableCell>
                <TableCell>{apt.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  const renderMedicalHistory = () => (
    <Card>
      <CardBody>
        <div className="space-y-4">
          <h4 className="font-medium">Medical History</h4>
          <div className="space-y-2">
            <p><span className="font-medium">Infections:</span> yes</p>
            <p><span className="font-medium">Been hospitalized:</span> yes</p>
          </div>
          <div className="mt-4">
            <h5 className="font-medium mb-2">Medical Documents</h5>
            <Table>
              <TableHeader>
                <TableColumn>File Name</TableColumn>
                <TableColumn>Uploaded By</TableColumn>
                <TableColumn>Upload Date</TableColumn>
                <TableColumn>Action</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No documents available">
                {(patient.documents || []).map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.uploadedBy}</TableCell>
                    <TableCell>{doc.uploadDate}</TableCell>
                    <TableCell>
                      <Icon icon="lucide:download" className="cursor-pointer" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <PageTemplate
      title={`${patient.name}`}
      icon="lucide:user"
    >
          <div className='mx-10'>

      {/* Patient Info Card */}
      {renderPatientInfo()}

      {/* Tabs Section */}
      <div className="mb-6 mx-40">
        <Tabs 
          selectedKey={selectedTab} 
          onSelectionChange={setSelectedTab}
          variant="underlined"
          className="w-full max-w-xl"
        >
          <Tab key="appointments" title="Appointments">
            {renderAppointments()}
          </Tab>
          <Tab key="prescriptions" title="Prescriptions" />
          <Tab key="invoices" title="Invoices" />
        </Tabs>
      </div>    </div>

    </PageTemplate>
  );
}