// Server Component: Metric Display Card
// Static metric display without client-side updates

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  status?: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const statusColors = {
  success: 'text-green-600',
  warning: 'text-yellow-600', 
  error: 'text-red-600',
  neutral: 'text-muted-foreground',
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  change,
  status = 'neutral',
  className,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = (type: 'increase' | 'decrease') => {
    return type === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", statusColors[status])} />
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        
        {change && (
          <div className="flex items-center mt-2">
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                getChangeColor(change.type)
              )}
            >
              {change.type === 'increase' ? '+' : '-'}
              {Math.abs(change.value)}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}