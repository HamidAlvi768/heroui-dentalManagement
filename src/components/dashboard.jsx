import React from 'react';
import { Icon } from '@iconify/react';
import { Button, Card, CardBody, Tabs, Tab } from '@heroui/react';
import { StatsCard } from './stats-card';
import { HospitalSurveyChart } from './hospital-survey-chart';
import { PatientMap } from './patient-map';
import { Header } from './header';

export function Dashboard() {
  const [selected, setSelected] = React.useState("chart");

  return (
    <div className="min-h-screen bg-content2">
      <Header />

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-default-500">Welcome to Oreo</p>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2 bg-default-100 rounded-full px-4 py-1">
              <Icon icon="lucide:home" className="text-primary" width={16} />
              <span className="text-default-700">Oreo</span>
              <span className="text-default-400">/</span>
              <span className="text-default-700">Dashboard</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatsCard 
            value="1600" 
            label="New Feedbacks" 
            change="15%" 
            color="danger" 
            progressValue={65}
          />
          <StatsCard 
            value="3218" 
            label="Happy Clients" 
            change="23%" 
            color="success" 
            progressValue={80}
          />
          <StatsCard 
            value="284" 
            label="Well Smiley Faces" 
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
                    <h3 className="text-lg font-semibold">Hospital <span className="text-default-500">Survey</span></h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:more-horizontal" className="text-default-400" />
                    <Icon icon="lucide:x" className="text-default-400" />
                  </div>
                </div>
                
                <Tabs 
                  aria-label="Survey view options" 
                  selectedKey={selected} 
                  onSelectionChange={setSelected}
                  variant="light"
                  size="sm"
                  className="mb-4 w-fit"
                >
                  <Tab key="chart" title="Chart View" />
                  <Tab key="table" title="Table View" />
                </Tabs>
                
                <HospitalSurveyChart />
              </CardBody>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardBody>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">TOTAL NEW PATIENT</h3>
                  <div className="h-10 flex items-end">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                      <div 
                        key={i} 
                        className="w-2 mx-1 bg-default-300" 
                        style={{ height: `${Math.random() * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <PatientMap />
                
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
