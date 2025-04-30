import React from 'react';
import { Card, CardBody, Progress, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export function StatsCard({ value, label, icon, onViewAll }) {
  return (
    <Card>
      <CardBody>
        <div className="w-100 flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-3">
              <div className="">{icon && <Icon icon={icon} className="text-primary" width={40} height={40} />}</div>
              <div className="text-4xl font-bold">{value}</div>
            </div>
            <Button size="sm" variant="light" color="primary" onPress={onViewAll}>
              View All
            </Button>
          </div>
          <div className="flex">
            <div className="text-base font-medium text-foreground">{label}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
