import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function HospitalSurveyChart() {
  const data = [
    { year: '2011', purple: 10, yellow: 5, gray: 15 },
    { year: '2012', purple: 30, yellow: 25, gray: 20 },
    { year: '2013', purple: 15, yellow: 35, gray: 25 },
    { year: '2014', purple: 40, yellow: 20, gray: 30 },
    { year: '2015', purple: 30, yellow: 25, gray: 45 },
    { year: '2016', purple: 20, yellow: 50, gray: 35 },
    { year: '2017', purple: 30, yellow: 40, gray: 20 },
  ];

  return (
    <div style={{ width: '100%', height: '400px', minHeight: '300px' }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4b8ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#d4b8ff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffcc66" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ffcc66" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#999999" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#999999" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="purple" 
            stackId="1" 
            stroke="#d4b8ff" 
            fillOpacity={1}
            fill="url(#colorPurple)" 
          />
          <Area 
            type="monotone" 
            dataKey="yellow" 
            stackId="1" 
            stroke="#ffcc66" 
            fillOpacity={1}
            fill="url(#colorYellow)" 
          />
          <Area 
            type="monotone" 
            dataKey="gray" 
            stackId="1" 
            stroke="#999999" 
            fillOpacity={1}
            fill="url(#colorGray)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
