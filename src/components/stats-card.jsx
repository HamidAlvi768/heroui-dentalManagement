import React from 'react';
import { Card, CardBody, Progress, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export function StatsCard({ value, label, icon, onViewAll }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {icon && <Icon icon={icon} className="text-primary" width={32} height={32} />}
            <div>
              <div className="text-4xl font-bold">{value}</div>
              <div className="text-base font-medium text-foreground">{label}</div>
            </div>
          </div>
          <Button size="sm" variant="light" color="primary" onPress={onViewAll}>
            View All
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
