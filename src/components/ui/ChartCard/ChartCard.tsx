/**
 * Purpose: Card wrapper specifically for chart widgets (Revenue Overview, Outstanding Trend)
 * Responsibilities: Consistent title/legend header above a chart body; chart itself is passed as children
 * Dependencies: Card, CardHeader, CardTitle, CardBody
 * Export: ChartCard
 */
import { type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../Card';

export interface ChartCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, action, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
