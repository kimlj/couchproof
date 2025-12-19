import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend.direction === 'up' ? '↑' : '↓'}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        </div>
      )}
    </Card>
  );
}
