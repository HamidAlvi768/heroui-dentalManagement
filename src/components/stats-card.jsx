import React from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export function StatsCard({ value, label, icon, onViewAll }) {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 w-full">
            {icon && <Icon icon={icon} className="text-primary" width={32} height={32} />}
            <div>
              <div className="text-4xl font-bold whitespace-nowrap">{value}</div>
              <div className="text-base font-medium text-foreground truncate">{label}</div>
            </div>
            <Button className='ml-auto' size="sm" variant="light" color="primary" onPress={onViewAll}>
              View All
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}