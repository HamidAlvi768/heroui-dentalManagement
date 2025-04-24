import React from 'react';
import { Card, CardBody, Progress } from '@heroui/react';
import { Icon } from '@iconify/react';

export function StatsCard({ value, label, change, color = "primary", icon, progressValue = 50 }) {
  return (
    <Card>
      <CardBody>
        <div className="text-4xl font-bold">{value}</div>
        <div className="text-default-500 mb-4">{label}</div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Change</span>
          <span className={`text-${color}`}>{change}</span>
        </div>
        
        <Progress 
          color={color} 
          value={progressValue} 
          className="h-1"
        />
      </CardBody>
    </Card>
  );
}
