import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button, Card, CardBody, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { StatsCard } from './stats-card';
import { AppointmentsChart } from './hospital-survey-chart';
import { Header } from './header';
import { useAuth } from '../auth/AuthContext';
import config from '../config/config';

export function Dashboard() {
  const [selected, setSelected] = React.useState("chart");
  const [stats, setStats] = React.useState({
    users_count: 0,
    patients_count: 0,
    inventory_count: 0,
    invoices_count: 0
  });

  const { token } = useAuth();
  useEffect(() => {
    config.initAPI(token)
    config.getData('/dashboard')
      .then(data => {
        console.log(data.data.data)
        setStats(data.data.data)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  // Sample data for table view
  const tableData = [
    { month: 'Jan', scheduled: 45, completed: 38, cancelled: 7 },
    { month: 'Feb', scheduled: 52, completed: 45, cancelled: 7 },
    { month: 'Mar', scheduled: 49, completed: 40, cancelled: 9 },
    { month: 'Apr', scheduled: 55, completed: 48, cancelled: 7 },
  ];

  const renderSurveyContent = () => {
    if (selected === "chart") {
      return <AppointmentsChart />;
    }
    
    return (
      <Table aria-label="Appointments data table">
        <TableHeader>
          <TableColumn>MONTH</TableColumn>
          <TableColumn>SCHEDULED</TableColumn>
          <TableColumn>COMPLETED</TableColumn>
          <TableColumn>CANCELLED</TableColumn>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.month}>
              <TableCell>{row.month}</TableCell>
              <TableCell>{row.scheduled}</TableCell>
              <TableCell>{row.completed}</TableCell>
              <TableCell>{row.cancelled}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-content2">
      <Header />
      <div className="p-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-default-500">Welcome to {config.appName}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatsCard
            value={stats.users_count}
            label="Users"
            change="15%"
            color="danger"
            progressValue={65}
          />
          <StatsCard
            value={stats.patients_count}
            label="Patients"
            change="23%"
            color="success"
            progressValue={80}
          />
          <StatsCard
            value={stats.inventory_count}
            label="Inventory"
            change="50%"
            icon="lucide:smile"
            color="secondary"
            progressValue={90}
          />

          <StatsCard
            value={stats.invoices_count}
            label="Invoices"
            change="50%"
            icon="lucide:smile"
            color="secondary"
            progressValue={90}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="h-full">
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-1 h-6 bg-primary mr-2"></div>
                    <h3 className="text-lg font-semibold">Appointments <span className="text-default-500">Overview</span></h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:more-horizontal" className="text-default-400" />
                    <Icon icon="lucide:x" className="text-default-400" />
                  </div>
                </div>

                <Tabs
                  aria-label="Appointments view options"
                  selectedKey={selected}
                  onSelectionChange={setSelected}
                  variant="light"
                  size="sm"
                  className="mb-4 w-fit"
                >
                  <Tab key="chart" title="Chart View" />
                  <Tab key="table" title="Table View" />
                </Tabs>

                {renderSurveyContent()}
              </CardBody>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardBody>
                <div>
                  <h3 className="text-lg font-semibold mb-2">TOTAL NEW PATIENT</h3>
        
                </div>

                <div className="mt-4">
                  <div className="flex justify-between font-semibold mb-2">
                    <div>City</div>
                    <div>Count</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-divider">
                      <div>New York</div>
                      <div className="flex items-center">
                        215
                        <Icon icon="lucide:arrow-up-right" className="text-success ml-1" width={16} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-divider">
                      <div>Los Angeles</div>
                      <div className="flex items-center">
                        189
                        <Icon icon="lucide:arrow-up-right" className="text-success ml-1" width={16} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-divider">
                      <div>Chicago</div>
                      <div className="flex items-center">
                        408
                        <Icon icon="lucide:arrow-down-right" className="text-danger ml-1" width={16} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div>Houston</div>
                      <div>215</div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
