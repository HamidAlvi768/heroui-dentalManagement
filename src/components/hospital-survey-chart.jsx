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

export function AppointmentsChart() {
  const data = [
    { month: 'Jan', scheduled: 45, completed: 38, cancelled: 7 },
    { month: 'Feb', scheduled: 52, completed: 45, cancelled: 7 },
    { month: 'Mar', scheduled: 49, completed: 40, cancelled: 9 },
    { month: 'Apr', scheduled: 55, completed: 48, cancelled: 7 },
    { month: 'May', scheduled: 47, completed: 42, cancelled: 5 },
    { month: 'Jun', scheduled: 54, completed: 46, cancelled: 8 },
    { month: 'Jul', scheduled: 58, completed: 50, cancelled: 8 },
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
            <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00a59e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00a59e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="scheduled" 
            stackId="1" 
            stroke="#00a59e" 
            fillOpacity={1}
            fill="url(#colorScheduled)" 
            name="Scheduled"
          />
          <Area 
            type="monotone" 
            dataKey="completed" 
            stackId="1" 
            stroke="#4caf50" 
            fillOpacity={1}
            fill="url(#colorCompleted)" 
            name="Completed"
          />
          <Area 
            type="monotone" 
            dataKey="cancelled" 
            stackId="1" 
            stroke="#f44336" 
            fillOpacity={1}
            fill="url(#colorCancelled)" 
            name="Cancelled"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
