// Server Component: Statistics Summary
// Static stats display without real-time updates

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  status?: 'good' | 'warning' | 'poor';
}

interface StatsSummaryProps {
  title?: string;
  stats: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const gridClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const statusColors = {
  good: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  poor: 'bg-red-100 text-red-800 border-red-200',
};

export function StatsSummary({
  title,
  stats,
  columns = 4,
  className,
}: StatsSummaryProps) {
  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card className={cn(className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        <div className={cn("grid gap-6", gridClasses[columns])}>
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
              
              <div className="text-2xl font-bold">
                {formatValue(stat.value)}
              </div>
              
              {stat.change && (
                <div className="flex items-center gap-2">
                  {stat.status && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        statusColors[stat.status]
                      )}
                    >
                      {stat.change.value > 0 ? '+' : ''}
                      {stat.change.value}%
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {stat.change.period}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}