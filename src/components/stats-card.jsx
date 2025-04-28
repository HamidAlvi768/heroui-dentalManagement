import React from 'react';
import { Card, CardBody, Progress } from '@heroui/react';
import { Icon } from '@iconify/react';

export function StatsCard({ value, label, icon }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4 mb-2">
          {icon && <Icon icon={icon} className="text-primary" width={32} height={32} />}
          <div className="text-4xl font-bold">{value}</div>
        </div>
        <div className="text-default-500 mb-4">{label}</div>
      </CardBody>
    </Card>
  );
}
